"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndSaveReport = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
/**
 * HTTPS Callable function to validate energy calculations server-side.
 * This prevents client-side tampering of savings potentials or bills before committing.
 */
exports.validateAndSaveReport = functions.https.onCall(async (data, context) => {
    // 1. Authenticate Request
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { userId, appliances, totalUnits } = data;
    // Verify user owns the resource being created
    if (context.auth.uid !== userId) {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission to log reports for this user profile.");
    }
    // 2. Validate calculations server-side
    let calculatedUnits = 0;
    for (const app of appliances) {
        if (app.quantity < 0 || app.hours < 0 || app.hours > 24 || app.watts < 0) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid appliance usage properties detected.");
        }
        calculatedUnits += app.quantity * (app.watts / 1000) * app.hours * 30;
    }
    calculatedUnits = Math.round(calculatedUnits);
    // Allow a small rounding tolerance of 2 units between client and server calculations
    if (Math.abs(calculatedUnits - totalUnits) > 2) {
        throw new functions.https.HttpsError("failed-precondition", "Calculated energy units do not match submitted values. Calculation rejected.");
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
});
//# sourceMappingURL=index.js.map