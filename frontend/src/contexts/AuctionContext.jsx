import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { MOCK_AUCTIONS } from '../lib/mock-data'
import { useNotifications } from './NotificationContext'

const AuctionContext = createContext(null)

export function AuctionProvider({ children }) {
  const [auctions, setAuctions] = useState(() => JSON.parse(JSON.stringify(MOCK_AUCTIONS)))
  const { addNotification } = useNotifications()
  const intervalRef = useRef(null)

  // Simulate real-time bid activity on live auctions
  useEffect(() => {
    const names = ['Priya S.', 'Rahul K.', 'Anjali M.', 'Vikram P.', 'Neha R.', 'Arjun D.', 'Kavya T.']

    intervalRef.current = setInterval(() => {
      setAuctions(prev => {
        const updated = [...prev]
        // Pick a random live auction to update
        const liveIndices = updated
          .map((a, i) => ({ a, i }))
          .filter(({ a }) => a.status === 'live' && new Date(a.endTime) > Date.now())

        if (liveIndices.length === 0) return prev

        const { i } = liveIndices[Math.floor(Math.random() * liveIndices.length)]
        const auction = { ...updated[i] }
        const bids = [...auction.bids]

        // 30% chance of a new bot bid
        if (Math.random() < 0.3) {
          const increment = auction.currentBid < 100000 ? 500 + Math.floor(Math.random() * 2000)
            : auction.currentBid < 500000 ? 2000 + Math.floor(Math.random() * 8000)
            : 5000 + Math.floor(Math.random() * 20000)

          const newBid = {
            id: `b_${Date.now()}`,
            userId: `bot_${Math.random().toString(36).substr(2, 5)}`,
            userName: names[Math.floor(Math.random() * names.length)],
            amount: auction.currentBid + increment,
            time: new Date().toISOString(),
          }
          auction.currentBid = newBid.amount
          auction.totalBids++
          auction.bids = [newBid, ...bids.slice(0, 19)]
          updated[i] = auction
        }

        return updated
      })
    }, 4000 + Math.random() * 6000)

    return () => clearInterval(intervalRef.current)
  }, [])

  const getAuction = useCallback((id) => {
    return auctions.find(a => a.id === id) || null
  }, [auctions])

  const placeBid = useCallback((auctionId, userId, userName, amount) => {
    let success = false
    setAuctions(prev => {
      const updated = [...prev]
      const i = updated.findIndex(a => a.id === auctionId)
      if (i === -1) return prev

      const auction = { ...updated[i] }
      if (amount <= auction.currentBid) return prev
      if (auction.status !== 'live') return prev

      const newBid = {
        id: `b_${Date.now()}`,
        userId, userName, amount,
        time: new Date().toISOString(),
      }

      auction.currentBid = amount
      auction.totalBids++
      auction.bids = [newBid, ...auction.bids.slice(0, 19)]
      updated[i] = auction
      success = true
      return updated
    })
    return success
  }, [])

  const addAuction = useCallback((auctionData) => {
    const newAuction = {
      id: `a_${Date.now()}`,
      ...auctionData,
      currentBid: auctionData.startingPrice,
      totalBids: 0,
      watchers: 0,
      winner: null,
      bids: [],
    }
    setAuctions(prev => [newAuction, ...prev])
    return newAuction
  }, [])

  const updateAuctionStatus = useCallback((auctionId, status) => {
    setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status } : a))
  }, [])

  const extendAuction = useCallback((auctionId, minutes) => {
    setAuctions(prev => prev.map(a => {
      if (a.id !== auctionId) return a
      const newEnd = new Date(new Date(a.endTime).getTime() + minutes * 60000).toISOString()
      return { ...a, endTime: newEnd }
    }))
  }, [])

  const stats = {
    total: auctions.length,
    live: auctions.filter(a => a.status === 'live').length,
    upcoming: auctions.filter(a => a.status === 'upcoming').length,
    ended: auctions.filter(a => a.status === 'ended').length,
    totalRevenue: auctions
      .filter(a => a.status === 'ended')
      .reduce((sum, a) => sum + a.currentBid, 0),
    totalBids: auctions.reduce((sum, a) => sum + a.totalBids, 0),
  }

  return (
    <AuctionContext.Provider value={{
      auctions, getAuction, placeBid, addAuction,
      updateAuctionStatus, extendAuction, stats,
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
