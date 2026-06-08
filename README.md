# 🧭 Hidden Gems - Vetted Local Discoveries Map

Hidden Gems is a highly interactive, full-stack monorepo web application designed for urban explorers to discover and nominate off-the-radar study spots, botanical cafes, photography viewpoints, and peaceful parks. It features a responsive geographic map, interactive coordinate pins, a dynamic search engine, and a fully gamified explorer progression system.

---

## 🚀 Key Features

- **🗺️ Interactive Leaflet Map API:** Dynamic rendering of CartoDB maps (supporting clean Voyager and dark-matter tile layers) with custom interactive SVG marker pins, camera auto-centering, and bounding viewport adjustments.
- **📍 Drag-and-Drop Pin Coordinate Selector:** Interactive coordinate picking on map clicks or marker dragging for listing submissions.
- **🛡️ JWT Session Authentication:** Token-based security middleware with user signup, password hashing (`bcryptjs`), and secure request routing.
- **⚙️ Dynamic Comfort Indicators:** Real-time calculation of "Hidden Gem Scores" based on cost, noise decibel metrics, crowd density, and safety levels.
- **🏆 Gamification System:** Live contribution counters calculating explorer level progression (Lvl 1 ➔ Lvl 10+) and achievement badge awards (e.g., *First Discovery*, *Reviewer Pro*, *Local Legend*).
- **⚡ Performance & Security Headers:** Request limiters (anti-DoS), compression middleware, Helmet header protection, and structured production logging via **Winston**.

---

## 🛠️ Technology Stack

### Frontend Client
- **Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, CSS Custom Properties
- **Animations:** Motion (Framer Motion v12)
- **Map Engine:** Leaflet (Vanilla mapping client)
- **Icons:** Lucide React

### Backend API
- **Runtime:** Node.js, Express
- **Database:** MongoDB (Mongoose ODM)
- **Security:** Helmet, CORS, Express-Rate-Limit, bcryptjs, jsonwebtoken
- **Validation:** Zod (Type-safe input parsing & escaping)
- **Logging:** Winston (JSON console and error log files)

### Infrastructure & CI/CD
- **Containerization:** Docker, Docker Compose (Nginx reverse proxy proxying API calls)
- **Clustering:** PM2 (Load-balanced Node.js instances)
- **Automated Workflows:** GitHub Actions (CI lint and build pipelines)

---

## 📂 Project Structure

```
hidden-gems/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InteractiveMap.tsx     # Geographic map + marker pins
│   │   │   ├── AddLocation.tsx        # Drag-and-drop location creator
│   │   │   ├── ProfileDashboard.tsx   # Achievements & saved spots listing
│   │   │   ├── Login.tsx / Register.tsx
│   │   │   └── Navbar.tsx             # Theme toggler & navigation
│   │   ├── App.tsx                    # Route guards & state syncing
│   │   ├── index.css                  # Custom styling overrides
│   │   └── types.ts
│   ├── Dockerfile                     # Multi-stage production client build
│   └── nginx.conf                     # Nginx client hosting routing
│
├── backend/
│   ├── config/
│   │   ├── db.js                      # MongoDB connection pool
│   │   └── logger.js                  # Central Winston logging setup
│   ├── controllers/                   # Business logic (Gem / User routing logic)
│   ├── middleware/                    # JWT auth, error masking, Zod validations
│   ├── models/                        # Mongoose schemas (Gem / User schema constraints)
│   ├── scripts/                       # Database seeding scripts
│   ├── tests/                         # Vitest cryptography test suite
│   ├── server.js                      # Express setup
│   └── Dockerfile                     # Node.js backend container configuration
│
├── docs/                              # Production readiness audits
├── docker-compose.yml                 # Multi-container service stack configuration
├── pm2.config.cjs                     # PM2 cluster config
└── package.json                       # Monorepo launch runner scripts
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or a local MongoDB instance running)

### Step 1: Clone and Configure Environment

1. Rename `backend/.env.example` to `backend/.env`
2. Configure the following environment variables inside `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key
   LOG_LEVEL=info
   ```

### Step 2: Install and Launch

From the root directory:

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Pre-seed the database:**
   ```bash
   npm run seed
   ```
   *(Creates a mock explorer user account `explorer.alex@hiddengems.co` with password `password123` and pre-populates 5 London custom gems).*

3. **Launch the servers:**
   ```bash
   npm run dev
   ```
   - **Frontend:** http://localhost:5173
   - **Backend:** http://localhost:5000

---

## 🐳 Production Deployment

### Option A: Docker Compose
Build and launch the complete stack with an Nginx reverse proxy routing requests from port `80`:
```bash
docker-compose up --build -d
```

### Option B: PM2 Process Manager
Run load-balanced instances of the server on bare-metal or VMs:
```bash
pm2 start pm2.config.cjs
```
