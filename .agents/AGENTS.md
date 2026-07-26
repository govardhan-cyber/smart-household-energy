# Workspace Rules & Version History

## Saved Versions

- **Version 24**: Points to git tag `version-24`.
  - **Features**:
    - **Dynamic Appliance Custom Wattage Support & Extended Integration Tests**: Upgraded energy audit calculation engines (`auditEngine.ts` & `useDashboardState.tsx`) to support per-appliance custom wattage overrides. Enhanced recommendation algorithms to evaluate LED conversions, T5 tube light upgrades, BLDC fan conversions, and standby power reduction dynamically based on user-configured wattages. Expanded unit/integration testing suite in `auditFlow.test.ts` and `auditEngine.test.ts` to 60 total passing tests.
    - **Tariff Calculator Type Hardening & Null Safety**: Hardened dynamic tariff cache lookup in `tariffCalculator.ts` with explicit `TariffState` type casting, eliminating nullability type warnings and preventing runtime discom slab load errors.
  - **Verified:** 60/60 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 24", run `git checkout version-24`.

- **Version 23**: Points to git tag `version-23`.
  - **Features**:
    - **Firestore Connection Timeout Protection**: Wrapped Firestore read/write operations (`addDoc`, `getDocs`, `setDoc`, `deleteDoc`) inside a custom `withTimeout` promise racer in `auditService.ts`, `reportsService.ts`, and inline in `BillAnalyzer.tsx`. If database operations take longer than 4 seconds (due to network drops or offline states), they time out gracefully and fall back to local storage caching, preventing the audit scanning spinners from getting stuck indefinitely.
    - **UI Startup Lag Optimizations**: Delayed the initialization of the canvas animation loop inside `ThreeBackground.tsx` by 500ms, staggered Framer Motion children entrances with `delayChildren: 0.25`, pre-bundled high-load dependencies in `vite.config.ts`, and added `.will-change-gpu` CSS rules to offload layout calculations to the GPU.
  - **Verified:** 20/20 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 23", run `git checkout version-23`.

- **Version 22**: Points to git tag `version-22`.
  - **Features**:
    - **Dual Web3Forms + EmailJS Pipeline**: Implemented a concurrent AJAX pipeline in `ReportIssueModal.tsx`. Submits fast, reliable admin notification tickets to Web3Forms and dispatches confirmation auto-replies to users via EmailJS. Fully mapped template parameters (`name`, `user_email`, `title`, `description`, `screenshot_url`) to align with dashboard configurations.
    - **Clean Footer Layout**: Removed the bottom copyright text bar, Designed credit lines, and all social link icons (GitHub, Twitter, LinkedIn, Discord/MessageSquare) from the bottom row of `Footer.tsx` for a cleaner interface.
  - **Verified:** 20/20 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 22", run `git checkout version-22`.

- **Version 21**: Points to git tag `version-21`.
  - **Features**:
    - **Unified Multi-Page PDF Booklet Reports**: Standardized printable PDF generation under a single dynamic component `PrintReport` across the manual Home Audit Wizard, the scanned Bill Analyzer, and the History log modal pages. Removed physical A4 height overrides (`min-h-[297mm]`) and restricted trailing page breaks to non-final page divisions (`.print-page:not(:last-child)`) in `index.css` to eliminate trailing blank pages.
    - **SaaS Platform Diagnostics Dashboard**: Rebuilt the "About Platform" diagnostics tab in `Settings.tsx` into a high-fidelity SaaS-style console. Integrated a dynamic system health header banner, a 98% circular health indicator SVG, live fluctuating hardware resource monitors (CPU usage, memory allocation, and latency timers), and specific build tags (`v1.6.4`, production designations, last updated tags, and build hex `#a92f8d`).
    - **Animated Diagnostics Checks & Compact Cards**: Added interactive sequential step logs (*Checking OCR... Checking AI... Checking Firebase... Checking Storage... Analyzing Performance...*) triggered by the renamed `Scan Platform` button. Scaled down visual card proportions (padding, icon sizes, and font ratios) to make the grid highly compact and visually balanced.
  - **Verified:** 20/20 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 21", run `git checkout version-21`.

