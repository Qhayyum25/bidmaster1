// ─── bids.js ──────────────────────────────────────────────────────────────────
const router = require('express').Router()
const { Auction, Bid, User, Transaction } = require('../models')
const { auth, adminOnly } = require('../middleware/auth')

// POST /api/bids
router.post('/', auth, async (req, res) => {
  try {
    const { auctionId, amount } = req.body
    if (!auctionId || !amount) return res.status(400).json({ error: 'auctionId and amount required' })

    const [auction, user] = await Promise.all([
      Auction.findById(auctionId),
      User.findById(req.user.id),
    ])

    if (!auction) return res.status(404).json({ error: 'Auction not found' })
    if (auction.status !== 'live') return res.status(400).json({ error: 'Auction is not live' })
    if (new Date(auction.endTime) < Date.now()) return res.status(400).json({ error: 'Auction has ended' })
    if (amount <= auction.currentBid) return res.status(400).json({ error: `Bid must exceed ${auction.currentBid}` })
    if (amount > user.credits) return res.status(400).json({ error: 'Insufficient credits' })

    // Deduct credits & save bid
    user.credits -= amount
    user.totalBids++
    await user.save()

    const bid = await Bid.create({ auctionId, userId: user._id, userName: user.name, amount })

    auction.currentBid = amount
    auction.totalBids++
    await auction.save()

    // Transaction log
    await Transaction.create({
      userId: user._id,
      type: 'debit',
      amount,
      description: `Bid placed on ${auction.title}`,
      reference: bid._id.toString(),
    })

    // Broadcast to room
    req.io.to(`auction:${auctionId}`).emit('bid:new', {
      id: bid._id,
      userId: user._id,
      userName: user.name,
      amount,
      auctionId,
      time: bid.createdAt,
    })

    res.status(201).json({ bid, newBalance: user.credits })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/bids/:auctionId
router.get('/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.auctionId })
      .sort({ createdAt: -1 }).limit(50).lean()
    res.json(bids)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
