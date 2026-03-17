require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const mongoose = require('mongoose')
const { startAuctionCron } = require('./utils/auctionCron')

const app = express()
const server = http.createServer(app)

// ─── CORS origin helper ───────────────────────────────────────────────────────
function isAllowedOrigin(origin) {
  if (!origin) return true // allow server-to-server / curl
  if (origin.includes('localhost')) return true
  if (origin.endsWith('.vercel.app')) return true
  const clientUrl = process.env.CLIENT_URL || ''
  if (clientUrl && origin === clientUrl) return true
  return false
}

const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) cb(null, true)
    else cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: (origin, cb) => cb(null, isAllowedOrigin(origin)), methods: ['GET', 'POST'] },
})

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors(corsOptions))
app.use(express.json())

// Attach io to request so routes can emit events
app.use((req, _res, next) => { req.io = io; next() })

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bidmasters'
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI)
    // Start auction expiry cron AFTER DB is ready
    startAuctionCron(io)
  })
  .catch(err => console.warn('⚠️  MongoDB not connected — running without DB:', err.message))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/auctions', require('./routes/auctions'))
app.use('/api/bids', require('./routes/bids'))
app.use('/api/users', require('./routes/users'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/admin', require('./routes/admin'))

// Root route — confirms API is running
app.get('/', (_req, res) => res.json({ message: '🔨 BidMasters API is running', docs: '/api/health' }))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Socket.io events ────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  socket.on('join_auction', (auctionId) => {
    socket.join(`auction:${auctionId}`)
    console.log(`   ↳ Joined room auction:${auctionId}`)
  })

  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction:${auctionId}`)
  })

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 BidMasters backend running on http://localhost:${PORT}`))

module.exports = { app, io }
