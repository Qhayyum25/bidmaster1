import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, StopCircle, Clock, Zap, AlertTriangle, ChevronDown, Sliders } from 'lucide-react'
import { useAuctions } from '../../contexts/AuctionContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatCurrency, formatDate } from '../../lib/mock-data'

const STATUS_ACTIONS = {
  live: [
    { label: 'Pause', icon: Pause, action: 'upcoming', color: 'btn-secondary' },
    { label: 'Force Close', icon: StopCircle, action: 'ended', color: 'btn-danger' },
  ],
  upcoming: [
    { label: 'Go Live', icon: Play, action: 'live', color: 'btn-primary' },
    { label: 'Force Close', icon: StopCircle, action: 'ended', color: 'btn-danger' },
  ],
  ended: [
    { label: 'Reopen', icon: Play, action: 'upcoming', color: 'btn-secondary' },
  ],
}

function AuctionControlCard({ auction }) {
  const { updateAuctionStatus, extendAuction } = useAuctions()
  const { addNotification } = useNotifications()
  const [extendMin, setExtendMin] = useState(15)
  const [expanded, setExpanded] = useState(false)

  const actions = STATUS_ACTIONS[auction.status] || []

  const handleAction = (action) => {
    updateAuctionStatus(auction.id, action)
    const labels = { live: 'started', upcoming: 'paused', ended: 'closed' }
    addNotification({
      type: action === 'live' ? 'success' : action === 'ended' ? 'warning' : 'info',
      title: `Auction ${labels[action]}`,
      message: `"${auction.title}" is now ${action}.`,
    })
  }

  const handleExtend = () => {
    extendAuction(auction.id, extendMin)
    addNotification({ type: 'info', title: 'Auction Extended', message: `${auction.title} extended by ${extendMin} minutes.` })
  }

  return (
    <div className={`card overflow-hidden transition-all ${auction.status === 'live' ? 'border-red-500/20' : ''}`}>
      {auction.status === 'live' && (
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-pulse" />
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
            <img src={auction.image} alt={auction.title} className="w-full h-full object-cover"
              onError={e => e.target.style.display = 'none'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge text-[10px] ${
                auction.status === 'live' ? 'badge-live' :
                auction.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended'
              }`}>
                {auction.status === 'live' && <div className="live-dot w-1.5 h-1.5" />}
                {auction.status}
              </span>
              <span className="text-xs text-gray-500">{auction.category}</span>
            </div>
            <p className="font-semibold text-white text-sm mt-1 truncate">{auction.title}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>Current: <span className="text-amber-400 font-mono font-bold">{formatCurrency(auction.currentBid)}</span></span>
              <span>{auction.totalBids} bids</span>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-white p-1">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="mt-3 flex gap-2 flex-wrap">
          {actions.map(action => {
            const Icon = action.icon
            return (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                className={`${action.color} text-xs flex items-center gap-1.5 px-3 py-1.5`}
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            )
          })}
        </div>

        {/* Expanded controls */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 pt-4 border-t border-gray-800 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-gray-500 mb-1">Start Time</p>
                <p className="text-white font-medium">{formatDate(auction.startTime)}</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-gray-500 mb-1">End Time</p>
                <p className="text-white font-medium">{formatDate(auction.endTime)}</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-gray-500 mb-1">Reserve Price</p>
                <p className="text-white font-mono font-bold">{formatCurrency(auction.reservePrice)}</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-gray-500 mb-1">Watchers</p>
                <p className="text-white font-bold">{auction.watchers}</p>
              </div>
            </div>

            {auction.status === 'live' && (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1.5">Extend auction by (minutes)</p>
                  <div className="flex gap-1">
                    {[5, 10, 15, 30, 60].map(m => (
                      <button key={m} onClick={() => setExtendMin(m)}
                        className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${
                          extendMin === m
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                        }`}>{m}m</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleExtend} className="btn-secondary text-xs flex items-center gap-1.5 py-2 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" /> Extend +{extendMin}m
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function AuctionControl() {
  const { auctions } = useAuctions()
  const [filter, setFilter] = useState('all')

  const filtered = auctions.filter(a => filter === 'all' || a.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Auction Control</h1>
        <p className="text-gray-400 text-sm mt-0.5">Start, pause, extend, or close auctions in real time</p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400">Admin Controls</p>
          <p className="text-xs text-amber-400/70 mt-0.5">Actions here affect live auctions immediately. Force-closing an auction will notify all active bidders.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Live', count: auctions.filter(a => a.status === 'live').length, color: 'text-red-400' },
          { label: 'Upcoming', count: auctions.filter(a => a.status === 'upcoming').length, color: 'text-amber-400' },
          { label: 'Ended', count: auctions.filter(a => a.status === 'ended').length, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'live', 'upcoming', 'ended'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}>{f}</button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <AuctionControlCard auction={a} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
