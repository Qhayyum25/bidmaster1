import { AnimatePresence, motion } from 'framer-motion'
import { useNotifications } from '../../contexts/NotificationContext'
import { X, CheckCircle, AlertTriangle, Info, Trophy } from 'lucide-react'

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  error: AlertTriangle,
  winning: Trophy,
  outbid: AlertTriangle,
}

const styles = {
  success: 'border-emerald-500/40 bg-emerald-950/80',
  warning: 'border-amber-500/40 bg-amber-950/80',
  info: 'border-blue-500/40 bg-blue-950/80',
  error: 'border-red-500/40 bg-red-950/80',
  winning: 'border-amber-400/60 bg-gray-900/95 glow-amber',
  outbid: 'border-red-500/40 bg-red-950/80',
}

const iconColors = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
  error: 'text-red-400',
  winning: 'text-amber-400',
  outbid: 'text-red-400',
}

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map(n => {
          const Icon = icons[n.type] || Info
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${styles[n.type] || styles.info}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[n.type] || iconColors.info}`} />
              <div className="flex-1 min-w-0">
                {n.title && <p className="text-sm font-semibold text-white">{n.title}</p>}
                {n.message && <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{n.message}</p>}
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