- **Version 20**: Points to git tag `version-20`.
  - **Features**:
    - **Multimodal Gemini Vision Primary Pipeline**: Configured the bill scanner to use direct image multimodal Gemini Vision as the primary parsing layer, bypassing OCR text-scrambling on complex table structures.
    - **Multi-layered Fallback Scan Deck**: Maintains PaddleOCR character recognition → Gemini JSON parsing → Local Heuristics as consecutive cascading fallbacks in case of API rate limits or offline state.
    - **Sanity Bounds & Exclusions Hardening**: Added specific ₹50 to ₹99,999 limits on bill amount extractions to prevent Service Connection numbers from leaking as billing totals. Broadened consumer name exclusions to prevent billing headers (e.g. Energy Charges) from leaking as the customer name.
    - **APEPDCL Fallback Heuristics Unit Tests**: Created `billOcrParser.test.ts` to verify local regex extraction against raw OCR text templates for five real-world bills (both normal and solar).
  - **Verified:** 20/20 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 20", run `git checkout version-20`.

- **Version 19**: Points to git tag `version-19`.
  - **Features**:
    - **PaddleOCR Character Recognition**: Replaced the browser-side Tesseract.js engine with deep-learning-based client-side PaddleOCR character recognition via ONNX Runtime Web.
    - **Dynamic Code-Split Imports**: Dynamically loads the PaddleOCR bundle (`web-*.js`) only when the scanner starts, decreasing page load size by ~428KB and preventing pre-bundling crashes.
    - **Math Cross-Checks & AI Validation**: Verifies that readings sum up to units consumed and charges balance, prepending warning insights on calculation mismatches.
    - **Visual Preprocessing Filters**: Added canvas-native grayscaling, contrast, and brightness optimizations to remove shadows and enhance thin faded characters.
  - **Verified:** 15/15 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 19", run `git checkout version-19`.

- **Version 18**: Points to git tag `version-18`.
  - **Features**:
    - **Solar Net-Metering & Firestore Omission Protection:** Full support for solar net-metered bills. Added dynamic Import/Export/Net Billed units display, CO2 efficiency adjustments, and incremental database model payload construction to omit `undefined` keys (preventing Firestore `addDoc` validation failures).
    - **Grid-Layout OCR Distance & Precedence Heuristics:** Upgraded regex patterns to support multi-column and grid layouts using character-distance matches (`[\s\S]{0,100}?`). Configured bill amount extraction with strict precedence (Net Amount/Amount Due before gross Total Amount) to accurately subtract government subsidies. Added comma/semicolon name segmentation to cleanly extract consumer names from long address blocks, and added sequence-based address extraction heuristics following the name index.
    - **Vibrant Card Glowing Effect:** Enhanced the top-right corner highlights of all 4 dashboard results cards. Integrated high-opacity blur vectors with premium blending modes (`mix-blend-multiply` in light mode, `mix-blend-screen` in dark mode) and smooth scaling hover transitions.
    - **Admin Contact Masking:** Masked administrative contact email addresses in user-facing modals to preserve privacy.
  - **Verified:** 15/15 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 18", run `git checkout version-18`.

- **Version 17**: Points to git tag `version-17`.
  - **Features**:
    - **Header Glass Control Center & HUD Status:** Overhauled the top settings hero header by wrapping it in a unified, floating glass console deck with accent spotlight glows. Redesigned the individual status cards on the right into borderless, frosted status chips (`bg-white/40 dark:bg-slate-900/40 backdrop-blur-md`) with real-time accent color circular progress rings, interactive cloud sync spinners, and blinking status animations.
    - **Widescreen Glassmorphic Details Panel:** Redesigned the main right details pane from a solid white/dark card into a frosted glass container layout (`bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/45 border-slate-250 dark:border-slate-855 backdrop-blur-md`).
    - **Frosted Navigation Sidebar Deck:** Grouped the sidebar tabs navigation buttons in a matching glass container card, converting inactive buttons into borderless, semi-translucent glass hover pills (`bg-slate-50/30 dark:bg-slate-900/20 hover:bg-slate-50/70 dark:hover:bg-slate-900/50`).
    - **Glass Calibrator Inputs & Segmented Switches:** Converted all input dropdown selectors, text input fields, and subtab segmented control button lists into glassmorphic controls with backdrop blur styling.
    - **Admin Database Manager Glass Modal:** Refined the regional slab database editor popup dialog modal to use translucent gradients (`bg-gradient-to-r from-slate-50/90 to-slate-100/70 dark:from-slate-900/90 dark:to-slate-950/85 backdrop-blur-xl border border-slate-250 dark:border-slate-855 shadow-2xl`).
    - **Interactive Diagnostics Center:** Integrated a system diagnostic test panel in the About tab. Clicking "Run Diagnostics" simulates a scan and generates a detailed report of local storage, Firebase API, active DISCOM rates, Vitest scenario compounding math, and latency specs.
    - **Upgraded Profile Summary Card:** Restyled the profile completion ring with a dynamic accent color SVG path. Swapped flat badge indicators with translucent iOS capsules, and added an AI Savings Score footer bar.
    - **Clean Toggle Switch Knobs:** Removed the tick mark icon from all ToggleSwitch knobs to restore a clean, minimal solid white iOS-style circle knob.
    - **Dynamic Translucent Preference Icons:** Swapped opaque gradients on notifications preferences card icon wrappers with translucent accent backdrops (`bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue`), making Lucide icons highly visible.
  - **Verified:** 15/15 tests passing, zero TypeScript errors, clean production build.
  - **Recovery Instruction**:
    - If the user says "recover version 17", run `git checkout version-17`.

