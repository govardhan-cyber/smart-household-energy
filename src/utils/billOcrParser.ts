import type { PaddleOcrService } from "ppu-paddle-ocr/web";
import * as pdfjsDist from "pdfjs-dist";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";
import type { ParsedBillData } from "../pages/BillAnalyzer";

let paddleOcrInstance: PaddleOcrService | null = null;

const getPaddleOcrInstance = async (): Promise<PaddleOcrService> => {
  if (!paddleOcrInstance) {
    const { PaddleOcrService } = await import("ppu-paddle-ocr/web");
    paddleOcrInstance = new PaddleOcrService();
    await paddleOcrInstance.initialize();
  }
  return paddleOcrInstance;
};

export type ParserStatus = "idle" | "uploading" | "pdf_rendering" | "ocr_scanning" | "ai_parsing" | "finalizing" | "reviewing" | "success" | "error";

export interface ParserCallbacks {
  setStatus: (status: ParserStatus) => void;
  setOcrSteps: (step: string) => void;
  setOcrProgress: (progress: number) => void;
}

export const parsedBillSchema = {
  type: "OBJECT",
  properties: {
    consumerName: { type: "STRING", description: "Clean full name of the customer, without address details or junctions" },
    serviceNumber: { type: "STRING", description: "13-16 character service connection number (e.g. 131102A202034345) or 'Unknown'" },
    customerID: { type: "STRING", description: "8-digit customer ID / unique service number (e.g. 23315006) or 'Unknown'" },
    address: { type: "STRING", description: "Full billing/property address of the consumer" },
    billDate: { type: "STRING", description: "Date of the bill (DD-MM-YYYY)" },
    billingPeriod: { type: "STRING", description: "Billing month/period (e.g. June 2026)" },
    dueDate: { type: "STRING", description: "Payment due date (DD-MM-YYYY)" },
    previousReading: { 
      type: "NUMBER", 
      description: "Previous meter reading cumulative value in kWh (typically 3-6 digits, e.g. 2535). CRITICAL: Do NOT extract status flags like 1 or 1 (LIVE) or multiplying factors like 1. If not found or if only status flags are present, set to null or 0." 
    },
    currentReading: { 
      type: "NUMBER", 
      description: "Current/Present meter reading cumulative value in kWh (typically 3-6 digits, e.g. 2667). CRITICAL: Do NOT extract status flags like 1 or 1 (LIVE) or multiplying factors like 1. If not found or if only status flags are present, set to null or 0." 
    },
    unitsConsumed: { type: "NUMBER", description: "Units consumed in kWh. Synonyms: 'Billed Units' (e.g. 132)" },
    energyCharge: { type: "NUMBER", description: "Calculated energy charge in INR. Labeled as 'Energy Charges' (e.g. 643.50)" },
    fixedCharge: { 
      type: "NUMBER", 
      description: "Fixed charges in INR. CRITICAL: For APEPDCL/APSPDCL, this is the SUM of 'Fixed Charges' (e.g. 10.00) and 'Customer Charges' (e.g. 50.00). In this case, 10 + 50 = 60.00." 
    },
    tax: { 
      type: "NUMBER", 
      description: "Taxes or duties in INR. For APEPDCL/APSPDCL, this is the 'Electricity Duty' (e.g. 7.92). Do NOT mix with subsidy." 
    },
    otherCharges: { type: "NUMBER", description: "Other adjustments, surcharges, FPPCA, ISD, Arrears, late payment surcharge in INR." },
    totalAmount: { 
      type: "NUMBER", 
      description: "Total amount or net payable bill amount (e.g. 561.35). CRITICAL: Do NOT use the gross energy charge (like 643.50) as totalAmount." 
    },
    tariffCategory: { type: "STRING", description: "Tariff category (e.g. LT-I Domestic)" },
    energyInsights: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3 helpful AI insights on the bill details and tariff rates"
    },
    solarImportUnits: { type: "NUMBER", description: "Imported units for solar net-metered connections, or null/0" },
    solarExportUnits: { type: "NUMBER", description: "Exported units for solar net-metered connections, or null/0" },
    netBilledUnits: { type: "NUMBER", description: "Net billed units for solar net-metered connections, or null/0" },
    billMonth: { type: "STRING", description: "Month of the bill (e.g. June 2026)" },
    billingDays: { type: "NUMBER", description: "Number of billing days in the cycle (typically 30 or 31)" },
    governmentSubsidy: { type: "NUMBER", description: "Government subsidy amount in INR (e.g. 184.50)" },
    netBill: { type: "NUMBER", description: "Net bill amount in INR after subtracting subsidy (e.g. 561.35)" },
    discom: { type: "STRING", description: "Electricity distribution company name (e.g. APSPDCL, APEPDCL, BESCOM)" },
    tariff: { type: "STRING", description: "Tariff category type (e.g. LT-I)" }
  },
  required: [
    "consumerName", "serviceNumber", "customerID", "address", "billDate", "billingPeriod", "dueDate",
    "previousReading", "currentReading", "unitsConsumed", "energyCharge", "fixedCharge", "tax",
    "otherCharges", "totalAmount", "tariffCategory", "energyInsights",
    "billMonth", "billingDays", "governmentSubsidy", "netBill", "discom", "tariff"
  ]
};

