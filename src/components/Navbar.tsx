import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, HelpCircle, User, History, Settings, LogOut, ChevronDown, Menu, X, Zap, LayoutDashboard, Receipt, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

const defaultIconVariants: Variants = {
  normal: { scale: 1, rotate: 0, y: 0 },
  active: { scale: 1.1, rotate: 0, y: 0 },
  hover: { scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 10 } }
};

const iconVariants: Record<string, Variants> = {
  "/dashboard": {
    normal: { scale: 1, rotate: 0 },
    active: { scale: 1.1, rotate: 0 },
    hover: { 
      scale: 1.22, 
      rotate: 15,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  },
  "/BillAnalyzer": {
    normal: { scale: 1, y: 0 },
    active: { scale: 1.1, y: 0 },
    hover: { 
      scale: 1.18,
      y: [0, -3, 2, -1, 0],
      transition: { duration: 0.65, ease: "easeInOut" }
    }
  },
  "/history": {
    normal: { scale: 1, rotate: 0 },
    active: { scale: 1.1, rotate: 0 },
    hover: { 
      scale: 1.22,
      rotate: -360,
      transition: { duration: 0.85, ease: "easeInOut" }
    }
  },
  "/survey-data": {
    normal: { scale: 1, rotate: 0, y: 0 },
    active: { scale: 1.1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.2,
      rotate: [0, -10, 8, -5, 0],
      y: [0, -2, 0],
      transition: { duration: 0.6 }
    }
  },
  "/faq": {
    normal: { scale: 1, y: 0, rotate: 0 },
    active: { scale: 1.1, y: 0, rotate: 0 },
    hover: { 
      scale: 1.2,
      y: [0, -4, 0],
      rotate: [0, -8, 8, 0],
      transition: { 
        y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
        rotate: { duration: 0.4 }
      }
    }
  }
};

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const initials = (() => {
    const name = user?.fullName || "User";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  })();

  const firstLetter = (user?.fullName || "U").trim().charAt(0).toUpperCase();
  const isInitialsPreset = !user?.photoURL || user.photoURL === "initials" || user.photoURL.includes("initials");

  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    theme === "dark" ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail !== theme) setTheme(ce.detail);
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, [theme]);

  const toggleTheme  = () => setTheme(prev => prev === "light" ? "dark" : "light");
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = user
    ? [
        { name: "Dashboard",    path: "/dashboard",   icon: LayoutDashboard },
        { name: "Bill Analyzer",path: "/BillAnalyzer", icon: Receipt },
        { name: "My History",   path: "/history",     icon: History },
        { name: "Survey Data",  path: "/survey-data", icon: ClipboardList },
        { name: "FAQ",          path: "/faq",         icon: HelpCircle },
      ]
    : [{ name: "FAQ", path: "/faq", icon: HelpCircle }];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-transparent pointer-events-none ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-[94%] xl:max-w-[1400px] 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
        <div
          className={`relative w-full backdrop-blur-xl border rounded-[24px] transition-all duration-300 ${
            scrolled
              ? "bg-white/75 dark:bg-slate-950/70 border-slate-200/40 dark:border-slate-800/45 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
              : "bg-white/60 dark:bg-slate-950/50 border-slate-200/30 dark:border-slate-800/30 shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          }`}
        >
          <div className="px-6 h-16 flex items-center justify-between">
            {/* ── Brand / Logo ──────────────────────────────────────── */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 shrink-0 group">
              <div className="relative w-9.5 h-9.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 dark:from-emerald-500 dark:via-teal-600 dark:to-cyan-400 p-[1.5px] shadow-[0_0_12px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.45)] dark:group-hover:shadow-[0_0_22px_rgba(16,185,129,0.3)] transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
                  <Zap className="w-4.5 h-4.5 text-primary-blue dark:text-primary-green fill-current/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                </div>
              </div>
              <div className="flex flex-col leading-none text-left">
                <span className="font-display font-black text-sm sm:text-[15.5px] tracking-tight text-slate-900 dark:text-white group-hover:text-primary-blue dark:group-hover:text-primary-green transition-colors duration-200">
                  Smart Household Energy
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-450 font-bold uppercase tracking-widest mt-0.5 transition-colors duration-200">
                  Consumption &amp; Saving Analysis
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ─────────────────────────────────── */}
            <nav
              className="hidden md:flex items-center gap-0.5"
              onMouseLeave={() => setHoveredPath(null)}
            >
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onMouseEnter={() => setHoveredPath(link.path)}
                    className={`relative px-4.5 py-2 rounded-full text-sm font-semibold transition-colors duration-300 flex items-center gap-2 group/nav-item ${
                      active
                        ? "text-primary-blue dark:text-primary-green"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 bg-slate-900/[0.04] dark:bg-white/10 border border-slate-900/[0.03] dark:border-white/5 rounded-full"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    {hoveredPath === link.path && !active && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 bg-slate-900/[0.03] dark:bg-white/[0.04] rounded-full"
                        transition={{ type: "spring", bounce: 0.1, duration: 0.25 }}
                      />
                    )}
                    {Icon && (
                      <motion.div
                        className="relative z-10 shrink-0 flex items-center justify-center"
                        variants={iconVariants[link.path as keyof typeof iconVariants] || defaultIconVariants}
                        animate={hoveredPath === link.path ? "hover" : active ? "active" : "normal"}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            active
                              ? "text-primary-blue dark:text-primary-green"
                              : "text-slate-400 dark:text-slate-550 group-hover/nav-item:text-slate-700 dark:group-hover/nav-item:text-slate-300"
                          }`}
                        />
                      </motion.div>
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Actions ─────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 shadow-sm relative group overflow-hidden"
                title="Toggle theme"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-blue/5 to-primary-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="block relative z-10"
                  >
                    {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {user ? (
                /* User Dropdown */
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border border-slate-200/35 dark:border-slate-800/35 bg-slate-50/40 dark:bg-slate-900/30 hover:bg-slate-100/70 dark:hover:bg-slate-850/60 hover:border-slate-300/50 dark:hover:border-slate-700/50 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-primary-blue via-indigo-400 to-primary-green shadow-[0_0_10px_rgba(37,99,235,0.15)] dark:shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform duration-200">
                        {isInitialsPreset ? (
                          <div className="w-full h-full rounded-full bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs font-display select-none">
                            {firstLetter}
                          </div>
                        ) : (
                          <img
                            src={user.photoURL}
                            alt={user.fullName}
                            className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-950"
                          />
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_6px_rgba(16,185,129,0.4)] animate-pulse" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          style={{ zIndex: 100, transformStyle: "preserve-3d", z: 100 }}
                          className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-slate-955 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                          {/* User Info Header */}
                          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-50/50 to-emerald-50/30 dark:from-blue-950/15 dark:to-emerald-950/10 border-b border-slate-100 dark:border-slate-900">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-primary-blue to-primary-green">
                                {isInitialsPreset ? (
                                  <div className="w-full h-full rounded-full bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-sm font-display select-none">
                                    {initials}
                                  </div>
                                ) : (
                                  <img src={user.photoURL} alt={user.fullName} className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-955" />
                                )}
                              </div>
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-snug">{user.fullName}</p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-550 truncate mt-0.5">{user.email}</p>
                            </div>
                          </div>

                          <div className="p-2 space-y-0.5">
                            {[
                              { to: "/profile",  icon: User,     label: "My Profile" },
                              { to: "/history",  icon: History,  label: "Energy History" },
                              { to: "/settings", icon: Settings, label: "Settings" },
                            ].map(({ to, icon: Icon, label }) => (
                              <Link
                                key={to} to={to}
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-all text-left group"
                              >
                                <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-350 transition-colors duration-200" />
                                {label}
                              </Link>
                            ))}
                            <div className="border-t border-slate-100 dark:border-slate-900 my-1.5" />
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-955/15 transition-all cursor-pointer group"
                            >
                              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Guest Action Buttons */
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-455 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-full transition-all">
                    Sign in
                  </Link>
                  <Link to="/login" className="relative group overflow-hidden px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-primary-blue via-blue-600 to-indigo-600 dark:from-primary-green dark:to-emerald-600 dark:text-slate-955 rounded-full shadow-md hover:shadow-lg shadow-blue-500/15 dark:shadow-emerald-500/10 transition-all duration-300">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">Get started</span>
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Menu Toggles ───────────────────────────────── */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 shadow-sm relative overflow-hidden"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="p-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-855 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 shadow-sm relative overflow-hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileMenuOpen ? "x" : "menu"}
                    initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="block relative z-10"
                  >
                    {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer Popover ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ zIndex: 100, transformStyle: "preserve-3d", z: 100 }}
            className="absolute top-[calc(100%+12px)] left-4 right-4 md:hidden bg-white dark:bg-slate-955 border border-slate-200/50 dark:border-slate-800/55 rounded-3xl shadow-2xl p-4 space-y-3 overflow-hidden pointer-events-auto"
          >
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border ${
                      active
                        ? "bg-gradient-to-r from-blue-50/50 to-emerald-50/20 dark:from-blue-950/15 dark:to-emerald-950/10 text-primary-blue dark:text-primary-green border-slate-200/60 dark:border-slate-800/60"
                        : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {link.name}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <div className="border-t border-slate-100 dark:border-slate-900 my-3" />
                  <div className="flex items-center gap-3.5 px-4 py-2 mb-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-900">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-primary-blue to-primary-green">
                        {isInitialsPreset ? (
                          <div className="w-full h-full rounded-full bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-sm font-display select-none">
                            {initials}
                          </div>
                        ) : (
                          <img src={user.photoURL} alt={user.fullName} className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-955" />
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      { to: "/profile",  icon: User,     label: "Profile" },
                      { to: "/history",  icon: History,  label: "History" },
                      { to: "/settings", icon: Settings, label: "Settings" },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-100/50 dark:border-slate-900/50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        {label}
                      </Link>
                    ))}
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-slate-100 dark:border-slate-900 my-3" />
                  <div className="flex flex-col gap-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                      className="block text-center px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                      className="block text-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-blue to-indigo-650 dark:from-primary-green dark:to-emerald-600 dark:text-slate-955 rounded-2xl shadow-sm"
                    >
                      Get started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
