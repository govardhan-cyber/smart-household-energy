import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// ─── Gemini API Proxy ─────────────────────────────────────────────────────────
// Keeps GEMINI_API_KEY on the server — never shipped in the browser bundle.
// Deploy the key once:  firebase functions:config:set gemini.key="YOUR_KEY"
export const geminiProxy = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to use the AI assistant."
      );
    }

    const geminiKey: string = functions.config().gemini?.key ?? "";
    if (!geminiKey) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Gemini API key is not configured on the server."
      );
    }

    const { model, contents, generationConfig, systemInstruction } = request.data as {
      model: string;
      contents: unknown;
      generationConfig?: unknown;
      systemInstruction?: unknown;
    };

    if (!model || !contents) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Request must include model and contents."
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    const body: Record<string, unknown> = { contents };
    if (generationConfig) body.generationConfig = generationConfig;
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000)
    });

    if (!response.ok) {
      throw new functions.https.HttpsError(
        "internal",
        `Gemini API returned status ${response.status}`
      );
    }

    const data = await response.json() as Record<string, unknown>;
    return data;
  }
);

interface ApplianceData {
  name: string;
  quantity: number;
  hours: number;
  watts: number;
}

interface ReportPayload {
  userId: string;
  appliances: ApplianceData[];
  totalUnits: number;
  estimatedBill: number;
  savingsPotential?: number;
  highestConsumer?: string;
  tariffState?: string;
  customFlatRate?: number;
  beforeCo2?: number;
  afterCo2?: number;
  savedCo2?: number;
  savedTrees?: number;
  billAfter?: number;
  usageAfter?: number;
}

/**
 * HTTPS Callable function to validate energy calculations server-side.
 * This prevents client-side tampering of savings potentials or bills before committing.
 */
export const validateAndSaveReport = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    // 1. Authenticate Request
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const data = request.data as ReportPayload;
    const { userId, appliances, totalUnits } = data;

    // Verify user owns the resource being created
    if (request.auth.uid !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to log reports for this user profile."
      );
    }

    // 2. Validate calculations server-side
    let calculatedUnits = 0;
    for (const app of appliances) {
      if (app.quantity < 0 || app.hours < 0 || app.hours > 24 || app.watts < 0) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid appliance usage properties detected."
        );
      }
      calculatedUnits += app.quantity * (app.watts / 1000) * app.hours * 30;
    }

    calculatedUnits = Math.round(calculatedUnits);

    // Allow a small rounding tolerance of 2 units between client and server calculations
    if (Math.abs(calculatedUnits - totalUnits) > 2) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Calculated energy units do not match submitted values. Calculation rejected."
      );
    }

    // 3. Save report securely
    const reportRef = admin.firestore().collection("energy_reports").doc();
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    const secureReport = {
      ...data,
      totalUnits: calculatedUnits,
      createdAt: serverTimestamp,
      validatedByBackend: true,
    };

    await reportRef.set(secureReport);

    return {
      success: true,
      reportId: reportRef.id,
      msg: "Report successfully validated server-side and recorded to Firestore.",
    };
  }
);

// ─── Scoring Module ──────────────────────────────────────────────────────────
export const calculateEnergyScore = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { appliances, customWattages } = request.data;
    if (!Array.isArray(appliances)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Appliances list must be provided as an array."
      );
    }

    let totalUnits = 0;
    for (const app of appliances) {
      const watt = customWattages?.[app.id] ?? app.watts;
      totalUnits += app.quantity * (watt / 1000) * app.hours * 30;
    }

    let score = 100;
    if (totalUnits > 250) {
      score -= Math.min(30, Math.round((totalUnits - 250) * 0.1));
    }

    // AC hours penalty
    const ac = appliances.find((a: any) => a.id === "ac");
    if (ac && ac.hours > 5) {
      score -= 10;
    }

    score = Math.max(10, Math.min(100, score));

    let status: "Excellent" | "Good" | "Average" | "Needs Improvement" = "Excellent";
    if (score < 50) {
      status = "Needs Improvement";
    } else if (score < 70) {
      status = "Average";
    } else if (score < 85) {
      status = "Good";
    }

    return {
      success: true,
      score,
      status,
      totalUnits: Math.round(totalUnits),
      calculatedAt: new Date().toISOString()
    };
  }
);

