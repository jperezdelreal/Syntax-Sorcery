# T1 Evaluation: BiciCoruña Route Planner

**By:** Morpheus (Lead/Architect)  
**Tier:** T1 (Architecture Authority)  
**Date:** 2025-07-13  
**Status:** ✅ APPROVED — Conditional  
**Requested by:** joperezd (Founder)

---

## 1. Viability Assessment

### Data Availability: ✅ CONFIRMED

BiciCoruña exposes a **live GBFS v2 API** (General Bikeshare Feed Specification) — the industry standard used by hundreds of bike-share systems worldwide.

- **Discovery endpoint:** `https://acoruna.publicbikesystem.net/customer/gbfs/v2/gbfs.json`
- **Station information:** Lat/lon, name, capacity for all 55 stations (expanding to 80)
- **Station status:** Real-time bike/dock availability, updated every ~30 seconds
- **Vehicle types:** Manual + electric bike differentiation
- **Geofencing zones:** Service area boundaries
- **License:** CC-BY-4.0 (attribution required, commercial use allowed)
- **Multi-language:** es, en, gl (Galician), fr
- **Backup source:** CityBikes API (`api.citybik.es/v2/networks/bicicorunha`)

I verified the API is live and returning valid JSON as of today. This is not a "maybe there's data" situation — the data is production-grade, well-structured, and free.

### Core Routing Algorithm: ✅ FEASIBLE

The multi-modal routing problem (walk → bike station → bike → station → walk) is a solved problem class. The algorithm:

1. **Input:** Origin (A), Destination (B)
2. **Fetch:** All stations with available bikes (pickup candidates) and free docks (dropoff candidates)
3. **For each (pickup, dropoff) pair:** Calculate walk(A→pickup) + bike(pickup→dropoff) + walk(dropoff→B)
4. **Rank:** By total time, weighting availability confidence
5. **Output:** Top 3 routes with time estimates

With 55 stations, the candidate space is small enough that brute-force works. No need for fancy graph algorithms — just score all feasible pairs and rank.

