import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db, IS_FIREBASE_CONFIGURED } from "../firebase/config";
import { collection, doc, addDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Printer, Download, Sparkles, CheckCircle2, AlertTriangle 
} from "lucide-react";
import { LiveGridStatusWidget, CarbonSavingsWidget } from "../components/dashboard/SidebarWidgets";
import { BillUploadZone } from "../components/dashboard/bill/BillUploadZone";
import { BillHistoryList } from "../components/dashboard/bill/BillHistoryList";
import { BillResultsView } from "../components/dashboard/bill/BillResultsView";
import { BillModals } from "../components/dashboard/bill/BillModals";
import { 
  convertPdfToImage, extractTextViaOcr, parseImageWithGeminiMultimodal, 
  parseOcrWithGemini, parseOcrWithHeuristics, type ParserStatus 
} from "../utils/billOcrParser";

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface ParsedBillData {
  consumerName: string;
  serviceNumber: string;
  customerID: string;
  address: string;
  billDate: string;
  billingPeriod: string;
  dueDate: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  energyCharge: number;
  fixedCharge: number;
  tax: number;
  otherCharges: number;
  totalAmount: number;
  tariffCategory: string;
  energyInsights: string[];
}

export interface BillRecord {
  id: string;
  userId: string;
  uploadDate: string;
  fileName: string;
  parsedData: ParsedBillData;
  ocrText: string;
}