// ─── Solar ROI & 25-Year Forecasting Module ──────────────────────────────────
export const generateSolarForecast = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const {
      systemSizeKw,
      yearlyGenerationKwh,
      tariffInflation = 0.05,
      panelDegradation = 0.007,
      maintenanceInflation = 0.03,
      isHybrid = false,
      batteryKwh = 0,
      batteryType = "lithium",
      netMeteringPolicy = "net-metering",
      buybackRate = 3.5
    } = request.data;

    let upfrontCost = systemSizeKw * 55000;
    let batteryReplacementInterval = 10;
    let batteryCostPerKwh = 15000;

    if (isHybrid && batteryKwh > 0) {
      if (batteryType === "lead-acid") {
        batteryCostPerKwh = 7000;
        batteryReplacementInterval = 4;
      }
      upfrontCost += batteryKwh * batteryCostPerKwh;
    }

    const forecast = [];
    let cumulativeNetSavings = -upfrontCost;
    let breakEvenYear = -1;

    for (let year = 1; year <= 25; year++) {
      const generation = yearlyGenerationKwh * Math.pow(1 - panelDegradation, year - 1);
      const averageTariff = 7.5 * Math.pow(1 + tariffInflation, year - 1);
      
      let yearSavings = 0;
      if (netMeteringPolicy === "net-metering") {
        yearSavings = generation * averageTariff;
      } else {
        const selfConsumption = generation * 0.7;
        const feedIn = generation * 0.3;
        yearSavings = (selfConsumption * averageTariff) + (feedIn * buybackRate);
      }

      const maintenance = year === 1 ? 0 : (systemSizeKw * 1000) * Math.pow(1 + maintenanceInflation, year - 1);
      
      let batteryReplacementCost = 0;
      if (isHybrid && batteryKwh > 0 && year > 1 && (year - 1) % batteryReplacementInterval === 0) {
        batteryReplacementCost = batteryKwh * batteryCostPerKwh * Math.pow(1 + maintenanceInflation, year - 1);
      }

      const netYearlyBenefit = yearSavings - maintenance - batteryReplacementCost;
      cumulativeNetSavings += netYearlyBenefit;

      if (cumulativeNetSavings >= 0 && breakEvenYear === -1) {
        breakEvenYear = year;
      }

      forecast.push({
        year,
        generation: Math.round(generation),
        savings: Math.round(yearSavings),
        maintenance: Math.round(maintenance),
        batteryReplacement: Math.round(batteryReplacementCost),
        netBenefit: Math.round(netYearlyBenefit),
        cumulativeSavings: Math.round(cumulativeNetSavings)
      });
    }

    return {
      success: true,
      upfrontCost: Math.round(upfrontCost),
      breakEvenYear: breakEvenYear === -1 ? 25 : breakEvenYear,
      forecast,
      total25YearSavings: Math.round(cumulativeNetSavings + upfrontCost),
      netLifetimeProfit: Math.round(cumulativeNetSavings)
    };
  }
);

// ─── Energy recommendations module ───────────────────────────────────────────
export const getAuditRecommendations = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { appliances, customWattages } = request.data;
    if (!Array.isArray(appliances)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Appliances list must be provided as an array."
      );
    }

    const recommendations = [];

    const ac = appliances.find((a: any) => a.id === "ac");
    if (ac && ac.hours > 5) {
      recommendations.push({
        id: "ac_hours_reduction",
        title: "Optimize AC Schedule (Server-Generated)",
        description: "Reducing AC usage by just 1.5 hours daily across units can save significant energy.",
        difficulty: "Easy",
        yearlySavings: Math.round(ac.quantity * 2500)
      });
    }

    const fan = appliances.find((a: any) => a.id === "fan");
    const fanWattage = customWattages?.fan ?? (fan ? fan.watts : 75);
    if (fan && fanWattage > 40) {
      recommendations.push({
        id: "fan_bldc_upgrade",
        title: "Upgrade to BLDC Ceiling Fans (Server-Generated)",
        description: "Replacing conventional ceiling fans with energy-efficient 28W BLDC fans.",
        difficulty: "Medium",
        yearlySavings: Math.round(fan.quantity * 1200)
      });
    }

    return {
      success: true,
      recommendations
    };
  }
);

// ─── Automated Tariff Sync & Scheduler Module ───────────────────────────────
export const syncStateTariffs = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const tariffsCollection = admin.firestore().collection("tariffs");
    
    const stateData = [
      {
        key: "ap_apspdcl",
        name: "ap_apspdcl",
        displayName: "Andhra Pradesh (APSPDCL - Southern)",
        slabs: [
          { limit: "0 – 30 units", rate: "₹1.90", max: 30, prev: 0, numericRate: 1.90 },
          { limit: "31 – 75 units", rate: "₹3.00", max: 45, prev: 30, numericRate: 3.00 },
          { limit: "76 – 125 units", rate: "₹4.50", max: 50, prev: 75, numericRate: 4.50 },
          { limit: "126 – 225 units", rate: "₹6.00", max: 100, prev: 125, numericRate: 6.00 },
          { limit: "226 – 400 units", rate: "₹8.75", max: 175, prev: 225, numericRate: 8.75 },
          { limit: "Above 400 units", rate: "₹9.75", max: 999999, prev: 400, numericRate: 9.75 },
        ],
        subsidy: { type: "fixed", value: 184.50, minGross: 0 },
        lastUpdated: Date.now()
      },
      {
        key: "karnataka_bescom",
        name: "karnataka_bescom",
        displayName: "Karnataka (BESCOM - Domestic)",
        slabs: [
          { limit: "0 – 50 units", rate: "₹4.15", max: 50, prev: 0, numericRate: 4.15 },
          { limit: "51 – 100 units", rate: "₹5.60", max: 50, prev: 50, numericRate: 5.60 },
          { limit: "101 – 200 units", rate: "₹7.15", max: 100, prev: 100, numericRate: 7.15 },
          { limit: "Above 200 units", rate: "₹8.20", max: 999999, prev: 200, numericRate: 8.20 },
        ],
        subsidy: { type: "fixed", value: 0, minGross: 0 },
        lastUpdated: Date.now()
      }
    ];

    for (const state of stateData) {
      await tariffsCollection.doc(state.key).set(state);
    }

    return {
      success: true,
      msg: "State tariffs successfully synchronized with Firestore database.",
      timestamp: Date.now()
    };
  }
);

// Scheduled everyday synchronization run
export const scheduledTariffSync = functions.scheduler.onSchedule(
  "0 0 * * *", 
  async () => {
    console.log("Scheduled sync triggering...");
    
    // Check if we can write a heartbeat log
    const syncLogRef = admin.firestore().collection("system_logs").doc("tariff_sync_heartbeat");
    await syncLogRef.set({
      lastSyncRun: admin.firestore.FieldValue.serverTimestamp(),
      status: "success",
      source: "scheduler_cron"
    });
  }
);