// ─── PDF.js Loader ───────────────────────────────────────────────────────────
export const loadPdfJs = (): Promise<typeof pdfjsDist> => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = window.pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not loaded on window."));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js library."));
    document.body.appendChild(script);
  });
};

// ─── PDF Page Extraction Helper ──────────────────────────────────────────────
export const convertPdfToImage = async (
  pdfFile: File,
  callbacks: Pick<ParserCallbacks, "setStatus" | "setOcrSteps">
): Promise<string> => {
  callbacks.setStatus("pdf_rendering");
  callbacks.setOcrSteps("Converting PDF page to image canvas...");
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  // Render first page
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 }); // High res rendering
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (context) {
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL("image/png");
  }
  throw new Error("Failed to create rendering context.");
};

// Helper to convert base64 imageSrc string to canvas
const loadImageToCanvas = (src: string): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2D context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = (e) => reject(new Error("Failed to load image for PaddleOCR: " + String(e)));
    img.src = src;
  });
};

// ─── OCR text extraction ─────────────────────────────────────────────────────
export const extractTextViaOcr = async (
  imageSrc: string,
  callbacks: ParserCallbacks
): Promise<string> => {
  callbacks.setStatus("ocr_scanning");
  callbacks.setOcrSteps("Initializing character recognition...");
  callbacks.setOcrProgress(15);

  try {
    callbacks.setOcrSteps("Loading image onto canvas...");
    const canvas = await loadImageToCanvas(imageSrc);
    callbacks.setOcrProgress(40);

    callbacks.setOcrSteps("Running PaddleOCR layout scanning...");
    const ocrService = await getPaddleOcrInstance();
    callbacks.setOcrProgress(60);

    const result = await ocrService.recognize(canvas);
    callbacks.setOcrProgress(100);
    return result.text;
  } catch (err: unknown) {
    console.error("PaddleOCR execution failed:", err);
    throw new Error(`PaddleOCR extraction failed: ${err instanceof Error ? err.message : String(err)}`);
  }
};

