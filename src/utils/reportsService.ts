import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
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

export const reportsService = {
  async saveReport(reportData: Omit<EnergyReport, "createdAt">): Promise<string> {
    const report: EnergyReport = {
      ...reportData,
      createdAt: new Date().toISOString()
    };

    // Instantly write to local cache so subsequent page loads can see it instantly
    const cacheKey = `she_reports_cache_${reportData.userId}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedReports: EnergyReport[] = cachedData ? JSON.parse(cachedData) : [];
    const tempId = "temp_" + Math.random().toString(36).substr(2, 9);
    const cachedReportWithId = { ...report, id: tempId };
    cachedReports.unshift(cachedReportWithId);
    localStorage.setItem(cacheKey, JSON.stringify(cachedReports));

    if (IS_FIREBASE_CONFIGURED && functions) {
      try {
        const validateAndSave = httpsCallable<any, { success: boolean; reportId: string; msg: string }>(
          functions,
          "validateAndSaveReport"
        );
        const result = await validateAndSave(report);
        const realId = result.data.reportId;

        // Update cached item with real Firestore doc ID
        const freshData = localStorage.getItem(cacheKey);
        if (freshData) {
          const freshList: EnergyReport[] = JSON.parse(freshData);
          const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: realId } : r);
          localStorage.setItem(cacheKey, JSON.stringify(updatedList));
        }

        return realId;
      } catch (e) {
        console.error("Cloud Functions validateAndSaveReport error, falling back to localStorage:", e);
        const localId = "report_" + Math.random().toString(36).substr(2, 9);
        const freshData = localStorage.getItem(cacheKey);
        if (freshData) {
          const freshList: EnergyReport[] = JSON.parse(freshData);
          const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: localId } : r);
          localStorage.setItem(cacheKey, JSON.stringify(updatedList));
        }
        return localId;
      }
    } else {
      const localId = "report_" + Math.random().toString(36).substr(2, 9);
      const freshData = localStorage.getItem(cacheKey);
      if (freshData) {
        const freshList: EnergyReport[] = JSON.parse(freshData);
        const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: localId } : r);
        localStorage.setItem(cacheKey, JSON.stringify(updatedList));
      }
      this.saveReportLocal(report);
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
        const querySnapshot = await getDocs(q);
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
        await deleteDoc(doc(db, "energy_reports", reportId));
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