- **Version 16**: Points to git tag `version-16`.
  - **Features**:
    - **React Error Boundary:** Created `src/components/ErrorBoundary.tsx` — a class-based boundary with a styled "Something went wrong / Try Again" fallback card. Wrapped all 6 protected routes (Dashboard, Bill Analyzer, History, Survey Data, Profile, Settings) individually plus a top-level `<ErrorBoundary page="App">` catch-all in `App.tsx`. A crash in one tab now shows a recovery card instead of blanking the entire app.
    - **Gemini API Key Security:** Added `geminiProxy` Firebase Callable Function in `functions/src/index.ts` that reads `GEMINI_API_KEY` from server-side Firebase config (`functions.config().gemini.key`) — the key is never shipped in the browser bundle. Both `ChatBot.tsx` and `BillAnalyzer.tsx` (all 3 call sites) now route through `httpsCallable(functions, "geminiProxy")`. A local dev fallback (`else` branch) preserves `VITE_GEMINI_API_KEY` for offline/dev use when Firebase isn't configured.
    - **Type Safety Hardening (Remaining 36 `any`):** Eliminated all remaining `any` usages across 8 files: `ChatBot.tsx` (lastError, catch blocks), `Charts.tsx` (Recharts formatter params), `PremiumDashboard.tsx` (Badge interface with trend/value), `SavingsAdvisor.tsx` (icon: ReactNode), `SidebarWidgets.tsx` (analysisResult typed interface), `SurveyData.tsx` (CustomTooltip inline type), `Dashboard.tsx` (RecommendationItem + AnalysisResult interfaces extracted), `Settings.tsx` (TariffSlab typed, all prev/value casts removed, numericRate added to new slabs).
    - **Chart Accessibility:** Both Recharts chart containers in `Charts.tsx` wrapped with `role="img"`, `aria-label`, and `aria-describedby` pointing to existing `sr-only` data tables.
  - **Verified:** 15/15 tests passing, zero TypeScript errors, clean build. Gemini key confirmed absent from `dist/` bundle (`Select-String` returns zero matches).
  - **Note:** `geminiProxy` Firebase Function requires **Blaze plan** to deploy. On Spark plan, the app automatically falls back to direct Gemini calls using `VITE_GEMINI_API_KEY`. To activate secure mode: upgrade to Blaze, run `firebase functions:config:set gemini.key="YOUR_KEY"`, then `firebase deploy --only functions`.
  - **Recovery Instruction**:
    - If the user says "recover version 16", run `git checkout version-16`.

- **Version 15**: Points to git tag `version-15`.
  - **Features**:
    - **Solar ROI Unit Tests:** Extracted the 25-year compounding ROI math out of `SolarCalculator.tsx` into a pure utility `src/utils/solarCalculator.ts` and wrote 5 scenario-based Vitest tests covering tariff key mapping, city cost interpolation, unit-from-bill estimation, full 25-year timeline correctness (payback year, cumulative balance), and lead-acid vs lithium battery cost differentiation.
    - **Component Refactor:** Replaced ~260 lines of inline calculation logic in `SolarCalculator.tsx` with a single `calculateSolarROI()` call, keeping the UI identical while making the math independently testable.
    - **Type Safety Upgrades:** Extended `global.d.ts` to declare `window.pdfjsLib` as `typeof import('pdfjs-dist')` (eliminating all `(window as any)` casts). Removed all `any` usages from `BillAnalyzer.tsx` — Tesseract logger typed with a `TesseractProgressMessage` interface, all `catch (err: any)` blocks narrowed to `catch (err: unknown)` with `instanceof Error` guards.
    - **Modal Accessibility (A11y):** Added full focus trapping (`Tab`/`Shift+Tab` cycle, `Escape` dismiss), `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`/`aria-describedby` to all 5 modals and drawers across `BillAnalyzer.tsx`, `History.tsx`, and `SurveyData.tsx`.
    - **Screen-Reader Chart Fallbacks:** Added `sr-only` hidden `<table>` elements with proper `<caption>` and `scope` attributes next to all 3 Recharts visualizations (Pie chart in BillAnalyzer, Pie + Bar charts in SurveyData) for full screen-reader accessibility.
  - **Verified:** 15/15 tests passing, zero TypeScript errors, clean `vite build` in 1.64s.
  - **Recovery Instruction**:
    - If the user says "recover version 15", run `git checkout version-15`.