// ─── Gemini Parsing Layer ────────────────────────────────────────────────────
export const parseOcrWithGemini = async (
  ocrText: string,
  callbacks: Pick<ParserCallbacks, "setStatus" | "setOcrSteps">
): Promise<ParsedBillData> => {
  callbacks.setStatus("ai_parsing");
  callbacks.setOcrSteps("Prompting Gemini AI to structure billing data...");

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!geminiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Please set environment keys.");
  }

  const prompt = `
    You are an expert OCR parser for utility electricity bills in India (e.g. APEPDCL, APSPDCL, BESCOM, TSSPDCL).
    I will provide you with the raw text extracted from an electricity bill using OCR.
    Your task is to clean the text, identify the required metadata fields, and return them as a valid JSON object.

    Do not include any markdown blockticks, code formatting block wrappers (\`\`\`json), or extra explanatory text. Return ONLY the raw JSON object string.
    
    Ensure numbers are extracted as numbers, and dates/addresses are clean.
    
    CRITICAL DOMAIN RULES FOR EXTRACTION:
    1. Consumer Name: Extract the clean full name of the customer. Do not append address details (like junctions, cantene, streets) to this field.
    2. Address: Extract the consumer's full billing/property address (e.g. "KOTTAROAD JUNCTION, NEAR ARMY CANTENE, AKKIVARAM, SRIKAKULAM").
    3. Service Number vs Customer ID:
       - Labeled as "Service Number" or "Service Connection No" (typically a 13-16 character/digit string containing numbers and letters, like "131450J086300691") -> extract as "serviceNumber".
       - Labeled as "Unique Service Number", "Customer ID", or "Customer No" (typically an 8-digit numeric string, like "30338570") -> extract as "customerID".
    4. Meter Readings:
       - "previousReading": Find the cumulative meter reading at the start of the billing period. Synonyms: "Previous Reading", "Prev Reading", "Prev Rdg", "PRDG", "P.Rdg", "Prev", "Previous", "PMR", "Old Reading", "Opening Reading".
       - "currentReading": Find the cumulative meter reading at the end of the billing period. Synonyms: "Current Reading", "Current Rdg", "Curr Rdg", "CRDG", "C.Rdg", "Current", "Pres Reading", "Pres Rdg", "Present Reading", "Pres", "Present", "CMR", "New Reading", "Closing Reading".
       - If both are present, make sure they align: currentReading - previousReading = unitsConsumed (for regular bills).
    5. Bill Amount (totalAmount):
       - Search for the Net Payable amount (labeled as "Net Bill Amount", "Net Bill", "Amount Due", or "Net Amount") first.
       - Do not use the gross "Total Amount" (e.g. ₹1166.00) if a "Net Bill Amount" or "Amount Due" (e.g. ₹945.56) is available, as the gross amount does not subtract government subsidies or solar net credits.
    6. Solar Net-Metering Fields:
       - "solarImportUnits": Extract units imported from the grid (often labeled as "Import Units", "Solar Import", or "Import Reading") if present.
       - "solarExportUnits": Extract units exported to the grid (often labeled as "Export Units", "Solar Export", or "Export Reading") if present.
       - "netBilledUnits": Extract the net grid units billed (often labeled as "Net Billed Units", "Net Billed", or "Net Units") if present.
       - If the bill is not a solar net-metered bill, set these three fields to null.
    7. Due Date & Bill Date:
       - Ignore "Disconnection Date" or "Discon Date" when extracting "dueDate".

    The JSON object structure MUST match this schema:
    {
      "consumerName": "Consumer's full name or 'Unknown'",
      "serviceNumber": "Service number, unique service ID, account connection number, or 'Unknown'",
      "customerID": "Customer ID, unique customer identification code, or 'Unknown'",
      "address": "Consumer's billing/property address or 'Unknown'",
      "billDate": "Bill Date (e.g. DD-MM-YYYY) or 'Unknown'",
      "billingPeriod": "Billing month/period (e.g. May 2026) or 'Unknown'",
      "dueDate": "Payment Due Date (e.g. DD-MM-YYYY) or 'Unknown'",
      "previousReading": 2535,
      "currentReading": 2667,
      "unitsConsumed": 132,
      "energyCharge": 643.50,
      "fixedCharge": 10.00,
      "tax": 7.92,
      "otherCharges": 90.00,
      "totalAmount": 561.35,
      "tariffCategory": "LT-I Domestic, Domestic Category, or 'Domestic'",
      "energyInsights": [
        "Provide 3 key insights. For example: Your usage is below average by 47%.",
        "Identify fixed charge rates of your DISCOM.",
        "Add recommendation matching your consumption profile."
      ],
      "solarImportUnits": 529,
      "solarExportUnits": 329,
      "netBilledUnits": 200
    }

    Raw OCR extracted text:
    ---
    ${ocrText}
    ---
  `;

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
  ];

  let lastError: Error | null = null;
  let parsed: ParsedBillData | null = null;

  for (const model of modelsToTry) {
    try {
      callbacks.setOcrSteps(`Prompting Gemini AI (${model}) to structure billing data...`);

      let resultJsonStr: string | undefined;

      if (functions) {
        try {
          const proxy = httpsCallable<unknown, Record<string, unknown>>(functions, "geminiProxy");
          const callPromise = proxy({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { 
              responseMimeType: "application/json",
              responseSchema: parsedBillSchema
            }
          });
          const result = await Promise.race([
            callPromise,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Emulator timeout")), 3500))
          ]);
          resultJsonStr = (result.data?.candidates as { content: { parts: { text: string }[] } }[])?.[0]?.content?.parts?.[0]?.text;
        } catch {
          // Proxy unavailable — fall through to direct call
        }
      }

      if (!resultJsonStr) {
        const geminiKeyDirect = import.meta.env.VITE_GEMINI_API_KEY || "";
        if (!geminiKeyDirect) throw new Error("No Gemini key available.");
        const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKeyDirect}`;
        const response = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { 
              responseMimeType: "application/json",
              responseSchema: parsedBillSchema
            }
          }),
          signal: AbortSignal.timeout(25000) // 25-second timeout safety net
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const resData = await response.json();
        resultJsonStr = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      }

      if (!resultJsonStr) throw new Error("Empty parsing response");
      parsed = JSON.parse(resultJsonStr);
      break;
    } catch (err: unknown) {
      console.warn(`Failed parsing with ${model}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!parsed) {
    throw new Error(`Gemini AI service error: ${lastError?.message || "Failed to parse content with any model."}`);
  }
  
  if (!parsed.consumerName) parsed.consumerName = "Unknown User";
  if (parsed.unitsConsumed === undefined || parsed.unitsConsumed === null) {
    parsed.unitsConsumed = Math.max(0, (parsed.currentReading || 0) - (parsed.previousReading || 0)) || 150;
  }
  if (!parsed.totalAmount) {
    parsed.totalAmount = (parsed.energyCharge || 0) + (parsed.fixedCharge || 0) + (parsed.tax || 0) + (parsed.otherCharges || 0);
  }
  if (!parsed.energyInsights || parsed.energyInsights.length < 3) {
    parsed.energyInsights = [
      `Units consumed: ${parsed.unitsConsumed} kWh.`,
      "AC cooling and space heaters usually dominate consumption.",
      "Consider turning off appliances at the wall to eliminate standby power draw."
    ];
  }

  return parsed;
};

