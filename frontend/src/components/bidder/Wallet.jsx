import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, Building2, CheckCircle, History } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatCurrency, formatDate, MOCK_TRANSACTIONS } from '../../lib/mock-data'

const PACKAGES = [
  { amount: 10000, label: '₹10,000', bonus: 0, popular: false },
  { amount: 25000, label: '₹25,000', bonus: 1000, popular: false },
  { amount: 50000, label: '₹50,000', bonus: 3000, popular: true },
  { amount: 100000, label: '₹1,00,000', bonus: 8000, popular: false },
  { amount: 250000, label: '₹2,50,000', bonus: 25000, popular: false },
  { amount: 500000, label: '₹5,00,000', bonus: 75000, popular: false },
]

const METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
]

export default function Wallet() {
  const { user, updateCredits } = useAuth()
  const { addNotification } = useNotifications()
  const [transactions, setTransactions] = useState(() => [...MOCK_TRANSACTIONS])
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [step, setStep] = useState('select') // select | confirm | success
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!selectedPkg) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const total = selectedPkg.amount + selectedPkg.bonus
    updateCredits(total)
    const newTx = {
      id: `t_${Date.now()}`,
      type: 'credit',
      amount: total,
      description: `Wallet top-up via ${selectedMethod.toUpperCase()}${selectedPkg.bonus ? ` (+₹${selectedPkg.bonus.toLocaleString('en-IN')} bonus)` : ''}`,
      time: new Date().toISOString(),
    }
    setTransactions(prev => [newTx, ...prev])
    setStep('success')
    setLoading(false)
    addNotification({
      type: 'winning',
      title: 'Credits Added!',
      message: `${formatCurrency(total)} added to your wallet.`,
    })
    setTimeout(() => { setStep('select'); setSelectedPkg(null) }, 3000)
  }

  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your bidding credits</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-amber-500/20 relative overflow-hidden">
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-sm text-gray-400">Available Balance</p>
            </div>
            <p className="font-mono text-3xl font-bold text-amber-400">{formatCurrency(user?.credits || 0)}</p>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-400">Total Added</p>
          </div>
          <p className="font-mono text-2xl font-bold text-emerald-400">{formatCurrency(totalCredits)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm text-gray-400">Total Spent</p>
          </div>
          <p className="font-mono text-2xl font-bold text-red-400">{formatCurrency(totalDebits)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Top up panel */}
        <div className="lg:col-span-3 card p-5 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" /> Add Credits
          </h2>

          <AnimatePresence mode="wait">
            {step === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-white">Payment Successful!</p>
                <p className="text-gray-400 text-sm mt-1">Credits have been added to your wallet</p>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-5">
                {/* Package selection */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Select Amount</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PACKAGES.map(pkg => (
                      <button
                        key={pkg.amount}
                        onClick={() => setSelectedPkg(pkg)}
                        className={`relative p-3 rounded-xl border text-left transition-all ${
                          selectedPkg?.amount === pkg.amount
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-amber-500 text-gray-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                        <p className="font-mono font-bold text-white text-sm">{pkg.label}</p>
                        {pkg.bonus > 0 && (
                          <p className="text-[10px] text-emerald-400 mt-0.5">+{formatCurrency(pkg.bonus)} bonus</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Payment Method</p>
                  <div className="space-y-2">
                    {METHODS.map(m => {
                      const Icon = m.icon
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMethod(m.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            selectedMethod === m.id
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedMethod === m.id ? 'bg-amber-500/20' : 'bg-gray-700'
                          }`}>
                            <Icon className={`w-4 h-4 ${selectedMethod === m.id ? 'text-amber-400' : 'text-gray-400'}`} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-white">{m.label}</p>
                            <p className="text-xs text-gray-500">{m.desc}</p>
                          </div>
                          <div className={`ml-auto w-4 h-4 rounded-full border-2 ${
                            selectedMethod === m.id ? 'border-amber-500 bg-amber-500' : 'border-gray-600'
                          }`} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Summary & pay */}
                {selectedPkg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/60 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-white font-mono">{formatCurrency(selectedPkg.amount)}</span>
                    </div>
                    {selectedPkg.bonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">Bonus Credits</span>
                        <span className="text-emerald-400 font-mono">+{formatCurrency(selectedPkg.bonus)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-2 flex justify-between">
                      <span className="text-white font-medium">Total Credits</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {formatCurrency(selectedPkg.amount + selectedPkg.bonus)}
                      </span>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={!selectedPkg || loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                  ) : (
                    <>Pay {selectedPkg ? formatCurrency(selectedPkg.amount) : '—'}</>
                  )}
                </button>

                <p className="text-center text-xs text-gray-600">
                  Demo mode — no real payment processing
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transaction history */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-amber-400" /> Transactions
          </h2>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-start gap-3 py-2 border-b border-gray-800/50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}>
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium leading-snug">{tx.description}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(tx.time)}</p>
                </div>
                <p className={`font-mono text-sm font-bold flex-shrink-0 ${
                  tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
