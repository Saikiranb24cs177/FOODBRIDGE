# FoodBridge 🍲🌿
> **“Turning Surplus Food Into Hope.”**

FoodBridge is an AI-powered, full-stack smart food donation platform engineered to bridge the gap between commercial surplus food donors (restaurants, hotels, hostels, marriage/function halls, caterers) and charitable organizations (NGOs, orphanages, old-age homes, night shelters, and disaster relief trusts).

---

## 🌟 Key Architecture & Capabilities

### 1. Transparent Impact & Dynamic Landing Page
- **Hero Showcase**: Tagline *“Don't Waste Food. Share Hope.”* with high-definition visuals, 1-click demo switcher, and responsive navigation.
- **Database-Backed Impact Metrics**: Real verified figures derived from MongoDB records (total donations, verified meals delivered, registered donors, and partner NGOs) with clear labeling of projections.
- **4-Stage Workflow Illustration**:
  1. Donor lists surplus food with expiry deadlines and safety declarations.
  2. Platform matches suitable nearby verified NGOs using AI scoring.
  3. NGO volunteers claim and donors accept with a secure 4-digit verification OTP.
  4. Food is safely transported, verified at handoff, and served to beneficiaries.
- **All 7 User Categories Featured**: Restaurants, Hotels, Hostels, Function Halls, NGOs, Orphanages, and Old-Age Homes.
- **Interactive Modals**: Detailed Terms of Service and Privacy Policy dialogs, emergency hotline, and social outreach links.

---

### 2. Intelligent AI Engine (Smart Matching & Demand Prediction)
*Architecture Note: Built with a clean modular service layer (`aiService.js`) allowing direct plug-in for trained machine-learning models or external LLM APIs. Honest, rule-based heuristic intelligence is active by default.*
- **AI Smart Food Matching**:
  - Calculates multi-factor match score (0–99%) based on Haversine geographic distance, dietary preferences, NGO beneficiary capacity vs. donation servings, and consumption urgency.
  - Automatic donor-to-NGO matching modal immediately after posting a donation.
  - Personalized NGO recommendations feed ranking surplus listings by relevance and proximity.
- **AI Surplus Demand Forecasting**:
  - Statistical analysis of historical request patterns and fulfillment rates across categories.
  - 7-Day surplus demand forecast with day-of-week consumption multipliers, confidence scores, and recommended donor preparation windows.
  - Category comparison highlighting supply vs. demand gaps.
- **Actionable Operational Insights**:
  - Average pickup turnaround speed tracking and bottleneck alerts.
  - Actionable dispatch recommendations (e.g., weekend banquet yield scheduling, cold-chain transport expansion).

---

### 3. Role-Based Authentication & Governance
- **Strict Role Boundaries**:
  - **Donor**: Hotels, restaurants, function halls, hostels, caterers.
  - **NGO**: Orphanages, shelters, old-age homes, relief trusts.
  - **Admin**: Dedicated governance console. Public self-registration of admin accounts is strictly prohibited and blocked at both the API and database validation layers.
- **Password Recovery**: Complete tokenized Forgot Password and Reset Password workflows with confirmation dialogs.
- **In-App Notification Center**: Real-time MongoDB-backed alert notifications with an unread badge counter in the top navigation bar and 1-click read state toggles.

---

### 4. Donor Dashboard & Food Management
- **Full Sidebar Navigation**: Overview, Donate Food, My Donations, NGO Requests, Donation Tracking, Profile, Settings, and Logout.
- **Surplus Food Publishing**:
  - Categories: *Cooked meals*, *Packaged food*, *Raw ingredients / Vegetables*, *Bakery items*, *Beverages*, *Dairy products*, *Other*.
  - Units: *meals*, *packets*, *kg*.
  - Date-time pickers for preparation time and safe consumption deadline.
  - Pickup window (start and end times), full address, city, and PIN code.
  - Mandatory food safety and hygiene declaration checkbox.
  - Draft saving and 1-click AI smart matching modal upon submission.
- **Claim Management**: View incoming NGO claims, volunteer details, beneficiary notes, and approve with automatic 4-digit verification OTP issuance.

