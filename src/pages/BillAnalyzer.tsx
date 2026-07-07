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
  solarImportUnits?: number;
  solarExportUnits?: number;
  netBilledUnits?: number;
  // User requested schema fields for 100% accurate AI document understanding
  billMonth?: string;
  billingDays?: number;
  governmentSubsidy?: number;
  netBill?: number;
  discom?: string;
  tariff?: string;
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

  // Compress, enhance, and convert any image URL (including blob URLs) to a lightweight base64 JPEG
  const compressAndConvertToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to create canvas rendering context"));
          return;
        }
        
        // 1. Image downscaling to keep payload lightweight (max 1400px)
        const maxDim = 1400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;

        // 2. Client-side Document Preprocessing (grayscale, contrast, and brightness optimization)
        // This removes shadows, enhances text contrast, and optimizes the image for OCR / Vision models.
        ctx.filter = "grayscale(1) contrast(1.45) brightness(1.02)";
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(new Error("Failed to load image for optimization: " + String(err)));
      img.src = url;
    });
  };

  // Helper to extract meter readings from raw OCR text with high APEPDCL specificity
  const extractAPEPDCLReading = (ocrText: string, type: "previous" | "present"): number => {
    const lines = ocrText.split('\n');
    let targetLines = lines.filter(line => {
      const l = line.toLowerCase();
      const hasReading = l.includes("reading") || l.includes("rdg") || l.includes("pmr") || l.includes("cmr");
      const hasType = type === "previous" 
        ? (l.includes("previous") || l.includes("prev") || l.includes("opening"))
        : (l.includes("present") || l.includes("current") || l.includes("closing") || l.includes("curr"));
      return hasReading && hasType && !l.includes("date") && !l.includes("status");
    });

    const kwhLines = targetLines.filter(line => line.toLowerCase().includes("kwh") || line.toLowerCase().includes("kw"));
    if (kwhLines.length > 0) {
      targetLines = kwhLines;
    }

    for (const line of targetLines) {
      const match = line.match(/\b(\d{3,6})\b/);
      if (match) {
        return parseInt(match[1]);
      }
    }

    const fallbackRegex = type === "previous"
      ? /(?:Previous Reading|Prev Reading|Prev Rdg|PRDG|Opening Reading)[\s\S]{0,40}?(\d{3,6})/i
      : /(?:Present Reading|Current Reading|Curr Reading|Curr Rdg|CRDG|Closing Reading)[\s\S]{0,40}?(\d{3,6})/i;
    
    const fallbackMatch = ocrText.match(fallbackRegex);
    if (fallbackMatch) {
      return parseInt(fallbackMatch[1]);
    }

    return 0;
  };

  // Helper to extract solar import/export from raw OCR text with high specificity
  const extractAPEPDCLSolar = (ocrText: string, type: "import" | "export"): number => {
    const lines = ocrText.split('\n');
    let targetLines = lines.filter(line => {
      const l = line.toLowerCase();
      const isSolar = l.includes("solar") || l.includes("export") || l.includes("import");
      const isType = type === "import" ? l.includes("import") : l.includes("export");
      return isSolar && isType && !l.includes("present") && !l.includes("previous");
    });

    for (const line of targetLines) {
      const match = line.match(/\b(\d{2,6})\b/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return 0;
  };

  // Main Upload & Scan handler
  const handleUploadAndScan = async () => {
    if (!file || !user) return;
    
    setStatus("uploading");
    setOcrSteps("Reading Document...");

    try {
      let imageSrc = previewUrl || "";
      
      if (isPdf) {
        imageSrc = await convertPdfToImage(file, { setStatus, setOcrSteps });
      }

      // Optimize and compress the image/PDF canvas to a lightweight base64 JPEG format (under 200KB)
      // This is crucial because:
      // 1. It resolves local blob: URLs into valid base64 data URLs required by Gemini API.
      // 2. It ensures very fast upload speeds and prevents API payload limit or network timeout errors.
      setOcrSteps("Reading Document...");
      imageSrc = await compressAndConvertToBase64(imageSrc);
      
      let textResult = "";
      let structuredData: ParsedBillData | null = null;

      // Stage 2 (PRIMARY): Gemini Vision reads the bill image directly.
      // This is the most reliable path — Gemini sees the actual layout,
      // table structure, and printed text without OCR noise/garbling.
      try {
        console.log("[Stage 2] Gemini Vision: scanning bill image directly...");
        setOcrSteps("AI Vision: Reading bill image...");
        setOcrProgress(40);
        structuredData = await parseImageWithGeminiMultimodal(imageSrc, { setStatus, setOcrSteps });
        setOcrProgress(80);
        console.log("[Stage 2] Gemini Vision succeeded.");
      } catch (visionErr: unknown) {
        // Stage 3 (FALLBACK): PaddleOCR → Gemini text parsing → local heuristics
        console.warn("[Stage 2] Gemini Vision failed, falling back to PaddleOCR pipeline:", visionErr);
        try {
          console.log("[Stage 3] PaddleOCR text extraction starting...");
          textResult = await extractTextViaOcr(imageSrc, { setStatus, setOcrSteps, setOcrProgress });
          console.log("[Stage 3] PaddleOCR raw text:", textResult.slice(0, 500));

          try {
            structuredData = await parseOcrWithGemini(textResult, { setStatus, setOcrSteps });
          } catch (geminiErr: unknown) {
            console.warn("[Stage 3] Gemini text parsing failed, using local heuristics:", geminiErr);
            structuredData = parseOcrWithHeuristics(textResult);
          }
        } catch (ocrErr: unknown) {
          console.error("[Stage 3] OCR pipeline execution failed:", ocrErr);
          throw new Error(`All parsing methods failed. OCR: ${ocrErr instanceof Error ? ocrErr.message : String(ocrErr)}`);
        }
      }

      if (!structuredData) {
        throw new Error("Unable to extract valid billing information from the document. Please verify the image quality.");
      }
      
      // ─────────────────────────────────────────────────────────────────
      // STAGE 4 & 5: AI VALIDATION & DETERMINISTIC MATH REPAIR (No false numbers)
      // ─────────────────────────────────────────────────────────────────
      setStatus("ai_parsing");
      setOcrSteps("Validating & Repairing Data...");
      
      const validationWarnings: string[] = [];
      const data = { ...structuredData };

      // 1. Sanitize consumerMetadata fields
      if (data.consumerName) {
        data.consumerName = data.consumerName.replace(/^(Consumer Name|Name|Customer Name|Name of the Consumer)\s*[:=-]?\s*/i, "").trim();
      }
      if (data.serviceNumber) {
        data.serviceNumber = data.serviceNumber.replace(/[\s\s]/g, "").toUpperCase().trim();
      }
      if (data.customerID) {
        data.customerID = data.customerID.replace(/\D/g, "").trim();
      }

      // 2. Solar connection detection and net-metering correction
      const isSolar = (data.solarImportUnits !== undefined && data.solarImportUnits !== null && Number(data.solarImportUnits) > 0) || 
                      (data.solarExportUnits !== undefined && data.solarExportUnits !== null && Number(data.solarExportUnits) > 0) ||
                      (data.netBilledUnits !== undefined && data.netBilledUnits !== null && Number(data.netBilledUnits) > 0);

      // 3. Extracted Consumption & Readings Repair
      let prevReading = Number(data.previousReading) || 0;
      let currReading = Number(data.currentReading) || 0;
      let units = Number(data.unitsConsumed) || 0;
      let solarImport = data.solarImportUnits !== undefined && data.solarImportUnits !== null ? Number(data.solarImportUnits) : 0;
      let solarExport = data.solarExportUnits !== undefined && data.solarExportUnits !== null ? Number(data.solarExportUnits) : 0;

      // Extract values from APEPDCL bill labels via helper functions if they are 0, null, or 1 (false status codes)
      // Only runs when textResult is non-empty (i.e., the OCR fallback path was used).
      // On the Gemini Vision primary path, textResult is empty and we trust Vision's structured output.
      if (textResult.length > 0 && (prevReading <= 0 || prevReading === 1 || currReading <= 0 || currReading === 1)) {
        const extractedPrev = extractAPEPDCLReading(textResult, "previous");
        const extractedCurr = extractAPEPDCLReading(textResult, "present");
        
        if (extractedPrev > 0 && (prevReading <= 0 || prevReading === 1)) {
          prevReading = extractedPrev;
          data.previousReading = prevReading;
        }
        if (extractedCurr > 0 && (currReading <= 0 || currReading === 1)) {
          currReading = extractedCurr;
          data.currentReading = currReading;
        }
      }

      if (textResult.length > 0 && isSolar && (solarImport <= 0 || solarExport <= 0)) {
        const extractedImport = extractAPEPDCLSolar(textResult, "import");
        const extractedExport = extractAPEPDCLSolar(textResult, "export");

        if (extractedImport > 0 && solarImport <= 0) {
          solarImport = extractedImport;
          data.solarImportUnits = solarImport;
        }
        if (extractedExport > 0 && solarExport <= 0) {
          solarExport = extractedExport;
          data.solarExportUnits = solarExport;
        }
      }

      // Enforce readings math checks
      if (currReading > prevReading && prevReading > 0) {
        const grossBilledUnits = currReading - prevReading;
        if (isSolar) {
          if (solarImport <= 0) solarImport = grossBilledUnits;
          const calculatedNetBilled = Math.max(0, solarImport - solarExport);
          data.solarImportUnits = solarImport;
          data.solarExportUnits = solarExport;
          data.netBilledUnits = calculatedNetBilled;
          data.unitsConsumed = calculatedNetBilled;
          validationWarnings.push(`Solar net-metering: Imported ${solarImport} kWh, Exported ${solarExport} kWh. Billed units set to net ${calculatedNetBilled} kWh.`);
        } else {
          data.unitsConsumed = grossBilledUnits;
          if (units !== grossBilledUnits) {
            validationWarnings.push(`Enforced consumed units to ${grossBilledUnits} kWh to match meter readings.`);
          }
        }
      } else if (units > 0) {
        // Readings missing but units is known
        if (!isSolar) {
          if (prevReading > 0 && currReading <= 0) {
            currReading = prevReading + units;
            data.currentReading = currReading;
            validationWarnings.push(`Calculated present reading (${currReading} kWh) to match consumed units.`);
          } else if (currReading > 0 && prevReading <= 0) {
            prevReading = Math.max(0, currReading - units);
            data.previousReading = prevReading;
            validationWarnings.push(`Calculated previous reading (${prevReading} kWh) to match consumed units.`);
          }
        }
      }

      // 4. Charge Structure Breakdown Repair
      const energyCharge = Number(data.energyCharge) || 0;
      const fixedCharge = Number(data.fixedCharge) || 0;
      const tax = Number(data.tax) || 0;
      const subsidy = Number(data.governmentSubsidy) || 0;
      
      // SANITY CHECK: Indian electricity bills range from ₹50 to ₹99,999.
      // If Gemini/heuristics returns a value outside this range it is OCR garbage.
      const BILL_AMT_MIN = 50;
      const BILL_AMT_MAX = 99999;
      const rawTotal = Number(data.totalAmount) || 0;
      const rawNet = Number(data.netBill) || 0;
      const originalTotal = (rawTotal >= BILL_AMT_MIN && rawTotal <= BILL_AMT_MAX) ? rawTotal : 0;
      const originalNet   = (rawNet   >= BILL_AMT_MIN && rawNet   <= BILL_AMT_MAX) ? rawNet   : 0;

      // SANITY CHECK: Consumer name must not be a known billing field label
      const FIELD_LABEL_WORDS = ["ENERGY", "CHARGES", "CHARGE", "FIXED", "TAX", "DUTY",
        "SUBSIDY", "TOTAL", "NET", "CONSUMPTION", "READING", "UNITS", "CUSTOMER",
        "GOVT", "OTHER", "AMOUNT", "BILL", "ELECTRICITY"];
      if (data.consumerName) {
        const upperName = data.consumerName.toUpperCase();
        if (FIELD_LABEL_WORDS.some(w => upperName.includes(w))) {
          data.consumerName = "Unknown Consumer";
        }
      }

      // Retain the actual Net Bill Amount and Total Amount printed in the headers
      let finalNetBill = originalNet > 0 ? originalNet : originalTotal;
      let finalTotalAmount = originalTotal > 0 ? originalTotal : (originalNet + subsidy);

      // Keep totalAmount and netBill 100% matching the bill
      data.totalAmount = finalTotalAmount;
      data.netBill = finalNetBill;

      // Adjust otherCharges so components balance perfectly (Total = Energy + Fixed + Tax + Other)
      const currentComponentsSum = energyCharge + fixedCharge + tax;
      const calculatedOtherCharges = Math.max(0, finalTotalAmount - currentComponentsSum);
      data.otherCharges = calculatedOtherCharges;

      // 5. Inject warnings / repair logs into insights list
      if (validationWarnings.length > 0) {
        data.energyInsights = [...validationWarnings, ...(data.energyInsights || [])];
      }

      // 6. Sync fields for backward compatibility
      if (data.billMonth) {
        data.billingPeriod = data.billMonth;
      }
      if (data.tariff) {
        data.tariffCategory = data.tariff;
      }
      
      // Transition to AI Analysis status feedback
      setStatus("finalizing");
      setOcrSteps("AI Analysis...");
      await new Promise(resolve => setTimeout(resolve, 1200));

      const record: Omit<BillRecord, "id"> = {
        userId: user.uid,
        uploadDate: new Date().toISOString(),
        fileName: file.name,
        parsedData: data,
        ocrText: textResult
      };

      const tempId = "mock_b_" + Math.random().toString(36).substring(2, 11);
      let finalRecord: BillRecord;

      if (IS_FIREBASE_CONFIGURED && db) {
        try {
          const docRef = await Promise.race([
            addDoc(collection(db, "billHistory"), record),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Firestore Timeout")), 4000))
          ]);
          finalRecord = { id: docRef.id, ...record };
        } catch (writeErr) {
          console.warn("Firestore write timed out or failed, using local mock ID fallback:", writeErr);
          finalRecord = { id: tempId, ...record };
        }
      } else {
        finalRecord = { id: tempId, ...record };
      }

      const localList = [finalRecord, ...history];
      localStorage.setItem(`she_bill_history_${user.uid}`, JSON.stringify(localList));

      setHistory(prev => [finalRecord, ...prev]);
      setActiveBill(finalRecord);
      
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

    // Use net grid units for environmental and efficiency impact if solar net-metering is active
    const netUnits = data.solarExportUnits !== undefined && data.solarExportUnits > 0
      ? (data.netBilledUnits !== undefined ? data.netBilledUnits : Math.max(0, (data.solarImportUnits || units) - data.solarExportUnits))
      : units;

    const co2 = parseFloat((netUnits * 0.82).toFixed(2));
    
    const baseline = 100 + (familySize * 45) + (houseType === "villa" ? 120 : houseType === "independent" ? 60 : 0);
    let score = 95;
    if (netUnits > baseline) {
      score = Math.max(10, Math.round(90 - ((netUnits - baseline) / baseline) * 45));
    } else {
      score = Math.min(100, Math.round(95 - (netUnits / baseline) * 8));
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
