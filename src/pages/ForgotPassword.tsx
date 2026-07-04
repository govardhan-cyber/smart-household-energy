import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, AlertCircle, ArrowLeft, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeDCard } from "../components/ThreeDCard";

/* ── animated floating orb ─────────────────────────────────────── */
const Orb = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
);

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send reset link. Please check the email address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = (field: string) =>
    `block w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none border bg-white/80 dark:bg-slate-950/50 border-slate-250 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
      focusedField === field
        ? "border-blue-600 dark:border-emerald-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)] dark:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
        : "hover:border-slate-400 dark:hover:border-slate-700"
    }`;

  return (
    <div className="flex-1 flex items-center lg:items-start justify-center py-12 lg:pt-28 px-4 sm:px-6 lg:px-8 bg-transparent transition-colors duration-300 relative overflow-hidden select-none min-h-screen">
      {/* Glow Orbs */}
      <Orb className="w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 -top-24 -left-24" />
      <Orb className="w-80 h-80 bg-emerald-500/5 bottom-0 right-0" />

      {/* Card size decreased: max-w-md -> max-w-[370px] */}
      <ThreeDCard maxTilt={5} className="w-full max-w-[370px] shadow-xl dark:shadow-2xl z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 p-6 rounded-[24px] space-y-4 shadow-sm"
        >
          {/* Top Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="h-5.5 w-5.5 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reset password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Alerts Area */}
          <AnimatePresence>
            {/* Success Alert */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                role="alert"
                className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-450 text-xs text-left"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Reset link sent!</span>
                  <p className="mt-0.5 text-[11px] text-slate-650 dark:text-slate-300 leading-snug">
                    Please check your inbox (and spam folder) for instructions to reset your password.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error Alert */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                role="alert"
                className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-655 dark:text-red-400 text-xs text-left"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4 text-left" aria-label="Forgot password form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "email" ? "text-blue-500 dark:text-emerald-400" : "text-slate-500 dark:text-slate-550"}`} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className={inputBase("email")}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Submit CTA Button (gradient fix) */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-2.5 px-4 text-sm font-bold rounded-xl text-white dark:text-slate-950 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-emerald-400 dark:via-emerald-300 dark:to-cyan-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-emerald-400 transition-all shadow-md shadow-blue-500/10 dark:shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Sending reset link..." : "Send reset link"}
              </motion.button>

              {/* Back to Login Link */}
              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-650 dark:text-slate-400 dark:hover:text-emerald-455 transition-colors py-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </Link>
            </div>
          </form>

          {/* Security Note Footer */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure data isolation · Firebase encrypted</span>
          </div>
        </motion.div>
      </ThreeDCard>
    </div>
  );
};
