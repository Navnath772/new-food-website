# FoodBridge AI — Smart Surplus Food Redistribution Platform

> **"Rescue Food. Connect Communities. Reduce Hunger."**  
> Targeting **UN Sustainable Development Goal 2: Zero Hunger** & **SDG 12: Responsible Consumption and Production**.

---

## 1. Problem Statement
Every single day, institutions such as college dining halls, hotel banquets, convention centers, restaurants, and catering kitchens produce massive volumes of safe, freshly prepared cooked food. Because hot cooked meals possess a perishable distribution window (typically 2 to 4 hours), they are routinely discarded into municipal landfills, decomposing into methane gas (CH₄). Simultaneously, nearby community shelters, orphanages, and food distribution centers face chronic nutrition deficits.

The fundamental gap is a **real-time, hyper-local coordination engine** that matches surplus food with verified nearby shelters and dispatches volunteer couriers before shelf-life expires.

---

## 2. The Solution
**FoodBridge AI** bridges this gap through an end-to-end civic-tech platform:
1. **Donors (College Mess, Caterers, Hotels)**: Publish surplus food in under 60 seconds with food safety declarations, or use natural language / voice input with **FoodBridge Copilot**.
2. **Explainable Intelligence Engine**: Calculates the 5-factor **Food Rescue Score™ (0–100)** and matches the batch to nearby shelters using Haversine proximity, food compatibility, urgency, and shelter capacity.
3. **Verified Volunteer Couriers**: Receive turn-by-turn routes, inspect a 7-point food safety checklist, and execute a **Dual-OTP / QR Code digital handshake**.
4. **Offline Resilience (PWA & LocalStorage)**: Couriers can inspect assignments, navigation routes, and donor contact numbers even in mobile deadspots.
5. **Digital Chain of Custody & Audit Log**: Every transfer is timestamped in an immutable ledger for food-safety governance and municipal compliance.

---

## 3. System Architecture

```text
                 FOODBRIDGE AI
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      DONOR           NGO          VOLUNTEER
        │              │              │
        └──────────────┼──────────────┘
                       │
                FRONTEND APP (React 19 + Vite 8)
                       │
                REST API (Express Node v22)
                       │
             ┌─────────┴─────────┐
             │                   │
       INTELLIGENCE          DATABASE (Atomic Persistent Store)
         ENGINE                 │
             │             ┌─────┼─────┐
             │             │     │     │
       Matching Engine   Users Donations Pickups
       Safety Engine     NGOs  Needs    AuditLogs
       Urgency Engine    Notifications
       Impact Engine
```

---

## 4. Explainable Intelligence Engine & Food Rescue Score™

Every donation receives an explainable score from **0 to 100**:

$$\text{Food Rescue Score} = (\text{Urgency} \times 30\%) + (\text{Distance} \times 20\%) + (\text{Demand Compatibility} \times 20\%) + (\text{Quantity} \times 15\%) + (\text{Food Safety} \times 15\%)$$

- **Urgency (30%)**: Remaining hours to distribution deadline (< 1 hour = 30 pts, < 2 hours = 28 pts).
- **Distance (20%)**: Proximity in kilometers via the Haversine formula (≤ 0.8 km = 20 pts, ≤ 2 km = 18 pts).
- **Demand Compatibility (20%)**: Direct match with active shelter food broadcasts and dietary compliance (Vegetarian/Vegan/Non-Veg).
- **Quantity (15%)**: Portion count and meal impact (≥ 80 meals = 15 pts, ≥ 40 meals = 13 pts).
- **Food Safety (15%)**: Physical temperature check and 7-point handler safety declaration.

*Disclaimer: Explainable deterministic intelligence algorithm, not an unverified black-box model.*

---

## 5. Food Safety Protocol & Dual-OTP Chain of Custody

FoodBridge AI enforces zero food safety compromises through a 3-tier inspection protocol:

1. **Donor Kitchen Declaration**: Supervisor verifies preparation temperature (>60°C hot hold or <5°C cold storage), packaging cleanliness, and absence of contamination.
2. **Courier 7-Point Physical Inspection**: Courier inspects container seal, absence of sensory spoilage, valid expiry window, and digital manifest portion match before taking custody.
3. **Dual-OTP Handshake**:
   - **Pickup OTP (4 digits)**: Held by donor. Entered by courier on arrival to mark status as `PICKED_UP`.
   - **Delivery OTP (4 digits)**: Held by receiving shelter supervisor. Entered on arrival to mark status as `COMPLETED`.
4. **Digital Custody Ledger**: Every event is permanently recorded in the donation's tamper-evident audit ledger.

*Legal Notice: Distribution window estimate. Final food-safety responsibility remains with the donor kitchen supervisor and authorized courier handlers.*

---

## 6. Offline Resilience & Volunteer PWA

