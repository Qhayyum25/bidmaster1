import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const { addNotification } = useNotifications()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        addNotification({ type: 'success', title: 'Welcome back!', message: 'You\'re now signed in to BidMasters.' })
      } else {
        if (!form.name.trim()) throw new Error('Name is required')
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
        await register(form.name, form.email, form.password)
        addNotification({ type: 'winning', title: 'Welcome to BidMasters!', message: '₹10,000 credits added as welcome bonus.' })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (type) => {
    setLoading(true)
    try {
      if (type === 'admin') {
        await login('admin@bidmasters.in', 'admin123')
      } else {
        await login('user@bidmasters.in', 'user1234')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-900 border-r border-gray-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.05),transparent_60%)]" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Gavel className="w-5 h-5 text-gray-950" />
            </div>
            <span className="text-xl font-bold text-white">BidMasters</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Bid smarter.<br />
            Win <span className="text-amber-400">more.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Real-time auctions powered by AI. Get personalised bid suggestions and beat the competition with data-driven strategy.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: '🎯', title: 'AI Smart Advisor', desc: 'Win probability & optimal bid recommendations' },
            { icon: '⚡', title: 'Real-time Bidding', desc: 'Instant bid updates via live auction feeds' },
            { icon: '🔒', title: 'Secure Wallet', desc: 'Credits system with full transaction history' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-white text-sm">{f.title}</p>
                <p className="text-gray-400 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Gavel className="w-4 h-4 text-gray-950" />
            </div>
            <span className="font-bold text-white">BidMasters</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? 'Welcome back to BidMasters' : 'Join thousands of smart bidders'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === m ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-white'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      className="input w-full pl-9"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  className="input w-full pl-9"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input w-full pl-9 pr-10"
                  placeholder={mode === 'login' ? 'Enter password' : 'Min. 6 characters'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-gray-800" />
              <span className="text-xs text-gray-600">Quick demo access</span>
              <div className="flex-1 border-t border-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => demoLogin('user')}
                className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5">
                <Sparkles className="w-3.5 h-3.5" /> Bidder Demo
              </button>
              <button onClick={() => demoLogin('admin')}
                className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5">
                <Gavel className="w-3.5 h-3.5" /> Admin Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
