import os
import subprocess

# Define categories and questions/answers database
qa_data = [
    {
        "category": "Basic Project Questions",
        "questions": [
            {
                "id": 1,
                "q": "What is the objective of your project?",
                "a": "The objective of the <strong>Smart Household Energy</strong> project is to provide residential consumers with an interactive, data-driven dashboard that helps them audit their electricity usage, identify inefficient energy-consuming appliances ('energy hogs'), and run accurate, customized 25-year financial simulations for installing rooftop solar panels. It aims to bridge the gap between abstract monthly utility bills and actionable conservation decisions."
            },
            {
                "id": 2,
                "q": "Why did you choose this project?",
                "a": "Rising utility costs and climate change make energy conservation a double priority. Most consumers receive a monthly bill showing total consumption but have no insight into <i>which</i> appliances are driving the costs, whether their usage schedules are inefficient, or if rooftop solar is financially viable. I chose this project to empower households with intuitive, self-service auditing and realistic financial forecasting to take control of their energy expenses."
            },
            {
                "id": 3,
                "q": "What problem does your project solve?",
                "a": "It solves three core problems:<br>1. <strong>Lack of Visibility:</strong> It breaks down a single monthly electricity bill into individual appliance footprints.<br>2. <strong>Appliance Decay Ignored:</strong> It models mechanical aging of high-draw appliances (like ACs and Fridges), showing how old models leak energy.<br>3. <strong>Oversimplified Solar Estimation:</strong> Unlike generic estimators that use flat average rates, our engine models regional multi-slab tariffs, solar degradation, utility inflation, and maintenance costs over 25 years to project accurate payback timelines."
            },
            {
                "id": 4,
                "q": "Who are the target users of this system?",
                "a": "The primary target users are:<br>1. <strong>Homeowners and Tenants:</strong> Looking to reduce monthly electricity bills and manage active appliances.<br>2. <strong>Green Energy Enthusiasts:</strong> Planning to transition to renewable solar energy.<br>3. <strong>Solar Installation Advisors:</strong> Using the interactive tool to present professional, personalized 25-year ROI forecasts to prospective clients.<br>4. <strong>Community Energy Auditors:</strong> Conducting household surveys to analyze regional energy health trends."
            },
            {
                "id": 5,
                "q": "How does your project help households save energy?",
                "a": "It helps households save energy in three ways:<br>1. <strong>Behavioral Changes:</strong> Recommends schedule optimizations (e.g., raising AC temperature to 24°C, reducing geyser pre-heat times).<br>2. <strong>Technological Upgrades:</strong> Identifies old appliances and calculates the exact payback timeline in years if replaced with BEE 5-star or BLDC motor models.<br>3. <strong>Immediate Feedback:</strong> Displays estimated annual rupee savings for each recommended action so users know where to focus first."
            },
            {
                "id": 6,
                "q": "What are the main features of your dashboard?",
                "a": "The dashboard contains several integrated features:<br>1. <strong>AI Home Audit Wizard:</strong> A step-by-step assistant where users input appliance counts, usage hours, and age to compute energy health.<br>2. <strong>Interactive Solar ROI Calculator:</strong> A 25-year cash-flow forecasting interface with live sliders (tariff inflation, module degradation, maintenance indexes).<br>3. <strong>AI Bill Analyzer:</strong> An upload tool utilizing client-side OCR (Tesseract.js) to scan billing PDFs or images, extract active units/bill amount, and check savings potential.<br>4. <strong>Interactive Charts:</strong> Dynamic SVG line and bar charts (using Recharts) mapping monthly consumption splits and cumulative payback curves.<br>5. <strong>Admin Tariff Settings:</strong> A interface to manage multi-slab dynamic domestic tariffs synced via Firebase Firestore."
            },
            {
                "id": 7,
                "q": "What makes your project different from existing energy calculators?",
                "a": "Existing online energy calculators use flat average unit rates (e.g., flat ₹8 per unit) and static assumptions. Our project is unique because it:<br>1. Employs <strong>real multi-slab domestic tariffs</strong> (APSPDCL, BESCOM, TSSPDCL) which calculate bills based on progressive consumption slabs.<br>2. Models <strong>appliance aging</strong>, adding a percentage efficiency decay per year of age.<br>3. Incorporates <strong>seasonal variation</strong> (cooling load multipliers in summer, heating in winter).<br>4. Simulates a <strong>dynamic 25-year cash-flow model</strong> with compounding panel degradation, maintenance escalation, and utility tariff inflation, finding the fractional break-even year."
            }
        ]
    },
    {
        "category": "Technical Questions",
        "questions": [
            {
                "id": 8,
                "q": "Which technologies did you use and why?",
                "a": "I built a modern web application stack:<br>• <strong>Frontend:</strong> React 19 + TypeScript + Vite (for high-speed developer experience and optimized production bundles).<br>• <strong>Styling:</strong> Tailwind CSS v4 (offering custom glassmorphic components, sleek dark mode variables, and layout structures).<br>• <strong>State & Navigation:</strong> React Router DOM v7 (for single-page navigation and protected routing).<br>• <strong>Charts:</strong> Recharts (native React SVG library for responsive, animated graphs).<br>• <strong>Backend & Database:</strong> Firebase (Authentication for user accounts, and Firestore as a real-time serverless NoSQL database).<br>• <strong>OCR & Text Extraction:</strong> Tesseract.js (for client-side OCR) and pdfjs-dist (for PDF text mining)."
            },
            {
                "id": 9,
                "q": "Why did you choose React for the frontend?",
                "a": "React was selected for its component-based architecture and declarative state rendering. In the Solar ROI Calculator, a user can modify multiple sliders (e.g. panel degradation from 0.8% to 1.5%). React's virtual DOM diffing detects these changes and instantly recalculates the 25-year compounding cash flow, updating the Recharts line graph and stats cards in milliseconds without requiring a full page refresh."
            },
            {
                "id": 10,
                "q": "Why did you choose your database?",
                "a": "I chose <strong>Firebase Cloud Firestore</strong>, a serverless NoSQL document database. Firestore was ideal because:<br>1. <strong>Flexible Schema:</strong> User energy audits and uploaded bills are semi-structured; NoSQL documents store nested appliance profiles without rigid tables.<br>2. <strong>Real-time Sync:</strong> Admin updates to tariff document rates in the Firestore console instantly propagate to all users' active sessions.<br>3. <strong>Offline Cache:</strong> Firestore automatically caches data on the client browser. If a user is offline, the app operates seamlessly using local cache."
            },
            {
                "id": 11,
                "q": "How is data stored in your system?",
                "a": "Data is stored in Firestore documents structured in collections:<br>1. <strong>tariffs/</strong>: Contains documents for each utility provider (e.g. ap_apspdcl, karnataka_bescom), mapping array objects of slabs (limits, rates, numeric rates) and subsidy configurations.<br>2. <strong>users/{userId}/</strong>: Main document holding user-specific preferences (default state, tariff provider).<br>3. <strong>users/{userId}/audits/</strong>: Sub-collection containing histories of home audits.<br>4. <strong>users/{userId}/bills/</strong>: Sub-collection storing parsed OCR bill records (units, billing date, net charges, file reference)."
            },
            {
                "id": 12,
                "q": "How does the frontend communicate with the backend?",
                "a": "Communication is performed asynchronously using the <strong>Firebase JS Client SDK (v12)</strong>. Rather than writing a custom REST API middleware, React imports functions like <code>getDoc</code>, <code>setDoc</code>, and <code>addDoc</code> to fetch and write to Firestore collections directly over secure WebSockets or HTTPS. Authentication is handled by standard Firebase Auth listener callbacks (<code>onAuthStateChanged</code>)."
            },
            {
                "id": 13,
                "q": "What APIs are used in your project?",
                "a": "The project uses client-side and serverless cloud APIs:<br>1. <strong>Firebase Auth API:</strong> Handles user authentication states.<br>2. <strong>Cloud Firestore API:</strong> Manages document reads and writes.<br>3. <strong>Tesseract OCR API:</strong> Built-in JavaScript API that runs Tesseract OCR engine inside browser <i>Web Workers</i>, allowing parallel image processing without locking the browser's UI thread."
            },
            {
                "id": 14,
                "q": "What is the project architecture?",
                "a": "The project follows a <strong>Serverless SPA (Single Page Application) Client-Server Architecture</strong>. The client-side React code compiles into optimized static files deployed to a Global Content Delivery Network (CDN) via Firebase Hosting. This client handles all routing, data visualization, and heavy mathematical audit/ROI calculations. The backend consists of serverless Firebase products (Authentication, Firestore Database, and Firestore Security Rules for access control) and client-side background Web Workers for OCR processing."
            },
            {
                "id": 15,
                "q": "Explain the folder structure of your project.",
                "a": "The project follows a clean, module-based folder layout:<br>• <code>/public</code>: Contains static files (manifests, default assets).<br>• <code>/src/assets</code>: Custom CSS variables, background styling, and SVG symbols.<br>• <code>/src/components</code>: Reusable global items (e.g. <code>Navbar</code>, <code>Footer</code>, <code>ChatBot</code>).<br>• <code>/src/components/dashboard</code>: Feature-specific files (e.g. <code>SolarCalculator</code>, <code>Charts</code>, <code>AIHomeAudit</code>, <code>SavingsAdvisor</code>).<br>• <code>/src/context</code>: Holds <code>AuthContext.tsx</code> to distribute user credentials across the application hierarchy.<br>• <code>/src/firebase</code>: Holds env-driven SDK configuration setup (<code>config.ts</code>).<br>• <code>/src/pages</code>: Primary page components loaded via React Router (<code>Home</code>, <code>Dashboard</code>, <code>BillAnalyzer</code>, <code>History</code>, <code>Settings</code>).<br>• <code>/src/utils</code>: Core mathematical models (<code>tariffCalculator.ts</code>, <code>auditEngine.ts</code>, <code>reportsService.ts</code>)."
            },
            {
                "id": 16,
                "q": "What is the role of state management in your application?",
                "a": "We use a hybrid approach to state management:<br>1. <strong>Global State:</strong> React Context (<code>AuthContext</code>) maintains user authentication, loading states, and active profile metadata across routes.<br>2. <strong>Local React State:</strong> We use hooks like <code>useState</code> and <code>useReducer</code> within page containers to hold form inputs, slider values, and OCR outputs.<br>3. <strong>Memoized State:</strong> We use <code>useMemo</code> for complex calculations (like the 25-year ROI matrix and appliance energy health indices) to prevent redundant mathematical iterations on irrelevant component re-renders."
            },
            {
                "id": 17,
                "q": "How is routing implemented?",
                "a": "Routing is handled by <strong>React Router DOM v7</strong>. The router coordinates routes in <code>App.tsx</code> using <code>&lt;Router&gt;</code>, <code>&lt;Routes&gt;</code>, and <code>&lt;Route&gt;</code>. To optimize bundles, pages are loaded lazily using <code>React.lazy</code>, rendering a custom spinner inside a <code>&lt;React.Suspense&gt;</code> fallback. Private pages (like Dashboard, Profile, and Settings) are wrapped in a <code>&lt;ProtectedRoute&gt;</code> component which inspects current session auth state and redirects unauthorized guests to the login page."
            }
        ]
    },
    {
        "category": "Energy Calculation Questions",
        "questions": [
            {
                "id": 18,
                "q": "How do you calculate electricity consumption?",
                "a": "Electricity consumption is calculated based on appliance wattage, quantity, and running duration: <br>1. Calculate daily energy in Watt-hours: <i>Wh = Wattage &times; Quantity &times; Hours/Day</i>.<br>2. Convert to Kilowatt-hours (Units): <i>kWh = Wh / 1000</i>.<br>3. Extrapolate to monthly consumption: <i>Monthly kWh = Daily kWh &times; 30 days</i>."
            },
            {
                "id": 19,
                "q": "What is the formula for energy consumption?",
                "a": "The general formula is:<br>$$E_{\\text{monthly}} (\\text{kWh}) = \\frac{P (\\text{Watts}) \\times N \\times t (\\text{Hours/day})}{1000} \\times 30$$<br>Where:<br>• $E_{\\text{monthly}}$ = Monthly energy consumption in kilowatt-hours (units).<br>• $P$ = nominal wattage of the appliance.<br>• $N$ = quantity of the appliance.<br>• $t$ = daily running time in hours."
            },
            {
                "id": 20,
                "q": "What is the unit of electrical energy?",
                "a": "The unit of electrical energy is the <strong>Kilowatt-hour (kWh)</strong>. In utility billing, 1 kWh of energy consumed is referred to as <strong>one unit</strong> of electricity."
            },
            {
                "id": 21,
                "q": "How do you calculate monthly consumption?",
                "a": "To calculate the total monthly household consumption, the system sums up the monthly energy consumption (kWh) of all active appliances in the profile:<br>$$\\text{Total Monthly kWh} = \\sum_{i=1}^{M} E_{\\text{monthly}, i}$$<br>Where $M$ is the number of distinct appliances, and $E_{\\text{monthly}, i}$ is the individual monthly consumption of the $i$-th appliance."
            },
            {
                "id": 22,
                "q": "How do you estimate the electricity bill?",
                "a": "The bill is estimated using a <strong>multi-slab calculation engine</strong>:<br>1. Look up slabs for the active state utility (e.g., 0-30 units, 31-75 units, etc.).<br>2. For each slab, multiply the units falling into that range by the slab's numeric unit rate.<br>3. Sum the charges across all slabs to compute the <strong>gross energy charge</strong>.<br>4. Apply any state-specific <strong>subsidy</strong> rules (fixed deduction or percentage reduction).<br>5. Compute the final amount: <i>Net Bill = Max(0, Gross Energy Charge - Subsidy)</i>."
            },
            {
                "id": 23,
                "q": "Why is energy consumption measured in kWh?",
                "a": "A Watt is a very small quantity (1 Joule of energy per second). If we measured household consumption in Watt-seconds or Joules, a typical household bill would run into billions, which is impractical. A Kilowatt-hour represents a large, convenient quantity of energy (1000 Watts running for 1 hour, or 3,600,000 Joules) which matches residential monthly usage scales."
            },
            {
                "id": 24,
                "q": "How do appliance wattages affect calculations?",
                "a": "Appliance wattage is directly proportional to energy consumption. An appliance with high wattage will consume more energy in a short time compared to a low-wattage appliance running longer. For example, a 2000W geyser running for 30 minutes (1 kWh) consumes the same energy as a 50W ceiling fan running for 20 hours (1 kWh)."
            },
            {
                "id": 25,
                "q": "How accurate are your calculations?",
                "a": "Our bill estimation has 100% mathematical accuracy relative to the utility definitions since it models the exact progressive slab boundaries and subsidies. Appliance audits are estimates, but we improve accuracy by modeling <strong>efficiency decay</strong>: high-load motor appliances (ACs, Fridges, and Fans) decay in efficiency as they age. An AC is modeled to lose 2% efficiency per year, meaning a 1500W rated AC that is 10 years old will be simulated as consuming 1800W ($1500 \\times (1 + 10 \\times 0.02)$) due to mechanical wear and compressor degradation."
            }
        ]
    },
    {
        "category": "Database Questions",
        "questions": [
            {
                "id": 26,
                "q": "What data is stored in the database?",
                "a": "We store:<br>1. <strong>User Profiles:</strong> Name, default state, and preferred utility provider.<br>2. <strong>Audit Sessions:</strong> Saved lists of household appliances, quantities, custom power ratings, usage hours, and unit ages.<br>3. <strong>Utility Tariffs:</strong> Standard slabs, display names, numeric unit rates, and dynamic subsidy rules (seeded initially and admin-editable).<br>4. <strong>Bill Analytics:</strong> Extracted data from scanned bills (units, billing period, cost, raw OCR text)."
            },
            {
                "id": 27,
                "q": "How do you handle user-specific data?",
                "a": "User data is stored under user-specific sub-paths in Firestore, linked by the user's Authentication UID. In the database rules, we enforce secure segment boundaries using <strong>Firestore Security Rules</strong>. A user can only read, write, or delete documents if their authenticated token matches the parent user ID of the collection path."
            },
            {
                "id": 28,
                "q": "What is a primary key?",
                "a": "A primary key is a unique identifier for a database record. In our Firestore NoSQL database, the Document ID serves as the primary key. For example, the user's Firestore document is keyed by their Auth UID, and audit records are keyed by a unique cryptographically generated string."
            },
            {
                "id": 29,
                "q": "What is database normalization?",
                "a": "Database normalization is the process of structuring data to reduce redundancy and maintain consistency. In our project, rather than storing tariff rates inside every user profile, we normalized the tariff structure by placing it in a central <code>tariffs</code> collection. If an admin edits karnataka_bescom slabs, the changes apply instantly to all BESCOM users during calculations, eliminating duplicated updates."
            },
            {
                "id": 30,
                "q": "Why did you choose SQL/NoSQL?",
                "a": "I chose NoSQL (Firestore) because:<br>1. <strong>Flexible Schemas:</strong> Household appliance configurations are dynamic. Users can add or customize wattages and parameters without migrating database schemas.<br>2. <strong>Serverless Integration:</strong> Firestore integrates with Firebase Auth directly, avoiding server middleware.<br>3. <strong>Client-side Caching:</strong> Firestore has built-in offline synchronization, which is ideal for a responsive dashboard."
            },
            {
                "id": 31,
                "q": "How do you retrieve data efficiently?",
                "a": "We optimize retrieval by:<br>1. Caching static utility tariffs in <code>localStorage</code> for 1 hour to avoid repeated Firestore reads.<br>2. Querying only the specific sub-collection fields needed for history feeds.<br>3. Structuring database writes so changes are pushed only when user saves their configuration, minimizing database operations."
            }
        ]
    },
    {
        "category": "UI/UX Questions",
        "questions": [
            {
                "id": 32,
                "q": "Why did you choose this dashboard design?",
                "a": "I chose a modern <strong>glassmorphism layout</strong> with contrasting color accents (teal, amber, and slate) to turn energy auditing into an engaging visual experience. Frosted-glass container styles, clear cards, and smooth transitions convey a professional, state-of-the-art feel, boosting user interaction."
            },
            {
                "id": 33,
                "q": "How did you make the interface user-friendly?",
                "a": "I implemented several design patterns:<br>1. <strong>Audit Wizard:</strong> Splits the appliance input into category steps (essential, kitchen, electronics, comfort, water) instead of showing one giant form.<br>2. <strong>Interactive Sliders:</strong> Allows users to drag solar ROI assumptions and immediately see visual change updates.<br>3. <strong>Color-Coded Feedback:</strong> Employs clear badges (green for Excellent energy health, red for Needs Improvement) so users can scan results easily."
            },
            {
                "id": 34,
                "q": "How is dark mode implemented?",
                "a": "Dark mode is implemented using Tailwind CSS's class selector method. A theme context monitors the dark/light state. When toggled, the script appends or removes the <code>dark</code> class from the document root (<code>&lt;html&gt;</code>). This instantly switches CSS color tokens. The preference is stored in <code>localStorage</code> so it persists across sessions."
            },
            {
                "id": 35,
                "q": "How did you ensure responsiveness?",
                "a": "I designed the layout using a <strong>Mobile-First grid system</strong>. Using flexbox, auto-fitting CSS grids, and Tailwind's responsive prefixes (e.g. <code>grid-cols-1 md:grid-cols-3</code>), cards, sidebars, and navigation headers adapt from mobile phone screens to widescreen monitors."
            },
            {
                "id": 36,
                "q": "Which chart libraries did you use?",
                "a": "I used <strong>Recharts</strong>, a composable charting library built on top of D3.js specifically for React. It uses declarative React components to render charts as responsive SVG graphics."
            },
            {
                "id": 37,
                "q": "Why are charts important in your project?",
                "a": "Charts translate dry numerical tables into visual narratives. A 25-year cumulative cash-flow line chart makes it instantly clear *when* the user will break even (where the line crosses 0). Similarly, appliance consumption pie charts show the share of each appliance category immediately, which is crucial for quick audits."
            }
        ]
    },
    {
        "category": "Authentication & Security Questions",
        "questions": [
            {
                "id": 38,
                "q": "How does user authentication work?",
                "a": "Authentication is powered by <strong>Firebase Authentication</strong>. Users sign up or log in with their email and password. Firebase verifies credentials on secure cloud servers and returns a JSON Web Token (JWT) session to the client. The frontend listens to session changes via <code>onAuthStateChanged</code> and coordinates route access."
            },
            {
                "id": 39,
                "q": "How do you protect user data?",
                "a": "User data is protected in transit via HTTPS/TLS encryption. In storage, Firestore databases are encrypted at rest by Firebase. Client-side database access is guarded by <strong>Firestore Security Rules</strong>, which prevent unauthenticated users from modifying records and block users from accessing any database path not belonging to their user ID."
            },
            {
                "id": 40,
                "q": "What is password hashing?",
                "a": "Password hashing is a security technique that runs plaintext passwords through a one-way mathematical algorithm (Firebase uses custom scrypt) before writing to database. The result cannot be reversed, meaning user passwords are never stored in plaintext. When logging in, the input password is hashed and compared to the stored hash."
            },
            {
                "id": 41,
                "q": "What is JWT?",
                "a": "JWT (JSON Web Token) is an open standard (RFC 7519) that defines a compact, self-contained way to transmit information securely between parties as a cryptographically signed JSON object. In our app, Firebase issues a JWT on login. The client automatically attaches this token to backend requests to verify the user's identity."
            },
            {
                "id": 42,
                "q": "How do you prevent unauthorized access?",
                "a": "We use double-layer protection:<br>1. <strong>Frontend:</strong> Protected routes (<code>ProtectedRoute.tsx</code>) prevent unauthorized users from accessing pages like the Dashboard and redirect them to Login.<br>2. <strong>Backend:</strong> Firestore security rules validate JWT signatures and confirm that the user ID in the request token matches the document owner before returning database records."
            }
        ]
    },
    {
        "category": "Analytics Questions",
        "questions": [
            {
                "id": 43,
                "q": "How do you identify high energy-consuming appliances?",
                "a": "The audit engine runs consumption calculations for all entered appliances. It then calculates each appliance's percentage share of the total household energy footprint. Any appliance that accounts for <strong>more than 20%</strong> of the total monthly consumption is flagged in the UI as a 'Dominant Consumer' and marked with an amber warning badge."
            },
            {
                "id": 44,
                "q": "How are energy-saving recommendations generated?",
                "a": "We run a rule-based analytics engine:<br>1. <strong>Aging Check:</strong> If an appliance is &ge; 5 years old, recommend upgrading to a BEE 5-star or BLDC model and calculate payback.<br>2. <strong>Duration check:</strong> If AC runs &gt; 5 hrs/day, recommend raising the temperature to 24-26&deg;C.<br>3. <strong>Standby Load Check:</strong> If 3 or more electronics (TV, router, gaming console) are active, suggest using smart power strips to eliminate phantom standby draw."
            },
            {
                "id": 45,
                "q": "How is the efficiency score calculated?",
                "a": "The efficiency score starts at 100 and applies cumulative deductions:<br>• <strong>Baseline Penalty:</strong> Deducts points if monthly consumption exceeds the 250 kWh regional household baseline.<br>• <strong>Mechanical Wear Penalty:</strong> Deducts points for old appliances based on age and category decay rates.<br>• <strong>Extended Runtime Penalty:</strong> Deducts points if heavy loads (ACs and Geysers) run for long daily durations."
            },
            {
                "id": 46,
                "q": "What insights does your dashboard provide?",
                "a": "The dashboard provides:<br>1. The dominant energy-consuming appliance.<br>2. Total monthly consumption (kWh) and bill (₹).<br>3. An energy efficiency score with a rating ('Excellent', 'Average', 'Needs Improvement').<br>4. Actionable tips listing the annual rupee savings for schedule adjustments and appliance upgrades."
            },
            {
                "id": 47,
                "q": "How can users reduce electricity usage using your system?",
                "a": "Users can look at the <strong>Savings Advisor</strong> panel, which lists specific recommendations sorted by highest potential yearly savings. By acting on recommendations (e.g. replacing a standard ceiling fan with a BLDC fan, which saves up to ₹1,500/year), users can incrementally lower their bills."
            }
        ]
    },
    {
        "category": "Testing Questions",
        "questions": [
            {
                "id": 48,
                "q": "How did you test your project?",
                "a": "I used a three-tier testing strategy:<br>1. <strong>Unit Testing:</strong> Verified that the billing engine correctly calculated multi-slab progressive rates against manual calculations.<br>2. <strong>Integration Testing:</strong> Verified that Tesseract OCR extracted bill parameters (such as units and date) and mapped them into the database records correctly.<br>3. <strong>UI/UX Testing:</strong> Tested layout responsiveness on different screen widths and verified that sliders recalculated the 25-year ROI matrix without lagging the UI thread."
            },
            {
                "id": 49,
                "q": "What test cases did you perform?",
                "a": "Key test cases included:<br>• <strong>Slab Boundary Transitions:</strong> Verifying bill calculation at boundary values (e.g. 30 units, 31 units, 75 units, 76 units).<br>• <strong>Zero Values:</strong> Ensuring calculations do not crash when an appliance has 0 hours or 0 quantity.<br>• <strong>Extreme Inputs:</strong> Inputting high ages (e.g. 20 years) or high wattages (e.g. 5000W) to confirm decay bounds.<br>• <strong>Payback Math:</strong> Verifying that solar break-even is reached exactly when cumulative savings exceed the installation cost."
            },
            {
                "id": 50,
                "q": "What challenges did you face during development?",
                "a": "I faced three major challenges:<br>1. <strong>UI Thread Lock during OCR:</strong> Initial client-side OCR scans lagged the browser window.<br>2. <strong>Dynamic Tariff Slabs:</strong> Modeling dynamic tariff slabs that could be updated by admins without rebuilding the application code.<br>3. <strong>Compounding ROI Calculations:</strong> Ensuring that the 25-year cash-flow simulation ran smoothly without lag when the user adjusted sliders."
            },
            {
                "id": 51,
                "q": "How did you solve those challenges?",
                "a": "I solved them by:<br>1. Running the Tesseract OCR engine in a background <strong>Web Worker</strong> to prevent UI thread blocking.<br>2. Designing a database structure in Firestore for tariffs and caching it in <code>localStorage</code> with a 1-hour TTL.<br>3. Implementing React's <code>useMemo</code> hook to cache the compounding ROI matrix, ensuring recalculation occurs only when relevant sliders change."
            },
            {
                "id": 52,
                "q": "What bugs did you encounter?",
                "a": "I encountered:<br>1. <strong>Infinite Loop Bug:</strong> Caused by the last tariff slab having an upper limit of Infinity. Fixed by adding a condition to break the loop when remaining units reach zero.<br>2. <strong>Floating Point Rounding:</strong> Currency values sometimes displayed with multiple decimals (e.g., ₹25.0000000004). Fixed by using <code>Math.round()</code> and cent-rounding techniques.<br>3. <strong>Chart Container Collapse:</strong> Recharts containers collapsed to 0 width inside flexible grid layouts. Fixed by setting fixed container wrapper aspect ratios."
            }
        ]
    },
    {
        "category": "Project Management Questions",
        "questions": [
            {
                "id": 53,
                "q": "How long did it take to build the project?",
                "a": "The project took approximately <strong>6 weeks</strong> from concept to deployment:<br>• Week 1: Wireframing and design setup.<br>• Week 2: User Authentication and database schema design.<br>• Week 3: Tariff slab billing and appliance audit engine coding.<br>• Week 4: Solar ROI simulation and Recharts integration.<br>• Week 5: OCR Bill Analyzer implementation.<br>• Week 6: Testing, optimization, and final deployment."
            },
            {
                "id": 54,
                "q": "How was work divided among team members?",
                "a": "Work was divided based on technical strengths:<br>• <strong>UI/UX Developer:</strong> Created the glassmorphic layouts, dark mode components, and slider controls.<br>• <strong>Backend Developer:</strong> Handled Firebase configurations, database security rules, and user profiles.<br>• <strong>Algorithm Developer:</strong> Coded the tariff slab billing logic, efficiency decay equations, and solar ROI compounding projections."
            },
            {
                "id": 55,
                "q": "What was your contribution?",
                "a": "My contribution was designing and implementing the core mathematical models: the multi-slab billing engine (<code>tariffCalculator.ts</code>), the age-degradation audit formula (<code>auditEngine.ts</code>), and the 25-year solar cash-flow simulation model. I also integrated Recharts to visualize the cumulative payback curves."
            },
            {
                "id": 56,
                "q": "What was the biggest challenge in the project?",
                "a": "The biggest challenge was creating a client-side OCR bill analyzer that extracts billing dates and units consumed from bills across various utilities (which use completely different layouts). We solved this by developing a robust regex pattern matcher that searches for keywords like 'Units', 'KWH', or 'Billing Period' adjacent to numeric sequences."
            }
        ]
    },
    {
        "category": "Future Scope Questions",
        "questions": [
            {
                "id": 57,
                "q": "What future enhancements can be added?",
                "a": "We can add:<br>1. <strong>Carbon Footprint Tracker:</strong> Converts energy saved into carbon offsets and trees planted.<br>2. <strong>Community Benchmarking:</strong> Let users anonymously compare their energy scores with similar households in their neighborhood.<br>3. <strong>Commercial Tariffs:</strong> Add support for commercial and industrial tariff structures."
            },
            {
                "id": 58,
                "q": "Can this project be integrated with IoT devices?",
                "a": "Yes. By integrating smart plug APIs (such as Tuya or TP-Link Tapo), the system can pull real-time energy usage data directly from home appliances, removing the need for manual inputs."
            },
            {
                "id": 59,
                "q": "Can smart meters be connected to your system?",
                "a": "Yes. Many modern utility smart meters have API portals. The dashboard can connect to these APIs to download daily consumption patterns automatically."
            },
            {
                "id": 60,
                "q": "How can AI be used in this project?",
                "a": "AI can be used to analyze daily consumption patterns and flag anomalies, such as a refrigerator compressor running continuously (indicating a broken seal) or a water pump running longer than usual."
            },
            {
                "id": 61,
                "q": "Can the system predict future energy consumption?",
                "a": "Yes. By feeding historical bill data into time-series forecasting models (like ARIMA or Prophet), the system can predict upcoming bills based on historical seasonal trends."
            },
            {
                "id": 62,
                "q": "How can machine learning improve the project?",
                "a": "Machine learning can enable <strong>Non-Intrusive Load Monitoring (NILM)</strong>. By training a model on aggregate smart meter readings, the system can identify when individual appliances are switched on or off without needing separate smart plugs."
            }
        ]
    },
    {
        "category": "Advanced Questions",
        "questions": [
            {
                "id": 63,
                "q": "Explain the complete workflow from user input to final report.",
                "a": "The workflow is as follows:<br>1. User inputs appliance quantities and ages or uploads a bill.<br>2. The <strong>Audit Engine</strong> calculates monthly energy consumption ($$kWh = \\frac{W \\times Q \\times h \\times 30}{1000}$$) and applies aging penalties.<br>3. The <strong>Billing Engine</strong> calculates charges using regional slab tariffs.<br>4. The <strong>Solar ROI Module</strong> runs a 25-year compounding simulation using panel degradation, tariff inflation, and maintenance parameters.<br>5. <strong>Recharts</strong> visualizes the payback curve and appliance footprint charts.<br>6. The user receives a comprehensive audit report with actionable savings and recommendations."
            },
            {
                "id": 64,
                "q": "What happens if incorrect data is entered?",
                "a": "The system validates inputs to prevent negative values or unrealistic usage hours. In the Bill Analyzer, the parsed OCR data is shown in an editable preview modal, letting the user verify and correct values before saving."
            },
            {
                "id": 65,
                "q": "How would the system handle thousands of users?",
                "a": "The frontend is distributed globally via Firebase Hosting's CDN. Cloud Firestore dynamically scales horizontally to handle high concurrent read/write requests, while database rules protect data integrity."
            },
            {
                "id": 66,
                "q": "How would you improve performance?",
                "a": "We can improve performance by:<br>• Implementing React windowing (virtualization) if rendering long histories of thousands of bills.<br>• Implementing lazy loading and code splitting for all routes.<br>• Memoizing heavy ROI calculation loops to prevent unnecessary re-runs."
            },
            {
                "id": 67,
                "q": "How would you deploy this project in production?",
                "a": "I would build the application with <code>npm run build</code>, configure production environment variables (<code>.env.production</code>), enable Firestore production indexes and rules, and deploy the assets to Firebase Hosting."
            },
            {
                "id": 68,
                "q": "What is cloud hosting?",
                "a": "Cloud hosting is the delivery of computing services—including servers, storage, databases, networking, and software—over the Internet ('the cloud') from providers like Google Cloud/Firebase, allowing automatic scaling and high availability."
            },
            {
                "id": 69,
                "q": "How would you scale the application?",
                "a": "To scale, I would implement Server-Side Rendering (SSR) for fast landing page loads, add Redis caching for API endpoints, containerize backend microservices with Docker on Google Cloud Run, and transition to a managed relational database if complex relational queries are needed."
            },
            {
                "id": 70,
                "q": "If given six more months, what would you add to this project?",
                "a": "I would:<br>1. Build a cross-platform mobile application (using React Native) for push notifications.<br>2. Build a B2B portal for solar installers to manage client ROI proposals.<br>3. Establish direct API integrations with popular smart home plugs."
            }
        ]
    },
    {
        "category": "Difficult Questions Often Asked by External Examiners",
        "questions": [
            {
                "id": 71,
                "q": "Why should anyone use your system instead of a normal electricity bill?",
                "a": "An electricity bill is <strong>reactive</strong>; it tells you what you spent last month, but doesn't explain <i>how</i> or <i>where</i> you spent it. Our system is <strong>proactive</strong>; it breaks down consumption by appliance, identifies inefficiencies (like mechanical wear in an old AC), and simulates future savings from solar and appliance upgrades before you spend any money."
            },
            {
                "id": 72,
                "q": "How do you validate appliance power ratings?",
                "a": "We seed default ratings from national energy standards (e.g. BEE standard appliance lists) as a baseline. Users can override these defaults by inputting the actual rated wattage from their appliance label, and the system accounts for efficiency decay over time."
            },
            {
                "id": 73,
                "q": "What assumptions have you made in your calculations?",
                "a": "Key assumptions include:<br>• Months are exactly 30 days.<br>• Regional solar panel generation is estimated at 120 units per kW capacity per month.<br>• Solar panels degrade at a uniform annual rate (default 0.8%).<br>• Maintenance costs inflate at a fixed rate of 2% annually."
            },
            {
                "id": 74,
                "q": "What are the limitations of your project?",
                "a": "Limitations include:<br>• Relies on manual accuracy of appliance running hours.<br>• Billing does not account for Time-of-Day (TOD) dynamic pricing.<br>• Solar calculations assume average regional sunshine hours and do not model local shadowing effects from nearby trees or buildings."
            },
            {
                "id": 75,
                "q": "If your calculations are wrong, what could be the reasons?",
                "a": "Discrepancy reasons include:<br>• Underestimating daily usage hours (behavioral variation).<br>• Utility company changing tariff rates before local cache updates.<br>• Unusual weather patterns (monsoons or dust storms) reducing solar output."
            },
            {
                "id": 76,
                "q": "What real-world impact can this project have?",
                "a": "Encourages residential energy efficiency (saving money for households) and accelerates the adoption of solar energy by providing clear, customizable financial justifications."
            },
            {
                "id": 77,
                "q": "Is this project commercially viable?",
                "a": "Yes. It can be white-labeled for solar installation companies as a lead-generation tool, or offered to electricity distribution companies (DISCOMs) to integrate into their customer portals to promote energy efficiency."
            },
            {
                "id": 78,
                "q": "How would you monetize it?",
                "a": "Monetization channels include:<br>• <strong>Lead Generation:</strong> Charging solar installers a fee for qualified customer solar reports.<br>• <strong>Auditing Tool SaaS:</strong> Offering detailed auditing software to professional home energy auditors.<br>• <strong>Appliance Referrals:</strong> Referral fees on energy-efficient appliance upgrades."
            },
            {
                "id": 79,
                "q": "What innovations have you introduced?",
                "a": "Innovations include:<br>• Live slider-based interactive 25-year compounding solar ROI projection.<br>• Appliance-specific aging and efficiency decay modeling.<br>• Hybrid OCR scanner that parses utility bills client-side using Web Workers."
            },
            {
                "id": 80,
                "q": "If I give you ₹100 lakh funding, how would you expand this project?",
                "a": "Expansion plan with ₹100 lakh:<br>1. Build proprietary IoT smart plugs for plug-and-play appliance energy monitoring.<br>2. Train machine learning models for Non-Intrusive Load Monitoring (NILM) on smart meters.<br>3. Expand local regional support with native language localization.<br>4. Partner directly with financial institutions to offer instant solar installment loans based on ROI projections."
            }
        ]
    }
]

