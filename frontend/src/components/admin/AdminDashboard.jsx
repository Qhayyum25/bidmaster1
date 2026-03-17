import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2, Users, Gavel, TrendingUp, Activity,
  ArrowRight, Package, Sliders, FileText, Eye,
} from 'lucide-react'
import { useAuctions } from '../../contexts/AuctionContext'
import { MOCK_USERS, formatCurrency, timeAgo } from '../../lib/mock-data'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const bidData = [
  { time: '6h ago', bids: 12 }, { time: '5h ago', bids: 18 },
  { time: '4h ago', bids: 25 }, { time: '3h ago', bids: 31 },
  { time: '2h ago', bids: 22 }, { time: '1h ago', bids: 40 },
  { time: 'Now', bids: 56 },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-bold">{payload[0].value} bids</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { auctions, stats } = useAuctions()
  const navigate = useNavigate()

  const liveAuctions = auctions.filter(a => a.status === 'live')
  const recentBids = auctions
    .flatMap(a => a.bids.map(b => ({ ...b, auctionTitle: a.title })))
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8)

  const quickLinks = [
    { label: 'Add Item', icon: Package, path: '/admin/items', color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Manage Users', icon: Users, path: '/admin/users', color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Auction Control', icon: Sliders, path: '/admin/control', color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Reports', icon: FileText, path: '/admin/reports', color: 'text-emerald-400 bg-emerald-500/10' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Platform overview & controls</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Live Auctions', value: stats.live, icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Upcoming', value: stats.upcoming, icon: Gavel, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Ended', value: stats.ended, icon: Package, color: 'text-gray-400', bg: 'bg-gray-700/50' },
          { label: 'Total Bids', value: stats.totalBids, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Users', value: MOCK_USERS.filter(u => u.role !== 'admin').length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: BarChart2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', mono: true },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.bg}`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`font-bold text-white ${s.mono ? 'font-mono text-base' : 'text-2xl'}`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(link => {
          const Icon = link.icon
          return (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className="card card-hover p-4 flex flex-col gap-3 text-left"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${link.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Bid activity chart */}
        <div className="xl:col-span-3 card p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" /> Bid Activity
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={bidData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bids" stroke="#f59e0b" fill="url(#bidGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Live auctions */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <div className="live-dot" /> Live Now
            </h2>
            <button onClick={() => navigate('/admin/control')} className="text-xs text-amber-400 hover:underline">Manage →</button>
          </div>
          {liveAuctions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No live auctions</p>
          ) : (
            <div className="space-y-3">
              {liveAuctions.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover"
                      onError={e => e.target.style.display = 'none'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{a.title}</p>
                    <p className="text-[10px] text-gray-500">{a.totalBids} bids</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-xs font-bold text-amber-400">{formatCurrency(a.currentBid)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent bids */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Recent Bids
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="pb-3 font-medium">Bidder</th>
                <th className="pb-3 font-medium">Item</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentBids.map(b => (
                <tr key={b.id} className="border-b border-gray-800/50 last:border-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                        {b.userName.charAt(0)}
                      </div>
                      <span className="text-gray-300">{b.userName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-400 max-w-[200px] truncate">{b.auctionTitle}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">{formatCurrency(b.amount)}</td>
                  <td className="py-2.5 text-right text-gray-500 text-xs">{timeAgo(b.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
