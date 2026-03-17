# BidMasters — Real-time Auction Platform

Full-stack auction platform with AI-powered smart bidding advisor, real-time bid feeds, admin panel, and credit wallet system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + Socket.io |
| Database | MongoDB (Mongoose) |
| Auth | JWT (bcryptjs) |
| AI | Gemini 2.0 Flash API |
| Charts | Recharts |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
bidmasters/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         AuthScreen.jsx
│   │   │   ├── layout/       AppLayout.jsx, NotificationToast.jsx
│   │   │   ├── bidder/       Marketplace.jsx, LiveAuction.jsx, Wallet.jsx, MyAuctions.jsx
│   │   │   ├── admin/        AdminDashboard.jsx, ItemManagement.jsx,
│   │   │   │                 UserManagement.jsx, AuctionControl.jsx, Reports.jsx
│   │   │   └── shared/       SmartBidPanel.jsx
│   │   ├── contexts/         AuthContext, AuctionContext, NotificationContext
│   │   ├── lib/              mock-data.js (utilities + mock data)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── backend/
    ├── models/       index.js  (User, Auction, Bid, Transaction)
    ├── routes/       auth.js, auctions.js, bids.js, users.js, ai.js, admin.js
    ├── middleware/   auth.js   (JWT + adminOnly)
    ├── server.js
    ├── .env.example
    └── package.json
```

---

## Quick Start

### 1. Clone & install

```bash
# Frontend
cd bidmasters/frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure environment variables

**Frontend** — copy `.env.example` to `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key   # optional — falls back to smart algorithm
```

**Backend** — copy `.env.example` to `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bidmasters
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key        # optional
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open http://localhost:5173

---

## Demo Accounts

The app ships with mock data and two demo accounts accessible from the login screen:

| Role | Email | Password |
|---|---|---|
| Bidder | user@bidmasters.in | user1234 |
| Admin | admin@bidmasters.in | admin123 |

> In mock mode (no MongoDB), all data lives in memory and resets on page refresh.

---

## Features

### Bidder Panel
- **Marketplace** — Browse live, upcoming, and ended auctions. Filter by status and category. Real-time countdown timers.
- **Live Auction** — Real-time bid feed with Socket.io. Quick-bid buttons, custom amount, outbid detection, live countdown.
- **AI Smart Advisor** — Powered by Gemini API. Shows recommended bid, win probability, risk level, and reasoning. Falls back to local algorithm if no API key.
- **Wallet** — Credit balance, top-up with multiple payment methods (demo), full transaction history.
- **My Auctions** — Track active bids, won auctions, lost auctions with win rate stats.

### Admin Panel
- **Dashboard** — Platform stats (live auctions, total bids, revenue), bid activity chart, live auction monitor.
- **Item Management** — Add/edit/remove auction items with full form, image preview, category, reserve price, timing.
- **User Management** — View all users, suspend/reinstate accounts, assign credits, view individual stats.
- **Auction Control** — Start, pause, force-close, or extend any auction in real time.
- **Reports** — Bid activity charts, category revenue, pie chart, winners table. Export bid history and winners as CSV.

### Real-time
- Live bid broadcasting via Socket.io rooms (`auction:<id>`)
- Simulated bot bid activity on live auctions (in mock mode)
- Animated bid feed with new-bid highlights

---

## AI Smart Bidding Advisor

The advisor works in two modes:

**With Gemini API key set:**
Sends anonymised auction context (title, current price, time remaining, bid velocity, user win rate) to Gemini 2.0 Flash. Returns recommended bid, win probability, risk level, and plain-English reasoning in under 1 second.

**Without API key:**
Falls back to a local algorithm that uses: price-to-reserve ratio, bid velocity, time remaining, and user history to compute the same four metrics.

To get a free Gemini API key: https://aistudio.google.com/

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
# Set env vars: VITE_API_URL, VITE_SOCKET_URL, VITE_GEMINI_API_KEY
```

### Backend → Render

1. Create a new Web Service on Render
2. Connect your GitHub repo, set root to `backend/`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Set env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`

### Database → MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Add your IP to the allowlist
3. Copy the connection string to `MONGO_URI`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/auctions | — | List auctions |
| GET | /api/auctions/:id | — | Auction detail + bids |
| POST | /api/auctions | Admin | Create auction |
| PUT | /api/auctions/:id | Admin | Update auction |
| PATCH | /api/auctions/:id/status | Admin | Change status / extend |
| POST | /api/bids | JWT | Place a bid |
| GET | /api/bids/:auctionId | — | Bid history |
| GET | /api/users/me/transactions | JWT | Transaction history |
| POST | /api/users/me/topup | JWT | Add credits |
| GET | /api/users | Admin | All users |
| PATCH | /api/users/:id | Admin | Update user |
| POST | /api/ai/suggest | JWT | Get AI bid suggestion |
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/reports/bids | Admin | Bid history CSV |
| GET | /api/admin/reports/winners | Admin | Winners CSV |

---

## Socket.io Events

| Event | Direction | Payload |
|---|---|---|
| `join_auction` | Client → Server | `auctionId` |
| `leave_auction` | Client → Server | `auctionId` |
| `bid:new` | Server → Client | `{ id, userId, userName, amount, auctionId, time }` |
| `auction:updated` | Server → Client | Full auction object |
| `auction:status` | Server → Client | `{ id, status, endTime? }` |
| `auction:new` | Server → All | New auction object |

---

## Hackathon Submission

- Team: BidMasters
- Member: Mohammad Qhayyum
- Unstop: mohammadqhay
- Event: CodeBidz Hackathon
