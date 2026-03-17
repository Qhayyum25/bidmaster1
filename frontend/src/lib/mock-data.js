// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

// ─── Countdown helper ─────────────────────────────────────────────────────────

export function getCountdown(endTime) {
  const diff = new Date(endTime) - Date.now()
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { hours, minutes, seconds, expired: false }
}

// ─── Mock auction data ────────────────────────────────────────────────────────

const now = Date.now()

export const MOCK_AUCTIONS = [
  {
    id: 'a1',
    title: 'Apple MacBook Pro 16" M3 Max',
    description: 'Brand new, sealed box. Latest M3 Max chip with 128GB RAM, 4TB SSD. Absolute powerhouse for creators and developers.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    startingPrice: 150000,
    currentBid: 187000,
    reservePrice: 200000,
    status: 'live',
    startTime: new Date(now - 2 * 3600000).toISOString(),
    endTime: new Date(now + 3 * 3600000).toISOString(),
    totalBids: 24,
    watchers: 87,
    winner: null,
    bids: [
      { id: 'b1', userId: 'u2', userName: 'Priya S.', amount: 187000, time: new Date(now - 5 * 60000).toISOString() },
      { id: 'b2', userId: 'u3', userName: 'Rahul K.', amount: 182000, time: new Date(now - 12 * 60000).toISOString() },
      { id: 'b3', userId: 'u4', userName: 'Anjali M.', amount: 175000, time: new Date(now - 25 * 60000).toISOString() },
      { id: 'b4', userId: 'u5', userName: 'Vikram P.', amount: 168000, time: new Date(now - 40 * 60000).toISOString() },
    ],
  },
  {
    id: 'a2',
    title: 'Sony PlayStation 5 Pro Bundle',
    description: 'PS5 Pro console with 3 controllers, 8 games including Spider-Man 2, God of War Ragnarök. Mint condition.',
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80',
    startingPrice: 60000,
    currentBid: 74500,
    reservePrice: 80000,
    status: 'live',
    startTime: new Date(now - 1 * 3600000).toISOString(),
    endTime: new Date(now + 1.5 * 3600000).toISOString(),
    totalBids: 18,
    watchers: 53,
    winner: null,
    bids: [
      { id: 'b5', userId: 'u3', userName: 'Rahul K.', amount: 74500, time: new Date(now - 3 * 60000).toISOString() },
      { id: 'b6', userId: 'u2', userName: 'Priya S.', amount: 71000, time: new Date(now - 8 * 60000).toISOString() },
      { id: 'b7', userId: 'u4', userName: 'Anjali M.', amount: 68000, time: new Date(now - 20 * 60000).toISOString() },
    ],
  },
  {
    id: 'a3',
    title: 'Rolex Submariner 126610LN',
    description: 'Authentic Rolex Submariner in black dial/bezel. Box and papers included. 2023 purchase, immaculate condition.',
    category: 'Watches',
    image: 'https://images.unsplash.com/photo-1548171915-f6ef99d8f9e9?w=400&q=80',
    startingPrice: 800000,
    currentBid: 950000,
    reservePrice: 1000000,
    status: 'live',
    startTime: new Date(now - 4 * 3600000).toISOString(),
    endTime: new Date(now + 0.5 * 3600000).toISOString(),
    totalBids: 7,
    watchers: 134,
    winner: null,
    bids: [
      { id: 'b8', userId: 'u5', userName: 'Vikram P.', amount: 950000, time: new Date(now - 10 * 60000).toISOString() },
      { id: 'b9', userId: 'u2', userName: 'Priya S.', amount: 920000, time: new Date(now - 35 * 60000).toISOString() },
    ],
  },
  {
    id: 'a4',
    title: 'DJI Mavic 3 Pro Drone',
    description: 'Brand new DJI Mavic 3 Pro with Fly More combo. Hasselbland camera system, 43min flight time.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80',
    startingPrice: 80000,
    currentBid: 80000,
    reservePrice: 90000,
    status: 'upcoming',
    startTime: new Date(now + 2 * 3600000).toISOString(),
    endTime: new Date(now + 6 * 3600000).toISOString(),
    totalBids: 0,
    watchers: 29,
    winner: null,
    bids: [],
  },
  {
    id: 'a5',
    title: 'Vintage Gibson Les Paul 1959 Reissue',
    description: 'Gibson Custom Shop 1959 Les Paul Standard Reissue in Lemon Burst. Stunning flame maple top.',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80',
    startingPrice: 300000,
    currentBid: 300000,
    reservePrice: 350000,
    status: 'upcoming',
    startTime: new Date(now + 5 * 3600000).toISOString(),
    endTime: new Date(now + 12 * 3600000).toISOString(),
    totalBids: 0,
    watchers: 62,
    winner: null,
    bids: [],
  },
  {
    id: 'a6',
    title: 'Nike Air Jordan 1 Retro High OG',
    description: 'DS (deadstock) Jordan 1 Chicago Lost & Found. Size 10 US. Includes original receipt from Nike. Ultra rare.',
    category: 'Sneakers',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    startingPrice: 25000,
    currentBid: 42000,
    reservePrice: 40000,
    status: 'ended',
    startTime: new Date(now - 24 * 3600000).toISOString(),
    endTime: new Date(now - 1 * 3600000).toISOString(),
    totalBids: 31,
    watchers: 92,
    winner: { userId: 'u1', userName: 'You' },
    bids: [
      { id: 'b10', userId: 'u1', userName: 'You', amount: 42000, time: new Date(now - 65 * 60000).toISOString() },
      { id: 'b11', userId: 'u3', userName: 'Rahul K.', amount: 39000, time: new Date(now - 80 * 60000).toISOString() },
    ],
  },
]

