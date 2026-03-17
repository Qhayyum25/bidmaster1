import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gavel, Store, Wallet, Trophy, LayoutDashboard,
  Package, Users, Sliders, FileText, LogOut,
  Menu, X, Bell, ChevronRight, Crown,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useAuctions } from '../../contexts/AuctionContext'
import { formatCurrency } from '../../lib/mock-data'

const bidderNav = [
  { path: '/marketplace', label: 'Marketplace', icon: Store },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/my-auctions', label: 'My Auctions', icon: Trophy },
]

const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/items', label: 'Item Management', icon: Package },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/control', label: 'Auction Control', icon: Sliders },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
]

function NavItem({ item, active, onClick }) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className={`nav-item w-full text-left ${active ? 'nav-item-active' : ''}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{item.label}</span>
      {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
    </button>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { stats } = useAuctions()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = user?.role === 'admin' ? adminNav : bidderNav
  const isAdmin = user?.role === 'admin'

  const Sidebar = () => (
    <aside className="w-60 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Gavel className="w-4 h-4 text-gray-950" />
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-wide">BidMasters</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              {isAdmin ? 'Admin Panel' : 'Auction Hub'}
            </p>
          </div>
        </div>
      </div>

      {/* Live badge */}
      {stats.live > 0 && (
        <div className="mx-4 mt-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <div className="live-dot" />
          <span className="text-xs text-red-400 font-medium">{stats.live} Auction{stats.live > 1 ? 's' : ''} Live</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!isAdmin && (
          <p className="text-[10px] uppercase tracking-widest text-gray-600 px-3 mb-2 font-semibold">Bidder</p>
        )}
        {navItems.map(item => (
          <NavItem
            key={item.path}
            item={item}
            active={location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))}
            onClick={() => { navigate(item.path); setSidebarOpen(false) }}
          />
        ))}

        {/* Switch to admin / bidder view */}
        {isAdmin && (
          <>
            <div className="border-t border-gray-800 my-3" />
            <NavItem
              item={{ path: '/marketplace', label: 'Bidder View', icon: Store }}
              active={false}
              onClick={() => { navigate('/marketplace'); setSidebarOpen(false) }}
            />
          </>
        )}
        {!isAdmin && (
          <>
            <div className="border-t border-gray-800 my-3" />
          </>
        )}
      </nav>

      {/* User panel */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          {isAdmin && <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />}
        </div>
        {!isAdmin && (
          <div className="bg-gray-800 rounded-lg px-3 py-2 mb-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Balance</p>
            <p className="font-mono text-sm font-bold text-amber-400">{formatCurrency(user?.credits || 0)}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 flex flex-col lg:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 hidden sm:block">
              {location.pathname === '/marketplace' && 'Browse Auctions'}
              {location.pathname === '/wallet' && 'My Wallet'}
              {location.pathname === '/my-auctions' && 'My Auctions'}
              {location.pathname === '/admin' && 'Admin Dashboard'}
              {location.pathname === '/admin/items' && 'Item Management'}
              {location.pathname === '/admin/users' && 'User Management'}
              {location.pathname === '/admin/control' && 'Auction Control'}
              {location.pathname === '/admin/reports' && 'Reports & Analytics'}
              {location.pathname.startsWith('/auction/') && 'Live Auction'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                <Wallet className="w-3 h-3 text-amber-400" />
                <span className="font-mono text-xs font-bold text-amber-400">{formatCurrency(user?.credits || 0)}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
