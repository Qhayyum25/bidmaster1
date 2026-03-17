const router = require('express').Router()
const { User, Transaction } = require('../models')
const { auth, adminOnly } = require('../middleware/auth')

// GET /api/users/me/transactions
router.get('/me/transactions', auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50)
    res.json(txs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users/me/topup
router.post('/me/topup', auth, async (req, res) => {
  try {
    const { amount, method } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' })

    const user = await User.findById(req.user.id)
    user.credits += amount
    await user.save()

    await Transaction.create({
      userId: user._id, type: 'credit', amount,
      description: `Wallet top-up via ${method || 'UPI'}`,
    })

    res.json({ credits: user.credits })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/users/:id (admin)
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, credits } = req.body
    const update = {}
    if (status) update.status = status
    if (credits !== undefined) update.$inc = { credits }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