---

### 5. NGO Portal & Food Rescue Hub
- **Full Sidebar Navigation**: Overview, Available Food, AI Recommendations, My Requests, Accepted Donations, Pickup Tracking, Organisation Profile, Settings, and Logout.
- **Available Food Directory**: Multi-filter search (search query, city, category, dietary preference) with urgency badges and remaining shelf-life countdowns.
- **AI Recommendations Tab**: Top-ranked donations optimized specifically for the NGO’s registered location, capacity, and dietary preferences.
- **OTP Verification & Delivery Handoff**: Submit OTP at donor kitchen pickup dock and mark delivery completed once food is distributed to beneficiaries.

---

### 6. Comprehensive 10-Tab Admin Headquarters
- **Dashboard**: High-level platform KPIs, live activity feed, verified impact statistics, and quick navigation.
- **Manage Users**: Complete user directory with role filters, account search, activation/suspension toggles, and verification badges.
- **Donors Directory**: Dedicated hotel/restaurant directory with donation history and venue contact details.
- **NGOs Directory**: Non-profit directory displaying beneficiary capacity, contact info, and legal registration numbers.
- **Verify Organisations (Statutory Audit Queue)**: Comprehensive NGO verification queue displaying NITI Aayog DARPAN ID, trust registration numbers, address proofs, and 1-click Approve / Reject actions with admin notes.
- **Food Donations Management**: Complete food listings directory with status filters (Available, Requested, Accepted, In Transit, Delivered, Cancelled) and administrative take-down actions.
- **Donation Requests**: Full log of claims, matching donor-NGO pairs, requested servings, and OTP verification logs.
- **Safety & Quality Reports**: Moderation queue for flagged listings with dismissal or permanent delisting controls.
- **AI Analytics & Predictions**: Interactive 7-day demand projections, category supply vs. demand fulfillment progress bars, and actionable logistics insights.
- **Platform Settings**: Toggle mandatory DARPAN verification, set Haversine proximity radius, toggle emergency distress alerts, and view database diagnostics.

---

### 7. 6-Stage Donation Lifecycle & Tracking Timeline
1. **Donation Listed** (`Available`)
2. **NGO Request Received** (`Requested`)
3. **Donation Accepted** (`Accepted` - 4-digit verification OTP issued)
4. **Pickup Scheduled** (`Ready for Pickup`)
5. **Food Collected** (`Picked Up`)
6. **Donation Completed** (`Delivered` or `Completed`)

Timestamped audit log entries are generated for every state transition in MongoDB.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, Axios, React Router DOM v6 |
| **Backend** | Node.js, Express.js REST API, JWT Authentication, bcryptjs, Multer, Morgan |
| **Database** | MongoDB & Mongoose *(No silent in-memory fallback; direct MongoDB connection required)* |
| **AI Layer** | Modular heuristic & statistical matching engine; prepared for ML / Python / LLM API integration |
| **Deployment** | Vercel (`vercel.json`), Render (`render.yaml`), MongoDB Atlas (production) / Community Server (local) |

---

## 📁 Repository Structure

