import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Zap, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── animated floating orb ─────────────────────────────────────── */
const Orb = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.75, 0.5] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  />
);

export const Login: React.FC = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/dashboard";

  React.useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [rememberMe, setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(null); setIsSubmitting(true);
    try { await login(email, password, rememberMe); navigate(from, { replace: true }); }
    catch (err: any) { setError(err.message || "Failed to log in. Please check your credentials."); }
    finally { setIsSubmitting(false); }
  };

  const handleGoogleSignIn = async () => {
    setError(null); setIsSubmitting(true);
    try { await loginWithGoogle(); navigate(from, { replace: true }); }
    catch (err: any) { setError(err.message || "Failed to sign in with Google."); }
    finally { setIsSubmitting(false); }
  };

  const inputBase = (field: string) =>
    `block w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all duration-200 outline-none border-2 bg-white dark:bg-slate-900/60 disabled:opacity-50 disabled:cursor-not-allowed ${
      focusedField === field
        ? "border-primary-blue dark:border-primary-green shadow-[0_0_0_4px_rgba(37,99,235,0.08)] dark:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
    }`;

  return (
    <div className="flex-1 flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ── LEFT PANEL — decorative ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-gradient-to-br from-primary-blue via-blue-700 to-primary-green flex-col items-center justify-center gap-14 p-12">
        {/* Animated orbs */}
        <Orb className="w-96 h-96 bg-white/10 -top-24 -left-24" />
        <Orb className="w-80 h-80 bg-white/10 bottom-0 right-0" />
        <Orb className="w-64 h-64 bg-emerald-400/20 top-1/2 left-1/3" />

        {/* Grid dots overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center justify-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-display font-extrabold text-2xl tracking-tight">EnergyAI</span>
        </motion.div>

        {/* Hero text — centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-10 space-y-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Smart Energy Analytics
          </div>
          <h2 className="text-5xl font-display font-extrabold text-white leading-[1.1]">
            Monitor.<br />Analyse.<br />Save Energy.
          </h2>
          <p className="text-blue-100/80 text-base leading-relaxed mx-auto max-w-xs">
            Track your household energy consumption, get AI-powered bill insights, and reduce your carbon footprint.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-10 pt-2">
            {[
              { value: "40%", label: "Avg. savings" },
              { value: "AI", label: "Bill analysis" },
              { value: "100%", label: "Data private" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-blue-200/70 font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 text-blue-200/50 text-xs"
        >
          © 2026 EnergyAI · Secure & Private
        </motion.p>
      </div>

      {/* ── RIGHT PANEL — form ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile brand (hidden on desktop) */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-blue to-primary-green flex items-center justify-center shadow-lg">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">EnergyAI</span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              Welcome back 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-primary-blue dark:text-primary-green hover:underline underline-offset-2 transition-colors"
              >
                Create one free →
              </Link>
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors ${focusedField === "email" ? "text-primary-blue dark:text-primary-green" : "text-slate-400"}`} />
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className={inputBase("email")}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-slate-500 hover:text-primary-blue dark:text-slate-400 dark:hover:text-primary-green transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors ${focusedField === "password" ? "text-primary-blue dark:text-primary-green" : "text-slate-400"}`} />
                <input
                  id="password" name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password" required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className={`${inputBase("password")} pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center">
                <input
                  id="remember-me" name="remember-me" type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue/20 dark:border-slate-700 cursor-pointer"
                />
              </div>
              <label htmlFor="remember-me" className="text-sm font-medium text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-primary-blue to-blue-700 dark:from-primary-green dark:to-emerald-600 dark:text-slate-950 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue dark:focus:ring-primary-green transition-all shadow-lg shadow-primary-blue/20 dark:shadow-emerald-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Google */}
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.22 3.02v2.51h3.58c2.09-1.92 3.29-4.75 3.29-7.38z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.58-2.51c-.99.66-2.26 1.06-3.76 1.06-2.9 0-5.35-1.97-6.22-4.63H2.82v2.59C4.8 21.09 8.16 24 12 24z" />
                <path fill="#FBBC05" d="M5.78 14.97c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1V8.18H2.82C2.04 9.73 1.6 11.47 1.6 13.3c0 1.83.44 3.57 1.22 5.12l2.96-2.45z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 8.16 0 4.8 2.91 2.82 7.02l2.96 2.45c.87-2.66 3.32-4.63 6.22-4.63z" />
              </svg>
              Continue with Google
            </motion.button>
          </form>

          {/* Security footer */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure data isolation · Firebase encrypted</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
