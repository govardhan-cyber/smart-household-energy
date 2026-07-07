import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";
import { initTariffCalculator } from "./utils/tariffCalculator";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Page lazy imports for bundle size optimization
const Home = React.lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Login = React.lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register = React.lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const Dashboard = React.lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const BillAnalyzer = React.lazy(() => import("./pages/BillAnalyzer").then(m => ({ default: m.BillAnalyzer })));
const History = React.lazy(() => import("./pages/History").then(m => ({ default: m.History })));
const SurveyData = React.lazy(() => import("./pages/SurveyData").then(m => ({ default: m.SurveyData })));
const Profile = React.lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const Settings = React.lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const FAQ = React.lazy(() => import("./pages/FAQ").then(m => ({ default: m.FAQ })));

const ThreeBackgroundLazy = React.lazy(() => import("./components/ThreeBackground").then(m => ({ default: m.ThreeBackground })));

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-green dark:border-slate-800 dark:border-t-primary-green rounded-full animate-spin"></div>
    <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider animate-pulse">Loading secure session...</span>
  </div>
);

// Scroll restoration helper component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import "./App.css";

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-slate-50/80 to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <React.Suspense fallback={null}>
        <ThreeBackgroundLazy className="fixed inset-0 pointer-events-none no-print" />
      </React.Suspense>
      <Navbar />
      
      <main className="flex-1 flex flex-col relative">
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Private Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ErrorBoundary page="Dashboard">
                    <Dashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/BillAnalyzer"
              element={
                <ProtectedRoute>
                  <ErrorBoundary page="Bill Analyzer">
                    <BillAnalyzer />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <ErrorBoundary page="History">
                    <History />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey-data"
              element={
                <ProtectedRoute>
                  <ErrorBoundary page="Survey Data">
                    <SurveyData />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ErrorBoundary page="Profile">
                    <Profile />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ErrorBoundary page="Settings">
                    <Settings />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

const App: React.FC = () => {
  // Theme initialization on mount
  useEffect(() => {
    initTariffCalculator().catch(console.error);
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedAccent = localStorage.getItem("she_accent") || "blue";
    const root = document.documentElement;
    
    if (savedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Set accent class
    root.classList.remove("accent-blue", "accent-green", "accent-purple", "accent-orange", "accent-teal");
    root.classList.add(`accent-${savedAccent}`);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ErrorBoundary page="App">
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;
