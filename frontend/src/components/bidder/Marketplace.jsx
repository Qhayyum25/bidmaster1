import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, Gavel, Clock, TrendingUp, Flame, Sparkles } from 'lucide-react'
import { useAuctions } from '../../contexts/AuctionContext'
import { formatCurrency, getCountdown, getAISuggestion } from '../../lib/mock-data'

function CountdownTimer({ endTime, status }) {
  const [countdown, setCountdown] = useState(getCountdown(endTime))

  useEffect(() => {
    if (status !== 'live') return
    const t = setInterval(() => setCountdown(getCountdown(endTime)), 1000)
    return () => clearInterval(t)
  }, [endTime, status])

  if (status === 'ended') return <span className="text-gray-500 text-xs">Ended</span>
  if (status === 'upcoming') {
    const start = getCountdown(new Date(endTime).getTime() - 4 * 3600000)
    return <span className="text-amber-400 text-xs font-mono">Starts soon</span>
  }
  if (countdown.expired) return <span className="text-red-400 text-xs">Ending...</span>

  const urgent = countdown.hours === 0 && countdown.minutes < 30
  return (
    <span className={`font-mono text-xs font-bold ${urgent ? 'text-red-400' : 'text-emerald-400'}`}>
      {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
    </span>
  )
}

function AuctionCard({ auction, index }) {
  const navigate = useNavigate()
  const statusConfig = {
    live: { label: 'Live', cls: 'badge-live', dot: true },
    upcoming: { label: 'Upcoming', cls: 'badge-upcoming', dot: false },
    ended: { label: 'Ended', cls: 'badge-ended', dot: false },
  }
  const sc = statusConfig[auction.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card card-hover cursor-pointer group overflow-hidden"
      onClick={() => auction.status === 'live' || auction.status === 'upcoming' ? navigate(`/auction/${auction.id}`) : null}
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-800 overflow-hidden">
        <img
          src={auction.image}
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`badge ${sc.cls} backdrop-blur-sm`}>
            {sc.dot && <div className="live-dot w-1.5 h-1.5" />}
            {sc.label}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] text-gray-300">{auction.watchers}</span>
          </div>
          {auction.status === 'live' && (
            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[9px] font-bold text-amber-400 whitespace-nowrap">
                {getAISuggestion(auction).winProbability}% Win Ch.
              </span>
            </div>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400">Current Bid</p>
            <p className="font-mono text-lg font-bold text-white">{formatCurrency(auction.currentBid)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Time Left</p>
            <CountdownTimer endTime={auction.endTime} status={auction.status} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{auction.category}</span>
        <h3 className="font-semibold text-white text-sm mt-1 mb-3 line-clamp-2 leading-snug">{auction.title}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Gavel className="w-3 h-3" />
            <span>{auction.totalBids} bids</span>
          </div>
          {auction.winner && (
            <span className="text-emerald-400 font-medium">You won! 🎉</span>
          )}
          {auction.status === 'live' && (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/auction/${auction.id}`) }}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
            >
              Bid now <TrendingUp className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Marketplace() {
  const { auctions } = useAuctions()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState('all')

  const categories = ['all', ...new Set(auctions.map(a => a.category))]

  const filtered = auctions.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'all' || a.status === filter
    const matchCat = category === 'all' || a.category === category
    return matchSearch && matchStatus && matchCat
  })

  const liveAuctions = auctions.filter(a => a.status === 'live')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-gray-400 text-sm mt-0.5">Discover and bid on premium items</p>
        </div>
        {liveAuctions.length > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">{liveAuctions.length} live now</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input w-full pl-9"
            placeholder="Search auctions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'live', 'upcoming', 'ended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-amber-500 text-gray-950'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No auctions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((auction, i) => (
            <AuctionCard key={auction.id} auction={auction} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