// ─── Multimodal Gemini Direct Image Scanning Fallback ────────────────────────
export const parseImageWithGeminiMultimodal = async (
  imageSrc: string,
  callbacks: Pick<ParserCallbacks, "setStatus" | "setOcrSteps">
): Promise<ParsedBillData> => {
  callbacks.setStatus("ai_parsing");
  callbacks.setOcrSteps("Converting image to base64 and uploading to Gemini Multimodal AI...");

  const match = imageSrc.match(/^data:(image\/[a-zA-Z\+]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image source encoding for Multimodal scanning.");
  }
  const mimeType = match[1];
  const base64Data = match[2];

  const prompt = `
    You are an expert utility bill scanner, especially for electricity bills in India (e.g. APEPDCL, APSPDCL, BESCOM, TSSPDCL).
    I am providing you with an image of a household utility electricity bill.
    Analyze the image, read the text visually, and return the structured billing metadata as a valid JSON object.

    Do not include any markdown blockticks, code formatting block wrappers (\`\`\`json), or extra text. Return ONLY the raw JSON object string.
    
    Ensure numbers are extracted as numbers, and dates/addresses are clean.
    
    CRITICAL DOMAIN RULES FOR EXTRACTION:
    1. Consumer Name: Extract the clean full name of the customer. Do not append address details (like junctions, cantene, streets) to this field.
    2. Address: Extract the consumer's full billing/property address (e.g. "KOTTAROAD JUNCTION, NEAR ARMY CANTENE, AKKIVARAM, SRIKAKULAM").
    3. Service Number vs Customer ID:
       - Labeled as "Service Number" or "Service Connection No" (typically a 13-16 character/digit string containing numbers and letters, like "131450J086300691") -> extract as "serviceNumber".
       - Labeled as "Unique Service Number", "Customer ID", or "Customer No" (typically an 8-digit numeric string, like "30338570") -> extract as "customerID".
    4. Bill Amount (totalAmount):
       - Search for the Net Payable amount (labeled as "Net Bill Amount", "Net Bill", "Amount Due", or "Net Amount") first.
       - Do not use the gross "Total Amount" (e.g. ₹1166.00) if a "Net Bill Amount" or "Amount Due" (e.g. ₹945.56) is available, as the gross amount does not subtract government subsidies or solar net credits.
    5. Solar Net-Metering Fields:
       - "solarImportUnits": Extract units imported from the grid (often labeled as "Import Units", "Solar Import", or "Import Reading") if present.
       - "solarExportUnits": Extract units exported to the grid (often labeled as "Export Units", "Solar Export", or "Export Reading") if present.
       - "netBilledUnits": Extract the net grid units billed (often labeled as "Net Billed Units", "Net Billed", or "Net Units") if present.
       - If the bill is not a solar net-metered bill, set these three fields to null.
    6. Due Date & Bill Date:
       - Ignore "Disconnection Date" or "Discon Date" when extracting "dueDate".

    The JSON object structure MUST match this schema:
    {
      "consumerName": "Consumer's full name or 'Unknown'",
      "serviceNumber": "Service number, unique service ID, account connection number, or 'Unknown'",
      "customerID": "Customer ID, unique customer identification code, or 'Unknown'",
      "address": "Consumer's billing/property address or 'Unknown'",
      "billDate": "Bill Date (e.g. DD-MM-YYYY) or 'Unknown'",
      "billingPeriod": "Billing month/period (e.g. May 2026) or 'Unknown'",
      "dueDate": "Payment Due Date (e.g. DD-MM-YYYY) or 'Unknown'",
      "previousReading": 2535,
      "currentReading": 2667,
      "unitsConsumed": 132,
      "energyCharge": 643.50,
      "fixedCharge": 10.00,
      "tax": 7.92,
      "otherCharges": 90.00,
      "totalAmount": 561.35,
      "tariffCategory": "LT-I Domestic, Domestic Category, or 'Domestic'",
      "energyInsights": [
        "Provide 3 key insights based on consumption.",
        "Check grid efficiency and billing tier.",
        "Add specific cost-saving recommendation."
      ],
      "solarImportUnits": 529,
      "solarExportUnits": 329,
      "netBilledUnits": 200
    }
  `;

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
  ];

  let lastError: Error | null = null;
  let parsed: ParsedBillData | null = null;

  for (const model of modelsToTry) {
    try {
      callbacks.setOcrSteps(`Direct AI Scan (${model}): Structured parsing...`);

      let resultJsonStr: string | undefined;
      const contents = [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64Data } }
        ]
      }];

      if (functions) {
        try {
          const proxy = httpsCallable<unknown, Record<string, unknown>>(functions, "geminiProxy");
          const callPromise = proxy({
            model,
            contents,
            generationConfig: { 
              responseMimeType: "application/json",
              responseSchema: parsedBillSchema
            }
          });
          const result = await Promise.race([
            callPromise,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Emulator timeout")), 3500))
          ]);
          resultJsonStr = (result.data?.candidates as { content: { parts: { text: string }[] } }[])?.[0]?.content?.parts?.[0]?.text;
        } catch {
          // Proxy failed — fallback to direct call
        }
      }

      if (!resultJsonStr) {
        const geminiKeyDirect = import.meta.env.VITE_GEMINI_API_KEY || "";
        if (!geminiKeyDirect) throw new Error("No Gemini key available.");
        const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKeyDirect}`;
        const response = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents, 
            generationConfig: { 
              responseMimeType: "application/json",
              responseSchema: parsedBillSchema
            } 
          }),
          signal: AbortSignal.timeout(30000) // 30-second timeout safety net (images can take longer)
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const resData = await response.json();
        resultJsonStr = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      }

      if (!resultJsonStr) throw new Error("Empty parsing response");
      parsed = JSON.parse(resultJsonStr);
      break;
    } catch (err: unknown) {
      console.warn(`Direct Multimodal AI parsing failed with ${model}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!parsed) {
    throw new Error(`Multimodal AI service error: ${lastError?.message || "Failed to analyze image."}`);
  }

  if (!parsed.consumerName) parsed.consumerName = "Unknown User";
  if (parsed.unitsConsumed === undefined || parsed.unitsConsumed === null) {
    parsed.unitsConsumed = Math.max(0, (parsed.currentReading || 0) - (parsed.previousReading || 0)) || 150;
  }
  if (!parsed.totalAmount) {
    parsed.totalAmount = (parsed.energyCharge || 0) + (parsed.fixedCharge || 0) + (parsed.tax || 0) + (parsed.otherCharges || 0);
  }
  if (!parsed.energyInsights || parsed.energyInsights.length < 3) {
    parsed.energyInsights = [
      `Direct AI scan completed. Units: ${parsed.unitsConsumed} kWh.`,
      "Multi-modal scanning matches bill structure accurately.",
      "Consider scheduling heavy appliances off-peak to save further."
    ];
  }

  return parsed;
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

