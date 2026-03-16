import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Don't show if already installed as standalone app
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Don't show if already dismissed
    if (localStorage.getItem('zc_install_dismissed')) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      const timer = setTimeout(() => setShowManual(true), 15000)
      return () => clearTimeout(timer)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => {
        if (!localStorage.getItem('zc_install_dismissed')) {
          setShowPrompt(true)
        }
      }, 15000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setShowPrompt(false)
    localStorage.setItem('zc_install_dismissed', 'true')
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowManual(false)
    localStorage.setItem('zc_install_dismissed', 'true')
  }

  // Android/Desktop install prompt
  if (showPrompt) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 text-white text-lg">
              🌙
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Add ZodiacCycle to your home screen</p>
              <p className="text-gray-500 text-xs mt-0.5">Get the full app experience — works offline too</p>
            </div>
            <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 text-lg leading-none">
              ×
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 rounded-xl text-gray-400 text-sm border border-gray-200 hover:bg-gray-50"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    )
  }

  // iOS manual guide
  if (showManual && isIOS) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-purple-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Add to Home Screen</p>
              <p className="text-gray-500 text-xs mt-0.5">Install ZodiacCycle for the best experience</p>
            </div>
            <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 text-lg leading-none">
              ×
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <p className="text-xs text-gray-600">
                Tap the <span className="font-semibold">Share button</span>{' '}
                <span className="text-base">⎋</span> at the bottom of Safari
              </p>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <p className="text-xs text-gray-600">
                Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span>
              </p>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <p className="text-xs text-gray-600">
                Tap <span className="font-semibold">"Add"</span> in the top right corner
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-3 py-2 rounded-xl text-gray-400 text-sm border border-gray-200"
          >
            Got it
          </button>
        </div>
      </div>
    )
  }

  return null
} 