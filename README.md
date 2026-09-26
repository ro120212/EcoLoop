# EcoLoop: Campus Circular E-Waste Economy & Reuse Platform
**NSS College of Engineering, Palakkad**

A full-stack circular economy monorepo platform designed to eliminate campus electronic waste through peer-to-peer hardware reuse, lab surplus reallocation, component splitting, and verifiable physical handoffs across five engineering departments.

---

## 🏛️ 5 Engineering Departments Covered

1. **💻 Computer Science and Engineering (CSE)**: Desktop towers, DDR3/DDR4 RAM, SMPS power units, keyboards, monitors, SATA cables.
2. **⚙️ Mechanical Engineering (Mech)**: Stepper motors, actuators, gear assemblies, 3D printer parts, pneumatic valves.
3. **🏗️ Civil Engineering (Civil)**: Electronic surveying accessories, theodolite sensors, digital level modules, scientific calculators, mini-drafters.
4. **⚡ Electrical & Electronics Engineering (EEE)**: Step-down transformers, bridge rectifiers, capacitor banks, variable power benches.
5. **🎛️ Instrumentation & Control Engineering (IC)**: RTD PT100 temperature sensors, op-amp modules, PID boards, transmitters, test probes.

---

## 🏗️ Monorepo Architecture

```
EcoLoop/
├── backend/                      # Python FastAPI REST Service
│   ├── .env.example              # Environment variables template
│   ├── database.py               # Dual Supabase PostgreSQL & SQLite engine
│   ├── gemini_service.py         # Google Gemini 2.5 Flash Vision & Diagnostic service
│   ├── main.py                   # FastAPI REST API endpoints
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # Cloud deployment process file (Render / Railway)
│   └── Dockerfile                # Container definition
├── frontend/                     # React 19 + Vite + Tailwind CSS Single-Page Application
│   ├── vite.config.js            # Vite build configuration with backend proxy
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx               # Role-based root view router
│   │   ├── services/
│   │   │   ├── api.js            # REST API client
│   │   │   └── supabaseClient.js # Supabase JavaScript client
│   │   └── components/
│   │       ├── Navbar.jsx              # 1-Click Role Switcher [Student | Lab Staff | Admin]
│   │       ├── StudentDashboard.jsx    # Dual-perspective Seller Sales Tracker & Buyer Claims
│   │       ├── MarketplaceCircular.jsx # 5-Branch Circular Marketplace & Component Splitting
│   │       ├── LabStaffDashboard.jsx   # Lab Hardware Triage & Surplus Reallocation Hub
│   │       ├── AdminDashboard.jsx      # Cross-Department Analytics & Official NAAC Report
│   │       ├── AIWasteClassifier.jsx   # Gemini 2.5 Flash Multimodal Waste Vision Scanner
│   │       ├── RepairPlatform.jsx      # Gemini Diagnostic Assistant & Fixer Tickets
│   │       ├── EcoImpactCalculator.jsx # Environmental Carbon & Certificate Engine
│   │       ├── SettingsModal.jsx       # Gemini API & Supabase Key Config
│   │       └── AuthModal.jsx           # Campus Authentication Modal
├── supabase_schema.sql           # Complete Supabase PostgreSQL schema with RLS & seed data
├── render.yaml                   # 1-Click Render Cloud deployment blueprint
├── .gitignore                    # Monorepo ignore rules (node_modules, .env, etc.)
├── start_ecoloop.bat             # 1-Click Local Windows Launcher
└── README.md                     # Documentation
```

---

## 🤝 Physical Meetup & 4-Digit PIN Verification Flow

Unlike municipal recycling or fixed drop bins, EcoLoop enables physical on-campus peer exchange:
1. **Buyer Claims Item**: Buyer types any campus meetup point (e.g. *"Outside Mechanical Workshop at 4:00 PM"*).
2. **Secret Code Generated**: System gives the buyer a secret **4-digit PIN** and QR code.
3. **Physical Meetup**: The buyer meets the seller and shows the code.
4. **Handoff Verification**: The seller enters the code on their dashboard. The status converts to **Sold / Taken**, and carbon savings are logged.

---

## 🚀 Quick Start (Local Development)

### 1. Launch with Batch Script (Windows)
Double-click `start_ecoloop.bat` in the root folder.

### 2. Or Run Manually:

**Terminal 1 — Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ☁️ Production Cloud Deployment

### Database (Supabase PostgreSQL)
1. Open your [Supabase Dashboard](https://supabase.com).
2. In the **SQL Editor**, paste the contents of `supabase_schema.sql` and click **Run**.
3. All tables, RLS policies, and 5-branch seed data will be created instantly.

### Continuous 24/7 Backend Hosting (Render)
1. Push this repository to GitHub.
2. Go to [Render.com](https://render.com) and create a **Web Service** from this repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `pip install -r requirements.txt` and **Start Command** to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` under Environment Variables.

### Frontend Hosting (Vercel)
1. Import this repository in [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add `VITE_API_URL` pointing to your deployed Render backend URL.
