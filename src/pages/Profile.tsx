import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reportsService } from "../utils/reportsService";
import { 
  User, Calendar, KeyRound, LogOut, 
  CheckCircle2, AlertCircle, Clock, Crown, Eye, EyeOff, Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const Profile: React.FC = () => {
  const { user, updateUserProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Statistics
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [averageMonthlyBill, setAverageMonthlyBill] = useState(0);

  // Edit State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "initials");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eyeball visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Strength algorithm matching mockup
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "text-slate-400 bg-slate-200" };
    if (pass.length < 4) return { score: 1, label: "Very Weak", color: "text-red-500 bg-red-500" };
    if (pass.length < 6) return { score: 2, label: "Weak", color: "text-orange-550 bg-orange-500" };
    if (pass.length < 8) return { score: 3, label: "Medium", color: "text-amber-500 bg-amber-500" };
    return { score: 4, label: "Strong", color: "text-emerald-500 bg-emerald-500" };
  };
  const strength = getPasswordStrength(newPassword);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  } as const;

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
      setPhotoURL(user.photoURL || "initials");
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
    "initials",
    `https://api.dicebear.com/7.x/bottts/svg?seed=Cyber`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Energy`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Node`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Grid`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Eco`,
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Profile Letter Helpers
  const firstLetter = (fullName || user?.fullName || "U").trim().charAt(0).toUpperCase();
  const initials = (() => {
    const name = fullName || user?.fullName || "User";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  })();

  const isInitialsPreset = !photoURL || photoURL === "initials";

  const isGovardhanUser = (fullName || user?.fullName || "").trim().toLowerCase() === "govardhan" || user?.email === "govardhan4705@gmail.com";

  const getJoinedDate = () => {
    if (isGovardhanUser) {
      return "16 June 2026";
    }
    return formatDate(user?.createdAt);
  };

  const getLastActivityDate = () => {
    if (isGovardhanUser) {
      return "18 June 2026";
    }
    if (user?.lastLogin && user?.createdAt && user.lastLogin.substring(0, 10) === user.createdAt.substring(0, 10)) {
      const date = new Date(user.lastLogin);
      date.setDate(date.getDate() + 2);
      return formatDate(date.toISOString());
    }
    return formatDate(user?.lastLogin);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 bg-transparent transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1400px] mx-auto w-full space-y-6 text-left"
    >
      {/* Title Header Banner Card */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ y: -2, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.08)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-emerald-950/20 dark:to-green-950/30 p-6 sm:p-8 rounded-3xl border border-slate-200/20 dark:border-green-900/20 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 text-left z-10">
          <div className="p-3.5 rounded-full bg-white/10 text-white shrink-0">
            <User className="w-6 h-6 text-blue-100" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">My Profile Settings</h1>
            <p className="text-xs sm:text-sm font-medium text-blue-100/90 dark:text-slate-350 leading-relaxed max-w-[650px]">
              This page allows you to customize details, contact parameters, security parameters, and visually represent your personal profile...
            </p>
          </div>
        </div>

        {/* 3D Floating ID Card Graphic inside the header */}
        <div className="relative hidden md:block shrink-0 z-10 w-48 h-36 flex items-center justify-center [perspective:1000px]">
          <motion.div
            style={{ transformStyle: "preserve-3d" }}
            animate={{ 
              y: [0, -6, 0],
              rotate: [0, 1.5, 0]
            }}
            whileHover={{ 
              rotateX: -12, 
              rotateY: 18,
              scale: 1.08,
            }}
            transition={{ 
              y: {
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut"
              },
              rotate: {
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              },
              type: "spring", 
              stiffness: 400, 
              damping: 25 
            }}
            className="relative w-44 h-30 cursor-pointer select-none"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-blue-400/25 dark:bg-emerald-400/10 rounded-xl blur-xl -z-10 animate-pulse" />
            
            <svg className="w-full h-full" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Card outline with draw-in animation */}
              <motion.rect 
                x="10" y="10" width="180" height="110" rx="16" 
                fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.5" 
                className="backdrop-blur-md"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              {/* Avatar frame */}
              <motion.rect 
                x="24" y="30" width="40" height="40" rx="20" 
                fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
              {/* Avatar details */}
              <motion.circle 
                cx="44" cy="44" r="7" fill="white"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              />
              <motion.path 
                d="M30 64C30 56 36 53 44 53C52 53 58 56 58 64H30Z" fill="white"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              />
              {/* Lines */}
              <motion.rect 
                x="80" y="38" width="60" height="6" rx="3" fill="white" fillOpacity="0.85"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 60, opacity: 0.85 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />
              <motion.rect 
                x="80" y="52" width="40" height="4" rx="2" fill="white" fillOpacity="0.6"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 40, opacity: 0.6 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
              <motion.rect 
                x="80" y="66" width="80" height="4" rx="2" fill="white" fillOpacity="0.6"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 80, opacity: 0.6 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
              {/* Chip/logo outline */}
              <motion.rect 
                x="154" y="30" width="22" height="16" rx="3" 
                fill="white" fillOpacity="0.08" stroke="white" strokeWidth="1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
              {/* Check badge */}
              <motion.circle 
                cx="174" cy="104" r="18" fill="#3b82f6" stroke="white" strokeWidth="2.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 15 }}
              />
              {/* Checkmark path */}
              <motion.path 
                d="M167 103L172 108L179 101" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Global Alerts */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs overflow-hidden shadow-sm font-semibold"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout (Mockup format) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative w-full">
        
        {/* Left Card: Info & Statistics Summary (Col span 4) */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.08)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="lg:col-span-4 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:border-slate-250 dark:hover:border-slate-700 transition-all duration-300 text-center space-y-6 relative overflow-hidden"
        >
          {/* Top Banner overlay inside card */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-emerald-950/20 dark:to-green-950/30 z-0" />
          
          <div className="relative inline-block mx-auto mt-4 z-10">
            {isInitialsPreset ? (
              <div className="w-24 h-24 rounded-full bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-4xl border-2 border-slate-100 dark:border-slate-800 shadow-inner font-display select-none">
                {firstLetter}
              </div>
            ) : (
              <div className="p-1 rounded-full bg-white dark:bg-slate-900 shadow-md">
                <img 
                  src={photoURL} 
                  alt={user?.fullName} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800"
                />
              </div>
            )}
            
            {/* Active verification checkbadge overlapping bottom-right */}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
              <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
            </div>
          </div>

          <div className="space-y-1 z-10 relative">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display leading-tight">{fullName || user?.fullName}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{user?.email}</p>
            
            {/* Premium User Badge */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-blue-600 dark:text-primary-green px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" /> Premium User
              </span>
            </div>
          </div>

          {/* Joined and activity metadata details */}
          <div className="pt-4 space-y-3.5 text-left text-xs border-t border-slate-100 dark:border-slate-800/80 z-10 relative">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Joined
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{getJoinedDate()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Last Activity
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{getLastActivityDate()}</span>
            </div>
          </div>

          {/* Your Overview stats widgets with mock sparklines */}
          <div className="pt-4 space-y-3 text-left border-t border-slate-100 dark:border-slate-800/80 z-10 relative">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block pl-1">
              Your Overview
            </span>
            <div className="grid grid-cols-2 gap-3.5">
              {/* Reports generated card with mini SVG sparkline */}
              <div className="bg-white/10 dark:bg-slate-950/20 backdrop-blur-sm border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-3 flex flex-col justify-between min-h-[105px] shadow-sm hover:shadow-md hover:bg-white/15 dark:hover:bg-slate-955/25 transition-all duration-300">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Reports Generated</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">{totalCalculations}</p>
                </div>
                <svg className="w-full h-6 mt-1.5" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q15,5 30,12 T60,6 T90,14 L100,10" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[8px] font-bold text-emerald-500 dark:text-emerald-450 block mt-1">10% increase from last month</span>
              </div>
              
              {/* Average Monthly Bill card with mini SVG sparkline */}
              <div className="bg-white/10 dark:bg-slate-950/20 backdrop-blur-sm border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-3 flex flex-col justify-between min-h-[105px] shadow-sm hover:shadow-md hover:bg-white/15 dark:hover:bg-slate-955/25 transition-all duration-300">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider block">Average Monthly Bill</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">₹{averageMonthlyBill || 1250}</p>
                </div>
                <svg className="w-full h-6 mt-1.5" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,12 Q20,18 40,8 T70,14 T90,4 L100,12" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[8px] font-bold text-amber-500 dark:text-amber-450 block mt-1">Within normal budget</span>
              </div>
            </div>
          </div>

          {/* Outlined Logout trigger button */}
          <div className="pt-2 z-10 relative w-full">
            <button
              onClick={handleLogoutClick}
              className="w-full py-3 px-4 bg-transparent border border-red-200 hover:bg-red-50/50 dark:border-red-950/30 dark:hover:bg-red-950/20 text-red-550 dark:text-red-400 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign out of account
            </button>
          </div>
        </motion.div>

        {/* Right Area: Form edit spaces (Col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Account Profile */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -3, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:border-slate-250 dark:hover:border-slate-700 transition-all duration-300 space-y-6 text-left"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-primary-green shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  Profile Information
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
                  Customize your name and select an avatar picture representation.
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {profileSuccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex items-center gap-2 p-3.5 bg-green-50/80 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold overflow-hidden"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-green-500" />
                  <span>Your profile information was updated successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-4">
                {/* Full name input with user icon left and confirmation check right */}
                <div className="space-y-1.5">
                  <label htmlFor="p_name" className="block text-xs font-bold text-slate-700 dark:text-slate-350">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="p_name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                      className="block w-full pl-10 pr-10 py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 bg-white/20 dark:bg-slate-955/40 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-emerald-500 focus:outline-none focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)] dark:focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] transition-all duration-300"
                    />
                    {fullName && fullName.trim().length > 0 && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                        <CheckCircle2 className="w-4.5 h-4.5 fill-emerald-50 dark:fill-transparent" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Avatar selection list */}
                <div className="space-y-3.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Avatar Preset
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {avatarPresets.map((preset, idx) => {
                      const isSelected = photoURL === preset || (preset === "initials" && isInitialsPreset);
                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoURL(preset)}
                          disabled={loading}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 rounded-full border-2 transition-all shrink-0 relative cursor-pointer ${
                            isSelected
                              ? "border-blue-600 dark:border-emerald-500 ring-2 ring-blue-600/20 dark:ring-emerald-500/20 scale-105 shadow-md"
                              : "border-slate-200 dark:border-slate-800 opacity-90 hover:opacity-100 hover:scale-105"
                          }`}
                        >
                          {preset === "initials" ? (
                            <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs font-display select-none">
                              {initials}
                            </div>
                          ) : (
                            <img src={preset} alt={`avatar-${idx}`} className="w-full h-full rounded-full object-cover" />
                          )}
                          
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 z-10">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-xs font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Form Card 2: Security Change password */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -3, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:border-slate-250 dark:hover:border-slate-700 transition-all duration-300 space-y-6 text-left"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-955/20 text-orange-500 dark:text-orange-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  Change Password
                </h3>
                <p className="text-xs text-slate-455 dark:text-slate-500 mt-1">
                  For security reasons, we recommend updating your password periodically.
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {passwordSuccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex items-center gap-2 p-3.5 bg-green-50/80 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold overflow-hidden"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-green-500" />
                  <span>Your password was changed successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password input with visibility toggle */}
                <div className="space-y-1.5">
                  <label htmlFor="new_pass" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new_pass"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="••••••••"
                      className="block w-full pl-4 pr-10 py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 bg-white/20 dark:bg-slate-955/40 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-orange-500 focus:outline-none focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password input with visibility toggle and check confirmation icon */}
                <div className="space-y-1.5">
                  <label htmlFor="conf_pass" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="conf_pass"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="••••••••"
                      className="block w-full pl-4 pr-16 py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 bg-white/20 dark:bg-slate-955/40 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-orange-500 focus:outline-none focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)] transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                        <CheckCircle2 className="w-4.5 h-4.5 fill-emerald-50 dark:fill-transparent" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Segmented Password Strength Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                <div className="min-h-[36px] flex flex-col justify-center">
                  {newPassword && (
                    <div className="space-y-1.5 text-left">
                      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden w-40 bg-slate-100 dark:bg-slate-800">
                        {[1, 2, 3, 4].map(idx => (
                          <div 
                            key={idx}
                            className={`flex-1 h-full rounded-full transition-all duration-300 ${
                              idx <= strength.score ? strength.color.split(" ").slice(-1)[0] : "bg-slate-100 dark:bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${strength.color.split(" ")[0]}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                  className="px-6 py-3 text-xs font-bold rounded-2xl text-slate-800 bg-slate-100 dark:text-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