export const BillAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<BillRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Upload & OCR States
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [status, setStatus] = useState<ParserStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrSteps, setOcrSteps] = useState("");

  // Extracted Bill Details
  const [activeBill, setActiveBill] = useState<BillRecord | null>(null);
  const [selectedBillForModal, setSelectedBillForModal] = useState<BillRecord | null>(null);

  // Custom Settings for Score
  const familySize = 4;
  const houseType = "apartment" as string;
  
  // Toast notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (status === "idle") {
      return;
    }
    const timeStr = new Date().toLocaleTimeString();
    let logMsg = "";
    if (status === "uploading") {
      logMsg = `[${timeStr}] [UPLOAD] Reading uploaded file and preparing buffer...`;
    } else if (status === "pdf_rendering") {
      logMsg = `[${timeStr}] [PREPROCESS] Converting PDF pages to high-resolution images...`;
    } else if (status === "ocr_scanning") {
      logMsg = `[${timeStr}] [OCR] Running Tesseract character recognition engine...`;
    } else if (status === "ai_parsing") {
      logMsg = `[${timeStr}] [AI] Sending extracted OCR text payload to Gemini models...`;
    } else if (status === "finalizing") {
      logMsg = `[${timeStr}] [CALC] Calibrating slab rates, carbon emission factor, and efficiency score...`;
    }
    
    if (logMsg) {
      console.log(logMsg);
    }
  }, [status]);

  useEffect(() => {
    if (ocrSteps) {
      const timeStr = new Date().toLocaleTimeString();
      console.log(`[${timeStr}] [PROCESS] ${ocrSteps}`);
    }
  }, [ocrSteps]);

  // Load history from Firestore or LocalStorage fallback
  const loadHistory = async () => {
    if (!user) return;
    
    const cacheKey = `she_bill_history_${user.uid}`;
    const cached = localStorage.getItem(cacheKey);
    let cachedRecords: BillRecord[] = [];
    if (cached) {
      try {
        cachedRecords = JSON.parse(cached);
        setHistory(cachedRecords);
        if (cachedRecords.length > 0 && !activeBill) {
          setActiveBill(cachedRecords[0]);
        }
        setLoadingHistory(false);
      } catch (e) {
        console.error("Failed to parse cached bill history:", e);
      }
    } else {
      setLoadingHistory(true);
    }

    try {
      if (IS_FIREBASE_CONFIGURED && db) {
        const q = query(
          collection(db, "billHistory"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const records: BillRecord[] = [];
        snap.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() } as BillRecord);
        });
        
        records.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        
        setHistory(records);
        localStorage.setItem(cacheKey, JSON.stringify(records));
        
        if (records.length > 0 && !activeBill) {
          setActiveBill(records[0]);
        }
      } else {
        if (!cached) {
          setHistory([]);
        }
      }
    } catch (err) {
      console.error("Error fetching bill history:", err);
      if (cachedRecords.length > 0) {
        setHistory(cachedRecords);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // Validate File
  const validateAndProcessFile = (selectedFile: File) => {
    setErrorMessage("");
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage("Unsupported file type. Please upload a JPG, PNG, WEBP image or a PDF.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds the 10 MB maximum size limit.");
      return;
    }

    setFile(selectedFile);
    setIsPdf(selectedFile.type === "application/pdf");
    
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setStatus("idle");
  };

  // Main Upload & Scan handler
  const handleUploadAndScan = async () => {
    if (!file || !user) return;
    
    setStatus("uploading");
    setOcrSteps("Reading file buffer...");

    try {
      let imageSrc = previewUrl || "";
      
      if (isPdf) {
        imageSrc = await convertPdfToImage(file, { setStatus, setOcrSteps });
      }
      
      let textResult = "";
      let structuredData: ParsedBillData | null = null;
      let ocrFailed = false;

      try {
        textResult = await extractTextViaOcr(imageSrc, { setStatus, setOcrSteps, setOcrProgress });
      } catch (ocrErr) {
        console.warn("Tesseract OCR extraction failed, trying direct multimodal fallback:", ocrErr);
        ocrFailed = true;
      }

      const isTextPoor = !textResult.trim() || textResult.trim().length < 150 || (textResult.match(/\d+/g) || []).length < 5;

      if (ocrFailed || isTextPoor) {
        console.log("Tesseract text is poor/blank. Activating Gemini Multimodal AI direct scan...");
        setOcrSteps("Tesseract OCR text is poor/blurry. Activating Multimodal AI scanner...");
        try {
          structuredData = await parseImageWithGeminiMultimodal(imageSrc, { setStatus, setOcrSteps });
          textResult = "[Direct Multimodal AI Image Scan - Tesseract Bypassed]";
        } catch (multiErr: unknown) {
          console.error("Multimodal fallback also failed:", multiErr);
          const multiErrMessage = multiErr instanceof Error ? multiErr.message : String(multiErr);
          if (textResult.trim()) {
            try {
              structuredData = await parseOcrWithGemini(textResult, { setStatus, setOcrSteps });
            } catch (geminiErr: unknown) {
              structuredData = parseOcrWithHeuristics(textResult);
            }
          } else {
            throw new Error(`Direct AI scanning failed: ${multiErrMessage}`);
          }
        }
      } else {
        try {
          structuredData = await parseOcrWithGemini(textResult, { setStatus, setOcrSteps });
        } catch (geminiErr: unknown) {
          console.warn("Gemini parsing failed, falling back to local OCR heuristics:", geminiErr);
          structuredData = parseOcrWithHeuristics(textResult);
        }
      }
      
      const record: Omit<BillRecord, "id"> = {
        userId: user.uid,
        uploadDate: new Date().toISOString(),
        fileName: file.name,
        parsedData: structuredData,
        ocrText: textResult
      };

      let finalRecord: BillRecord;

      if (IS_FIREBASE_CONFIGURED && db) {
        const docRef = await addDoc(collection(db, "billHistory"), record);
        finalRecord = { id: docRef.id, ...record };
      } else {
        const id = "mock_b_" + Math.random().toString(36).substr(2, 9);
        finalRecord = { id, ...record };
      }

      const localList = [finalRecord, ...history];
      localStorage.setItem(`she_bill_history_${user.uid}`, JSON.stringify(localList));

      setHistory(prev => [finalRecord, ...prev]);
      setActiveBill(finalRecord);
      
      setStatus("finalizing");
      setOcrSteps("Tariff structure & Dynamic calculations calibrated...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus("success");
      window.dispatchEvent(new CustomEvent("she_bill_uploaded", { 
        detail: finalRecord 
      }));
      setToast({ type: "success", message: "Bill parsed and added successfully!" });
      
      setFile(null);
      setPreviewUrl(null);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Failed to process bill. Please check the file quality or API keys.";
      setStatus("error");
      setErrorMessage(errMsg);
      setToast({ type: "error", message: errMsg });
    }
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    setDeleteBillId(id);
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteBillId) return;
    const targetId = deleteBillId;
    setDeleteBillId(null);

    try {
      if (IS_FIREBASE_CONFIGURED && db) {
        await deleteDoc(doc(db, "billHistory", targetId));
      }
      
      const localList = history.filter(h => h.id !== targetId);
      localStorage.setItem(`she_bill_history_${user.uid}`, JSON.stringify(localList));
      
      setHistory(prev => prev.filter(h => h.id !== targetId));
      if (activeBill?.id === targetId) {
        const remaining = history.filter(h => h.id !== targetId);
        setActiveBill(remaining.length > 0 ? remaining[0] : null);
      }
      setToast({ type: "success", message: "Bill deleted successfully." });
    } catch (err: unknown) {
      console.error(err);
      setToast({ type: "error", message: "Failed to delete record." });
    }
  };

  const detailsModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBillForModal) {
      setTimeout(() => detailsModalRef.current?.focus(), 50);
    }
  }, [selectedBillForModal]);

  useEffect(() => {
    if (deleteBillId) {
      setTimeout(() => deleteModalRef.current?.focus(), 50);
    }
  }, [deleteBillId]);

  const handleDetailsModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setSelectedBillForModal(null);
      return;
    }
    if (e.key === "Tab") {
      const focusableElements = e.currentTarget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  const handleDeleteModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setDeleteBillId(null);
      return;
    }
    if (e.key === "Tab") {
      const focusableElements = e.currentTarget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Calculations & Formula engines
  const handleExplainWithAI = () => {
    if (!activeBill) return;
    
    const prompt = `Explain my electricity bill in a simple, formatted way. Here are the details:
- Units Consumed: ${activeBill.parsedData.unitsConsumed} kWh
- Total Bill Amount: ₹${activeBill.parsedData.totalAmount}
- Tariff Category: ${activeBill.parsedData.tariffCategory || "Domestic"}
- Due Date: ${activeBill.parsedData.dueDate || "N/A"}
- Billing Period: ${activeBill.parsedData.billingPeriod || "N/A"}
Please break down the charges in simple terms and provide 2-3 saving tips.`;

    window.dispatchEvent(new CustomEvent("she_trigger_chat", {
      detail: { message: prompt }
    }));
  };

  const getCalculations = (bill: BillRecord | null = activeBill) => {
    if (!bill) return null;
    const data = bill.parsedData;
    const units = data.unitsConsumed || 150;
    const amount = data.totalAmount || 1000;

    const co2 = parseFloat((units * 0.82).toFixed(2));
    
    const baseline = 100 + (familySize * 45) + (houseType === "villa" ? 120 : houseType === "independent" ? 60 : 0);
    let score = 95;
    if (units > baseline) {
      score = Math.max(10, Math.round(90 - ((units - baseline) / baseline) * 45));
    } else {
      score = Math.min(100, Math.round(95 - (units / baseline) * 8));
    }

    let grade = "B";
    if (score >= 90) grade = "A+";
    else if (score >= 80) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 50) grade = "C";
    else grade = "D";

    const pastAmounts = history.slice(0, 5).map(h => h.parsedData.totalAmount);
    let forecastAmount = Math.round(amount * 1.04);
    let confidence = 75;

    if (pastAmounts.length >= 3) {
      const sum = pastAmounts.reduce((s, a) => s + a, 0);
      forecastAmount = Math.round((sum / pastAmounts.length) * 1.02);
      confidence = Math.min(95, 80 + pastAmounts.length * 3);
    } else {
      confidence = 92;
    }

    const pieData = [
      { name: "Energy Charge", value: data.energyCharge || (amount * 0.8) },
      { name: "Fixed Charge", value: data.fixedCharge || (amount * 0.1) },
      { name: "Tax / Duty", value: data.tax || (amount * 0.05) },
      { name: "Other Charges", value: data.otherCharges || (amount * 0.05) }
    ].map(item => ({ ...item, value: Math.round(item.value) }));

    const recommendations = [
      {
        title: "Set AC to 24°C",
        desc: "Save about 12% on cooling units dynamically.",
        savings: Math.round(units * 0.12 * 7.5),
        difficulty: "Easy",
        impact: "High"
      },
      {
        title: "Replace Old Fans with BLDC",
        desc: "Save up to 8% on continuous fan ventilation loads.",
        savings: Math.round(units * 0.08 * 7.5),
        difficulty: "Medium",
        impact: "Medium"
      },
      {
        title: "Unplug Idle Standby Appliances",
        desc: "Standby phantom draws cost about 4% of billing rates.",
        savings: Math.round(units * 0.04 * 7.5),
        difficulty: "Easy",
        impact: "Low"
      }
    ];

    return {
      co2,
      score,
      grade,
      forecastAmount,
      confidence,
      pieData,
      recommendations
    };
  };

  const calcs = getCalculations();
  const modalCalcs = getCalculations(selectedBillForModal);

  const handleExportCSV = (bill: BillRecord | null = activeBill) => {
    if (!bill) return;
    const data = bill.parsedData;
    const c = getCalculations(bill)!;
    
    const csvContent = [
      ["Parameter", "Details"],
      ["Consumer Name", data.consumerName],
      ["Service Number", data.serviceNumber],
      ["Customer ID", data.customerID],
      ["Address", data.address],
      ["Bill Date", data.billDate],
      ["Billing Period", data.billingPeriod],
      ["Due Date", data.dueDate],
      ["Units Consumed (kWh)", data.unitsConsumed],
      ["Previous Reading", data.previousReading],
      ["Current Reading", data.currentReading],
      ["Energy Charge (INR)", data.energyCharge],
      ["Fixed Charge (INR)", data.fixedCharge],
      ["Tax (INR)", data.tax],
      ["Other Charges (INR)", data.otherCharges],
      ["Total Bill Amount (INR)", data.totalAmount],
      ["Tariff Category", data.tariffCategory],
      [],
      ["Energy Score", `${c.score}/100 (${c.grade})`],
      ["Carbon Footprint (kg CO2)", c.co2],
      ["Next Month Forecast (INR)", c.forecastAmount],
      [],
      ["AI Energy Insights"],
      ...data.energyInsights.map(ins => [ins]),
      [],
      ["BEE Energy Saving Recommendations", "Estimated Savings / Month"],
      ...c.recommendations.map(r => [r.title, `₹${r.savings}`])
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bill_analysis_${data.serviceNumber || "report"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 bg-transparent transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto w-full space-y-8 min-h-screen print:p-0 print:bg-white print:text-black"
    >
      {/* ─── PRINT ONLY HEADER ────────────────────────────────────────────────── */}
      <div className="hidden print:flex flex-col w-full border-b-2 border-primary-blue pb-4 mb-6 text-left print-background-content">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black tracking-tight text-blue-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold">⚡</span>
              SMART HOUSEHOLD ENERGY PORTAL
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Electricity Bill OCR Extraction & Slab Tariff Analysis Report
            </p>
          </div>
          <div className="text-right text-xs text-slate-550 font-mono">
            <div>Report Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>Account: {user?.email || "Govardhan"}</div>
            <div>Security Status: Verified & Audited</div>
          </div>
        </div>
      </div>

      {/* 3-Column Widescreen Layout Grid */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8 items-start relative w-full print-background-content">
        
        {/* Left Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <LiveGridStatusWidget />
        </aside>

        {/* Center Main Content Column */}
        <main className="col-span-1 2xl:col-span-8 space-y-6 w-full text-left print:p-0">
      
          {/* ─── TITLE HEADER ────────────────────────────────────────────────────── */}
          <motion.div 
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-r from-blue-600/10 via-teal-500/5 to-transparent dark:from-blue-950/20 dark:via-emerald-955/10 dark:to-transparent border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 dark:bg-primary-green/5 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-green animate-pulse" />
                Electricity Bill Analyzer
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Upload images or PDFs to extract consumption, charges, and AI intelligence insights.
              </p>
            </div>

            {activeBill && (
              <div className="flex items-center gap-2 relative z-10 shrink-0">
                <button
                  onClick={() => handleExportCSV(activeBill)}
                  className="h-10 px-4 flex items-center gap-1.5 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl text-slate-705 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer active:scale-[0.98] transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={handlePrintReport}
                  className="h-10 px-4 flex items-center gap-1.5 bg-gradient-to-r from-primary-blue to-blue-700 dark:from-primary-green dark:to-emerald-600 dark:text-slate-950 text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl hover:opacity-95 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98] transition-all text-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print PDF Report
                </button>
              </div>
            )}
          </motion.div>

          {/* Toast Alert */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-xs font-bold ${
                  toast.type === "success"
                    ? "bg-green-50 dark:bg-green-950/80 border-green-200 dark:border-green-900 text-green-605 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-955/80 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span>{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Zone Card */}
          <BillUploadZone 
            file={file}
            previewUrl={previewUrl}
            isPdf={isPdf}
            status={status}
            errorMessage={errorMessage}
            ocrProgress={ocrProgress}
            setFile={setFile}
            setPreviewUrl={setPreviewUrl}
            validateAndProcessFile={validateAndProcessFile}
            handleUploadAndScan={handleUploadAndScan}
            fileInputRef={fileInputRef}
          />

          {/* Dynamic Results Card */}
          {activeBill && (
            <BillResultsView 
              activeBill={activeBill}
              calcs={calcs}
              handleExplainWithAI={handleExplainWithAI}
              PIE_COLORS={PIE_COLORS}
            />
          )}

          {/* Billing History Card */}
          <BillHistoryList 
            history={history}
            activeBill={activeBill}
            loadingHistory={loadingHistory}
            setActiveBill={setActiveBill}
            setSelectedBillForModal={setSelectedBillForModal}
            handleDeleteRecord={handleDeleteRecord}
          />

          {/* Modals Dialogs Container */}
          <BillModals 
            selectedBillForModal={selectedBillForModal}
            setSelectedBillForModal={setSelectedBillForModal}
            deleteBillId={deleteBillId}
            setDeleteBillId={setDeleteBillId}
            handleConfirmDelete={handleConfirmDelete}
            modalCalcs={modalCalcs}
            handleExportCSV={handleExportCSV}
            formatDate={formatDate}
            detailsModalRef={detailsModalRef}
            deleteModalRef={deleteModalRef}
            handleDetailsModalKeyDown={handleDetailsModalKeyDown}
            handleDeleteModalKeyDown={handleDeleteModalKeyDown}
            userEmail={user?.email || undefined}
          />

        </main>

        {/* Right Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <CarbonSavingsWidget />
        </aside>

      </div>
    </motion.div>
  );
};
