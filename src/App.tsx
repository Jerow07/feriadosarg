import { useEffect, useState, useRef } from 'react'
import { useHolidays } from './hooks/useHolidays'
import { Countdown } from './components/Countdown'
import { UpcomingHolidays } from './components/UpcomingHolidays'
import { BankPayday } from './components/BankPayday'
import { TodayEvents } from './components/TodayEvents'
import { PushSubscribe } from './components/PushSubscribe'
import { InstallPWA } from './components/InstallPWA'
import { OfflineBanner } from './components/OfflineBanner'
import { ReleaseNotes } from './components/ReleaseNotes'
import { AnnualStats } from './components/AnnualStats'
import { SunTimes } from './components/SunTimes'
import { MoonPhase } from './components/MoonPhase'
import { LongWeekend } from './components/LongWeekend'
import { YearProgress } from './components/YearProgress'
import { PaydaySelectorModal } from './components/PaydaySelectorModal'
import { AdminPanel } from './components/AdminPanel'
import { Loader2, Sun, Moon } from 'lucide-react'

function App() {
  const { holidays, nextHoliday, upcomingHolidays, loading, error } = useHolidays()
  const [showPaydayModal, setShowPaydayModal] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const versionClickCount = useRef(0)
  const versionClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
    }
    return true
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  useEffect(() => {
    // Show modal if it's the first time (no payday preference saved)
    const savedPayday = localStorage.getItem('feriadosarg_normalPaydayType')
    if (!savedPayday) {
      setShowPaydayModal(true)
    }
  }, [])

  // Clear badge and close pending notifications when app is opened
  useEffect(() => {
    if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {})
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.getNotifications().then(notifications => {
          notifications.forEach(n => n.close())
        })
      }).catch(() => {})
    }
  }, [])

  // Analytics: send pageview once on load
  useEffect(() => {
    let uid = localStorage.getItem('feriadosarg_uid')
    if (!uid) {
      uid = crypto.randomUUID()
      localStorage.setItem('feriadosarg_uid', uid)
    }
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'pageview', userId: uid }),
    }).catch(() => {})
  }, [])

  const handlePaydaySelect = (type: string) => {
    localStorage.setItem('feriadosarg_normalPaydayType', type)
    setShowPaydayModal(false)
    // Reload or trigger a state refresh in components if needed
    window.location.reload() // Simplest way to ensure all components see the new preference
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-primary text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4 selection:bg-accent selection:text-black transition-colors duration-300">
      
      <ReleaseNotes />
      <OfflineBanner />
      <PushSubscribe />
      <InstallPWA />
      
      <PaydaySelectorModal
        isOpen={showPaydayModal}
        onSelect={handlePaydaySelect}
      />

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => {
            versionClickCount.current += 1
            if (versionClickTimer.current) clearTimeout(versionClickTimer.current)
            if (versionClickCount.current >= 5) {
              versionClickCount.current = 0
              setShowAdmin(true)
            } else {
              versionClickTimer.current = setTimeout(() => { versionClickCount.current = 0 }, 3000)
            }
          }}
          className="px-2 py-0.5 bg-white/80 dark:bg-secondary/80 backdrop-blur-sm text-[10px] font-bold text-gray-400 dark:text-gray-500 rounded-md border border-gray-200 dark:border-white/10 tracking-wider shadow-sm transition-opacity duration-300 cursor-default select-none"
          aria-label="Versión"
        >
          V3.5.0
        </button>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-full bg-white dark:bg-secondary/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-secondary/80 transition-colors shadow-sm"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center relative z-10 px-4">
        
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500 mt-12">
            <Loader2 className="w-10 h-10 text-yellow-500 dark:text-accent animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Calculando fechas...</p>
          </div>
        )}

        {error && (
          <div className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-400/10 p-4 rounded-2xl ring-1 ring-red-200 dark:ring-red-400/20 mt-12">
            Hubo un error al calcular los feriados. Intenta nuevamente más tarde.
          </div>
        )}

        {!loading && !error && nextHoliday && (
          <div className="w-full animate-in zoom-in-95 duration-700 ease-out fade-in mt-8 md:mt-0">
            <Countdown nextHoliday={nextHoliday} holidays={holidays} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both fade-in w-full text-center md:text-left">
              <TodayEvents holidays={holidays} />
              <UpcomingHolidays holidays={upcomingHolidays.slice(1, 4)} />
              <BankPayday holidays={holidays} />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both fade-in w-full">
              <SunTimes />
              <MoonPhase />
              <LongWeekend upcomingHolidays={upcomingHolidays} />
              <YearProgress />
            </div>

            <div className="mt-8 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both fade-in w-full pb-8">
              <AnnualStats holidays={holidays} />
            </div>
          </div>
        )}

      </div>

      <footer className="w-full flex items-center justify-center gap-4 py-8 mt-auto relative z-10 text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>&copy; Hecho con ☕ y código por Jerónimo Parra</span>
        <button
          onClick={async () => {
            const shareData = {
              title: 'FeriadosArg',
              text: '¡Mirá esta app para saber cuándo es el próximo feriado en Argentina! 🇦🇷',
              url: window.location.origin
            };
            if (navigator.share) {
              try { await navigator.share(shareData); } catch {}
            } else {
              await navigator.clipboard.writeText(window.location.origin);
              alert('¡Link copiado al portapapeles!');
            }
          }}
          className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors border border-gray-200 dark:border-white/10"
          aria-label="Compartir esta app"
          title="Compartir FeriadosArg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </footer>
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 dark:bg-accent/5 blur-[120px] rounded-full transition-opacity duration-300" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 dark:bg-accent/5 blur-[120px] rounded-full transition-opacity duration-300" />
      </div>
    </main>
  )
}

export default App
