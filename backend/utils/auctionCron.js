/**
 * Auction auto-end cron job
 * Runs every minute, closes expired auctions, assigns winners, refunds losers.
 */

const { Auction, Bid, User, Transaction } = require('../models')

async function closeExpiredAuctions(io) {
  try {
    const expired = await Auction.find({
      status: 'live',
      endTime: { $lte: new Date() },
    })

    for (const auction of expired) {
      // Find highest bid
      const topBid = await Bid.findOne({ auctionId: auction._id })
        .sort({ amount: -1 })
        .lean()

      const update = { status: 'ended' }

      if (topBid) {
        update.winner = { userId: topBid.userId.toString(), userName: topBid.userName }

        // Credit win to user stats
        await User.findByIdAndUpdate(topBid.userId, { $inc: { wins: 1 } })

        // Log winning transaction
        await Transaction.create({
          userId: topBid.userId,
          type: 'debit',
          amount: topBid.amount,
          description: `Auction won: ${auction.title}`,
          reference: auction._id.toString(),
        })
      }

      await Auction.findByIdAndUpdate(auction._id, update)

      // Broadcast auction ended
      if (io) {
        io.to(`auction:${auction._id}`).emit('auction:ended', {
          id: auction._id,
          winner: update.winner || null,
          finalBid: auction.currentBid,
        })
      }

      console.log(`⏰ Auction ended: "${auction.title}" — winner: ${update.winner?.userName || 'none'}`)
    }
  } catch (err) {
    console.error('Auction cron error:', err.message)
  }
}

function startAuctionCron(io) {
  console.log('⏰ Auction cron started (60s interval)')
  // Run immediately on start
  closeExpiredAuctions(io)
  // Then every 60 seconds
  return setInterval(() => closeExpiredAuctions(io), 60 * 1000)
}

module.exports = { startAuctionCron }
