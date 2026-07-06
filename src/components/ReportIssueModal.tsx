import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Upload, CheckCircle2, AlertTriangle, Bug, Calculator, 
  BarChart3, Bot, Sun, Lightbulb, Palette, LogIn, 
  Zap, Smartphone, HelpCircle, FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { functions, storage, IS_FIREBASE_CONFIGURED } from "../firebase/config";
import { httpsCallable } from "firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
}

const ISSUE_TYPES = [
  { id: "Bug Report", label: "Bug Report", icon: Bug, color: "text-red-500 bg-red-500/10 dark:bg-red-500/15" },
  { id: "Incorrect Bill Calculation", label: "Incorrect Bill Calculation", icon: Calculator, color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/15" },
  { id: "Data Problem", label: "Data Problem", icon: BarChart3, color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/15" },
  { id: "AI Recommendation Issue", label: "AI Recommendation Issue", icon: Bot, color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/15" },
  { id: "Solar Calculator Issue", label: "Solar Calculator Issue", icon: Sun, color: "text-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/15" },
  { id: "Feature Request", label: "Feature Request", icon: Lightbulb, color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15" },
  { id: "UI/UX Issue", label: "UI/UX Issue", icon: Palette, color: "text-pink-500 bg-pink-500/10 dark:bg-pink-500/15" },
  { id: "Login / Account Problem", label: "Login / Account Problem", icon: LogIn, color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/15" },
  { id: "Performance Issue", label: "Performance Issue", icon: Zap, color: "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/15" },
  { id: "Mobile Display Issue", label: "Mobile Display Issue", icon: Smartphone, color: "text-orange-500 bg-orange-500/10 dark:bg-orange-500/15" },
  { id: "Other", label: "Other", icon: HelpCircle, color: "text-slate-500 bg-slate-500/10 dark:bg-slate-500/15" },
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, initialType }) => {
  const { user } = useAuth();
  
  const [issueType, setIssueType] = useState<string>("Bug Report");
  const [description, setDescription] = useState<string>("");
  
  // Screenshot states
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  // Submit state
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync initial type when opened
  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        setIssueType(initialType);
      } else {
        setIssueType("Bug Report");
      }
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      setStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen, initialType]);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      
      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        
        const first = focusableElements[0] as HTMLElement;
        const last = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle file preview URL generation
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      // PDF or non-image supported formats
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected?: File) => {
    if (!selected) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(selected.type)) {
      setErrorMsg("Unsupported file format. Please upload PNG, JPG, or PDF.");
      return;
    }

    // 5MB limit
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    setErrorMsg("");
    setFile(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const selected = e.dataTransfer.files?.[0];
    validateAndSetFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg("Please describe the issue.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      let screenshotUrl = "";

      // 1. Upload screenshot to Firebase Storage if exists and Firebase is configured
      if (file) {
        if (IS_FIREBASE_CONFIGURED && storage) {
          const timestamp = Date.now();
          const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
          const storageRef = ref(storage, `issue-screenshots/${timestamp}_${safeName}`);
          
          await uploadBytes(storageRef, file);
          screenshotUrl = await getDownloadURL(storageRef);
        } else {
          // Firebase not configured - mockup base64 upload
          screenshotUrl = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop";
        }
      }

      const email = user?.email || "anonymous@example.com";
      const name = user?.fullName || "Anonymous User";

      // 2. Call cloud function or fallback
      if (IS_FIREBASE_CONFIGURED && functions) {
        const sendIssueReportFn = httpsCallable(functions, "sendIssueReport");
        await sendIssueReportFn({
          issueType,
          description,
          screenshotUrl,
          userEmail: email,
          userName: name
        });
      } else {
        // Simulated API call latency in mock mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Mock Mode issue report submitted:", {
          issueType,
          description,
          screenshotUrl,
          userEmail: email,
          userName: name
        });
      }

      setStatus("success");
    } catch (err: any) {
      console.error("Failed to submit issue report:", err);
      setErrorMsg(err.message || "An error occurred while submitting the issue. Please try again.");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-slate-950/70"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            className="relative w-full max-w-2xl bg-gradient-to-r from-slate-50/95 to-slate-100/85 dark:from-slate-900/95 dark:to-slate-950/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl rounded-3xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h3 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bug className="w-5 h-5 text-blue-500" />
                  Report an Issue
                </h3>
                <p id="modal-description" className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Help us improve your experience. We will get back to you soon.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-450 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            {status === "success" ? (
              <div className="p-8 text-center flex flex-col items-center justify-center flex-grow space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Issue Report Submitted!</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you for reporting this issue. A copy of this report has been logged and sent to our support desk. We will review it shortly.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-grow">
                {/* 1. Issue Type Pills */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">
                    1. Issue Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-1 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white/30 dark:bg-slate-900/20 backdrop-blur-md">
                    {ISSUE_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = issueType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setIssueType(type.id)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-[11px] font-semibold transition-all duration-300 text-left ${
                            isSelected 
                              ? "border-blue-500/80 bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-400 shadow-sm" 
                              : "border-transparent bg-slate-50/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-450 hover:bg-slate-100/60 dark:hover:bg-slate-900/70"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${type.color}`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Describe the Issue */}
                <div className="space-y-2">
                  <label htmlFor="issue-description" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">
                    2. Describe the Issue
                  </label>
                  <textarea
                    id="issue-description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened, what you expected, and how we can reproduce the issue."
                    className="w-full bg-white/60 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 dark:focus:ring-cyan-400/20 dark:focus:border-cyan-400/60 transition-all font-sans resize-none"
                  />
                </div>

                {/* 3. Drag and Drop Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">
                    3. Upload Screenshot
                  </label>
                  
                  {file ? (
                    <div className="flex items-center justify-between p-3 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white/50 dark:bg-slate-900/30">
                      <div className="flex items-center gap-3">
                        {previewUrl ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-850">
                            <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-500">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 rounded-xl bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 group ${
                        isDragOver 
                          ? "border-blue-500 bg-blue-500/5 dark:border-cyan-400 dark:bg-cyan-400/5" 
                          : "border-slate-200 hover:border-blue-500/50 dark:border-slate-800 dark:hover:border-cyan-400/50 bg-white/30 dark:bg-slate-900/15"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".png,.jpg,.jpeg,.pdf"
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-all duration-300">
                        <Upload className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Drag and drop screenshot, or <span className="text-blue-500 dark:text-cyan-400 underline font-extrabold">browse</span>
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400">
                          Supported formats: PNG, JPG, PDF (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>



                {/* Error Banner */}
                {errorMsg && (
                  <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 dark:border-red-500/30 rounded-xl p-3 animate-shake">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-bold leading-tight">{errorMsg}</span>
                  </div>
                )}

                {/* Footer Submit buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={status === "loading"}
                    className="px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-xs transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Report...</span>
                      </>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
