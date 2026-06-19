import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  updatePassword as fbUpdatePassword
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { auth, db as rawDb, IS_FIREBASE_CONFIGURED } from "../firebase/config";

const db = rawDb as Firestore;

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  photoURL: string;
  createdAt: string;
  lastLogin: string;
  tariffState?: string;
  customFlatRate?: number;
  monthlyBudgetBill?: number;
  monthlyBudgetUnits?: number;
  customWattages?: Record<string, number>;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateUserProfile: (fullName: string, photoURL: string) => Promise<void>;
  updateUserSettings: (settings: {
    tariffState?: string;
    customFlatRate?: number;
    monthlyBudgetBill?: number;
    monthlyBudgetUnits?: number;
    customWattages?: Record<string, number>;
  }) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Local storage helper keys for mock mode
  const MOCK_USERS_KEY = "she_mock_users";
  const MOCK_SESSION_KEY = "she_mock_session";

  // Check if we are running mock mode
  const isMock = !IS_FIREBASE_CONFIGURED;

  useEffect(() => {
    if (!isMock && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          // 1. Instantly set user profile from firebase auth state to unlock navigation
          setUser((prev) => {
            if (prev && prev.uid === fbUser.uid) return prev;
            return {
              uid: fbUser.uid,
              email: fbUser.email || "",
              fullName: fbUser.displayName || "Smart User",
              photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || "U")}`,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              tariffState: "ap",
              customFlatRate: 7.5,
              monthlyBudgetBill: 3000,
              monthlyBudgetUnits: 400,
              customWattages: {}
            };
          });
          setLoading(false);

          // 2. Load/create Firestore profile details asynchronously in the background
          const userDocRef = doc(db, "users", fbUser.uid);
          getDoc(userDocRef)
            .then(async (userDocSnap) => {
              if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setUser((prev) => {
                  if (!prev || prev.uid !== fbUser.uid) return prev;
                  return {
                    ...prev,
                    fullName: data.fullName || prev.fullName,
                    photoURL: data.photoURL || prev.photoURL,
                    createdAt: data.createdAt || prev.createdAt,
                    lastLogin: data.lastLogin || prev.lastLogin,
                    tariffState: data.tariffState || "ap",
                    customFlatRate: data.customFlatRate !== undefined ? data.customFlatRate : 7.5,
                    monthlyBudgetBill: data.monthlyBudgetBill !== undefined ? data.monthlyBudgetBill : 3000,
                    monthlyBudgetUnits: data.monthlyBudgetUnits !== undefined ? data.monthlyBudgetUnits : 400,
                    customWattages: data.customWattages || {}
                  };
                });
              } else {
                const newProfile: UserProfile = {
                  uid: fbUser.uid,
                  email: fbUser.email || "",
                  fullName: fbUser.displayName || "Smart User",
                  photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || "U")}`,
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  tariffState: "ap",
                  customFlatRate: 7.5,
                  monthlyBudgetBill: 3000,
                  monthlyBudgetUnits: 400,
                  customWattages: {}
                };
                await setDoc(userDocRef, newProfile);
                setUser((prev) => {
                  if (!prev || prev.uid !== fbUser.uid) return prev;
                  return newProfile;
                });
              }
            })
            .catch((e) => {
              console.error("Error reading user doc in background:", e);
            });
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      return unsubscribe;
    } else {
      // Mock mode auth checking on mount
      const savedSession = localStorage.getItem(MOCK_SESSION_KEY) || sessionStorage.getItem(MOCK_SESSION_KEY);
      if (savedSession) {
        try {
          const parsedUser = JSON.parse(savedSession) as UserProfile;
          setUser(parsedUser);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, [isMock]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    try {
      if (!isMock && auth) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Mock Login
        const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
        const usersList: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
        const existingUser = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!existingUser) {
          throw new Error("User not found. Please register first.");
        }
        
        const updatedUser = {
          ...existingUser,
          lastLogin: new Date().toISOString()
        };

        const updatedList = usersList.map(u => u.uid === updatedUser.uid ? updatedUser : u);
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedList));

        const sessionStr = JSON.stringify(updatedUser);
        if (rememberMe) {
          localStorage.setItem(MOCK_SESSION_KEY, sessionStr);
        } else {
          sessionStorage.setItem(MOCK_SESSION_KEY, sessionStr);
        }
        setUser(updatedUser);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    try {
      if (!isMock && auth) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await fbUpdateProfile(credential.user, {
          displayName: fullName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
        });
        
        const newProfile: UserProfile = {
          uid: credential.user.uid,
          email: credential.user.email || "",
          fullName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          tariffState: "ap",
          customFlatRate: 7.5,
          monthlyBudgetBill: 3000,
          monthlyBudgetUnits: 400,
          customWattages: {}
        };

        // Write to Firestore in the background to avoid registration latency
        setDoc(doc(db, "users", credential.user.uid), newProfile)
          .catch((err) => console.error("Error setting user doc on register:", err));

        setUser(newProfile);
      } else {
        // Mock Registration
        const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
        const usersList: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
        
        if (usersList.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Email already registered.");
        }

        const newProfile: UserProfile = {
          uid: "mock_" + Math.random().toString(36).substr(2, 9),
          email: email.toLowerCase(),
          fullName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          tariffState: "ap",
          customFlatRate: 7.5,
          monthlyBudgetBill: 3000,
          monthlyBudgetUnits: 400,
          customWattages: {}
        };

        usersList.push(newProfile);
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(usersList));

        // Auto login after signup
        sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(newProfile));
        setUser(newProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (!isMock && auth) {
        await fbSignOut(auth);
      } else {
        localStorage.removeItem(MOCK_SESSION_KEY);
        sessionStorage.removeItem(MOCK_SESSION_KEY);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isMock && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Mock password reset
      const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
      const usersList: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
      if (!usersList.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email address not found in our records.");
      }
      // Simple mock message (resolved instantly)
      console.log(`Mock reset email sent to ${email}`);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (!isMock && auth) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        // Mock Google login
        const mockGoogleName = "Google Tester";
        const mockGoogleEmail = "google.tester@example.com";
        const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
        const usersList: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
        
        let profile = usersList.find((u) => u.email === mockGoogleEmail);
        
        if (!profile) {
          profile = {
            uid: "mock_g_" + Math.random().toString(36).substr(2, 9),
            email: mockGoogleEmail,
            fullName: mockGoogleName,
            photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mockGoogleName)}`,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            tariffState: "ap",
            customFlatRate: 7.5,
            monthlyBudgetBill: 3000,
            monthlyBudgetUnits: 400,
            customWattages: {}
          };
          usersList.push(profile);
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(usersList));
        } else {
          profile.lastLogin = new Date().toISOString();
          const updatedList = usersList.map(u => u.uid === profile!.uid ? profile! : u);
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedList));
        }

        sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(profile));
        setUser(profile);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateUserProfile = async (fullName: string, photoURL: string) => {
    if (!user) return;
    
    // Update active user state and storage instantly
    const updatedUser = {
      ...user,
      fullName,
      photoURL
    };
    
    setUser(updatedUser);

    if (!isMock && auth && auth.currentUser) {
      fbUpdateProfile(auth.currentUser, { displayName: fullName, photoURL })
        .then(() => {
          const userDocRef = doc(db, "users", user.uid);
          return updateDoc(userDocRef, { fullName, photoURL });
        })
        .catch(err => console.error("Error updating user profile:", err));
    }

    if (isMock) {
      // Update in mock list
      const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
      const usersList: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
      const updatedList = usersList.map(u => u.uid === user.uid ? updatedUser : u);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedList));

      // Update in session
      if (localStorage.getItem(MOCK_SESSION_KEY)) {
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
      }
    }
  };

  const updateUserSettings = async (settings: {
    tariffState?: string;
    customFlatRate?: number;
    monthlyBudgetBill?: number;
    monthlyBudgetUnits?: number;
    customWattages?: Record<string, number>;
  }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...settings
    };
    setUser(updatedUser);

    if (!isMock && auth && auth.currentUser) {
      const userDocRef = doc(db, "users", user.uid);
      updateDoc(userDocRef, settings)
        .catch(err => console.error("Error updating user settings in Firestore:", err));
    }

    // Always update in mock storage so mock/caching matches
    const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
    const usersList: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
    const updatedList = usersList.map(u => u.uid === user.uid ? updatedUser : u);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedList));

    if (localStorage.getItem(MOCK_SESSION_KEY)) {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return;
    if (!isMock && auth && auth.currentUser) {
      await fbUpdatePassword(auth.currentUser, newPassword);
    } else {
      // Mock mode change password (no additional storage needed as password checks are mock-bypassed)
      console.log("Mock password updated successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, loginWithGoogle, updateUserProfile, updateUserSettings, changePassword, isMock }}>
      {children}
    </AuthContext.Provider>
  );
};
