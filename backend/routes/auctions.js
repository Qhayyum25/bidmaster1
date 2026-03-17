const router = require('express').Router()
const { Auction, Bid } = require('../models')
const { auth, adminOnly } = require('../middleware/auth')

// GET /api/auctions
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query
    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category
    const auctions = await Auction.find(filter).sort({ createdAt: -1 }).lean()
    res.json(auctions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auctions/:id
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).lean()
    if (!auction) return res.status(404).json({ error: 'Auction not found' })
    const bids = await Bid.find({ auctionId: auction._id }).sort({ createdAt: -1 }).limit(20).lean()
    res.json({ ...auction, bids })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auctions (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const auction = await Auction.create({ ...req.body, createdBy: req.user.id })
    req.io.emit('auction:new', auction)
    res.status(201).json(auction)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/auctions/:id (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!auction) return res.status(404).json({ error: 'Auction not found' })
    req.io.to(`auction:${req.params.id}`).emit('auction:updated', auction)
    res.json(auction)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH /api/auctions/:id/status (admin)
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, extendMinutes } = req.body
    const update = { status }
    if (extendMinutes) {
      const auction = await Auction.findById(req.params.id)
      update.endTime = new Date(new Date(auction.endTime).getTime() + extendMinutes * 60000)
    }
    const auction = await Auction.findByIdAndUpdate(req.params.id, update, { new: true })
    req.io.to(`auction:${req.params.id}`).emit('auction:status', { id: req.params.id, status, endTime: update.endTime })
    res.json(auction)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
