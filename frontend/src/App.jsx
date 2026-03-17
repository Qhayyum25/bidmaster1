import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AuthScreen from './components/auth/AuthScreen'
import AppLayout from './components/layout/AppLayout'
import Marketplace from './components/bidder/Marketplace'
import LiveAuction from './components/bidder/LiveAuction'
import Wallet from './components/bidder/Wallet'
import MyAuctions from './components/bidder/MyAuctions'
import Profile from './components/bidder/Profile'
import AdminDashboard from './components/admin/AdminDashboard'
import ItemManagement from './components/admin/ItemManagement'
import UserManagement from './components/admin/UserManagement'
import AuctionControl from './components/admin/AuctionControl'
import Reports from './components/admin/Reports'
import NotificationToast from './components/layout/NotificationToast'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading BidMasters...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <>
      <NotificationToast />
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthScreen />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Bidder routes */}
          <Route index element={<Navigate to="/marketplace" replace />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="auction/:id" element={<LiveAuction />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="my-auctions" element={<MyAuctions />} />
          <Route path="profile" element={<Profile />} />
          {/* Routes open to all logged-in users */}
          <Route path="admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          {/* Admin-only routes */}
          <Route path="admin/items" element={<ProtectedRoute adminOnly><ItemManagement /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
          <Route path="admin/control" element={<ProtectedRoute adminOnly><AuctionControl /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
