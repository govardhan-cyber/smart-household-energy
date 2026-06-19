# Smart Household Energy ⚡

A premium, interactive household energy auditing and solar return-on-investment (ROI) forecasting dashboard. Built with React, TypeScript, and Tailwind CSS, the platform helps users analyze appliance consumption, identify energy-saving opportunities, and run detailed 25-year financial simulations for solar installations.

---

## 🚀 Features

### 🏠 AI Home Audit
*   **Appliance Profiling:** Analyzes wattage, quantity, and usage hours to calculate monthly consumption.
*   **Feasibility & Efficiency Analysis:** Ranks appliances by energy footprint and flags high-consumption or inefficient usage patterns.
*   **Smart Savings Actions:** Actionable recommendations with immediate feedback on estimated monthly savings.

### ☀️ Smart Solar ROI Calculator
*   **25-Year Cash Flow Projection:** Models real-world factors including panel degradation, tariff inflation, and rising maintenance costs.
*   **Live Interactive Assumptions:** Sliders to customize tariff increase rate (0-15%), annual module degradation (0.1-2.0%), and maintenance cost index.
*   **Amortization Timeline:** Visually plots the cumulative net savings and automatically identifies the exact break-even (payback) year.
*   **Comparison Engine:** Side-by-side lifetime costs (No Solar vs. Solar Installed) and clear financial recommendation badges.

### 📊 Interactive Visualizations
*   **Dynamic Savings Plots:** Monthly and cumulative multi-year line and bar charts powered by Recharts.
*   **Animated Stats Counters:** Smooth transitions for financial metrics.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend Framework:** React 19 + TypeScript + Vite
*   **Styling:** Tailwind CSS v4 (with custom palettes, modern dark mode compatibility, and glassmorphism components)
*   **Animations:** Framer Motion (for transitions and slider recalculation layouts)
*   **Charts:** Recharts (responsive grids, tooltips, and cumulative timeline plotting)
*   **Icons:** Lucide React
*   **Backend & DB:** Firebase (Authentication + Firestore) with a local-storage mock fallback for local sandboxing.

---

## 📁 Architecture Directory Structure

```text
smart-household-energy/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, global styles, and SVGs
│   ├── components/         # Shared and feature-specific components
│   │   └── dashboard/      # SolarCalculator, Charts, DashboardHero, etc.
│   ├── context/            # React context providers (Auth, Energy Data)
│   ├── firebase/           # config.ts (env-driven configuration setup)
│   ├── pages/              # Primary pages (Dashboard, Audit View, Login)
│   ├── utils/              # Helper utilities (tariff calculation engine, math scripts)
│   ├── App.tsx             # Route coordinator and root container
│   └── main.tsx            # Application entrypoint
├── .env.example            # Safe template for environment variables
├── firebase.json           # Firebase CLI deployment configuration
└── README.md               # Project documentation
```

---

## ⚙️ Installation & Local Development

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-household-energy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy the template file to create your local env configuration:
```bash
cp .env.example .env.local
```
*(Open `.env.local` and add your Firebase credentials. If left blank, the app will automatically run in local-storage mock mode.)*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔥 Firebase Setup

To hook the application up to your own Firebase project:

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Add a **Web App** to your project to get your configuration object.
3.  Fill in the values in your `.env.local` file:
    ```env
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    VITE_FIREBASE_APP_ID=your-app-id
    ```
4.  Enable **Anonymous Authentication** or **Email/Password Authentication** in the Firebase Auth panel.
5.  Enable **Cloud Firestore** and deploy rules suited for user energy profiles.

---

## 🚢 Deployment

The application is configured to deploy to Firebase Hosting.

### 1. Build the production application
```bash
npm run build
```

### 2. Login & deploy via Firebase CLI
```bash
# Login to Firebase
npx firebase login

# Deploy host build to production
npx firebase deploy --only hosting
```

---

## 📸 Screenshots

*Provide previews of key areas here:*

| Dashboard Hero & Insights | Interactive Solar Calculator & ROI Timeline |
| :---: | :---: |
| *Personalized Greetings & Trend Indicators* | *25-Year Amortization Curve & Financial Verdicts* |

*(Screenshots can be added to a local `public/screenshots/` folder and linked accordingly.)*