export const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'credit', amount: 100000, description: 'Wallet top-up via UPI', time: new Date(now - 2 * 86400000).toISOString() },
  { id: 't2', type: 'debit', amount: 42000, description: 'Bid placed — Nike Air Jordan 1', time: new Date(now - 1 * 86400000).toISOString() },
  { id: 't3', type: 'credit', amount: 50000, description: 'Wallet top-up via Net Banking', time: new Date(now - 3 * 86400000).toISOString() },
  { id: 't4', type: 'debit', amount: 74500, description: 'Bid placed — Sony PS5 Pro', time: new Date(now - 0.5 * 3600000).toISOString() },
]

export const MOCK_USERS = [
  { id: 'u1', name: 'Qhayyum M.', email: 'user@bidmasters.in', role: 'bidder', credits: 133500, totalBids: 12, wins: 1, status: 'active', joined: new Date(now - 30 * 86400000).toISOString() },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@example.com', role: 'bidder', credits: 250000, totalBids: 45, wins: 7, status: 'active', joined: new Date(now - 60 * 86400000).toISOString() },
  { id: 'u3', name: 'Rahul Kumar', email: 'rahul@example.com', role: 'bidder', credits: 89000, totalBids: 28, wins: 3, status: 'active', joined: new Date(now - 15 * 86400000).toISOString() },
  { id: 'u4', name: 'Anjali Mehta', email: 'anjali@example.com', role: 'bidder', credits: 45000, totalBids: 9, wins: 1, status: 'active', joined: new Date(now - 45 * 86400000).toISOString() },
  { id: 'u5', name: 'Vikram Patel', email: 'vikram@example.com', role: 'bidder', credits: 750000, totalBids: 67, wins: 12, status: 'active', joined: new Date(now - 90 * 86400000).toISOString() },
  { id: 'admin', name: 'Admin', email: 'admin@bidmasters.in', role: 'admin', credits: 0, totalBids: 0, wins: 0, status: 'active', joined: new Date(now - 180 * 86400000).toISOString() },
]

// ─── AI suggestion (local fallback) ──────────────────────────────────────────

export function getAISuggestion(auction) {
  const timeLeft = new Date(auction.endTime) - Date.now()
  const timeLeftHours = timeLeft / 3600000
  const priceRatio = auction.currentBid / auction.reservePrice
  const bidVelocity = auction.totalBids / Math.max(1, (Date.now() - new Date(auction.startTime)) / 3600000)

  let riskLevel = 'low'
  let winProbability = 72

  if (priceRatio > 0.9) { riskLevel = 'high'; winProbability = 45 }
  else if (priceRatio > 0.75) { riskLevel = 'medium'; winProbability = 61 }

  if (timeLeftHours < 0.5) winProbability = Math.min(winProbability + 15, 90)
  if (bidVelocity > 5) { riskLevel = 'high'; winProbability = Math.max(winProbability - 10, 30) }

  const increment = auction.currentBid < 100000 ? 1500 : auction.currentBid < 500000 ? 5000 : 10000
  const recommendedBid = auction.currentBid + increment

  const reasoningMap = {
    low: `Bid velocity is moderate at ${bidVelocity.toFixed(1)} bids/hr. With ${timeLeftHours.toFixed(1)}h remaining, a strategic increment should hold the lead.`,
    medium: `Auction heating up — ${auction.totalBids} bids placed. Recommend a confident jump to deter competitors before the final push.`,
    high: `High competition detected. Price near reserve (${Math.round(priceRatio * 100)}%). Consider if the value justifies aggressive bidding.`,
  }

  return {
    recommendedBid,
    winProbability,
    riskLevel,
    reasoning: reasoningMap[riskLevel],
  }
}
