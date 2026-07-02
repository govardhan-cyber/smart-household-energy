import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, AlertCircle, ArrowLeft, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        {/* Top Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-blue to-primary-green flex items-center justify-center shadow-lg shadow-primary-blue/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-display font-extrabold text-slate-900 dark:text-white">
            Reset password
          </h2>
          <p className="mt-2 text-sm text-slate-550 dark:text-slate-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2.5 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-semibold">Reset link sent!</span>
              <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                Please check your inbox (and spam folder) for instructions to reset your password.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue dark:focus:border-primary-green transition-all text-sm disabled:opacity-50"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue dark:focus:ring-primary-green transition-all shadow-md shadow-primary-blue/10 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </button>

            {/* Back to Login Link */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-650 hover:text-primary-blue dark:text-slate-400 dark:hover:text-primary-green transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
