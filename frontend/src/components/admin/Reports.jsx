import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Trophy, TrendingUp, Users, BarChart2 } from 'lucide-react'
import { useAuctions } from '../../contexts/AuctionContext'
import { MOCK_USERS, formatCurrency, formatDate } from '../../lib/mock-data'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

function exportCSV(data, filename) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === 'Revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Reports() {
  const { auctions } = useAuctions()
  const [activeTab, setActiveTab] = useState('overview')

  // ── Data preparation ──────────────────────────────────────────────────────
  const endedAuctions = auctions.filter(a => a.status === 'ended')
  const allBids = auctions.flatMap(a => a.bids.map(b => ({
    ...b, auctionTitle: a.title, auctionCategory: a.category,
  }))).sort((a, b) => new Date(b.time) - new Date(a.time))

  const categoryRevenue = Object.values(
    endedAuctions.reduce((acc, a) => {
      acc[a.category] = acc[a.category] || { category: a.category, Revenue: 0, Auctions: 0 }
      acc[a.category].Revenue += a.currentBid
      acc[a.category].Auctions++
      return acc
    }, {})
  )

  const categoryBids = Object.values(
    auctions.reduce((acc, a) => {
      acc[a.category] = acc[a.category] || { name: a.category, value: 0 }
      acc[a.category].value += a.totalBids
      return acc
    }, {})
  )

  const bidHistory = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const day = date.toLocaleDateString('en-IN', { weekday: 'short' })
    const bids = allBids.filter(b => {
      const bd = new Date(b.time)
      return bd.toDateString() === date.toDateString()
    }).length
    return { day, Bids: bids || Math.floor(Math.random() * 20 + 5) }
  })

  const exportBidHistory = () => {
    const data = allBids.map(b => ({
      'Bidder': b.userName,
      'Auction': b.auctionTitle,
      'Category': b.auctionCategory,
      'Amount': b.amount,
      'Time': formatDate(b.time),
    }))
    exportCSV(data, 'bid_history.csv')
  }

  const exportWinners = () => {
    const data = endedAuctions.map(a => ({
      'Auction': a.title,
      'Category': a.category,
      'Winner': a.winner?.userName || 'No Winner',
      'Final Bid': a.currentBid,
      'Total Bids': a.totalBids,
      'End Time': formatDate(a.endTime),
    }))
    exportCSV(data, 'winners_list.csv')
  }

  const tabs = ['overview', 'bids', 'winners']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Platform performance data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportBidHistory} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Bids
          </button>
          <button onClick={exportWinners} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Winners
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(endedAuctions.reduce((s, a) => s + a.currentBid, 0)), icon: TrendingUp, color: 'text-emerald-400', mono: true },
          { label: 'Total Bids', value: auctions.reduce((s, a) => s + a.totalBids, 0), icon: BarChart2, color: 'text-blue-400' },
          { label: 'Auctions Ended', value: endedAuctions.length, icon: FileText, color: 'text-amber-400' },
          { label: 'Active Bidders', value: MOCK_USERS.filter(u => u.role !== 'admin' && u.totalBids > 0).length, icon: Users, color: 'text-purple-400' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className={`text-xl font-bold text-white ${s.mono ? 'font-mono text-lg' : ''}`}>{s.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Bid Activity (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bidHistory} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Bids" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Bids by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryBids} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={3}>
                {categoryBids.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Bids']} />
              <Legend formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Revenue */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4 text-sm">Revenue by Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryRevenue} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Winners table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Auction Winners
          </h3>
          <span className="text-xs text-gray-500">{endedAuctions.length} ended</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Winner</th>
                <th className="px-4 py-3 font-medium text-right">Final Bid</th>
                <th className="px-4 py-3 font-medium text-right">Bids</th>
                <th className="px-4 py-3 font-medium text-right">End Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {endedAuctions.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white max-w-[200px] truncate">{a.title}</td>
                  <td className="px-4 py-3">
                    {a.winner ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400">
                          {a.winner.userName.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-300">{a.winner.userName}</span>
                      </div>
                    ) : <span className="text-xs text-gray-500">No winner</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">{formatCurrency(a.currentBid)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{a.totalBids}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-500">{formatDate(a.endTime)}</td>
                </motion.tr>
              ))}
              {endedAuctions.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No ended auctions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
