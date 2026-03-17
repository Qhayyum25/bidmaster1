const router = require('express').Router()
const fetch = require('node-fetch')
const { auth } = require('../middleware/auth')

// POST /api/ai/suggest
router.post('/suggest', async (req, res) => {
  try {
    const { auction, userStats } = req.body
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Fallback: local algorithm
      return res.json(localSuggestion(auction, userStats))
    }

    const timeLeftMs = new Date(auction.endTime) - Date.now()
    const timeLeftMin = Math.round(timeLeftMs / 60000)
    const elapsedHours = Math.max(1, (Date.now() - new Date(auction.startTime)) / 3600000)
    const bidVelocity = (auction.totalBids / elapsedHours).toFixed(1)

    const prompt = `You are an expert auction bidding advisor. Analyze this auction and recommend an optimal bid.

Auction: "${auction.title}"
Category: ${auction.category}
Starting Price: ₹${auction.startingPrice}
Current Bid: ₹${auction.currentBid}
Reserve Price: ₹${auction.reservePrice}
Total Bids: ${auction.totalBids}
Time Remaining: ${timeLeftMin} minutes
Bid Velocity: ${bidVelocity} bids/hour

Bidder Profile:
- Win Rate: ${userStats?.winRate || 0}%
- Lifetime Bids: ${userStats?.totalBids || 0}
- Available Credits: ₹${userStats?.credits || 0}

Return ONLY valid JSON without markdown fences:
{
  "recommendedBid": <integer, must exceed current bid by at least 1%>,
  "winProbability": <integer 0-100>,
  "riskLevel": "low" | "medium" | "high",
  "reasoning": "<2 crisp sentences explaining your recommendation>"
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini error:', errText)
      return res.json(localSuggestion(auction, userStats))
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let suggestion
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      suggestion = JSON.parse(cleaned)
      // Validate
      if (!suggestion.recommendedBid || !suggestion.winProbability) throw new Error('Invalid response')
      suggestion.recommendedBid = Math.max(Math.ceil(auction.currentBid * 1.01), suggestion.recommendedBid)
    } catch {
      suggestion = localSuggestion(auction, userStats)
    }

    res.json(suggestion)
  } catch (err) {
    console.error('AI route error:', err)
    res.json(localSuggestion(req.body.auction, req.body.userStats))
  }
})

function localSuggestion(auction, userStats) {
  if (!auction) return { recommendedBid: 0, winProbability: 50, riskLevel: 'medium', reasoning: 'Unable to analyze auction.' }

  const timeLeft = new Date(auction.endTime) - Date.now()
  const timeLeftHours = timeLeft / 3600000
  const priceRatio = auction.currentBid / (auction.reservePrice || auction.currentBid)
  const elapsedHours = Math.max(1, (Date.now() - new Date(auction.startTime)) / 3600000)
  const bidVelocity = auction.totalBids / elapsedHours

  let riskLevel = 'low', winProbability = 72
  if (priceRatio > 0.9) { riskLevel = 'high'; winProbability = 44 }
  else if (priceRatio > 0.75) { riskLevel = 'medium'; winProbability = 61 }
  if (timeLeftHours < 0.5) winProbability = Math.min(winProbability + 15, 90)
  if (bidVelocity > 5) { riskLevel = 'high'; winProbability = Math.max(winProbability - 10, 25) }

  const base = auction.currentBid
  const increment = base < 100000 ? 1500 : base < 500000 ? 5000 : 15000
  const recommendedBid = base + increment

  const reasoning = {
    low: `Auction has moderate activity at ${bidVelocity.toFixed(1)} bids/hr. A strategic increment should hold a competitive position with ${timeLeftHours.toFixed(1)}h remaining.`,
    medium: `Bidding is heating up with ${auction.totalBids} bids placed. A confident jump above current bid is recommended to deter competitors.`,
    high: `High competition — price near reserve (${Math.round(priceRatio * 100)}%). Consider the item's value carefully before committing at this stage.`,
  }

  return { recommendedBid, winProbability, riskLevel, reasoning: reasoning[riskLevel] }
}

module.exports = router
