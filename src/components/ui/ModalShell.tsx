import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalShellProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'md' | 'lg' | 'full'
  className?: string
}

const precision = [0.25, 0.46, 0.45, 0.94] as const

export function ModalShell({ open, onClose, title, children, size = 'lg', className }: ModalShellProps) {
  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const sizeClasses = {
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    full: 'max-w-[90vw] w-[90vw]',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ background: 'rgba(10,12,15,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            key="modal-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: precision }}
            className={cn(
              'w-full bg-slate-deep border border-wire rounded-t-[2px] overflow-hidden',
              size === 'full' ? 'h-[90vh]' : 'max-h-[90vh]',
              sizeClasses[size],
              className,
            )}
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-wire bg-slate-mid">
                <span className="font-mono font-bold text-sm text-data tracking-wide uppercase">{title}</span>
                <button
                  onClick={onClose}
                  className="text-ghost hover:text-data transition-colors p-1"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="overflow-auto h-full">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
