const mongoose = require('mongoose')

// ─── User ─────────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['bidder', 'admin'], default: 'bidder' },
  credits: { type: Number, default: 10000 },
  totalBids: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
}, { timestamps: true })

// ─── Auction ─────────────────────────────────────────────────────────────────
const AuctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: 'Other' },
  image: String,
  startingPrice: { type: Number, required: true },
  currentBid: { type: Number },
  reservePrice: Number,
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  totalBids: { type: Number, default: 0 },
  watchers: { type: Number, default: 0 },
  winner: { userId: String, userName: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

AuctionSchema.pre('save', function (next) {
  if (!this.currentBid) this.currentBid = this.startingPrice
  next()
})

// ─── Bid ──────────────────────────────────────────────────────────────────────
const BidSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  amount: { type: Number, required: true },
}, { timestamps: true })

// ─── Transaction ──────────────────────────────────────────────────────────────
const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: String,
  reference: String,
}, { timestamps: true })

module.exports = {
  User: mongoose.model('User', UserSchema),
  Auction: mongoose.model('Auction', AuctionSchema),
  Bid: mongoose.model('Bid', BidSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema),
}
