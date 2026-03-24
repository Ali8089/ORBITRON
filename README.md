# ORBITRON UTM 🇭🇰

**ORBITRON** is a full-stack Unmanned Traffic Management (UTM) system for Hong Kong airspace. It provides real-time drone deconfliction, VCG-based slot auctions, 3D airspace visualisation, and blockchain-anchored compliance records.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORBITRON UTM                             │
├──────────────────┬──────────────────┬───────────────────────────┤
│  Operator        │  Admin Centre    │  Drone Simulator           │
│  Dashboard       │  (Port 3001)     │  (Port 3003)               │
│  (Port 3000)     │  Mapbox 3D Map   │  Tactical Map + Feed       │
│  Flight Plans    │  NO-GO Zones     │  50-drone simulation       │
│  VCG Auction     │  Privacy Zones   │  Rogue drone injection     │
│  AI Safety       │  Blockchain Feed │  Counter-measure costs     │
└────────┬─────────┴────────┬─────────┴──────────┬────────────────┘
         │                  │                     │
         └──────────────────▼─────────────────────┘
                    Express REST API (Port 4000)
                    ┌──────────────────────────┐
                    │  /api/v1/flights          │
                    │  /api/v1/auctions         │
                    │  /api/v1/blockchain       │
                    │  /api/v1/telemetry        │
                    │  /api/v1/simulator        │
                    └──────────┬───────────────┘
                               │
              ┌────────────────┼──────────────────┐
              ▼                ▼                   ▼
         PostgreSQL         InfluxDB        Hyperledger Fabric
         (Flights/Users)    (Telemetry)     (Audit Trail)
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- (Optional) Docker & Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Set NEXT_PUBLIC_MAPBOX_TOKEN to your Mapbox public token
# Get one free at https://account.mapbox.com/
```

### 3. Start all services

```bash
npm run dev
```

This starts:
- **API** at http://localhost:4000
- **Operator Dashboard** at http://localhost:3000
- **Admin Centre** at http://localhost:3001
- **Drone Simulator** at http://localhost:3003

### 4. Seed demo data

```bash
npm run seed
```

### 5. Run demo script

```bash
npm run demo
# or with options:
npm run demo -- --scenario=rush-hour --drones=50
```

---

## Docker

```bash
# Start all infrastructure
docker-compose up -d

# View logs
docker-compose logs -f api
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL public token | — |
| `OPENAI_API_KEY` | OpenAI API key for AI deconfliction | — |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://orbitron:orbitron@localhost:5432/orbitron` |
| `INFLUXDB_URL` | InfluxDB URL | `http://localhost:8086` |
| `INFLUXDB_TOKEN` | InfluxDB auth token | `orbitron-influx-token` |
| `INFLUXDB_ORG` | InfluxDB organisation | `orbitron` |
| `INFLUXDB_BUCKET` | InfluxDB bucket | `telemetry` |
| `FABRIC_CONNECTION_PROFILE_PATH` | Hyperledger Fabric connection profile | — |
| `FABRIC_WALLET_PATH` | Fabric wallet directory | — |
| `FABRIC_USER_ID` | Fabric user identity | `admin` |
| `FABRIC_CHANNEL_NAME` | Fabric channel | `mychannel` |
| `FABRIC_CHAINCODE_NAME` | Fabric chaincode | `orbitron` |
| `API_PORT` | Express API port | `4000` |
| `NODE_ENV` | Node environment | `development` |

---

## Features

### Operator Dashboard (Port 3000)
- **Flight plan submission** with AI deconfliction (4s simulation)
- **Risk scoring**: wind, occupancy, building density
- **Conflict detection** with alternative route suggestions
- **VCG slot auction**: bid credits, pay only harm caused
- **Flight status table** with real-time updates

### Admin Centre (Port 3001)
- **3D Mapbox map** of Hong Kong airspace
- **Altitude band toggles** (Bands 0–4, 0–400m)
- **NO-GO zone overlays** (HKIA, PLA bases, prisons)
- **Privacy zone overlays** (residential towers)
- **HKO weather widget**
- **Blockchain stats** (TPS, block height, events)
- **Live blockchain event feed**

### Drone Simulator (Port 3003)
- **Launch 50 drones** simultaneously with animated movement
- **Inject rogue drone** with threat classification
- **Counter-measure cost comparison** (RF jamming → Patriot missile)
- **Tactical agent feed** with real-time separation warnings
- **Credit balance** decreasing in real-time
- **Bottom stats bar**: flights, conflicts, credits

### API (Port 4000)
| Endpoint | Description |
|---|---|
| `GET /api/v1/flights` | List all flight plans |
| `POST /api/v1/flights` | Submit flight plan (triggers 4s deconfliction) |
| `GET /api/v1/auctions` | List all auctions |
| `POST /api/v1/auctions` | Submit VCG bid |
| `GET /api/v1/blockchain/stats` | TPS, block height, event count |
| `GET /api/v1/blockchain/events` | Last 50 blockchain events |
| `GET /api/v1/telemetry` | 50 mock drone positions |
| `POST /api/v1/simulator/launch` | Launch N drones (max 50) |
| `POST /api/v1/simulator/rogue` | Inject rogue drone |
| `GET /api/v1/simulator/drones` | Get all active drones |
| `DELETE /api/v1/simulator/drones` | Clear all drones |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Map | Mapbox GL JS, react-map-gl |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL 15 |
| Time-series | InfluxDB 2.7 |
| Blockchain | Hyperledger Fabric |
| Monorepo | npm workspaces |
| Containers | Docker Compose |

---

## Project Structure

```
ORBITRON/
├── apps/
│   ├── operator-dashboard/   # Next.js port 3000
│   ├── admin-centre/         # Next.js port 3001 (Mapbox 3D)
│   └── drone-simulator/      # Next.js port 3003 (Tactical map)
├── packages/
│   └── api/                  # Express REST API port 4000
├── scripts/
│   ├── seed-hk-data.ts
│   ├── seed-demo-operators.ts
│   └── run-demo.ts
├── docker-compose.yml
├── .env.example
└── package.json
```

---

*Built for the Hong Kong Civil Aviation Department UTM initiative.*

---

# Original README

 UTM - Drone Traffic Management System for Hong Kong