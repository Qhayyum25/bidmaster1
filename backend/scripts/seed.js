/**
 * BidMasters Seed Script
 * Run: node scripts/seed.js
 * Seeds the database with an admin user, demo bidders, and live/upcoming/ended auctions.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { User, Auction, Bid, Transaction } = require('../models')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bidmasters'

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('✅ Connected to MongoDB:', MONGO_URI)

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Auction.deleteMany({}),
    Bid.deleteMany({}),
    Transaction.deleteMany({}),
  ])
  console.log('🧹 Cleared existing data')

  // ─── Users ────────────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hash(pw, 10)

  const [admin, user1, user2, user3, user4] = await User.insertMany([
    { name: 'Admin', email: 'admin@bidmasters.in', password: await hash('admin123'), role: 'admin', credits: 0, status: 'active' },
    { name: 'Qhayyum M.', email: 'user@bidmasters.in', password: await hash('user1234'), role: 'bidder', credits: 133500, totalBids: 12, wins: 1, status: 'active' },
    { name: 'Priya Sharma', email: 'priya@example.com', password: await hash('demo1234'), role: 'bidder', credits: 250000, totalBids: 45, wins: 7, status: 'active' },
    { name: 'Rahul Kumar', email: 'rahul@example.com', password: await hash('demo1234'), role: 'bidder', credits: 89000, totalBids: 28, wins: 3, status: 'active' },
    { name: 'Anjali Mehta', email: 'anjali@example.com', password: await hash('demo1234'), role: 'bidder', credits: 45000, totalBids: 9, wins: 1, status: 'active' },
  ])
  console.log('👥 Users created')

  // ─── Auctions ─────────────────────────────────────────────────────────────
  const now = Date.now()

  const auctions = await Auction.insertMany([
    {
      title: 'Apple MacBook Pro 16" M3 Max',
      description: 'Brand new, sealed box. Latest M3 Max chip with 128GB RAM, 4TB SSD. Absolute powerhouse for creators and developers.',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
      startingPrice: 150000,
      currentBid: 187000,
      reservePrice: 200000,
      status: 'live',
      startTime: new Date(now - 2 * 3600000),
      endTime: new Date(now + 3 * 3600000),
      totalBids: 4,
      watchers: 87,
      createdBy: admin._id,
    },
    {
      title: 'Sony PlayStation 5 Pro Bundle',
      description: 'PS5 Pro console with 3 controllers, 8 games. Mint condition.',
      category: 'Gaming',
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80',
      startingPrice: 60000,
      currentBid: 74500,
      reservePrice: 80000,
      status: 'live',
      startTime: new Date(now - 1 * 3600000),
      endTime: new Date(now + 1.5 * 3600000),
      totalBids: 3,
      watchers: 53,
      createdBy: admin._id,
    },
    {
      title: 'Rolex Submariner 126610LN',
      description: 'Authentic Rolex Submariner in black dial/bezel. Box and papers included. 2023 purchase, immaculate condition.',
      category: 'Watches',
      image: 'https://images.unsplash.com/photo-1548171915-f6ef99d8f9e9?w=400&q=80',
      startingPrice: 800000,
      currentBid: 950000,
      reservePrice: 1000000,
      status: 'live',
      startTime: new Date(now - 4 * 3600000),
      endTime: new Date(now + 0.5 * 3600000),
      totalBids: 2,
      watchers: 134,
      createdBy: admin._id,
    },
    {
      title: 'DJI Mavic 3 Pro Drone',
      description: 'Brand new DJI Mavic 3 Pro with Fly More combo. Hasselblad camera system, 43min flight time.',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80',
      startingPrice: 80000,
      currentBid: 80000,
      reservePrice: 90000,
      status: 'upcoming',
      startTime: new Date(now + 2 * 3600000),
      endTime: new Date(now + 6 * 3600000),
      totalBids: 0,
      watchers: 29,
      createdBy: admin._id,
    },
    {
      title: 'Vintage Gibson Les Paul 1959 Reissue',
      description: 'Gibson Custom Shop 1959 Les Paul Standard Reissue in Lemon Burst. Stunning flame maple top.',
      category: 'Music',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80',
      startingPrice: 300000,
      currentBid: 300000,
      reservePrice: 350000,
      status: 'upcoming',
      startTime: new Date(now + 5 * 3600000),
      endTime: new Date(now + 12 * 3600000),
      totalBids: 0,
      watchers: 62,
      createdBy: admin._id,
    },
    {
      title: 'Nike Air Jordan 1 Retro High OG',
      description: 'DS (deadstock) Jordan 1 Chicago Lost & Found. Size 10 US. Includes original receipt. Ultra rare.',
      category: 'Sneakers',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      startingPrice: 25000,
      currentBid: 42000,
      reservePrice: 40000,
      status: 'ended',
      startTime: new Date(now - 24 * 3600000),
      endTime: new Date(now - 1 * 3600000),
      totalBids: 5,
      watchers: 92,
      winner: { userId: user1._id.toString(), userName: user1.name },
      createdBy: admin._id,
    },
  ])
  console.log('🏷️  Auctions created')

  // ─── Bids ─────────────────────────────────────────────────────────────────
  const macbook = auctions[0]
  const ps5 = auctions[1]
  const rolex = auctions[2]
  const jordan = auctions[5]

  await Bid.insertMany([
    // MacBook bids
    { auctionId: macbook._id, userId: user1._id, userName: user1.name, amount: 155000, createdAt: new Date(now - 90 * 60000) },
    { auctionId: macbook._id, userId: user2._id, userName: user2.name, amount: 168000, createdAt: new Date(now - 60 * 60000) },
    { auctionId: macbook._id, userId: user3._id, userName: user3.name, amount: 175000, createdAt: new Date(now - 40 * 60000) },
    { auctionId: macbook._id, userId: user2._id, userName: user2.name, amount: 187000, createdAt: new Date(now - 10 * 60000) },
    // PS5 bids
    { auctionId: ps5._id, userId: user3._id, userName: user3.name, amount: 63000, createdAt: new Date(now - 50 * 60000) },
    { auctionId: ps5._id, userId: user2._id, userName: user2.name, amount: 68000, createdAt: new Date(now - 30 * 60000) },
    { auctionId: ps5._id, userId: user3._id, userName: user3.name, amount: 74500, createdAt: new Date(now - 10 * 60000) },
    // Rolex bids
    { auctionId: rolex._id, userId: user4._id, userName: user4.name, amount: 850000, createdAt: new Date(now - 120 * 60000) },
    { auctionId: rolex._id, userId: user2._id, userName: user2.name, amount: 950000, createdAt: new Date(now - 60 * 60000) },
    // Jordan bids (ended)
    { auctionId: jordan._id, userId: user3._id, userName: user3.name, amount: 28000, createdAt: new Date(now - 20 * 3600000) },
    { auctionId: jordan._id, userId: user2._id, userName: user2.name, amount: 33000, createdAt: new Date(now - 18 * 3600000) },
    { auctionId: jordan._id, userId: user3._id, userName: user3.name, amount: 37000, createdAt: new Date(now - 15 * 3600000) },
    { auctionId: jordan._id, userId: user2._id, userName: user2.name, amount: 39000, createdAt: new Date(now - 10 * 3600000) },
    { auctionId: jordan._id, userId: user1._id, userName: user1.name, amount: 42000, createdAt: new Date(now - 2 * 3600000) },
  ])
  console.log('💸 Bids created')

  // ─── Transactions ─────────────────────────────────────────────────────────
  await Transaction.insertMany([
    { userId: user1._id, type: 'credit', amount: 100000, description: 'Wallet top-up via UPI', createdAt: new Date(now - 2 * 86400000) },
    { userId: user1._id, type: 'debit', amount: 42000, description: 'Bid placed — Nike Air Jordan 1', createdAt: new Date(now - 2 * 3600000) },
    { userId: user1._id, type: 'credit', amount: 50000, description: 'Wallet top-up via Net Banking', createdAt: new Date(now - 3 * 86400000) },
    { userId: user2._id, type: 'credit', amount: 300000, description: 'Wallet top-up via UPI', createdAt: new Date(now - 5 * 86400000) },
  ])
  console.log('💳 Transactions created')

  console.log('\n🎉 Seed complete!\n')
  console.log('─────────────────────────────────────────')
  console.log('Admin login:  admin@bidmasters.in  / admin123')
  console.log('Bidder login: user@bidmasters.in   / user1234')
  console.log('─────────────────────────────────────────')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
