import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reportsService } from "../utils/reportsService";
import { 
  User, ShieldCheck, Calendar, KeyRound, LogOut, 
  CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Profile: React.FC = () => {
  const { user, updateUserProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Statistics
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [averageMonthlyBill, setAverageMonthlyBill] = useState(0);

  // Edit State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load calculations count and stats
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const reports = await reportsService.getUserReports(user.uid);
        setTotalCalculations(reports.length);
        if (reports.length > 0) {
          const totalBill = reports.reduce((acc, curr) => acc + curr.estimatedBill, 0);
          setAverageMonthlyBill(Math.round(totalBill / reports.length));
        }
      } catch (e) {
        console.error("Failed to load profile statistics:", e);
      }
    };
    loadStats();
  }, [user]);

  // Synchronize input fields if user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhotoURL(user.photoURL);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProfileSuccess(false);
    setLoading(true);
    try {
      await updateUserProfile(fullName, photoURL);
      setProfileSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile information.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordSuccess(false);
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to change password. Re-authentication might be required.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/");
    }
  };

  const avatarPresets = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || "User")}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Jack`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Buster`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Molly`,
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6 text-left">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-7 h-7 text-primary-blue dark:text-primary-green" />
          My Profile settings
        </h1>
        <p className="text-sm font-semibold text-slate-550 dark:text-slate-450 mt-1">
          Manage your personal information, update security settings, and view account stats.
        </p>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 text-xs">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Info & Statistics Summary (Col span 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="relative inline-block mx-auto">
            <img 
              src={photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || "U")}`} 
              alt={user?.fullName} 
              className="w-24 h-24 rounded-full object-cover border-2 border-slate-350 dark:border-slate-700 mx-auto"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 flex items-center justify-center" title="Account active">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>

          {/* Details list */}
          <div className="border-t border-b border-slate-150 dark:border-slate-800 py-4 space-y-3 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-450 font-bold flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Member Since</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(user?.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 font-bold flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Last Login</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(user?.lastLogin)}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reports</span>
              <p className="text-2xl font-display font-extrabold text-primary-blue dark:text-primary-green mt-1">{totalCalculations}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Bill</span>
              <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">₹{averageMonthlyBill}</p>
            </div>
          </div>

          {/* Logout Trigger button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-bold text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out of account
          </button>
        </div>

        {/* Right Area: Form edit spaces (Col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Form Card 1: Account Profile */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary-blue" />
                Profile Information
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize your name and select an avatar picture representation.
              </p>
            </div>

            {profileSuccess && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>Your profile information was updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-4">
                {/* Full name input */}
                <div>
                  <label htmlFor="p_name" className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="p_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all text-xs"
                  />
                </div>

                {/* Avatar selection list */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 uppercase tracking-wider">
                    Select Avatar Preset
                  </label>
                  <div className="flex flex-wrap gap-3.5">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoURL(preset)}
                        disabled={loading}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                          photoURL === preset
                            ? "border-primary-blue scale-110 shadow-md"
                            : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                      >
                        <img src={preset} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>


              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 text-xs font-semibold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Form Card 2: Security Change password */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-warning-orange" />
                Change Password
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                For security reasons, we recommend updating your password periodically.
              </p>
            </div>

            {passwordSuccess && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>Your password was changed successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label htmlFor="new_pass" className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    id="new_pass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all text-xs"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="conf_pass" className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    id="conf_pass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 text-xs font-semibold rounded-xl text-white bg-warning-orange hover:bg-warning-orange/90 transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
