import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { MOCK_USERS } from '../lib/mock-data'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('bidmasters_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    // In production: call /api/auth/login
    const found = MOCK_USERS.find(u => u.email === email)
    if (!found) throw new Error('User not found')
    if (password.length < 4) throw new Error('Invalid credentials')
    localStorage.setItem('bidmasters_user', JSON.stringify(found))
    setUser(found)
    return found
  }, [])

  const register = useCallback(async (name, email, password) => {
    const exists = MOCK_USERS.find(u => u.email === email)
    if (exists) throw new Error('Email already registered')
    const newUser = {
      id: `u_${Date.now()}`,
      name, email, role: 'bidder',
      credits: 10000, // Welcome bonus
      totalBids: 0, wins: 0, status: 'active',
      joined: new Date().toISOString(),
    }
    MOCK_USERS.push(newUser)
    localStorage.setItem('bidmasters_user', JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bidmasters_user')
    setUser(null)
  }, [])

  const updateCredits = useCallback((delta) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, credits: prev.credits + delta }
      localStorage.setItem('bidmasters_user', JSON.stringify(updated))
      // Sync to MOCK_USERS
      const idx = MOCK_USERS.findIndex(u => u.id === prev.id)
      if (idx !== -1) MOCK_USERS[idx] = updated
      return updated
    })
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('bidmasters_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateCredits, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
