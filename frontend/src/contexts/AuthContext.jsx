import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount — verify token with server
  useEffect(() => {
    const token = localStorage.getItem('bidmasters_token')
    if (!token) { setLoading(false); return }

    authApi.me()
      .then(u => setUser(normalise(u)))
      .catch(() => {
        localStorage.removeItem('bidmasters_token')
        localStorage.removeItem('bidmasters_user')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── helpers ────────────────────────────────────────────────────────────────
  function normalise(u) {
    // Backend returns _id; keep as id for consistency with old mock shape
    return { ...u, id: u._id || u.id }
  }

  function persist(token, user) {
    localStorage.setItem('bidmasters_token', token)
    localStorage.setItem('bidmasters_user', JSON.stringify(user))
  }

  // ── actions ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { token, user } = await authApi.login(email, password)
    const u = normalise(user)
    persist(token, u)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { token, user } = await authApi.register(name, email, password)
    const u = normalise(user)
    persist(token, u)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bidmasters_token')
    localStorage.removeItem('bidmasters_user')
    setUser(null)
  }, [])

  /** Optimistically update credits in UI (e.g. after placing a bid) */
  const updateCredits = useCallback((delta) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, credits: prev.credits + delta }
      localStorage.setItem('bidmasters_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  /** Generic user field update (used by admin impersonation etc.) */
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('bidmasters_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateProfile = useCallback(async (data) => {
    const { usersApi } = await import('../lib/api')
    const updated = await usersApi.updateMe(data)
    const u = normalise(updated)
    setUser(u)
    localStorage.setItem('bidmasters_user', JSON.stringify(u))
    return u
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateCredits, updateUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
