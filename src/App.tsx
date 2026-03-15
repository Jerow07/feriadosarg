import { useEffect, useState } from 'react'
import { useHolidays } from './hooks/useHolidays'
import { Countdown } from './components/Countdown'
import { UpcomingHolidays } from './components/UpcomingHolidays'
import { PushSubscribe } from './components/PushSubscribe'
import { Loader2, Sun, Moon } from 'lucide-react'

function App() {
  const { nextHoliday, upcomingHolidays, loading, error } = useHolidays()
  
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-primary text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4 selection:bg-accent selection:text-black transition-colors duration-300">
      
      <PushSubscribe />

      <button 
        onClick={() => setIsDark(!isDark)}
        className="absolute top-4 right-4 p-3 rounded-full bg-white dark:bg-secondary/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-secondary/80 transition-colors z-50 shadow-sm"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative z-10">
        
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
            <Countdown nextHoliday={nextHoliday} />
            <div className="mt-8 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both fade-in">
              <UpcomingHolidays holidays={upcomingHolidays.slice(1, 4)} />
            </div>
          </div>
        )}

      </div>
      
      {/* Background gradients for aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 dark:bg-accent/5 blur-[120px] rounded-full transition-opacity duration-300" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 dark:bg-accent/5 blur-[120px] rounded-full transition-opacity duration-300" />
      </div>
    </main>
  )
}

export default App