- **Version 14**: Points to git tag `version-14`.
  - **Features**:
    - **Premium Light & Dark Mode Backgrounds:** Generated new, ultra-high-definition abstract tech backgrounds for both themes. Light mode features flowing silver/white metallic wave surfaces with glowing neon cyan/mint-green paths. Dark mode features charcoal/obsidian metallic curves with neon trails.
    - **Vibrant Glows & Spotlights:** Added dedicated dark-mode glowing ambient blobs (emerald, cyan, and indigo) behind UI cards for lighting depth. Configured high-contrast spotlights (normal/multiply for light mode, screen blend mode with 0.16 opacity for dark mode).
    - **Visible Tech Grids & Contrast:** Adjusted image visibility (`opacity-85 brightness-[0.98] contrast-[1.08]` in light mode, `opacity-75 brightness-[0.88] contrast-[1.15]` in dark mode) and grid line opacity (`0.035` indigo grid in light mode, `0.03` cyan grid in dark mode) to render clean, high-contrast, premium layouts. Fixed invalid Tailwind vignettes.
  - **Recovery Instruction**:
    - If the user says "recover version 14", run `git checkout version-14`.

- **Version 13**: Points to git tag `version-13`.
  - **Features**:
    - **Premium Footer Layout:** Integrated a full-width Final CTA gradient banner, animated stat count-up bridge cards (Homes Audited, AI Accuracy, kWh Analysed, Costs Predicted), a 5-column brand links grid, platform trust badges (SSL, Privacy, AI, Eco, DISCOM), and inline SVG social links.
  - **Recovery Instruction**:
    - If the user says "recover version 13", run `git checkout version-13`.

- **Version 12**: Points to git tag `version-12`.
  - **Features**:
    - **Dual Lighting Source Split:** Separated LED Bulbs and conventional Tube Lights into two first-class, independent selectable appliances. Added custom wattage presets (9W/12W/15W for LEDs; 18W T5/40W Conventional for Tube Lights) and separate runtime configurations.
    - **Concurrent Savings Simulation & Audits:** Upgraded the real-time consumption dashboard simulator and advisory engines to calculate and display potential savings for both lighting types concurrently. Added separate action item recommendations for bulb upgrades and T5 LED tube replacements.
    - **Asymmetrical Glassmorphic Layout:** Redesigned the footer links grid by wrapping it in a parent glassmorphism card container. Added a layered, inner glass brand-sync status widget card on the left side, balanced against offset floating link columns on the right.
    - **Micro-Hover Navigation Transitions:** Integrated interactive slide-up and translate animations on footer links and active glows on hover.
  - **Recovery Instruction**:
    - If the user says "recover version 12", run `git checkout version-12`.

- **Version 11**: Points to git tag `version-11`.
  - **Features**:
    - **Clear Glassmorphic Card:** Upgraded the `BiggestConsumerCard` to a highly translucent, clear glass pane by removing all backdrop blur properties. Integrated a dual concentric ring progress dial, specular reflective gloss sheen, top edge highlights, and high-contrast typography.
    - **Premium Light Mode Background:** Transitioned the root container from flat gray to a gradient backdrop (`from-slate-50 via-slate-100/70 to-blue-50/30`) with three floating animated mesh gradient glows (indigo, cyan, and emerald) in the viewport corners and enhanced mouse spotlight cursor tracking.
    - **Universal Dark Mode Legibility Fixes:**
      - Styled native select options and optgroups globally with specific dark backgrounds and white text.
      - Resolved the harsh solid white background on the Estimated Monthly Usage badge by fixing the invalid tailwind class from `blue-955` to `blue-950`.
      - Configured Recharts chart tooltips to dynamically style backgrounds and text color using `activeTheme` to resolve white text on white background issues.
  - **Recovery Instruction**:
    - If the user says "recover version 11", run `git checkout version-11`.