```
Foodbridge/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB direct Mongoose connection
│   ├── controllers/
│   │   ├── adminController.js    # Platform governance, verification, and moderation
│   │   ├── aiController.js       # Smart food matching, demand prediction & insights
│   │   ├── authController.js     # JWT auth, registration, and password recovery
│   │   ├── donationController.js # Food listing lifecycle and queries
│   │   ├── notificationController.js # In-app notification center
│   │   └── requestController.js  # Claim lifecycle and OTP handoff
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer token JWT validation
│   │   └── roleMiddleware.js     # Role-based access control (donor, ngo, admin)
│   ├── models/
│   │   ├── DonationHistory.js    # Historical delivery records
│   │   ├── DonationRequest.js    # Claims, requested servings, and OTP
│   │   ├── FoodDonation.js       # Listings, categories, servings, and safety flags
│   │   ├── Notification.js       # In-app notification documents
│   │   ├── TrackingLog.js        # Audit trail of status transitions
│   │   └── User.js               # Users, roles, DARPAN details, and capacity
│   ├── routes/                   # Express API routes
│   ├── seeds/
│   │   └── seedData.js           # Comprehensive test database seeder
│   ├── services/
│   │   ├── aiService.js          # Heuristic matching, 7-day demand forecasting
│   │   └── dataService.js        # Data aggregation and automated notifications
│   ├── server.js                 # Express application entrypoint (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, FoodCard, Modals, Timeline
│   │   ├── context/              # AuthContext (with 1-click demo switcher) & ToastContext
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # 10-Tab Admin Headquarters
│   │   │   ├── DonateFoodPage.jsx    # Multi-category donation listing & draft saving
│   │   │   ├── DonationDetailPage.jsx # 6-stage lifecycle timeline & claim modal
│   │   │   ├── DonorDashboard.jsx    # 8-tab Donor command center
│   │   │   ├── FoodListingsPage.jsx  # Public searchable food rescue catalog
│   │   │   ├── ForgotPasswordPage.jsx # Password recovery initiation
│   │   │   ├── HowItWorksPage.jsx    # Illustrated workflow & FAQs
│   │   │   ├── LandingPage.jsx       # Public homepage with live DB impact metrics
│   │   │   ├── LoginPage.jsx         # Role-tailored login with quick demo switcher
│   │   │   ├── NgoDashboard.jsx      # 8-tab NGO shelter rescue hub
│   │   │   ├── RegisterPage.jsx      # Donor & NGO registration with DARPAN inputs
│   │   │   └── ResetPasswordPage.jsx # Password token reset form
│   │   ├── services/                 # Axios API clients
│   │   ├── App.jsx                   # React Router routing
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (MongoDB Community Server installed locally, or a MongoDB Atlas connection URI)

### 2. Start MongoDB Community Server
If running MongoDB locally on Windows:
```powershell
# Create local data directory if needed:
mkdir -p "c:\Users\saiki\Downloads\Foodbridge\backend\data\db"

# Start mongod instance:
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "c:\Users\saiki\Downloads\Foodbridge\backend\data\db" --port 27017
```

### 3. Backend Setup & Database Seeding
```bash
# In a new terminal, navigate to backend:
cd backend

# Install dependencies:
npm install

# Configure backend environment (.env):
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/foodbridge
# JWT_SECRET=foodbridge_super_secret_jwt_key_998811
# FRONTEND_URL=http://localhost:5173

# Populate database with test donors, NGOs, food listings, and notifications:
npm run seed

# Start Express server:
npm run dev
# -> Server running on port 5000, connected to MongoDB
```

### 4. Frontend Setup
```bash
# In a separate terminal, navigate to frontend:
cd frontend

# Install dependencies:
npm install

# Start Vite development server:
npm run dev
# -> Local URL: http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Pre-Configured Demo Credentials

The platform features an instant **1-Click Demo Switcher** in the top navigation bar and login screen. You can also log in manually using the following credentials:

| Role | Organization / User | Email Address | Password | Features Accessible |
| :--- | :--- | :--- | :--- | :--- |
| **Donor** | Grand Palace Hotel | `donor@foodbridge.org` | `Password123!` | Post food, view claims, accept requests, view OTP |
| **NGO** | Hope Children Orphanage | `ngo@foodbridge.org` | `Password123!` | Browse surplus, AI recommendations, claim meals, submit OTP |
| **Admin** | FoodBridge Governance HQ | `admin@foodbridge.org` | `Password123!` | 10-tab command console, verify NGOs, AI demand forecasting |

---

## 🚢 Deployment Configuration

### Frontend (Vercel)
1. Link repository to Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`

### Backend (Render)
1. Create a Web Service on Render pointing to repository root.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/foodbridge?retryWrites=true&w=majority`
   - `JWT_SECRET=<strong-random-secret>`
   - `FRONTEND_URL=https://your-app.vercel.app`

---

## 📄 License & Mission
FoodBridge is released under the **MIT License**.
Designed and engineered with passion to eliminate edible food waste and feed vulnerable communities.
