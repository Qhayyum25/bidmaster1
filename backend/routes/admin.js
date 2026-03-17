const router = require('express').Router()
const { Auction, Bid, User, Transaction } = require('../models')
const { auth, adminOnly } = require('../middleware/auth')

// GET /api/admin/dashboard
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers, activeUsers, totalAuctions,
      liveAuctions, endedAuctions, totalBids,
    ] = await Promise.all([
      User.countDocuments({ role: 'bidder' }),
      User.countDocuments({ role: 'bidder', status: 'active' }),
      Auction.countDocuments(),
      Auction.countDocuments({ status: 'live' }),
      Auction.countDocuments({ status: 'ended' }),
      Bid.countDocuments(),
    ])

    const revenue = await Auction.aggregate([
      { $match: { status: 'ended' } },
      { $group: { _id: null, total: { $sum: '$currentBid' } } },
    ])

    const recentBids = await Bid.find({})
      .sort({ createdAt: -1 }).limit(10)
      .populate('auctionId', 'title')
      .lean()

    res.json({
      stats: {
        totalUsers, activeUsers, totalAuctions,
        liveAuctions, endedAuctions, totalBids,
        revenue: revenue[0]?.total || 0,
      },
      recentBids,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/reports/bids — CSV export
router.get('/reports/bids', auth, adminOnly, async (req, res) => {
  try {
    const bids = await Bid.find({}).sort({ createdAt: -1 })
      .populate('auctionId', 'title category').lean()

    const rows = bids.map(b => [
      b.userName,
      b.auctionId?.title || 'N/A',
      b.auctionId?.category || 'N/A',
      b.amount,
      new Date(b.createdAt).toLocaleString('en-IN'),
    ])

    const csv = [
      'Bidder,Auction,Category,Amount,Time',
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=bid_history.csv')
    res.send(csv)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/reports/winners
router.get('/reports/winners', auth, adminOnly, async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'ended' }).lean()

    const rows = auctions.map(a => [
      a.title,
      a.category,
      a.winner?.userName || 'No Winner',
      a.currentBid,
      a.totalBids,
      new Date(a.endTime).toLocaleString('en-IN'),
    ])

    const csv = [
      'Auction,Category,Winner,Final Bid,Total Bids,End Time',
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=winners.csv')
    res.send(csv)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
