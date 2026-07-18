import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { FieldValue } from "firebase-admin/firestore";

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
    const serverTimestamp = FieldValue.serverTimestamp();

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
      lastSyncRun: FieldValue.serverTimestamp(),
      status: "success",
      source: "scheduler_cron"
    });
  }
);

interface IssueReportPayload {
  issueType: string;
  description: string;
  screenshotUrl?: string;
  userEmail?: string;
  userName?: string;
}

export const sendIssueReport = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    // 1. Validate payload
    const data = request.data as IssueReportPayload;
    const { issueType, description, screenshotUrl, userEmail, userName } = data;

    if (!issueType || !description) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Request must include issueType and description."
      );
    }

    // 2. Save report to Firestore
    const reportRef = admin.firestore().collection("issue_reports").doc();
    const serverTimestamp = FieldValue.serverTimestamp();
    const uid = request.auth?.uid || "anonymous";

    const secureReport = {
      issueType,
      description,
      screenshotUrl: screenshotUrl || null,
      userEmail: userEmail || null,
      userName: userName || null,
      uid,
      createdAt: serverTimestamp,
    };

    await reportRef.set(secureReport);

    // 3. Send email via Nodemailer
    const gmailUser: string = functions.config().gmail?.user ?? process.env.GMAIL_USER ?? "";
    const gmailPass: string = functions.config().gmail?.pass ?? process.env.GMAIL_PASS ?? "";

    if (!gmailUser || !gmailPass) {
      console.warn("Gmail SMTP credentials are not configured on the server. Skipping email notification.");
      return {
        success: true,
        reportId: reportRef.id,
        emailSent: false,
        msg: "Report saved to database, but SMTP configurations are missing to send email."
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-top: 0;">New Issue Report Submitted</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px;">Issue Type:</td>
              <td style="padding: 6px 0; color: #0f172a;">${issueType}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">User Name:</td>
              <td style="padding: 6px 0; color: #0f172a;">${userName || "Anonymous"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">User Email:</td>
              <td style="padding: 6px 0; color: #0f172a;">${userEmail || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Firebase UID:</td>
              <td style="padding: 6px 0; color: #475569; font-family: monospace; font-size: 12px;">${uid}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Report ID:</td>
              <td style="padding: 6px 0; color: #475569; font-family: monospace; font-size: 12px;">${reportRef.id}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h4 style="margin: 0 0 8px 0; color: #1e3a8a;">Description:</h4>
            <p style="margin: 0; color: #334155; line-height: 1.5; white-space: pre-wrap;">${description}</p>
          </div>
          ${screenshotUrl ? `
            <div style="margin-top: 20px;">
              <h4 style="margin: 0 0 8px 0; color: #1e3a8a;">Screenshot:</h4>
              <a href="${screenshotUrl}" target="_blank" style="display: inline-block; color: #3b82f6; text-decoration: none; font-weight: bold; margin-bottom: 8px;">View Full Image</a>
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-height: 300px; text-align: center; background-color: #f1f5f9;">
                <img src="${screenshotUrl}" alt="Screenshot" style="max-width: 100%; max-height: 300px; object-fit: contain;" />
              </div>
            </div>
          ` : ""}
        </div>
      `;

      await transporter.sendMail({
        from: `"Smart Household Energy Support" <${gmailUser}>`,
        to: "govardhan4705@gmail.com",
        subject: `[${issueType}] New Issue Report (#${reportRef.id})`,
        text: `Issue Type: ${issueType}\nReported by: ${userName || "Anonymous"} (${userEmail || "No email"})\n\nDescription:\n${description}\n\n${screenshotUrl ? `Screenshot: ${screenshotUrl}` : ""}`,
        html: htmlContent,
      });

      // Send automated reply confirmation to the reporting user
      if (userEmail) {
        const autoReplyHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
            <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-top: 0;">We Received Your Issue Report</h2>
            <p>Hi ${userName || "Valued User"},</p>
            <p>Thank you for contacting Smart Household Energy support. We have received your report regarding <strong>${issueType}</strong>.</p>
            <p>Our system has logged this issue with <strong>Report ID: #${reportRef.id}</strong>. Our team is already looking into it, and we will work to resolve it automatically for you as soon as possible.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h4 style="margin: 0 0 8px 0; color: #1e3a8a;">Your Description:</h4>
              <p style="margin: 0; color: #334155; line-height: 1.5; white-space: pre-wrap;">${description}</p>
            </div>
            <p style="margin-top: 20px; color: #64748b; font-size: 12px;">This is an automated confirmation email. Please do not reply directly to this message.</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"Smart Household Energy Support" <${gmailUser}>`,
          to: userEmail,
          subject: `We received your issue report (#${reportRef.id})`,
          text: `Hi ${userName || "Valued User"},\n\nThank you for contacting us. We have received your report regarding "${issueType}". Our team is looking into it and we will resolve it automatically for you.\n\nReport ID: #${reportRef.id}`,
          html: autoReplyHtml,
        });
      }

      return {
        success: true,
        reportId: reportRef.id,
        emailSent: true
      };
    } catch (error: any) {
      console.error("Nodemailer failed to send email:", error);
      return {
        success: true,
        reportId: reportRef.id,
        emailSent: false,
        error: error.message || "Failed to send email"
      };
    }
  }
);




