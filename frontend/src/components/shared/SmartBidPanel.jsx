import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Target, TrendingUp, ShieldAlert, Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { formatCurrency, getAISuggestion } from '../../lib/mock-data'
import { useAuth } from '../../contexts/AuthContext'
import { useAuctions } from '../../contexts/AuctionContext'
import { useNotifications } from '../../contexts/NotificationContext'

// ─── Backend API call ──────────────────────────────────────────────────────────
async function fetchBackendAISuggestion(auction, userStats) {
  try {
    const res = await fetch('/api/ai/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auction, userStats }),
    })

    if (!res.ok) throw new Error('API Error')
    return await res.json()
  } catch (err) {
    console.error('AI Fetch Error:', err)
    return null
  }
}

const riskColors = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function SmartBidPanel({ auction }) {
  const { user, updateCredits } = useAuth()
  const { placeBid } = useAuctions()
  const { addNotification } = useNotifications()
  const [placed, setPlaced] = useState(false)
  const [suggestion, setSuggestion] = useState(() => getAISuggestion(auction))
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPowered, setAiPowered] = useState(false)

  if (auction.status !== 'live') return null

  const fetchAI = useCallback(async () => {
    setAiLoading(true)
    try {
      const result = await fetchBackendAISuggestion(auction, {
        wins: user?.wins || 0,
        totalBids: user?.totalBids || 0,
        credits: user?.credits || 0,
      })
      if (result) {
        setSuggestion(result)
        setAiPowered(true)
        addNotification({ type: 'info', title: 'AI Updated', message: 'Fresh Gemini-powered recommendation ready.' })
      } else {
        // Refresh local suggestion
        setSuggestion(getAISuggestion(auction))
        setAiPowered(false)
        addNotification({ type: 'warning', title: 'Using Smart Algorithm', message: 'Set VITE_GEMINI_API_KEY for full AI power.' })
      }
    } catch {
      setSuggestion(getAISuggestion(auction))
    } finally {
      setAiLoading(false)
    }
  }, [auction, user, addNotification])

  const handleSmartBid = useCallback(() => {
    if (!user) return
    if (suggestion.recommendedBid > user.credits) {
      addNotification({ type: 'warning', title: 'Insufficient Credits', message: 'Top up your wallet to place this bid.' })
      return
    }
    if (suggestion.recommendedBid <= auction.currentBid) {
      addNotification({ type: 'warning', title: 'Bid Too Low', message: 'Recommended bid is no longer competitive.' })
      return
    }
    const ok = placeBid(auction.id, user.id, user.name, suggestion.recommendedBid)
    if (ok) {
      updateCredits(-suggestion.recommendedBid)
      setPlaced(true)
      addNotification({
        type: 'winning',
        title: 'Smart Bid Placed!',
        message: `AI placed ${formatCurrency(suggestion.recommendedBid)} on ${auction.title}`,
      })
      setTimeout(() => setPlaced(false), 3000)
    }
  }, [user, suggestion, auction, placeBid, updateCredits, addNotification])

  return (
    <div className="card p-5 relative overflow-hidden border-amber-500/20">
      {/* Background shimmer */}
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
                {aiPowered ? '✦ Powered by Gemini' : 'Smart algorithm'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchAI}
            disabled={aiLoading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition-colors bg-gray-800 hover:bg-amber-500/10 border border-gray-700 hover:border-amber-500/30 px-2.5 py-1.5 rounded-lg"
          >
            <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
            {aiLoading ? 'Analysing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats grid */}
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

        {/* Insufficient credits warning */}
        {user && suggestion.recommendedBid > user.credits && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Insufficient credits. Top up wallet to use Smart Bid.
          </div>
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
                <Sparkles className="w-4 h-4" />
                Smart Bid — {formatCurrency(suggestion.recommendedBid)}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
