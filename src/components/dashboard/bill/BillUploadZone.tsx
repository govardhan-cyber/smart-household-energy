import React from "react";
import { motion } from "framer-motion";
import { FileText, Upload, CheckCircle2, AlertTriangle, Trash2, Sparkles } from "lucide-react";
import type { ParserStatus } from "../../../utils/billOcrParser";

interface BillUploadZoneProps {
  file: File | null;
  previewUrl: string | null;
  isPdf: boolean;
  status: ParserStatus;
  errorMessage: string;
  ocrProgress: number;
  setFile: (f: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  validateAndProcessFile: (selectedFile: File) => void;
  handleUploadAndScan: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const BillUploadZone: React.FC<BillUploadZoneProps> = ({
  file,
  previewUrl,
  isPdf,
  status,
  errorMessage,
  ocrProgress,
  setFile,
  setPreviewUrl,
  validateAndProcessFile,
  handleUploadAndScan,
  fileInputRef
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="max-w-2xl mx-auto w-full print:hidden"
    >
      {status !== "idle" && status !== "success" && status !== "error" ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 text-left relative overflow-hidden"
        >
          {/* Ambient glowing background washed light */}
          <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-cyan-400 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Analyzing Your Utility Bill
              </h3>
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              {status === "uploading" || status === "pdf_rendering" ? "STAGE 1/5" : status === "ocr_scanning" ? "STAGE 2/5" : status === "ai_parsing" ? "STAGE 3/5" : "STAGE 4/5"}
            </span>
          </div>

          {/* Scanning graphic & Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* Radar Graphic */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer spinning dash ring */}
                <motion.div 
                  className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                {/* Middle pulse ring */}
                <motion.div 
                  className="absolute w-24 h-24 border border-cyan-400/50 rounded-full"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Inner scanner laser swipe */}
                <div className="absolute inset-2 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 overflow-hidden flex flex-col items-center justify-center">
                  <motion.div 
                    className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-20"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                  <span className="text-sm font-mono font-bold text-slate-800 dark:text-white mt-1">
                    {status === "uploading" ? "10%" : status === "pdf_rendering" ? "30%" : status === "ocr_scanning" ? `${50 + Math.round(ocrProgress / 2)}%` : status === "ai_parsing" ? "85%" : "95%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="md:col-span-8 space-y-3 font-semibold text-xs sm:text-sm">
              
              {/* Step 1 */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-2">
                  {status === "uploading" || status === "pdf_rendering" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <span className={status === "uploading" || status === "pdf_rendering" ? "text-cyan-500 animate-pulse" : "text-slate-500"}>
                    1. Reading Document...
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {status === "uploading" || status === "pdf_rendering" ? "RUNNING" : "COMPLETE"}
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-2">
                  {status === "ocr_scanning" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0"></div>
                  ) : status === "uploading" || status === "pdf_rendering" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-800 shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <span className={status === "ocr_scanning" ? "text-cyan-500 animate-pulse" : status === "uploading" || status === "pdf_rendering" ? "text-slate-450 font-normal" : "text-slate-500"}>
                    2. Extracting Details (PaddleOCR)...
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {status === "ocr_scanning" ? "RUNNING" : status === "uploading" || status === "pdf_rendering" ? "QUEUED" : "COMPLETE"}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-2">
                  {status === "ai_parsing" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0"></div>
                  ) : status === "uploading" || status === "pdf_rendering" || status === "ocr_scanning" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-800 shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <span className={status === "ai_parsing" ? "text-cyan-505 animate-pulse" : status === "uploading" || status === "pdf_rendering" || status === "ocr_scanning" ? "text-slate-450 font-normal" : "text-slate-500"}>
                    3. Validating Data...
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {status === "ai_parsing" ? "RUNNING" : status === "finalizing" ? "COMPLETE" : "QUEUED"}
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-2">
                  {status === "finalizing" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0"></div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-800 shrink-0"></div>
                  )}
                  <span className={status === "finalizing" ? "text-cyan-550 animate-pulse" : "text-slate-450 font-normal"}>
                    4. AI Analysis...
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {status === "finalizing" ? "RUNNING" : "QUEUED"}
                </span>
              </div>

            </div>
          </div>
        </motion.div>
      ) : (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm text-center space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 justify-center select-none">
            <Upload className="w-4 h-4 text-primary-blue dark:text-primary-green" />
            Upload Utility Bill
          </h3>
          
          <label className="border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm hover:bg-slate-50/60 dark:hover:bg-slate-950/20 hover:border-primary-blue/40 dark:hover:border-primary-green/40 transition-all duration-300 group relative overflow-hidden shadow-inner select-none">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*,application/pdf" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            
            {previewUrl ? (
              isPdf ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 py-4">
                  <FileText className="w-10 h-10 text-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-650 dark:text-slate-300 max-w-[200px] truncate">{file?.name}</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">PDF File Selected</span>
                </div>
              ) : (
                <div className="relative py-2 max-h-48 flex items-center justify-center">
                  <img src={previewUrl} alt="Bill Preview" className="max-h-40 object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-800" />
                </div>
              )
            ) : (
              <>
                <div className="p-3 bg-slate-50 dark:bg-slate-955 text-slate-400 dark:text-slate-500 rounded-full border border-slate-150 dark:border-slate-850 group-hover:scale-110 group-hover:text-primary-blue dark:group-hover:text-primary-green group-hover:border-primary-blue/20 dark:group-hover:border-primary-green/20 transition-all duration-300 shadow-sm">
                  <FileText className="w-5 h-5 transition-colors" />
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-855 dark:text-white">
                    Drop your electricity bill here
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-550">
                    or <span className="text-primary-blue dark:text-primary-green font-bold">click to upload</span>
                  </p>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  Supports JPG, PNG, WEBP, PDF (Max 10MB)
                </p>
              </>
            )}
          </label>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Selected File Card */}
          {file && (
            <div className="bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-primary-blue dark:text-primary-green shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{file.name}</p>
                  <p className="text-[10px] text-slate-455">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="p-1.5 text-slate-455 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {file && status === "idle" && (
            <button
              onClick={handleUploadAndScan}
              className="w-full h-11 bg-primary-blue text-white dark:bg-primary-green dark:text-slate-950 font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              Scan & Analyze Bill
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
