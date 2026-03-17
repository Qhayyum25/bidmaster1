import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Save, Image as ImageIcon, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    
    setLoading(true)
    try {
      await updateProfile(form)
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      })
    } catch (err) {
      addNotification({
        type: 'warning',
        title: 'Update Failed',
        message: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Update your personal information</p>
      </div>

      <div className="card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User className="w-32 h-32 text-amber-500" />
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center text-amber-500 text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold text-white">{user?.name}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {user?.role} Account
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                type="text"
                className="input w-full"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                type="email"
                className="input w-full"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6 border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent">
        <h3 className="font-bold text-white flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Security Note
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          To change your password or security settings, please contact support. Profile changes may take a few moments to reflect across all services.
        </p>
      </div>
    </div>
  )
}
