import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Gavel, Eye, Clock, TrendingUp, Award, Package } from 'lucide-react'
import { useAuctions } from '../../contexts/AuctionContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, formatDate, getCountdown } from '../../lib/mock-data'
import { useState, useEffect } from 'react'

function CountdownSmall({ endTime }) {
  const [cd, setcd] = useState(getCountdown(endTime))
  useEffect(() => {
    const t = setInterval(() => setcd(getCountdown(endTime)), 1000)
    return () => clearInterval(t)
  }, [endTime])
  if (cd.expired) return <span className="text-red-400 text-xs font-mono">Ending</span>
  return (
    <span className="font-mono text-xs text-emerald-400">
      {String(cd.hours).padStart(2,'0')}:{String(cd.minutes).padStart(2,'0')}:{String(cd.seconds).padStart(2,'0')}
    </span>
  )
}

export default function MyAuctions() {
  const { auctions } = useAuctions()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('active')

  const myBidIds = new Set(
    auctions
      .filter(a => a.bids.some(b => b.userId === user?.id))
      .map(a => a.id)
  )

  const activeBids = auctions.filter(a =>
    a.status === 'live' && a.bids.some(b => b.userId === user?.id)
  )
  const wonAuctions = auctions.filter(a =>
    a.status === 'ended' && a.winner?.userId === user?.id
  )
  const lostAuctions = auctions.filter(a =>
    a.status === 'ended' &&
    a.bids.some(b => b.userId === user?.id) &&
    a.winner?.userId !== user?.id
  )

  const tabs = [
    { id: 'active', label: 'Active Bids', count: activeBids.length, icon: TrendingUp },
    { id: 'won', label: 'Won', count: wonAuctions.length, icon: Trophy },
    { id: 'lost', label: 'Lost', count: lostAuctions.length, icon: Package },
  ]

  const displayList = tab === 'active' ? activeBids : tab === 'won' ? wonAuctions : lostAuctions

  const stats = {
    totalBids: [...myBidIds].reduce((sum, id) => {
      const a = auctions.find(x => x.id === id)
      return sum + (a?.bids.filter(b => b.userId === user?.id).length || 0)
    }, 0),
    won: wonAuctions.length,
    winRate: myBidIds.size > 0 ? Math.round((wonAuctions.length / myBidIds.size) * 100) : 0,
    totalSpent: wonAuctions.reduce((sum, a) => sum + a.currentBid, 0),
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">My Auctions</h1>
        <p className="text-gray-400 text-sm mt-0.5">Track your bidding activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Auctions Entered', value: myBidIds.size, icon: Gavel, color: 'text-blue-400' },
          { label: 'Auctions Won', value: stats.won, icon: Trophy, color: 'text-amber-400' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: Award, color: 'text-emerald-400' },
          { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: TrendingUp, color: 'text-red-400', mono: true },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold text-white ${s.mono ? 'font-mono text-lg' : ''}`}>
                {s.value}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1 w-fit">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-gray-950/20' : 'bg-gray-700 text-gray-300'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Auction list */}
      {displayList.length === 0 ? (
        <div className="card p-16 text-center text-gray-500">
          {tab === 'active' && <><TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No active bids.</p><p className="text-xs mt-1">Head to the Marketplace to find auctions!</p></>}
          {tab === 'won' && <><Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No wins yet.</p><p className="text-xs mt-1">Keep bidding — your first win is coming!</p></>}
          {tab === 'lost' && <><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No lost auctions.</p></>}
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((auction, i) => {
            const myBid = [...auction.bids].filter(b => b.userId === user?.id).sort((a, b) => b.amount - a.amount)[0]
            const isLeading = auction.bids[0]?.userId === user?.id
            const won = auction.winner?.userId === user?.id

            return (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card card-hover p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/auction/${auction.id}`)}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  <img src={auction.image} alt={auction.title} className="w-full h-full object-cover"
                    onError={e => e.target.style.display = 'none'} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-gray-500">{auction.category}</span>
                    {won && <span className="badge badge-won text-[10px]"><Trophy className="w-2.5 h-2.5" /> Won</span>}
                    {tab === 'active' && isLeading && <span className="badge badge-won text-[10px]">Leading</span>}
                    {tab === 'active' && !isLeading && <span className="badge badge-live text-[10px]">Outbid</span>}
                  </div>
                  <p className="font-semibold text-white text-sm truncate">{auction.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{auction.totalBids} total bids</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">Your Bid</p>
                    <p className="font-mono font-bold text-sm text-white">{myBid ? formatCurrency(myBid.amount) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">
                      {tab === 'active' ? 'Current' : 'Final'}
                    </p>
                    <p className="font-mono font-bold text-sm text-amber-400">{formatCurrency(auction.currentBid)}</p>
                  </div>
                  {tab === 'active' && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Ends in</p>
                      <CountdownSmall endTime={auction.endTime} />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
