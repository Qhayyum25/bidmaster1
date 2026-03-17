import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, ShieldOff, Shield, CreditCard, Trophy, Gavel, Crown } from 'lucide-react'
import { MOCK_USERS, formatCurrency, formatDate } from '../../lib/mock-data'
import { useNotifications } from '../../contexts/NotificationContext'

export default function UserManagement() {
  const { addNotification } = useNotifications()
  const [users, setUsers] = useState([...MOCK_USERS])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [creditAmount, setCreditAmount] = useState('')

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSuspend = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      const newStatus = u.status === 'active' ? 'suspended' : 'active'
      addNotification({
        type: newStatus === 'suspended' ? 'warning' : 'success',
        title: newStatus === 'suspended' ? 'User Suspended' : 'User Reinstated',
        message: `${u.name}'s account has been ${newStatus}.`,
      })
      return { ...u, status: newStatus }
    }))
  }

  const assignCredits = (userId, amount) => {
    if (!amount || isNaN(amount)) return
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      const updated = { ...u, credits: u.credits + Number(amount) }
      addNotification({ type: 'success', title: 'Credits Assigned', message: `${formatCurrency(Number(amount))} added to ${u.name}` })
      return updated
    }))
    setCreditAmount('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 text-sm mt-0.5">View and manage all registered bidders</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.filter(u => u.role !== 'admin').length, icon: Users, color: 'text-blue-400' },
          { label: 'Active', value: users.filter(u => u.status === 'active' && u.role !== 'admin').length, icon: Shield, color: 'text-emerald-400' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: ShieldOff, color: 'text-red-400' },
          { label: 'Top Bidder', value: [...users].sort((a, b) => b.totalBids - a.totalBids)[0]?.name?.split(' ')[0] || '—', icon: Trophy, color: 'text-amber-400' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* User table */}
        <div className="flex-1 card overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input className="input w-full pl-9" placeholder="Search users..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium text-right">Credits</th>
                  <th className="px-4 py-3 font-medium text-right">Bids/Wins</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`hover:bg-gray-800/30 transition-colors cursor-pointer ${selected?.id === u.id ? 'bg-amber-500/5' : ''}`}
                    onClick={() => setSelected(u)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-white">{u.name}</p>
                            {u.role === 'admin' && <Crown className="w-3 h-3 text-amber-400" />}
                          </div>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400">{formatCurrency(u.credits)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-white">{u.totalBids}</span>
                      <span className="text-gray-500 text-xs"> / {u.wins} wins</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${u.status === 'active' ? 'badge-won' : 'badge-live'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={e => { e.stopPropagation(); toggleSuspend(u.id) }}
                          className={`p-1.5 rounded-lg transition-all text-xs font-medium ${
                            u.status === 'active'
                              ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User detail panel */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-72 card p-5 space-y-4 self-start"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg font-bold text-amber-400">
                {selected.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-white">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { label: 'Balance', value: formatCurrency(selected.credits), mono: true },
                { label: 'Total Bids', value: selected.totalBids },
                { label: 'Auctions Won', value: selected.wins },
                { label: 'Win Rate', value: `${selected.totalBids > 0 ? Math.round((selected.wins / selected.totalBids) * 100) : 0}%` },
                { label: 'Joined', value: formatDate(selected.joined) },
                { label: 'Status', value: selected.status },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-medium ${item.mono ? 'font-mono text-amber-400' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {selected.role !== 'admin' && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Assign Credits</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="input flex-1 font-mono text-sm"
                    placeholder="Amount ₹"
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value)}
                  />
                  <button
                    onClick={() => assignCredits(selected.id, creditAmount)}
                    className="btn-primary px-3"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {[1000, 5000, 10000].map(amt => (
                    <button key={amt} onClick={() => assignCredits(selected.id, amt)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg py-1.5 font-mono transition-colors border border-gray-700">
                      +{amt >= 1000 ? `${amt/1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
