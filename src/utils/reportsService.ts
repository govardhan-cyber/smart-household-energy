import { collection, getDocs, query, where, deleteDoc, doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions, IS_FIREBASE_CONFIGURED } from "../firebase/config";

export interface EnergyReport {
  id?: string;
  userId: string;
  appliances: {
    name: string;
    quantity: number;
    hours: number;
    watts: number;
  }[];
  totalUnits: number;
  estimatedBill: number;
  savingsPotential: number;
  highestConsumer: string;
  createdAt: string; // ISO String or Timestamp representation
  // Premium and Carbon tracking properties
  tariffState?: string;
  customFlatRate?: number;
  beforeCo2?: number;
  afterCo2?: number;
  savedCo2?: number;
  savedTrees?: number;
  billAfter?: number;
  usageAfter?: number;
}

const MOCK_REPORTS_KEY = "she_mock_reports";

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database operation timed out")), timeoutMs)
    )
  ]);
};

export const reportsService = {
  async saveReport(reportData: Omit<EnergyReport, "createdAt">): Promise<string> {
    const reportWithUser: EnergyReport = {
      ...reportData,
      createdAt: new Date().toISOString()
    };

    // Cache locally instantly
    const cacheKey = `she_reports_cache_${reportData.userId}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedReports: EnergyReport[] = cachedData ? JSON.parse(cachedData) : [];
    const tempId = "temp_report_" + Math.random().toString(36).substr(2, 9);
    const cachedReportWithId = { ...reportWithUser, id: tempId };
    cachedReports.unshift(cachedReportWithId);
    localStorage.setItem(cacheKey, JSON.stringify(cachedReports));

    if (IS_FIREBASE_CONFIGURED) {
      if (functions) {
        try {
          const saveReportFn = httpsCallable(functions, "saveReport");
          const res = await withTimeout(saveReportFn(reportWithUser));
          const docId = (res.data as any).id;

          // Update cached item with real Firestore doc ID
          const freshData = localStorage.getItem(cacheKey);
          if (freshData) {
            const freshList: EnergyReport[] = JSON.parse(freshData);
            const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: docId } : r);
            localStorage.setItem(cacheKey, JSON.stringify(updatedList));
          }
          return docId;
        } catch (e) {
          console.error("Cloud function saveReport error, trying direct write fallback:", e);
        }
      }

      if (db) {
        try {
          const newDocRef = doc(collection(db, "energy_reports"));
          const reportWithId = { 
            ...reportWithUser, 
            id: newDocRef.id,
            validatedByBackend: false
          };
          await withTimeout(setDoc(newDocRef, reportWithId));

          // Update cached item with real Firestore doc ID
          const freshData = localStorage.getItem(cacheKey);
          if (freshData) {
            const freshList: EnergyReport[] = JSON.parse(freshData);
            const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: newDocRef.id } : r);
            localStorage.setItem(cacheKey, JSON.stringify(updatedList));
          }
          return newDocRef.id;
        } catch (firestoreErr) {
          console.error("Firestore direct write fallback also failed:", firestoreErr);
        }
      }

      const localId = "report_" + Math.random().toString(36).substr(2, 9);
      const freshData = localStorage.getItem(cacheKey);
      if (freshData) {
        const freshList: EnergyReport[] = JSON.parse(freshData);
        const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: localId } : r);
        localStorage.setItem(cacheKey, JSON.stringify(updatedList));
      }
      return localId;
    } else {
      const localId = "report_" + Math.random().toString(36).substr(2, 9);
      const freshData = localStorage.getItem(cacheKey);
      if (freshData) {
        const freshList: EnergyReport[] = JSON.parse(freshData);
        const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: localId } : r);
        localStorage.setItem(cacheKey, JSON.stringify(updatedList));
      }
      this.saveReportLocal(reportWithUser);
      return localId;
    }
  },


  saveReportLocal(report: EnergyReport): string {
    const rawReports = localStorage.getItem(MOCK_REPORTS_KEY);
    const reportsList: EnergyReport[] = rawReports ? JSON.parse(rawReports) : [];
    const reportId = "report_" + Math.random().toString(36).substr(2, 9);
    const newReport = { ...report, id: reportId };
    
    reportsList.push(newReport);
    localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reportsList));
    return reportId;
  },

  async getUserReports(userId: string): Promise<EnergyReport[]> {
    if (IS_FIREBASE_CONFIGURED && db) {
      try {
        const reportsRef = collection(db, "energy_reports");
        const q = query(
          reportsRef, 
          where("userId", "==", userId)
        );
        const querySnapshot = await withTimeout(getDocs(q));
        const reports: EnergyReport[] = [];
        querySnapshot.forEach((doc) => {
          reports.push({ ...doc.data() as EnergyReport, id: doc.id });
        });
        
        // Sort by date descending
        const sorted = reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Update local cache
        const cacheKey = `she_reports_cache_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify(sorted));

        return sorted;
      } catch (e) {
        console.error("Firestore getUserReports error, loading from local fallback:", e);
        return this.getUserReportsLocal(userId);
      }
    } else {
      return this.getUserReportsLocal(userId);
    }
  },

  getUserReportsLocal(userId: string): EnergyReport[] {
    const rawReports = localStorage.getItem(MOCK_REPORTS_KEY);
    const reportsList: EnergyReport[] = rawReports ? JSON.parse(rawReports) : [];
    return reportsList
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async deleteReport(reportId: string): Promise<void> {
    // Instantly remove from all local cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("she_reports_cache_")) {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
          try {
            const reportsList: EnergyReport[] = JSON.parse(cachedData);
            const updatedList = reportsList.filter(r => r.id !== reportId);
            localStorage.setItem(key, JSON.stringify(updatedList));
          } catch (e) {
            console.error("Failed to update cache on delete:", e);
          }
        }
      }
    }

    if (IS_FIREBASE_CONFIGURED && db && !reportId.startsWith("report_") && !reportId.startsWith("temp_")) {
      try {
        await withTimeout(deleteDoc(doc(db, "energy_reports", reportId)));
        return;
      } catch (e) {
        console.error("Firestore deleteDoc error, trying localStorage:", e);
      }
    }
    
    // Fallback or Mock delete
    const rawReports = localStorage.getItem(MOCK_REPORTS_KEY);
    if (rawReports) {
      let reportsList: EnergyReport[] = JSON.parse(rawReports);
      reportsList = reportsList.filter((r) => r.id !== reportId);
      localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reportsList));
    }
  }
};
