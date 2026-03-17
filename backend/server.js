require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const server = http.createServer(app)

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
})

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Attach io to request for use in routes
app.use((req, _res, next) => { req.io = io; next() })

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bidmasters'
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.warn('⚠️  MongoDB not connected — running without DB:', err.message))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/auctions', require('./routes/auctions'))
app.use('/api/bids', require('./routes/bids'))
app.use('/api/users', require('./routes/users'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/admin', require('./routes/admin'))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

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
