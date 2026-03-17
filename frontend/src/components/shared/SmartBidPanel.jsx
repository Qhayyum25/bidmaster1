import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Target, TrendingUp, ShieldAlert, Sparkles, Check, RefreshCw, ThumbsUp, ThumbsDown, Minus as HoldIcon } from 'lucide-react'
import { formatCurrency, getAISuggestion } from '../../lib/mock-data'
import { useAuth } from '../../contexts/AuthContext'
import { useAuctions } from '../../contexts/AuctionContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { aiApi } from '../../lib/api'

const riskColors = {
  low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-amber-400  bg-amber-500/10  border-amber-500/30',
  high:   'text-red-400    bg-red-500/10    border-red-500/30',
}

function WinMeter({ percent }) {
  const color = percent >= 65 ? '#10b981' : percent >= 40 ? '#f59e0b' : '#ef4444'
  const radius = 38
  const circ   = 2 * Math.PI * radius
  const dash   = circ * (percent / 100)

  return (
    <div className="relative flex items-center justify-center w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-white leading-none">{percent}%</span>
        <span className="text-[9px] text-gray-400 uppercase tracking-widest">Win</span>
      </div>
    </div>
  )
}

function Recommendation({ winProbability, riskLevel }) {
  const shouldBid = winProbability >= 45 && riskLevel !== 'high'
  const isNeutral = winProbability >= 35 && winProbability < 45

  if (shouldBid) return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
        <ThumbsUp className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-emerald-400">✅ Recommended: BID</p>
        <p className="text-[11px] text-gray-400">Win probability is favourable. Smart bid is suggested.</p>
      </div>
    </div>
  )

  if (isNeutral) return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <HoldIcon className="w-4 h-4 text-amber-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-amber-400">⚠️ Caution: WAIT</p>
        <p className="text-[11px] text-gray-400">Marginal odds — consider waiting for the price to settle.</p>
      </div>
    </div>
  )

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
        <ThumbsDown className="w-4 h-4 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-red-400">❌ Advised: SKIP</p>
        <p className="text-[11px] text-gray-400">Low win probability or high risk — not worth the credits.</p>
      </div>
    </div>
  )
}

export default function SmartBidPanel({ auction }) {
  const { user, updateCredits } = useAuth()
  const { placeBid } = useAuctions()
  const { addNotification } = useNotifications()
  const [placed, setPlaced]       = useState(false)
  const [suggestion, setSuggestion] = useState(() => getAISuggestion(auction))
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPowered, setAiPowered] = useState(false)

  useEffect(() => {
    if (auction.status === 'live') fetchAI()
  }, [])

  const fetchAI = useCallback(async () => {
    if (auction.status !== 'live') return
    setAiLoading(true)
    try {
      const result = await aiApi.suggest(auction, {
        wins:      user?.wins      || 0,
        totalBids: user?.totalBids || 0,
        credits:   user?.credits   || 0,
      })
      if (result) { setSuggestion(result); setAiPowered(true) }
      else          setAiPowered(false)
    } catch {
      setSuggestion(getAISuggestion(auction))
      setAiPowered(false)
    } finally {
      setAiLoading(false)
    }
  }, [auction, user])

  const handleSmartBid = useCallback(async () => {
    if (!user) return
    if (suggestion.recommendedBid > user.credits) {
      addNotification({ type: 'warning', title: 'Insufficient Credits', message: 'Top up your wallet to place this bid.' })
      return
    }
    if (suggestion.recommendedBid <= (auction.currentBid || 0)) {
      addNotification({ type: 'warning', title: 'Bid Too Low', message: 'Recommended bid is no longer competitive. Refreshing...' })
      fetchAI(); return
    }
    setAiLoading(true)
    try {
      const { newBalance } = await placeBid(auction.id, user.id, user.name, suggestion.recommendedBid)
      updateCredits(newBalance - user.credits)
      setPlaced(true)
      addNotification({
        type: 'winning', title: 'Smart Bid Placed!',
        message: `AI placed ${formatCurrency(suggestion.recommendedBid)} on ${auction.title}`,
      })
      setTimeout(() => setPlaced(false), 3000)
    } catch (err) {
      addNotification({ type: 'warning', title: 'Bid Failed', message: err.message })
    } finally {
      setAiLoading(false)
    }
  }, [user, suggestion, auction, placeBid, updateCredits, addNotification, fetchAI])

  if (auction.status !== 'live') return null

  return (
    <div className="card p-5 relative overflow-hidden border-amber-500/20">
      <div className="absolute inset-0 shimmer pointer-events-none" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Smart Advisor</p>
              <p className="text-[10px] text-gray-500">
                {aiLoading ? 'Analysing auction...' : aiPowered ? '✦ Powered by Gemini' : 'Smart algorithm'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchAI} disabled={aiLoading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition-colors bg-gray-800 hover:bg-amber-500/10 border border-gray-700 hover:border-amber-500/30 px-2.5 py-1.5 rounded-lg"
          >
            <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Win Probability Meter */}
        {aiLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <WinMeter percent={suggestion.winProbability} />

            {/* BID / HOLD / SKIP Recommendation */}
            <Recommendation winProbability={suggestion.winProbability} riskLevel={suggestion.riskLevel} />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <Target className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <p className="font-mono text-sm font-bold text-amber-400">{formatCurrency(suggestion.recommendedBid)}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Recommended</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <p className="font-mono text-sm font-bold text-white">{suggestion.winProbability}%</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Win Chance</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <ShieldAlert className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold capitalize border ${riskColors[suggestion.riskLevel] || riskColors.low}`}>
                  {suggestion.riskLevel}
                </span>
                <p className="text-[9px] text-gray-500 mt-0.5">Risk</p>
              </div>
            </div>

            {/* Reasoning */}
            <p className="text-xs text-gray-400 leading-relaxed bg-gray-800/40 rounded-lg px-3 py-2.5 border border-gray-700/50">
              {suggestion.reasoning}
            </p>
          </>
        )}

        {/* Smart bid button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSmartBid}
          disabled={placed || aiLoading}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
            placed
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'btn-primary'
          } disabled:opacity-60`}
        >
          <AnimatePresence mode="wait">
            {placed ? (
              <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Bid Placed!
              </motion.span>
            ) : (
              <motion.span key="bid" className="flex items-center gap-2">
                {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Smart Bid — {formatCurrency(suggestion.recommendedBid)}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