# Generate beautiful HTML content with style sheets optimized for print
html_content = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Smart Household Energy - Q&A Defense Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
    @page {
      size: A4;
      margin: 20mm;
    }
    
    @media print {
      body {
        background-color: #ffffff;
        color: #1e293b;
        font-size: 10.5pt;
      }
      .page-break {
        page-break-before: always;
        break-before: always;
        clear: both;
      }
      .no-print {
        display: none;
      }
      .question-card {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      h1, h2, h3, h4, h5 {
        page-break-after: avoid;
        break-after: avoid;
      }
    }

    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px;
      box-sizing: border-box;
      background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
      color: #ffffff;
      page-break-after: always;
      break-after: always;
      position: relative;
    }

    .cover-badge {
      background-color: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 24px;
    }

    .cover h1 {
      font-size: 3rem;
      margin: 0 0 16px 0;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .cover h2 {
      font-size: 1.5rem;
      font-weight: 300;
      color: #ccfbf1;
      margin: 0 0 40px 0;
      max-width: 600px;
    }

    .cover-divider {
      width: 80px;
      height: 4px;
      background-color: #f59e0b;
      margin-bottom: 40px;
      border-radius: 2px;
    }

    .metadata-table {
      width: 100%;
      max-width: 500px;
      border-collapse: collapse;
      margin-top: 20px;
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .metadata-table td {
      padding: 12px 16px;
      text-align: left;
      font-size: 0.95rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .metadata-table tr:last-child td {
      border-bottom: none;
    }

    .metadata-label {
      color: #99f6e4;
      font-weight: 500;
      width: 40%;
    }

    .metadata-value {
      color: #ffffff;
    }

    /* Container for content */
    .content-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    /* TOC Page */
    .toc-title {
      font-size: 2.2rem;
      color: #0f766e;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      margin-top: 0;
      margin-bottom: 30px;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0 0 40px 0;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 8px;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-weight: 500;
      text-decoration: none;
      color: #0f766e;
      transition: all 0.2s ease;
    }

    .toc-item:hover {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
    }

    .toc-count {
      background-color: #ccfbf1;
      color: #115e59;
      font-size: 0.8rem;
      padding: 4px 10px;
      border-radius: 9999px;
      font-weight: 600;
    }

    /* Standard Sections */
    .section-title {
      font-size: 1.8rem;
      color: #0f766e;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 8px;
      margin-top: 40px;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Question Cards */
    .question-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .question-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }

    .q-badge {
      background-color: #f59e0b;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      min-width: 45px;
      text-align: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .q-text {
      font-size: 1.15rem;
      font-weight: 600;
      color: #0f766e;
      margin: 0;
    }

    .answer-body {
      color: #334155;
      font-size: 1rem;
      line-height: 1.6;
      margin-left: 57px;
    }

    .answer-body strong {
      color: #1e293b;
    }

    .answer-body code {
      font-family: Consolas, Monaco, monospace;
      background-color: #f1f5f9;
      color: #0f766e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    /* Footer details */
    .doc-footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.85rem;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-badge">Academic Vetting &amp; Review</div>
    <h1>Smart Household Energy</h1>
    <h2>Comprehensive Q&amp;A Defense Guide &amp; External Examiner Handbook</h2>
    <div class="cover-divider"></div>
    <p style="max-width: 550px; font-weight: 300; font-size: 1.1rem; color: #e2e8f0; margin-bottom: 30px;">
      An exhaustive reference covering the design decisions, mathematical models, technical implementation, and security architectures of the Smart Household Energy Dashboard.
    </p>
    
    <table class="metadata-table">
      <tr>
        <td class="metadata-label">System Objective</td>
        <td class="metadata-value">Appliance Auditing &amp; Solar ROI Forecasting</td>
      </tr>
      <tr>
        <td class="metadata-label">Technology Stack</td>
        <td class="metadata-value">React 19, TypeScript, Tailwind v4, Recharts, Firebase</td>
      </tr>
      <tr>
        <td class="metadata-label">Mathematical Core</td>
        <td class="metadata-value">Multi-Slab Utility Tariffs &amp; Aging Degradation Models</td>
      </tr>
      <tr>
        <td class="metadata-label">Created For</td>
        <td class="metadata-value">External Examiners &amp; Project Evaluators</td>
      </tr>
      <tr>
        <td class="metadata-label">Document Date</td>
        <td class="metadata-value">June 2026</td>
      </tr>
    </table>
  </div>

  <!-- TOC and Content -->
  <div class="content-container">
    
    <!-- Table of Contents -->
    <h1 class="toc-title">Table of Contents</h1>
    <ul class="toc-list">
"""

# Append TOC items
for idx, cat_data in enumerate(qa_data):
    cat_name = cat_data["category"]
    cat_id = cat_name.lower().replace(" ", "-").replace("&", "and")
    count = len(cat_data["questions"])
    html_content += f'      <li><a class="toc-item" href="#{cat_id}"><span>{idx+1}. {cat_name}</span><span class="toc-count">{count} Questions</span></a></li>\n'

html_content += """    </ul>
    
    <div class="page-break"></div>
"""

# Append Question Sections
for idx, cat_data in enumerate(qa_data):
    cat_name = cat_data["category"]
    cat_id = cat_name.lower().replace(" ", "-").replace("&", "and")
    
    # Page break before each major section, except the first one
    if idx > 0:
        html_content += '    <div class="page-break"></div>\n'
        
    html_content += f'    <h2 class="section-title" id="{cat_id}">{cat_name}</h2>\n'
    
    for q_item in cat_data["questions"]:
        q_num = q_item["id"]
        question = q_item["q"]
        answer = q_item["a"]
        
        html_content += f"""    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Q {q_num}</span>
        <h3 class="q-text">{question}</h3>
      </div>
      <div class="answer-body">
        {answer}
      </div>
    </div>
"""

html_content += """    <div class="doc-footer">
      <p>Smart Household Energy Project Handbook &copy; 2026. All rights reserved.</p>
      <p>Built with React 19, TypeScript, Tailwind CSS, Recharts, and Google Firebase.</p>
    </div>
  </div>

</body>
</html>
"""

# Write HTML content to document.html
html_path = "d:\\smart-household-energy\\document.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("[INFO] document.html written successfully.")

# Run Microsoft Edge to print HTML to PDF
pdf_path = "d:\\smart-household-energy\\Smart_Household_Energy_Project_Guide.pdf"
edge_cmd = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_path}",
    html_path
]

try:
    print("[INFO] Launching Microsoft Edge headless compiler...")
    result = subprocess.run(edge_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    print("[SUCCESS] PDF compiled successfully at:", pdf_path)
    
    # Delete temporary HTML file
    if os.path.exists(html_path):
        os.remove(html_path)
        print("[INFO] Temporary HTML file cleaned up.")
except Exception as e:
    print("[ERROR] PDF compilation failed:", str(e))
