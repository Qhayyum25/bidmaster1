import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { io as socketIO } from 'socket.io-client'
import { auctionsApi, bidsApi } from '../lib/api'
import { useNotifications } from './NotificationContext'

const AuctionContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function AuctionProvider({ children }) {
  const [auctions, setAuctions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const { addNotification }        = useNotifications()
  const socketRef                  = useRef(null)

  // ── Fetch auctions from API ────────────────────────────────────────────────
  const fetchAuctions = useCallback(async () => {
    try {
      const data = await auctionsApi.list()
      setAuctions(data.map(normalise))
    } catch (err) {
      console.error('Failed to fetch auctions:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAuctions() }, [fetchAuctions])

  // ── Socket.io real-time updates ────────────────────────────────────────────
  useEffect(() => {
    const socket = socketIO(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('bid:new', ({ auctionId, amount, userName, userId, time }) => {
      setAuctions(prev => prev.map(a => {
        if (a._id !== auctionId && a.id !== auctionId) return a
        const newBid = { id: `b_${Date.now()}`, userId, userName, amount, time }
        return {
          ...a,
          currentBid: amount,
          totalBids: a.totalBids + 1,
          bids: [newBid, ...(a.bids || []).slice(0, 19)],
        }
      }))
    })

    socket.on('auction:new', (auction) => {
      setAuctions(prev => [normalise(auction), ...prev])
      addNotification?.({ type: 'info', message: `New auction: ${auction.title}` })
    })

    socket.on('auction:updated', (auction) => {
      setAuctions(prev => prev.map(a =>
        (a._id === auction._id || a.id === auction._id) ? normalise(auction) : a
      ))
    })

    socket.on('auction:status', ({ id, status, endTime }) => {
      setAuctions(prev => prev.map(a => {
        if (a._id !== id && a.id !== id) return a
        return { ...a, status, ...(endTime ? { endTime } : {}) }
      }))
    })

    socket.on('auction:ended', ({ id, winner, finalBid }) => {
      setAuctions(prev => prev.map(a => {
        if (a._id !== id && a.id !== id) return a
        return { ...a, status: 'ended', winner, currentBid: finalBid ?? a.currentBid }
      }))
      if (winner) addNotification?.({ type: 'success', message: `Auction ended — won by ${winner.userName}` })
    })

    socket.on('auction:deleted', ({ id }) => {
      setAuctions(prev => prev.filter(a => a._id !== id && a.id !== id))
    })

    return () => socket.disconnect()
  }, [addNotification])

  // ── Normalise helper (map _id → id for UI compatibility) ──────────────────
  function normalise(a) {
    if (!a) return null
    return {
      ...a,
      id: a._id || a.id,
      currentBid: a.currentBid || a.startingPrice,
      totalBids: a.bids?.length || 0,
      bids: (a.bids || []).map(b => ({
        ...b,
        id: b._id || b.id,
        userId: b.bidder || b.userId,
        userName: b.bidderName || b.userName,
        time: b.time || b.timestamp
      }))
    }
  }

  // ── Selectors ─────────────────────────────────────────────────────────────
  const getAuction = useCallback((id) =>
    auctions.find(a => a._id === id || a.id === id) || null,
  [auctions])

  // ── Place bid (calls API, socket does the state update) ───────────────────
  const placeBid = useCallback(async (auctionId, _userId, _userName, amount) => {
    const result = await bidsApi.place(auctionId, amount)
    return result  // { bid, newBalance }
  }, [])

  // ── Admin helpers (call API; socket broadcasts back to update state) ───────
  const addAuction = useCallback(async (auctionData) => {
    const auction = await auctionsApi.create(auctionData)
    return normalise(auction)
  }, [])

  const updateAuction = useCallback(async (id, data) => {
    const auction = await auctionsApi.update(id, data)
    return normalise(auction)
  }, [])

  const deleteAuction = useCallback(async (id) => {
    await auctionsApi.delete(id)
  }, [])

  const updateAuctionStatus = useCallback(async (auctionId, status) => {
    await auctionsApi.setStatus(auctionId, status)
  }, [])

  const extendAuction = useCallback(async (auctionId, minutes) => {
    await auctionsApi.setStatus(auctionId, undefined, minutes)
  }, [])

  const joinAuctionRoom = useCallback((auctionId) => {
    socketRef.current?.emit('join_auction', auctionId)
  }, [])

  const leaveAuctionRoom = useCallback((auctionId) => {
    socketRef.current?.emit('leave_auction', auctionId)
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    total:        auctions.length,
    live:         auctions.filter(a => a.status === 'live').length,
    upcoming:     auctions.filter(a => a.status === 'upcoming').length,
    ended:        auctions.filter(a => a.status === 'ended').length,
    totalRevenue: auctions.filter(a => a.status === 'ended').reduce((s, a) => s + a.currentBid, 0),
    totalBids:    auctions.reduce((s, a) => s + a.totalBids, 0),
  }

  return (
    <AuctionContext.Provider value={{
      auctions, loading, getAuction, placeBid, addAuction,
      updateAuction, deleteAuction,
      updateAuctionStatus, extendAuction,
      joinAuctionRoom, leaveAuctionRoom,
      stats, refresh: fetchAuctions,
    }}>
      {children}
    </AuctionContext.Provider>
  )
}

export const useAuctions = () => {
  const ctx = useContext(AuctionContext)
  if (!ctx) throw new Error('useAuctions must be inside AuctionProvider')
  return ctx
}
