import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

type ToastType = 'success' | 'error' | 'loading' | 'default'

interface ToastOptions {
  type?: ToastType
  duration?: number
  position?: 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right'
}

export function useToast() {
  const [toasts, setToasts] = useState<any[]>([])

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const { type = 'default', duration = 4000, position = 'top-center' } = options

    let toastId: string

    switch (type) {
      case 'success':
        toastId = toast.success(message, {
          duration,
          position,
        })
        break
      case 'error':
        toastId = toast.error(message, {
          duration,
          position,
        })
        break
      case 'loading':
        toastId = toast.loading(message, {
          duration,
          position,
        })
        break
      default:
        toastId = toast(message, {
          duration,
          position,
        })
        break
    }

    setToasts(prev => [...prev, { id: toastId, message, type }])
    return toastId
  }, [])

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id)
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    toast.dismiss()
    setToasts([])
  }, [])

  return {
    toast: showToast,
    dismiss: dismissToast,
    dismissAll,
    toasts,
  }
}