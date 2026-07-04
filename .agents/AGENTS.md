# Workspace Rules & Version History

## Saved Versions

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
