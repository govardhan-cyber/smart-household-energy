import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, HelpCircle, User, History, Settings, LogOut, ChevronDown, Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== theme) {
        setTheme(customEvent.detail);
      }
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

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

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Bill Analyzer", path: "/BillAnalyzer" },
        { name: "My History", path: "/history" },
        { name: "Survey Data", path: "/survey-data" },
        { name: "FAQ", path: "/faq" },
      ]
    : [
        { name: "FAQ", path: "/faq" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Header */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-blue to-primary-green flex items-center justify-center shadow-md shadow-primary-blue/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight text-slate-900 dark:text-white">
                  Smart Household Energy
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Consumption & Saving Analysis
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "bg-slate-100 dark:bg-slate-800 text-primary-blue dark:text-primary-green"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action buttons (Right side) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              title="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Help/FAQ shortcut */}
            <Link
              to="/faq"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              title="Frequently Asked Questions"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>

            {user ? (
              /* User Avatar and Dropdown */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                >
                  <img
                    src={user.photoURL}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-150 dark:border-slate-800">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Signed in as
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/history"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <History className="w-4 h-4 text-slate-400" />
                            Energy History
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            Settings
                          </Link>
                          <hr className="border-slate-150 dark:border-slate-800 my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Guest Actions */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 rounded-xl transition-colors duration-200 shadow-md shadow-primary-blue/10 dark:shadow-none"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-slate-100 dark:bg-slate-800 text-primary-blue dark:text-primary-green"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <>
                  <hr className="border-slate-150 dark:border-slate-800 my-2" />
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <img src={user.photoURL} alt={user.fullName} className="w-10 h-10 rounded-full border border-slate-300" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.fullName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-base font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    <User className="w-5 h-5 text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-base font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    <History className="w-5 h-5 text-slate-400" />
                    Energy History
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-base font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    <Settings className="w-5 h-5 text-slate-400" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 mt-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-slate-150 dark:border-slate-800 my-2" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-4 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-4 py-2.5 mt-2 text-base font-semibold text-white bg-primary-blue dark:bg-primary-green dark:text-slate-950 rounded-xl transition-colors duration-200 shadow-md"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
