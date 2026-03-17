# 🔨 BidMasters — Smart Auction Platform

A full-stack real-time auction platform with AI-powered bidding advice, live wallet management, and a complete admin control panel.

---

## ✨ Features

### For Bidders
- 🏪 **Marketplace** — Browse live, upcoming, and ended auctions with category filters
- ⚡ **Real-time Bidding** — Instant bid updates via Socket.IO live feeds
- 🤖 **AI Smart Advisor** — Win probability meter + BID / WAIT / SKIP recommendation on every auction
- 🔒 **Secure Wallet** — Credits system with full transaction history and top-up
- 🏆 **My Auctions** — Track all auctions you've participated in
- 📊 **Dashboard & Reports** — Platform-wide stats visible to all users
- 👤 **Edit Profile** — Update name and email from the sidebar

### For Admins
- ➕ **Item Management** — Add, edit, and delete auction items with real-time DB sync
- 👥 **User Management** — View, suspend, and adjust credits for any user
- 🎛️ **Auction Control** — Change auction status, extend time, force-close auctions
- 📈 **Reports & Analytics** — Revenue, bids, and winner data

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Framer Motion, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.IO |
| Auth | JWT (bcryptjs) |
| AI | Google Gemini API (AI Smart Advisor) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repo
```bash
git clone https://github.com/Qhayyum25/bidmaster1.git
cd bidmaster1
```

### 2. Set up environment variables
Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/bidmasters
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
PORT=5000
GEMINI_API_KEY=your_gemini_key_here   # optional — AI advisor falls back to smart algorithm
```

### 3. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Seed the database (first-time only)
```bash
cd backend
node scripts/seed.js
```

### 5. Run the app

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Bidder** | `user@bidmasters.in` | `user1234` |
| **Admin** | `admin@bidmasters.in` | `admin123` |

---

## 📁 Project Structure

```
bidmasters/
├── backend/
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Mongoose schemas (User, Auction, Bid, Transaction)
│   ├── routes/         # API routes (auth, auctions, bids, users, ai, admin)
│   ├── scripts/        # DB seeder
│   ├── utils/          # Auction cron job (auto-end expired auctions)
│   └── server.js       # Express + Socket.IO server
└── frontend/
    └── src/
        ├── components/
        │   ├── admin/   # AdminDashboard, ItemManagement, UserManagement, etc.
        │   ├── auth/    # Login & Register screen
        │   ├── bidder/  # Marketplace, LiveAuction, Wallet, Profile, MyAuctions
        │   ├── layout/  # AppLayout (sidebar + topbar)
        │   └── shared/  # SmartBidPanel (AI advisor)
        ├── contexts/    # AuthContext, AuctionContext, NotificationContext
        └── lib/         # api.js (centralised API client)
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login and get JWT |
| GET | `/api/auctions` | — | List all auctions |
| POST | `/api/auctions` | Admin | Create auction |
| PUT | `/api/auctions/:id` | Admin | Update auction |
| DELETE | `/api/auctions/:id` | Admin | Delete auction |
| POST | `/api/bids` | User | Place a bid |
| GET | `/api/users/me/transactions` | User | Wallet history |
| POST | `/api/users/me/topup` | User | Add credits |
| PATCH | `/api/users/me` | User | Update profile |
| GET | `/api/admin/dashboard` | Admin | Platform stats |

---

## 📄 License

MIT © BidMasters
