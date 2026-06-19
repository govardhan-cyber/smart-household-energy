import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db, IS_FIREBASE_CONFIGURED } from "../firebase/config";
import type { AuditResult } from "./auditEngine";

export interface HomeAudit {
  id?: string;
  userId: string;
  result: AuditResult;
  createdAt: string; // ISO String
}

const MOCK_AUDITS_KEY = "she_mock_audits";

export const auditService = {
  async saveAudit(userId: string, result: AuditResult): Promise<string> {
    const audit: HomeAudit = {
      userId,
      result,
      createdAt: new Date().toISOString()
    };

    // Cache locally instantly
    const cacheKey = `she_audits_cache_${userId}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedAudits: HomeAudit[] = cachedData ? JSON.parse(cachedData) : [];
    const tempId = "temp_audit_" + Math.random().toString(36).substr(2, 9);
    const cachedAuditWithId = { ...audit, id: tempId };
    cachedAudits.unshift(cachedAuditWithId);
    localStorage.setItem(cacheKey, JSON.stringify(cachedAudits));

    if (IS_FIREBASE_CONFIGURED && db) {
      try {
        const docRef = await addDoc(collection(db, "home_audits"), audit);
        
        // Sync local cache with Firestore ID
        const freshData = localStorage.getItem(cacheKey);
        if (freshData) {
          const freshList: HomeAudit[] = JSON.parse(freshData);
          const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: docRef.id } : r);
          localStorage.setItem(cacheKey, JSON.stringify(updatedList));
        }

        return docRef.id;
      } catch (e) {
        console.error("Firestore saveAudit error, falling back to localStorage:", e);
        const localId = "audit_" + Math.random().toString(36).substr(2, 9);
        const freshData = localStorage.getItem(cacheKey);
        if (freshData) {
          const freshList: HomeAudit[] = JSON.parse(freshData);
          const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: localId } : r);
          localStorage.setItem(cacheKey, JSON.stringify(updatedList));
        }
        this.saveAuditLocal(audit);
        return localId;
      }
    } else {
      const localId = "audit_" + Math.random().toString(36).substr(2, 9);
      const freshData = localStorage.getItem(cacheKey);
      if (freshData) {
        const freshList: HomeAudit[] = JSON.parse(freshData);
        const updatedList = freshList.map(r => r.id === tempId ? { ...r, id: localId } : r);
        localStorage.setItem(cacheKey, JSON.stringify(updatedList));
      }
      this.saveAuditLocal(audit);
      return localId;
    }
  },

  saveAuditLocal(audit: HomeAudit): string {
    const rawAudits = localStorage.getItem(MOCK_AUDITS_KEY);
    const auditsList: HomeAudit[] = rawAudits ? JSON.parse(rawAudits) : [];
    const auditId = "audit_" + Math.random().toString(36).substr(2, 9);
    const newAudit = { ...audit, id: auditId };
    
    auditsList.push(newAudit);
    localStorage.setItem(MOCK_AUDITS_KEY, JSON.stringify(auditsList));
    return auditId;
  },

  async getUserAudits(userId: string): Promise<HomeAudit[]> {
    if (IS_FIREBASE_CONFIGURED && db) {
      try {
        const auditsRef = collection(db, "home_audits");
        const q = query(auditsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const audits: HomeAudit[] = [];
        querySnapshot.forEach((doc) => {
          audits.push({ ...doc.data() as HomeAudit, id: doc.id });
        });
        
        // Sort by date descending
        const sorted = audits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Update local cache
        const cacheKey = `she_audits_cache_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify(sorted));

        return sorted;
      } catch (e) {
        console.error("Firestore getUserAudits error, loading from local fallback:", e);
        return this.getUserAuditsLocal(userId);
      }
    } else {
      return this.getUserAuditsLocal(userId);
    }
  },

  getUserAuditsLocal(userId: string): HomeAudit[] {
    const rawAudits = localStorage.getItem(MOCK_AUDITS_KEY);
    const auditsList: HomeAudit[] = rawAudits ? JSON.parse(rawAudits) : [];
    return auditsList
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async deleteAudit(auditId: string): Promise<void> {
    // Remove from local cache
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("she_audits_cache_")) {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
          try {
            const auditsList: HomeAudit[] = JSON.parse(cachedData);
            const updatedList = auditsList.filter(r => r.id !== auditId);
            localStorage.setItem(key, JSON.stringify(updatedList));
          } catch (e) {
            console.error("Failed to update cache on delete:", e);
          }
        }
      }
    }

    if (IS_FIREBASE_CONFIGURED && db && !auditId.startsWith("audit_") && !auditId.startsWith("temp_")) {
      try {
        await deleteDoc(doc(db, "home_audits", auditId));
        return;
      } catch (e) {
        console.error("Firestore deleteDoc error, trying localStorage:", e);
      }
    }
    
    // Fallback or Mock delete
    const rawAudits = localStorage.getItem(MOCK_AUDITS_KEY);
    if (rawAudits) {
      let auditsList: HomeAudit[] = JSON.parse(rawAudits);
      auditsList = auditsList.filter((r) => r.id !== auditId);
      localStorage.setItem(MOCK_AUDITS_KEY, JSON.stringify(auditsList));
    }
  }
};
