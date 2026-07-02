import React from "react";
import { Link } from "react-router-dom";
import { Zap, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand block */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-blue to-primary-green flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-md text-slate-900 dark:text-white">
                Smart Household Energy
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Empowering consumers in Andhra Pradesh to understand their electricity consumption, analyze LT-I domestic slab bills, and make informed choices to save money and the environment.
            </p>
          </div>

          {/* Quick links block */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-blue dark:hover:text-primary-green transition-colors">
                  Calculators & Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-blue dark:hover:text-primary-green transition-colors">
                  My History
                </Link>
              </li>
              <li>
                <Link to="/survey-data" className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-blue dark:hover:text-primary-green transition-colors">
                  Survey Data (30 Members)
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support block */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-blue dark:hover:text-primary-green transition-colors">
                  FAQ & Guide
                </Link>
              </li>
              <li>
                <a href="https://apdiscom.ap.gov.in" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-blue dark:hover:text-primary-green transition-colors">
                  Official APDISCOM portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Smart Household Energy. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            Designed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> for energy efficiency.
          </p>
        </div>
      </div>
    </footer>
  );
};
