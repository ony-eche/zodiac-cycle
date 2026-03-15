import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Only show after user has visited at least once
    const hasVisited = localStorage.getItem('zc_visited')
    if (!hasVisited) {
      localStorage.setItem('zc_visited', 'true')
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after 30 seconds of use
      setTimeout(() => {
        const dismissed = localStorage.getItem('zc_install_dismissed')
        if (!dismissed) setShowPrompt(true)
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('zc_install_dismissed', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-purple-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-900/50">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🌙</div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Add ZodiacCycle to Home Screen</p>
            <p className="text-purple-300 text-xs mt-0.5">
              Get the full app experience — works offline too
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-purple-400 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 rounded-xl text-purple-300 text-sm border border-purple-500/30 hover:bg-purple-800/30"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}