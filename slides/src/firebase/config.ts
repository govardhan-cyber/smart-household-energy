import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import type { Functions } from "firebase/functions";

// ---------------------------------------------------------------------------
// All Firebase credentials MUST be supplied via environment variables.
// Copy .env.example → .env.local and fill in your values.
// Never commit real credentials to version control.
// ---------------------------------------------------------------------------
const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

const missing = required.filter((key) => !import.meta.env[key]);
if (missing.length > 0) {
  console.warn(
    `[Firebase] Missing environment variable(s): ${missing.join(", ")}. ` +
    "Copy .env.example to .env.local and fill in your project credentials."
  );
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// IS_FIREBASE_CONFIGURED is true only when all required vars are present
// Or if we are in mock/sandbox environment
export const IS_FIREBASE_CONFIGURED =
  missing.length === 0 &&
  !!firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 5;

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;

if (IS_FIREBASE_CONFIGURED) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);
  } catch (error) {
    console.error("[Firebase] Failed to initialize services:", error);
  }
} else {
  console.log(
    "[Firebase] Running in local-storage mock mode — credentials not detected."
  );
}

export { auth, db, functions };
export default firebaseConfig;

