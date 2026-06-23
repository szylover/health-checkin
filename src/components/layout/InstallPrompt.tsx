import { useEffect, useState } from 'react'
import { INSTALL_LABELS } from '../../data/texts'

const DISMISS_KEY = 'health-install-dismissed'

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    if (isIos() && !isStandalone()) {
      const id = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(id)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-[55] flex justify-center px-3 safe-area-bottom">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📲</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm">{INSTALL_LABELS.title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {INSTALL_LABELS.step1}
              <span className="inline-block mx-1 align-middle">⬆️</span>
              {INSTALL_LABELS.step2}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 text-lg leading-none px-1 active:text-gray-600"
            aria-label={INSTALL_LABELS.dismiss}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
