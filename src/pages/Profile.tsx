import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reportsService } from "../utils/reportsService";
import { 
  User, ShieldCheck, Calendar, KeyRound, LogOut, 
  CheckCircle2, AlertCircle, RefreshCw, Sparkles, Award
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
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 bg-slate-50 dark:bg-slate-950/10 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6 text-left"
    >
      {/* Title Header Banner Card */}
      <motion.div 
        variants={itemVariants} 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-950/20 dark:to-green-950/30 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-green-900/20 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 max-w-lg z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10 text-white">
              <User className="w-5 h-5 text-amber-300 dark:text-primary-green" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-200 dark:text-primary-green">
              Account Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">My Profile Settings</h1>
          <p className="text-xs text-blue-100 dark:text-slate-350 leading-relaxed">
            Manage your personal credentials, customize visual avatars, track calculator report statistics, and update security parameters.
          </p>
        </div>
      </motion.div>

      {/* Global Alerts */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 text-red-655 dark:text-red-450 text-xs overflow-hidden shadow-sm"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Info & Statistics Summary (Col span 4) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg text-center space-y-6 relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-primary-blue/5 dark:bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative inline-block mx-auto">
            <motion.div
              key={photoURL}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative p-1 rounded-full bg-gradient-to-tr from-primary-blue/30 to-indigo-500/30 dark:from-primary-green/30 dark:to-emerald-500/30 shadow-inner"
            >
              <img 
                src={photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || "U")}`} 
                alt={user?.fullName} 
                className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-slate-900 mx-auto"
              />
            </motion.div>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md" title="Account active">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display leading-tight">{fullName || user?.fullName}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-mono">{user?.email}</p>
          </div>

          {/* Details list */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-850/80 space-y-3 text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-450 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-blue dark:text-primary-green" /> Joined
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(user?.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-455 font-bold flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-warning-orange" /> Activity
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(user?.lastLogin)}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-slate-50/30 dark:bg-slate-950/30 p-4 rounded-2xl border-l-4 border-l-primary-blue border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-primary-blue dark:text-primary-green" />
                Reports
              </span>
              <p className="text-2xl font-display font-extrabold text-primary-blue dark:text-primary-green mt-1">{totalCalculations}</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-slate-50/30 dark:bg-slate-950/30 p-4 rounded-2xl border-l-4 border-l-warning-orange border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-warning-orange animate-pulse" />
                Avg Bill
              </span>
              <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">₹{averageMonthlyBill}</p>
            </motion.div>
          </div>

          {/* Logout Trigger button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 dark:border-red-900/50 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white hover:border-transparent rounded-xl text-xs font-bold text-red-500 dark:text-red-400 transition-all active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Sign out of account
          </button>
        </motion.div>

        {/* Right Area: Form edit spaces (Col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Form Card 1: Account Profile */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <User className="w-5 h-5 text-primary-blue dark:text-primary-green" />
                Profile Information
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
                Customize your name and select an avatar picture representation.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {profileSuccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-955/10 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold overflow-hidden"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-green-500" />
                  <span>Your profile information was updated successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-4">
                {/* Full name input */}
                <div>
                  <label htmlFor="p_name" className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="p_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-green/20 focus:border-primary-blue dark:focus:border-primary-green transition-all text-xs"
                  />
                </div>

                {/* Avatar selection list */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">
                    Select Avatar Preset
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {avatarPresets.map((preset, idx) => {
                      const isSelected = photoURL === preset;
                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoURL(preset)}
                          disabled={loading}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all shrink-0 relative ${
                            isSelected
                              ? "border-primary-blue dark:border-primary-green ring-4 ring-primary-blue/30 dark:ring-primary-green/30 scale-110 shadow-lg"
                              : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={preset} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary-blue/10 dark:bg-primary-green/10 flex items-center justify-center">
                              <div className="p-0.5 rounded-full bg-primary-blue dark:bg-primary-green text-white shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                              </div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-emerald-500 dark:to-green-500 dark:hover:from-emerald-600 dark:hover:to-green-600 dark:text-slate-950 transition-all disabled:opacity-50 active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Form Card 2: Security Change password */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <KeyRound className="w-5 h-5 text-warning-orange" />
                Change Password
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
                For security reasons, we recommend updating your password periodically.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {passwordSuccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-955/10 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold overflow-hidden"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-green-500" />
                  <span>Your password was changed successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label htmlFor="new_pass" className="block text-xs font-bold text-slate-455 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
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
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-955/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-warning-orange/20 focus:border-warning-orange transition-all text-xs"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="conf_pass" className="block text-xs font-bold text-slate-455 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
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
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-warning-orange/20 focus:border-warning-orange transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-warning-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-orange-600 dark:to-amber-500 dark:hover:from-orange-700 dark:hover:to-amber-600 transition-all disabled:opacity-50 active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer"
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
