import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Package, Image, AlertCircle } from 'lucide-react'
import { useAuctions } from '../../contexts/AuctionContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatCurrency } from '../../lib/mock-data'

const CATEGORIES = ['Electronics', 'Gaming', 'Watches', 'Music', 'Sneakers', 'Art', 'Jewelry', 'Vehicles', 'Other']

const defaultForm = {
  title: '', description: '', category: 'Electronics',
  image: '', startingPrice: '', reservePrice: '',
  startTime: '', endTime: '', status: 'upcoming',
}

function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item ? {
    ...item,
    startingPrice: String(item.startingPrice),
    reservePrice: String(item.reservePrice || ''),
    startTime: item.startTime?.slice(0, 16) || '',
    endTime: item.endTime?.slice(0, 16) || '',
  } : { ...defaultForm })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.title || !form.startingPrice || !form.endTime) {
      alert('Please fill required fields: Title, Starting Price, End Time')
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...form,
        startingPrice: Number(form.startingPrice),
        reservePrice: Number(form.reservePrice) || Number(form.startingPrice),
        startTime: form.startTime ? new Date(form.startTime).toISOString() : new Date().toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-semibold text-white">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Title *</label>
              <input className="input w-full" placeholder="Item title" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Description</label>
              <textarea className="input w-full h-20 resize-none" placeholder="Item description..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Category</label>
              <select className="input w-full" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Status</label>
              <select className="input w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Starting Price (₹) *</label>
              <input type="number" className="input w-full font-mono" placeholder="e.g. 10000"
                value={form.startingPrice} onChange={e => set('startingPrice', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Reserve Price (₹)</label>
              <input type="number" className="input w-full font-mono" placeholder="Minimum to sell"
                value={form.reservePrice} onChange={e => set('reservePrice', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Start Time</label>
              <input type="datetime-local" className="input w-full text-sm"
                value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">End Time *</label>
              <input type="datetime-local" className="input w-full text-sm"
                value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Image URL</label>
              <input className="input w-full" placeholder="https://..." value={form.image}
                onChange={e => set('image', e.target.value)} />
              {form.image && (
                <div className="mt-2 h-24 rounded-lg overflow-hidden bg-gray-800">
                  <img src={form.image} alt="preview" className="h-full w-full object-cover"
                    onError={e => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-800">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Save Item</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DeleteConfirmModal({ item, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-md p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Delete Auction</h2>
            <p className="text-xs text-gray-400">This cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-bold text-white">"{item.title}"</span>? All bids will also be removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            {deleting ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ItemManagement() {
  const { auctions, addAuction, updateAuction, deleteAuction, refresh } = useAuctions()
  const { addNotification } = useNotifications()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = auctions.filter(a => {
    const ms = a.title?.toLowerCase().includes(search.toLowerCase())
    const mf = filterStatus === 'all' || a.status === filterStatus
    return ms && mf
  })

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await updateAuction(editItem.id || editItem._id, data)
        addNotification({ type: 'success', title: 'Item Updated', message: `${data.title} has been updated.` })
      } else {
        await addAuction(data)
        addNotification({ type: 'success', title: 'Item Added', message: `${data.title} added to auctions.` })
      }
      refresh()
    } catch (err) {
      addNotification({ type: 'warning', title: 'Error', message: err.message })
    }
    setEditItem(null)
  }

  const handleDelete = async () => {
    try {
      await deleteAuction(deleteItem.id || deleteItem._id)
      addNotification({ type: 'success', title: 'Item Deleted', message: `${deleteItem.title} has been removed.` })
      refresh()
    } catch (err) {
      addNotification({ type: 'warning', title: 'Error', message: err.message })
    }
    setDeleteItem(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Item Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">Add, edit, and manage auction items</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="input flex-1" placeholder="Search items..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2">
          {['all', 'live', 'upcoming', 'ended'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                filterStatus === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Current Bid</th>
                <th className="px-4 py-3 font-medium text-right">Bids</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((a, i) => (
                <motion.tr
                  key={a.id || a._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                        {a.image ? (
                          <img src={a.image} alt={a.title} className="w-full h-full object-cover"
                            onError={e => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white max-w-[200px] truncate">{a.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{a.category}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      a.status === 'live' ? 'badge-live' :
                      a.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended'
                    } text-[10px]`}>
                      {a.status === 'live' && <div className="live-dot w-1.5 h-1.5" />}
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{formatCurrency(a.currentBid || a.startingPrice)}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-400">{a.totalBids || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditItem(a); setShowModal(true) }}
                        className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(a)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ItemModal item={editItem} onClose={() => { setShowModal(false); setEditItem(null) }} onSave={handleSave} />
        )}
        {deleteItem && (
          <DeleteConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  )
}