- **Service Worker (`/sw.js`)**: Caches critical web app shell and assets via Stale-While-Revalidate so the PWA loads reliably with zero network.
- **Offline `localStorage` Cache (`OfflineStorageManager`)**:
  - Automatically synchronizes all assigned active pickups with full donor address, telephone contact numbers, pickup OTP codes, destination shelter data, and offline navigation notes.
  - Couriers can view complete pickup specs, safety instructions, and turn-by-turn routes offline.
  - Provides a one-click **"Simulate Offline Mode"** toggle in the volunteer portal to demonstrate zero-connectivity field operations during evaluations and demos.
  - Offline actions (safety checks, pickup attempts) queue locally and re-sync automatically upon reconnection.

---

## 7. Demo Credentials & Test Personas

Use the 1-click **Persona Switcher** in the top navigation bar to test all roles immediately:

| Persona | Organization / Name | Location | Pre-Configured Action |
| :--- | :--- | :--- | :--- |
| **Donor** | ABC College Mess Administration | Campus Road, Kolhapur | Create donations, view expiry timers, view AI matches, Copilot NLP |
| **NGO / Shelter** | Annapurna Community Shelter | Rajarampuri, Kolhapur | Accept matched food, broadcast community food needs, verify Delivery OTP |
| **Volunteer** | Rahul Patil (Motorcycle) | Shivaji Udyamnagar, Kolhapur | Accept pickups, inspect 7-point safety checklist, verify Pickup OTP, PWA Offline |
| **Admin** | Command Center Console | Civic Center, Kolhapur | Real-time activity feed, system audit trail, ecosystem health telemetry |

*Demo Disclosure: Demo Data — Not connected to real NGOs or municipal systems.*

---

## 8. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user role and retrieve session token |
| `POST` | `/api/auth/register` | Register new donor, NGO, or volunteer account |
| `GET` | `/api/auth/users` | List available persona accounts |
| `GET` | `/api/donations` | Fetch surplus food batches with status and donor filters |
| `POST` | `/api/donations` | Publish surplus food batch with food safety declaration |
| `GET` | `/api/donations/:id` | Get detailed donation manifest and OTP tokens |
| `GET` | `/api/matches/:donation_id` | Run 5-factor AI matching and retrieve ranked NGOs |
| `POST` | `/api/matches/:id/accept` | Accept allocation and trigger courier dispatch |
| `GET` | `/api/volunteers` | List volunteer couriers, vehicle types, and statuses |
| `POST` | `/api/pickups` | Assign volunteer courier to pickup route |
| `PUT` | `/api/pickups/:id/status` | Advance pickup status with OTP verification |
| `POST` | `/api/safety-check` | Submit volunteer 7-point food safety inspection |
| `GET` | `/api/needs` | Fetch open community food needs broadcast by shelters |
| `POST` | `/api/needs` | Post a new community food need broadcast |
| `GET` | `/api/notifications` | Fetch real user notifications |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read |
| `GET` | `/api/audit` | Fetch system audit log trail |
| `GET` | `/api/analytics` | Real-time metrics: meals rescued, kg diverted, CO₂e avoided |
| `POST` | `/api/admin/reset` | Restore demo database to fresh hackathon state |
| `GET` | `/api/health` | Comprehensive multi-component system health report |
| `GET` | `/sw.js` | Service Worker script for offline PWA caching |

---

## 9. SDG 2 & Climate Impact Transparency

- **UN SDG 2 (Zero Hunger)**: Directly supports Target 2.1 (access to safe, nutritious food) and Target 12.3 (halving per capita food waste).
- **Carbon Avoidance Formula**:
  $$\text{CO}_2\text{e Avoided (kg)} = \text{Food Diverted (kg)} \times 4.43$$
  *(Derived from UN FAO and US EPA Waste Reduction Model for prepared food diversion. Clearly disclosed as an illustrative estimate).*

---

## 10. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Port 3000)
npm run dev

# 3. Build for production
npm run build
npm start
```

---

## 11. Known Limitations & Future Scope

### Honest Distinctions
- **REAL**: Full-stack React 19 + Express REST architecture, atomic persistent database (`/data/foodbridge_db.json`), explainable 5-factor matching, Food Rescue Score™ calculation, dual-OTP verification, 7-point physical inspection, offline Service Worker, `localStorage` courier caching, natural language donation parser, dark mode, command palette (`Ctrl + K`).
- **SIMULATED**: End-to-end 15-stage rescue mission simulation, animated route visualization on OpenStreetMap.
- **ESTIMATED**: Meal portion weights (0.35 kg/meal) and CO₂e avoidance factors (4.43 kg CO₂e/kg food).
- **FUTURE SCOPE**: Production deployment with PostgreSQL/PostGIS, Redis job queues for real-time courier push notifications, external telematics GPS tracking, and IoT thermal sensor container monitoring.

---

## 12. License
Apache-2.0. Built for the Code4Impact Hackathon.
