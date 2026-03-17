const router = require('express').Router()
const { Auction, Bid, User, Transaction } = require('../models')
const { auth } = require('../middleware/auth')

// POST /api/bids — place a bid
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
    if (amount <= auction.currentBid) return res.status(400).json({ error: `Bid must exceed ₹${auction.currentBid}` })
    if (amount > user.credits) return res.status(400).json({ error: 'Insufficient credits' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })

    // Deduct credits & increment stats
    user.credits -= amount
    user.totalBids += 1
    await user.save()

    const bid = await Bid.create({ auctionId, userId: user._id, userName: user.name, amount })

    auction.currentBid = amount
    auction.totalBids += 1
    await auction.save()

    // Transaction log
    await Transaction.create({
      userId: user._id,
      type: 'debit',
      amount,
      description: `Bid placed on ${auction.title}`,
      reference: bid._id.toString(),
    })

    // Broadcast bid to all watchers in the auction room
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

// GET /api/bids/:auctionId — bid history for an auction
router.get('/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.auctionId })
      .sort({ createdAt: -1 }).limit(50).lean()
    res.json(bids)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/bids/user/me — current user's bid history across all auctions
router.get('/user/me', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('auctionId', 'title category status currentBid endTime image')
      .lean()
    res.json(bids)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
