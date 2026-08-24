# MoSPI Real-Time Airfare Price Index for India
### Smart India Hackathon 2026 | Ministry of Statistics and Programme Implementation (MoSPI)

> **"An intelligent statistical infrastructure that transforms multi-source airfare observations into a validated, explainable, and near-real-time Airfare Price Index for supporting MoSPI's CPI compilation."**

---

## 1. Project Overview & Problem Statement

### Problem Statement
Development of a Real-Time Airfare Price Index for India through automated collection of airfare data from airline and online travel aggregator portals for augmentation of the Consumer Price Index (CPI).

### Key Innovation & Pipeline
This platform is **not a flight booking or price comparison engine**. It is a **National Statistical Intelligence Infrastructure** designed for government economists and statistical officers:

$$\text{Data Sources} \longrightarrow \text{Data Acquisition} \longrightarrow \text{ETL} \longrightarrow \text{Data Quality (ML)} \longrightarrow \text{Database} \longrightarrow \text{Index Engine} \longrightarrow \text{Analytics} \longrightarrow \text{MoSPI Dashboard} \longrightarrow \text{CPI Integration}$$

---

## 2. Statistical Methodology

### 1. Route Representative Fare ($P_{i,t}$)
Calculated using a 10%–90% trimmed mean across standardized booking lead days ($D-1, D-3, D-7, D-15, D-30, D-45, D-60$) to eliminate promotional distortion and extreme last-minute surges.

### 2. Price Relative ($R_i$)
$$R_i = \frac{P_{i,t}}{P_{i,0}}$$
Where $P_{i,0}$ is the benchmark base period representative fare.

### 3. Corridor Route Index ($I_i$)
$$I_i = R_i \times 100$$

### 4. Weighted Laspeyres National Airfare Price Index
$$\text{National API} = \frac{\sum (w_i \times I_i)}{\sum w_i}$$
Where $w_i$ represents the passenger volume weight derived from DGCA statutory domestic seat capacity.

### 5. Deterministic Explainability Engine
$$\Delta \text{API} = \sum \frac{w_i}{\sum w_k} (I_{i,t} - I_{i,t-1})$$
Automatically surfaces and ranks the exact percentage point contribution of each domestic corridor without non-deterministic external LLMs.

### 6. AI-Assisted Data Quality Score
$$\text{Quality Score} = 0.30 \times \text{Completeness} + 0.25 \times \text{Freshness} + 0.20 \times \text{Schema} + 0.15 \times \text{Agreement} + 0.10 \times \text{Consistency}$$

> **AI Governance Rule:** *AI assists the statistical pipeline (anomaly flagging, missing data detection); it does not replace the deterministic statistical methodology.*

---

## 3. Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Three.js, `@react-three/fiber`, `@react-three/drei`, Recharts, Lucide Icons, Framer Motion
- **Backend**: Python 3.14 / FastAPI, Pydantic v2, SQLAlchemy 2.0, Pandas, NumPy, Scikit-learn (Isolation Forest & IQR)
- **Database**: SQLite (Zero-dependency local default) / PostgreSQL-ready

---

## 4. Project Structure

```text
SIHI2026/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py             # REST API endpoints
│   │   ├── database/
│   │   │   ├── connection.py         # SQLAlchemy engine & session
│   │   │   └── models.py             # Database ORM models
│   │   ├── schemas/
│   │   │   └── api_schemas.py        # Pydantic schemas
│   │   ├── services/
│   │   │   ├── index_engine.py       # Laspeyres formula & deterministic explainability
│   │   │   ├── quality_engine.py     # 5-factor quality confidence scoring
│   │   │   ├── anomaly_engine.py     # Isolation Forest & IQR outlier detection
│   │   │   ├── cpi_simulator.py      # CPI transport pass-through modeling
│   │   │   └── data_service.py       # Data querying & aggregations
│   │   ├── collectors/
│   │   │   └── source_adapters.py    # DGCA, GDS, OTA aggregator adapters
│   │   ├── seed/
│   │   │   └── seed_data.py          # Comprehensive 18,900+ observation database seeder
│   │   └── main.py                   # FastAPI application entrypoint
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with sidebar and global search
│   │   ├── page.tsx                  # Page 1: Command Centre Hero & 3D Network
│   │   ├── overview/page.tsx         # Page 2: National Overview & Index Trends
│   │   ├── route-explorer/page.tsx   # Page 3: Route Explorer & Lead Time Curves
│   │   ├── live-fares/page.tsx       # Page 4: Live Observations & Audit Drawer
│   │   ├── index-engine/page.tsx     # Page 5: Index Engine & Explain Today's Index
│   │   ├── data-quality/page.tsx     # Page 6: Quality Centre & ML Anomaly Triage
│   │   ├── analytics/page.tsx        # Page 7: Regional Sub-indices & Volatilities
│   │   ├── cpi-simulator/page.tsx    # Page 8: CPI Integration Simulator
│   │   └── data-monitor/page.tsx     # Page 9: Data Collection Monitor & Health
│   ├── components/
│   │   ├── navigation/
│   │   ├── three/
│   │   │   └── IndiaAviationGlobe.tsx# 3D interactive Indian Subcontinent network
│   │   ├── charts/
│   │   ├── tables/
│   │   ├── drawers/
│   │   └── ui/
│   ├── services/
│   │   └── api.ts                    # Strongly typed API client
│   └── types/
│       └── index.ts                  # TypeScript interfaces
│
├── .env.example
└── README.md
```

---

## 5. Quick Start & Local Setup

### Prerequisites
- Node.js v18+ & npm
- Python 3.10+ (Tested on Python 3.14)

### Step 1: Initialize Backend & Database
```bash
# 1. Install backend dependencies
python -m pip install -r backend/requirements.txt

# 2. Seed the database with 18,900+ realistic observations and 180-day index series
python -m backend.app.seed.seed_data

# 3. Start the FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be running at: `http://127.0.0.1:8000` (Interactive Swagger Docs at `http://127.0.0.1:8000/docs`).

### Step 2: Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at: `http://localhost:3000`.

---

## 6. SIH Presentation / Demo Story

Follow this sequence during judging presentations:
1. **Landing Page**: Showcase the interactive 3D India Aviation Network, animated flight arcs, and live ticker metrics.
2. **National Overview**: Review the dynamic National Airfare Price Index, 1M/3M/6M/1Y trend lines, and top inflationary corridors.
3. **Route Explorer**: Select `DEL → BOM`, inspect the D-60 to D-1 lead time pricing escalation curve, and normalized cross-airline variance.
4. **Live Fares & Audit Drawer**: Click any fare record to open the observation drawer with full data provenance and validation checks.
5. **Index Engine**: Walk through the 7-stage compilation flow, Laspeyres basket weights, and click **"Explain National Index vs Base"** for deterministic attribution.
6. **Data Quality & AI**: Demonstrate the 5-factor quality confidence score and review/confirm a flagged **Isolation Forest anomaly**.
7. **CPI Impact Simulator**: Adjust the airfare index movement and CPI basket weight sliders to simulate macro pass-through in basis points.
8. **Data Monitor**: Verify ingestion source health and trigger an on-demand mock collection run.

---

## 7. Compliance & Legal Disclaimer

- Data collection adheres strictly to statutory regulatory sources, authorized API feeds, and compliant public schedules.
- No CAPTCHA bypasses, unauthorized access mechanisms, or anti-bot evasion methods are implemented.
- Prototype simulation values are clearly badged as `DEMO DATA` where applicable.
