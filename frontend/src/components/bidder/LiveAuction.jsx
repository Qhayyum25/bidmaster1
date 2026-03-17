import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Eye, Gavel, Clock, TrendingUp, Plus, Minus,
  ChevronUp, AlertCircle, Trophy, Users, Zap,
} from 'lucide-react'
import { useAuctions } from '../../contexts/AuctionContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatCurrency, getCountdown, timeAgo } from '../../lib/mock-data'
import SmartBidPanel from '../shared/SmartBidPanel'

function CountdownLarge({ endTime, status }) {
  const [cd, setCd] = useState(getCountdown(endTime))
  useEffect(() => {
    if (status !== 'live') return
    const t = setInterval(() => setCd(getCountdown(endTime)), 1000)
    return () => clearInterval(t)
  }, [endTime, status])

  const urgent = cd.hours === 0 && cd.minutes < 10
  return (
    <div className={`flex items-center gap-3 font-mono text-3xl font-bold ${urgent ? 'text-red-400' : 'text-white'}`}>
      {[
        { val: cd.hours, label: 'h' },
        { val: cd.minutes, label: 'm' },
        { val: cd.seconds, label: 's' },
      ].map(({ val, label }, i) => (
        <div key={label} className="flex items-end gap-1">
          {i > 0 && <span className="text-gray-600 mb-1">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[3rem] text-center">
              {String(val).padStart(2, '0')}
            </div>
            <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function BidRow({ bid, isNew, currentUserId }) {
  const isMe = bid.userId === currentUserId
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: -12, backgroundColor: 'rgba(245,158,11,0.15)' } : false}
      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(0,0,0,0)' }}
      transition={{ duration: 0.6 }}
      className="bid-row"
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          isMe ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-400'
        }`}>
          {bid.userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className={`text-sm font-medium ${isMe ? 'text-amber-400' : 'text-white'}`}>
            {isMe ? 'You' : bid.userName}
          </p>
          <p className="text-[10px] text-gray-500">{timeAgo(bid.time)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-bold text-white text-sm">{formatCurrency(bid.amount)}</p>
        {isMe && <p className="text-[9px] text-amber-400">Your bid</p>}
      </div>
    </motion.div>
  )
}

export default function LiveAuction() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAuction, placeBid } = useAuctions()
  const { user, updateCredits } = useAuth()
  const { addNotification } = useNotifications()

  const [customBid, setCustomBid] = useState('')
  const [bidding, setBidding] = useState(false)
  const [lastBidCount, setLastBidCount] = useState(0)
  const prevBidsRef = useRef([])

  const auction = getAuction(id)

  useEffect(() => {
    if (!auction) return
    setLastBidCount(auction.totalBids)
  }, [])

  // Track new bids for animation
  const newBidIds = useRef(new Set())
  useEffect(() => {
    if (!auction) return
    const currentIds = new Set(auction.bids.map(b => b.id))
    const prevIds = new Set(prevBidsRef.current.map(b => b.id))
    newBidIds.current = new Set([...currentIds].filter(id => !prevIds.has(id)))
    prevBidsRef.current = auction.bids

    // Check if outbid
    if (auction.bids.length > 0) {
      const top = auction.bids[0]
      if (top.userId !== user?.id && prevBidsRef.current.some(b => b.userId === user?.id)) {
        // addNotification({ type: 'outbid', title: 'You\'ve been outbid!', message: `${top.userName} bid ${formatCurrency(top.amount)}` })
      }
    }
  }, [auction?.bids])

  const handleBid = useCallback(async (amount) => {
    if (!user) return
    if (!amount || isNaN(amount)) {
      addNotification({ type: 'warning', title: 'Invalid Bid', message: 'Please enter a valid bid amount.' })
      return
    }
    if (amount <= auction.currentBid) {
      addNotification({ type: 'warning', title: 'Bid Too Low', message: `Bid must exceed ${formatCurrency(auction.currentBid)}` })
      return
    }
    if (amount > user.credits) {
      addNotification({ type: 'warning', title: 'Insufficient Credits', message: `You need ${formatCurrency(amount - user.credits)} more credits.` })
      return
    }
    setBidding(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = placeBid(auction.id, user.id, user.name, amount)
    if (ok) {
      updateCredits(-amount)
      addNotification({ type: 'winning', title: 'Bid Placed!', message: `You bid ${formatCurrency(amount)} on ${auction.title}` })
      setCustomBid('')
    }
    setBidding(false)
  }, [auction, user, placeBid, updateCredits, addNotification])

  if (!auction) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <p>Auction not found.</p>
      <button onClick={() => navigate('/marketplace')} className="mt-3 btn-secondary text-sm">
        Back to Marketplace
      </button>
    </div>
  )

  const minBid = auction.currentBid + (auction.currentBid < 100000 ? 500 : auction.currentBid < 500000 ? 2000 : 5000)
  const quickBids = [minBid, minBid + (minBid * 0.02), minBid + (minBid * 0.05)].map(Math.round)

  const isLeading = auction.bids[0]?.userId === user?.id
  const myLastBid = auction.bids.find(b => b.userId === user?.id)

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Back */}
      <button onClick={() => navigate('/marketplace')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left — image & info */}
        <div className="xl:col-span-3 space-y-4">
          {/* Image */}
          <div className="card overflow-hidden relative aspect-[16/9]">
            <img
              src={auction.image}
              alt={auction.title}
              className="w-full h-full object-cover"
              onError={e => e.target.parentElement.classList.add('bg-gray-800')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {auction.status === 'live' ? (
                <span className="badge badge-live backdrop-blur-sm">
                  <div className="live-dot w-1.5 h-1.5" /> Live
                </span>
              ) : (
                <span className={`badge ${auction.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended'}`}>
                  {auction.status}
                </span>
              )}
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-300">{auction.watchers} watching</span>
            </div>
          </div>

          {/* Title & details */}
          <div className="card p-5 space-y-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">{auction.category}</span>
              <h1 className="text-xl font-bold text-white mt-1">{auction.title}</h1>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{auction.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Starting Price</p>
                <p className="font-mono font-bold text-gray-300">{formatCurrency(auction.startingPrice)}</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Bids</p>
                <div className="flex items-center gap-1">
                  <Gavel className="w-3.5 h-3.5 text-gray-400" />
                  <p className="font-mono font-bold text-white">{auction.totalBids}</p>
                </div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Watchers</p>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <p className="font-mono font-bold text-white">{auction.watchers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bid history */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Live Bid Feed
              </h3>
              <span className="text-xs text-gray-500">{auction.bids.length} recent bids</span>
            </div>
            <div className="space-y-0">
              {auction.bids.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No bids yet — be the first!</p>
              ) : (
                auction.bids.map((bid, i) => (
                  <BidRow
                    key={bid.id}
                    bid={bid}
                    isNew={i === 0 && newBidIds.current.has(bid.id)}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right — bidding panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Current bid */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-400">Current Bid</p>
              {isLeading && (
                <span className="badge badge-won flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Leading
                </span>
              )}
            </div>
            <motion.p
              key={auction.currentBid}
              initial={{ scale: 1.05, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="font-mono text-4xl font-bold text-white"
            >
              {formatCurrency(auction.currentBid)}
            </motion.p>
            {auction.bids[0] && (
              <p className="text-xs text-gray-500 mt-1">
                by {auction.bids[0].userId === user?.id ? 'You' : auction.bids[0].userName} · {timeAgo(auction.bids[0].time)}
              </p>
            )}
          </div>

          {/* Countdown */}
          {auction.status === 'live' && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-medium text-gray-300">Time Remaining</p>
              </div>
              <CountdownLarge endTime={auction.endTime} status={auction.status} />
            </div>
          )}

          {/* Bidding controls */}
          {auction.status === 'live' && (
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Place Bid
              </h3>

              {/* Quick bid buttons */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Quick bids</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickBids.map((amt, i) => (
                    <button
                      key={amt}
                      onClick={() => handleBid(amt)}
                      disabled={bidding || amt > user?.credits}
                      className={`py-2.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                        i === 0
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom bid */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Custom amount</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      className="input w-full pl-7 font-mono"
                      placeholder={`Min ${formatCurrency(minBid)}`}
                      value={customBid}
                      onChange={e => setCustomBid(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleBid(Number(customBid))}
                      min={minBid}
                    />
                  </div>
                  <button
                    onClick={() => handleBid(Number(customBid))}
                    disabled={bidding || !customBid}
                    className="btn-primary px-4 disabled:opacity-50"
                  >
                    {bidding ? (
                      <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Balance display */}
              <div className="flex items-center justify-between text-xs bg-gray-800/60 rounded-lg px-3 py-2">
                <span className="text-gray-500">Your Balance</span>
                <span className="font-mono font-bold text-amber-400">{formatCurrency(user?.credits || 0)}</span>
              </div>

              {myLastBid && !isLeading && (
                <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>You've been outbid! Your last bid was {formatCurrency(myLastBid.amount)}</span>
                </div>
              )}
            </div>
          )}

          {/* Ended state */}
          {auction.status === 'ended' && (
            <div className="card p-5 text-center">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="font-bold text-white">Auction Ended</p>
              {auction.winner ? (
                <p className="text-sm text-gray-400 mt-1">
                  Won by {auction.winner.userId === user?.id ? 'You 🎉' : auction.winner.userName}
                  {' '}for {formatCurrency(auction.currentBid)}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">No winner</p>
              )}
            </div>
          )}

          {/* AI Smart Bid Panel */}
          <SmartBidPanel auction={auction} />
        </div>
      </div>
    </div>
  )
}