**Routing engine:** [openrouteservice](https://openrouteservice.org/) — free API with cycling + walking profiles, no self-hosting needed for prototype volumes. Falls back to OSRM if needed.

### Minimum Viable Stack: ✅ ACHIEVABLE AT €0

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React/Vite + Leaflet + OpenStreetMap tiles | €0 |
| Routing | openrouteservice free API (2,000 req/day) | €0 |
| Bike data | BiciCoruña GBFS v2 (direct fetch from browser) | €0 |
| Weather | Open-Meteo API (free, no key needed) | €0 |
| Hosting | GitHub Pages (static SPA) | €0 |
| CI/CD | GitHub Actions | €0 |

**Total prototype cost: €0/month.** No backend server needed — the app can be a pure client-side SPA that fetches GBFS data and routing directly from the browser.

### Key Technical Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| GBFS API goes down or changes | Medium | CityBikes fallback + local cache of station_information |
| openrouteservice rate limits (2K/day) | Low | Client-side caching of routes, debounce requests |
| CORS on GBFS endpoints | Medium | Lightweight proxy via Cloudflare Worker (free tier) or CORS-anywhere |
| Prediction accuracy (bike availability) | Low | v0.1 uses live data only; prediction is v0.2+ |
| Map tile usage limits | Low | OpenStreetMap tiles have generous fair-use policy |

---

## 2. Fit for Syntax Sorcery

### Does it align with SS's mission? ✅ YES

SS is an autonomous software development company. Its mission is to **design, build, and deploy software products with minimal human intervention.** BiciCoruña is a software product. It fits.

More importantly, it **diversifies the portfolio**:
- **FFS (FirstFrame Studios):** Games (entertainment, browser-based, no external APIs)
- **BiciCoruña project:** Civic utility (real-world data, API integration, maps, algorithms)

This proves SS can build more than games. It's a different problem domain — real-time data, geospatial, multi-modal routing — which demonstrates broader capability.

### Should it be a new downstream company? ✅ YES

**Proposed structure:**

```
Syntax Sorcery (hub)
├── FirstFrame Studios (games)
└── [New Downstream] (civic/urban mobility)
    └── BiciCoruña Route Planner (first product)
```

**Rationale:** The urban mobility / civic-tech domain is distinct enough from game development to warrant its own downstream. If the BiciCoruña prototype works, the same team could build route planners for other GBFS-compatible cities (Madrid BiciMAD, Barcelona Bicing, etc.) — that's a product line, not a one-off.

**Proposed downstream name:** To be decided by founder — but I'd suggest something like **CityPulse Labs** or **RutaVerde** to signal the civic/sustainability angle without coupling to one city.

### Budget/Cost Implications: ✅ ZERO IMPACT

The prototype runs entirely on free-tier services. It does not touch the €500/mo Azure budget. If it ever needs a backend (for prediction models, historical data collection), that's a Phase 2 decision — and even then, an Azure Function on consumption plan would cost <€5/mo.

---

## 3. Recommendation

### **VERDICT: ✅ YES — APPROVED (Conditional)**

**Conditions:**
1. **Separate repository** — not inside the SS monorepo. New repo under joperezd's GitHub org.
2. **v0.1 scope lock** — see below. No feature creep into ML/prediction until the map works.
3. **Downstream company naming** — Founder picks the name (T0 decision: new downstream company).
4. **SS team builds it** — this is a Squad project, proving autonomous AI dev works on a new domain.

### v0.1 Scope (Prototype — 2-3 weeks)

**IN scope:**
- Interactive map (Leaflet + OSM) centered on A Coruña
- All 55 BiciCoruña stations displayed with live availability (bikes/docks)
- Origin/destination input (click on map or search)
- Multi-modal route calculation: walk → bike station → bike → station → walk
- Top 3 route suggestions ranked by total time
- Basic stats per route: distance, estimated time, comparison vs walking
- Mobile-responsive design
- GitHub Pages deployment

**DEFERRED to v0.2+:**
- Availability prediction (requires historical data collection over time)
- Weather integration (nice-to-have, not core)
- CO₂/calorie stats (trivial to add but not MVP)
- User accounts / saved routes
- Electric vs manual bike differentiation in routing
- PWA / offline support

### Team Assignment Recommendation

| Role | Agent | Scope |
|------|-------|-------|
| Architecture | Morpheus | Stack decisions, repo structure, API integration design |
| Implementation | Trinity | Frontend (React + Leaflet), routing algorithm, GBFS integration |
| Infrastructure | Tank | GitHub Pages deploy pipeline, CI/CD |
| Testing | Switch | Route calculation tests, GBFS data parsing tests, UI tests |
| Documentation | Oracle | README, user guide, API docs |

---

## 4. Architecture Sketch

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (SPA)                      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Map UI   │  │  Route   │  │  Station Panel    │  │
│  │ (Leaflet) │  │  Planner │  │  (availability)   │  │
│  └─────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│        │             │                  │             │
│        └─────────────┼──────────────────┘             │
│                      │                                │
│              ┌───────┴────────┐                       │
│              │  Route Engine  │                       │
│              │  (client-side) │                       │
│              └───────┬────────┘                       │
└──────────────────────┼────────────────────────────────┘
                       │
          ┌────────────┼────────────────┐
          │            │                │
          ▼            ▼                ▼
    ┌──────────┐ ┌───────────┐  ┌────────────┐
    │ BiciCoruña│ │openroute- │  │ OpenStreet │
    │ GBFS API  │ │ service   │  │ Map Tiles  │
    │ (stations)│ │ (routing) │  │ (map)      │
    └──────────┘ └───────────┘  └────────────┘
```

### Tech Stack

- **Framework:** React 18+ with Vite (fast builds, SS team knows it)
- **Map:** Leaflet + react-leaflet (battle-tested, free, lightweight)
- **Tiles:** OpenStreetMap (free, no API key)
- **Routing API:** openrouteservice (free tier, cycling + walking profiles)
- **Bike Data:** BiciCoruña GBFS v2 (direct fetch, polled every 30s)
- **State:** React context or Zustand (keep it simple)
- **Styling:** Tailwind CSS (SS team standard from FFS)
- **Testing:** Vitest + React Testing Library
- **Deploy:** GitHub Pages via GitHub Actions

### Data Flow

1. **On load:** Fetch `station_information.json` (static — station metadata, lat/lon, capacity)
2. **Every 30s:** Fetch `station_status.json` (dynamic — current bikes/docks available)
3. **On route request:** 
   - Filter stations: pickup candidates (bikes > 0), dropoff candidates (docks > 0)
   - For each (pickup, dropoff) pair within reasonable walking distance of origin/destination:
     - Call openrouteservice: walk(origin → pickup), bike(pickup → dropoff), walk(dropoff → destination)
   - Score and rank by total time
   - Display top 3 on map with polylines

### Deployment

- Static SPA → GitHub Pages (€0)
- CI: GitHub Actions (lint + test + build + deploy on push to main)
- No backend, no database, no server costs

---

## 5. Strategic Value

This project is strategically excellent for SS because:

1. **Portfolio diversification:** Proves SS isn't a game studio — it's a software company.
2. **Real-world data integration:** First SS project consuming external APIs with real-time data.
3. **Civic value:** Solves a real problem for real people in a real city. Good for public perception.
4. **Scalability narrative:** GBFS is a global standard — the same app pattern works for any city with bike-sharing.
5. **Technical challenge:** Multi-modal routing is a non-trivial algorithm — demonstrates AI agents can handle complexity beyond CRUD.
6. **Cost:** €0. Pure upside.

---

**Decision:** ✅ APPROVED. Awaiting founder confirmation on downstream company name (T0). v0.1 scope locked as defined above.

**Next steps (on founder approval):**
1. Founder picks downstream company name → T0 decision
2. Create new GitHub repo under the downstream
3. Morpheus defines repo structure + architecture ADR
4. Trinity begins implementation (React + Leaflet + GBFS integration)
5. Tank sets up CI/CD + GitHub Pages
6. Switch writes test suite for route calculation logic