// ─── Local OCR Heuristics Fallback Parser ────────────────────────────────────
export const parseOcrWithHeuristics = (ocrText: string): ParsedBillData => {
  // 1. Consumer Name Heuristic
  let consumerName = "Unknown Consumer";
  const nameMatch = ocrText.match(/(?:Consumer Name|Customer Name|Name of the Consumer)[\s\S]{0,100}?([A-Za-z\s\.]+)/i);
  if (nameMatch && nameMatch[1].trim().length > 3) {
    consumerName = nameMatch[1].trim().split('\n')[0].trim();
  } else {
    // Look for lines containing names ending with a comma (very typical of AP DISCOM bills)
    const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const exclusions = [
      "ELECTRICITY", "BILL", "POWER", "EASTERN", "SECTION", "DISTRIBUTION", 
      "DISCOM", "ERO", "ROAD", "JUNCTION", "NEAR", "CANTENE", "AKKIVARAM", 
      "STREET", "LANE", "FLOOR", "BUILDING", "OPPOSITE", "BEHIND", "NEXT",
      "SRIKAKULAM", "THOGARAM", "CONNECTED", "LOAD", "CONTRACTED", "METER",
      "DATE", "NUMBER", "SERVICE", "AMOUNT", "DUE", "DISCONNECTION", "PHASE",
      "SOLAR", "DETAILS", "CONTACTS", "CONTACT", "LINE MAN", "SUPERVISOR", "LIVE",
      // Bill field labels that must never be mistaken for consumer names:
      "ENERGY", "CHARGES", "CHARGE", "FIXED", "TAX", "DUTY", "OTHER", "CUSTOMER",
      "GOVT", "SUBSIDY", "TOTAL", "NET", "CONSUMPTION", "READING", "UNITS"
    ];
    
    const commaLine = lines.find(l => {
      const cleaned = l.trim();
      return cleaned.endsWith(",") && 
             cleaned.length > 3 && 
             cleaned.length < 50 &&
             !exclusions.some(ex => cleaned.toUpperCase().includes(ex));
    });

    if (commaLine) {
      consumerName = commaLine.replace(/[,;:]/g, "").trim();
    } else {
      // Look for name line pattern (Title Case or Uppercase) excluding address/DISCOM/meta keywords
      const segments = lines.flatMap(l => l.split(/[,;]/)).map(s => s.trim()).filter(s => s.length > 0);
      const nameLine = segments.find(s => {
        const cleaned = s.trim();
        const words = cleaned.split(/\s+/);
        
        const isWordPattern = words.length >= 2 && words.length <= 5 && words.every(w => 
          /^[A-Z][a-zA-Z]{1,}$/.test(w) || /^[A-Z]{2,}$/.test(w)
        );
        
        const hasExclusion = exclusions.some(ex => cleaned.toUpperCase().includes(ex));
        return isWordPattern && !hasExclusion;
      });
      if (nameLine) {
        consumerName = nameLine.replace(/[,;:]/g, "").trim();
      }
    }
  }

  // 2. Service Number Heuristic (Connection Number: must contain at least 4 digits to avoid matching column header texts)
  let serviceNumber = "Unknown SC No";
  const scMatch = ocrText.match(/(?:Service Connection No|Service Connection Number|Service Number|Service No|SC No|Account No|Consumer No|Consumer ID|Consumer Number|Unique Service Number|Unique Service No)[\s\S]{0,100}?([A-Z0-9\-\/\_]*\d{4,}[A-Z0-9\-\/\_]*)/i);
  if (scMatch && scMatch[1].trim().length > 3) {
    serviceNumber = scMatch[1].trim();
  }

  // 3. Customer ID Heuristic (must contain at least 4 digits to avoid column bleed matches)
  let customerID = "Unknown CID";
  const cidMatch = ocrText.match(/(?:Customer ID|Customer No|Consumer ID|Unique Service Number|Unique Service No)[\s\S]{0,100}?([A-Z0-9\-\/\_]*\d{4,}[A-Z0-9\-\/\_]*)/i);
  if (cidMatch && cidMatch[1].trim().length > 3) {
    customerID = cidMatch[1].trim();
  } else if (serviceNumber !== "Unknown SC No") {
    customerID = "CID-" + serviceNumber;
  }

  // 4. Readings & Units Consumed Heuristic
  let previousReading = extractAPEPDCLReading(ocrText, "previous");
  let currentReading = extractAPEPDCLReading(ocrText, "present");

  let unitsConsumed = 0;
  // Try to find "Billed Units" as a standalone line (most reliable)
  const billedUnitsLineMatch = ocrText.split('\n').find(l => /^\s*Billed Units\s*\d+\s*$/i.test(l));
  if (billedUnitsLineMatch) {
    const num = billedUnitsLineMatch.match(/(\d+)/);
    if (num) unitsConsumed = parseInt(num[1]);
  }
  if (unitsConsumed <= 0) {
    const unitsMatch = ocrText.match(/(?:Billed Units|Units Consumed|Consumed Units)[\s\S]{0,30}?(\d{1,5})/i);
    if (unitsMatch) {
      const val = parseInt(unitsMatch[1]);
      if (val > 0 && val < 5000) unitsConsumed = val;
    }
  }
  if (unitsConsumed <= 0 && currentReading > previousReading && previousReading > 0) {
    unitsConsumed = currentReading - previousReading;
  }
  // Do NOT silently default to 180 — keep 0 so the UI shows no false data
  if (unitsConsumed > 5000) unitsConsumed = 0;

  if (previousReading > 0 && currentReading <= 0) {
    currentReading = previousReading + unitsConsumed;
  } else if (currentReading > 0 && previousReading <= 0) {
    previousReading = Math.max(0, currentReading - unitsConsumed);
  }

  // 5. Total Amount & Net Bill Heuristic
  // CRITICAL: Bills in India are always between ₹50 and ₹99,999.
  // If any extracted value is outside this range it is OCR garbage (e.g. a service connection number).
  const AMOUNT_MIN = 50;
  const AMOUNT_MAX = 99999;

  let totalAmount = 0;
  const taMatch = ocrText.match(/Total Amount[\s\S]{0,50}?([\d\.,]+)/i);
  if (taMatch) {
    const taVal = Math.round(parseFloat(taMatch[1].replace(/,/g, '')));
    if (taVal >= AMOUNT_MIN && taVal <= AMOUNT_MAX) totalAmount = taVal;
  }

  let netBill = 0;
  const nbMatch = ocrText.match(/(?:Net Bill Amount|Net Bill|Amount Due|Amount Due\s*\(₹\)|Amount Due\s*\(Rs\))[\s\S]{0,50}?([\d\.,]+)/i);
  if (nbMatch) {
    const nbVal = Math.round(parseFloat(nbMatch[1].replace(/,/g, '')));
    if (nbVal >= AMOUNT_MIN && nbVal <= AMOUNT_MAX) netBill = nbVal;
  }

  if (totalAmount <= 0 && netBill > 0) totalAmount = netBill;
  if (netBill <= 0 && totalAmount > 0) netBill = totalAmount;

  // 6. Solar Net Metering Heuristics
  let solarImportUnits: number | undefined = undefined;
  const extractedImport = extractAPEPDCLSolar(ocrText, "import");
  if (extractedImport > 0) {
    solarImportUnits = extractedImport;
  }

  let solarExportUnits: number | undefined = undefined;
  const extractedExport = extractAPEPDCLSolar(ocrText, "export");
  if (extractedExport > 0) {
    solarExportUnits = extractedExport;
  }

  let netBilledUnits: number | undefined = undefined;
  if (solarImportUnits !== undefined && solarExportUnits !== undefined) {
    netBilledUnits = Math.max(0, solarImportUnits - solarExportUnits);
  }

  // 7. Bill Date / Due Date Heuristics
  let billDate = new Date().toLocaleDateString();
  let dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();
  
  // Look for dates within 100 characters after the label to support table structures
  const billDateMatch = ocrText.match(/Bill Date(?:s)?[\s\S]{0,100}?(\b\d{1,2}[-\/\.][A-Za-z0-9]{3,9}[-\/\.]\d{2,4}\b)/i);
  if (billDateMatch) {
    billDate = billDateMatch[1];
  }
  
  const dueDateMatch = ocrText.match(/(?:Due Date|Payment Due Date|Pay By)[\s\S]{0,100}?(\b\d{1,2}[-\/\.][A-Za-z0-9]{3,9}[-\/\.]\d{2,4}\b)/i);
  if (dueDateMatch) {
    dueDate = dueDateMatch[1];
  }

  if (!billDateMatch || !dueDateMatch) {
    // Exclude any dates associated with "Disconnection Date" or "Discon Date" from generic search
    let textForGenericDates = ocrText;
    const disconMatch = ocrText.match(/(?:Disconnection Date|Discon Date|Disconnection|Discon)[\s\S]{0,50}?(\b\d{1,2}[-\/\.][A-Za-z0-9]{3,9}[-\/\.]\d{2,4}\b)/i);
    if (disconMatch) {
      textForGenericDates = ocrText.replace(disconMatch[0], "");
    }

    const dates = textForGenericDates.match(/\b\d{1,2}[-\/\.][A-Za-z0-9]{3,9}[-\/\.]\d{2,4}\b/g) || 
                  textForGenericDates.match(/\b\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}\b/g) || [];
    if (dates.length > 0) {
      if (!billDateMatch) billDate = dates[0] || billDate;
      if (!dueDateMatch) dueDate = dates[1] || dates[0] || dueDate;
    }
  }

  // 8. State / DISCOM Heuristic
  let tariffCategory = "LT-I Domestic";
  const lowerText = ocrText.toLowerCase();
  if (lowerText.includes("bescom") || lowerText.includes("karnataka")) {
    tariffCategory = "LT-2 Domestic (BESCOM)";
  } else if (lowerText.includes("spdcl") || lowerText.includes("epdcl") || lowerText.includes("ap")) {
    tariffCategory = "AP Domestic LT-I";
  } else if (lowerText.includes("ts") || lowerText.includes("telangana")) {
    tariffCategory = "TS Domestic LT-I";
  }

  // 9. Detailed breakdown heuristics
  let energyCharge = Math.round(totalAmount * 0.75);
  const ecMatch = ocrText.match(/(?:Energy Charges|Energy Charge|Consumption Charge)[\s\S]{0,50}?([\d\.,]+)/i);
  if (ecMatch) {
    energyCharge = Math.round(parseFloat(ecMatch[1].replace(/,/g, '')));
  }

  let fixedChargeVal = 0;
  const fcMatch = ocrText.match(/Fixed Charges[\s\S]{0,50}?([\d\.,]+)/i);
  if (fcMatch) fixedChargeVal = parseFloat(fcMatch[1].replace(/,/g, ''));

  let customerChargeVal = 0;
  const ccMatch = ocrText.match(/Customer Charges[\s\S]{0,50}?([\d\.,]+)/i);
  if (ccMatch) customerChargeVal = parseFloat(ccMatch[1].replace(/,/g, ''));

  let fixedCharge = Math.round(fixedChargeVal + customerChargeVal);
  if (fixedCharge <= 0) {
    fixedCharge = Math.round(totalAmount * 0.10);
  }

  let tax = 0;
  const taxMatch = ocrText.match(/Electricity Duty[\s\S]{0,50}?([\d\.,]+)/i);
  if (taxMatch) {
    tax = Math.round(parseFloat(taxMatch[1].replace(/,/g, '')));
  } else {
    tax = Math.round(totalAmount * 0.05);
  }

  let governmentSubsidy = 0;
  const subsidyMatch = ocrText.match(/(?:Govt\.?\s*Subsidy|Government\s*Subsidy)[\s\S]{0,50}?([\d\.,]+)/i);
  if (subsidyMatch) {
    governmentSubsidy = Math.round(parseFloat(subsidyMatch[1].replace(/,/g, '')));
  }

  const energyInsights = [];
  if (solarExportUnits !== undefined && solarExportUnits > 0) {
    const net = (solarImportUnits || unitsConsumed) - solarExportUnits;
    energyInsights.push(`Solar Net-Metering: Imported ${solarImportUnits || unitsConsumed} kWh, Exported ${solarExportUnits} kWh.`);
    energyInsights.push(`Your net grid consumption is ${netBilledUnits !== undefined ? netBilledUnits : Math.max(0, net)} kWh, reducing your overall bill amount.`);
  } else {
    energyInsights.push(`Heuristic Parser: Extracted ${unitsConsumed} units from document.`);
  }
  energyInsights.push("AI parsing unavailable. Results extracted via local heuristic rules.");
  energyInsights.push("To run full AI insights, verify your VITE_GEMINI_API_KEY is a valid key (starts with 'AIza').");

  // 10. Address Heuristic (Extract lines following the consumer name)
  let address = "Extracted locally from document text via smart heuristics (AI Offline)";
  if (consumerName !== "Unknown Consumer") {
    const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const nameLineIndex = lines.findIndex(l => l.includes(consumerName) || consumerName.includes(l));
    if (nameLineIndex !== -1) {
      const addressParts = [];
      const exclusions = ["ELECTRICITY", "BILL", "POWER", "DISCOM", "METER", "SERVICE", "DATE", "NUMBER", "UNIQUE", "CONNECTED", "LOAD", "CONTRACTED"];
      
      for (let i = nameLineIndex + 1; i < Math.min(lines.length, nameLineIndex + 5); i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        if (exclusions.some(ex => line.toUpperCase().includes(ex)) || 
            lowerLine.includes("section") || 
            lowerLine.includes("readings") || 
            lowerLine.includes("charge") ||
            /^\d{4,}/.test(line)) {
          break;
        }
        addressParts.push(line);
      }
      
      if (addressParts.length > 0) {
        address = addressParts.join(", ").replace(/,+/g, ",").trim();
      }
    }
  }

  const result: ParsedBillData = {
    consumerName,
    serviceNumber,
    customerID,
    address,
    billDate,
    billingPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    dueDate,
    previousReading,
    currentReading,
    unitsConsumed,
    energyCharge,
    fixedCharge,
    tax,
    otherCharges: Math.max(0, totalAmount - (energyCharge + fixedCharge + tax)),
    totalAmount,
    tariffCategory,
    energyInsights,
    // Add user requested document understanding fields with safe local fallbacks
    billMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    billingDays: 30,
    governmentSubsidy,
    netBill,
    discom: tariffCategory.includes("AP") ? "APEPDCL" : "Electricity Board",
    tariff: "LT-I"
  };

  if (solarImportUnits !== undefined) result.solarImportUnits = solarImportUnits;
  if (solarExportUnits !== undefined) result.solarExportUnits = solarExportUnits;
  if (netBilledUnits !== undefined) result.netBilledUnits = netBilledUnits;

  return result;
};
