import { useState } from 'react'
import { soundFx } from '@/presentation/utils/sound'
import { Volume2, VolumeX } from 'lucide-react'

export function SoundToggle() {
  const [enabled, setEnabled] = useState(() => soundFx.isEnabled())

  const handleToggle = () => {
    const newState = soundFx.toggle()
    setEnabled(newState)
  }

  return (
    <button
      onClick={handleToggle}
      type="button"
      title={enabled ? 'Efectos de sonido activados (Clic para silenciar)' : 'Efectos de sonido silenciados (Clic para activar)'}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md text-xs font-semibold shadow-lg transition-all cursor-pointer ${
        enabled
          ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 hover:bg-sky-500/30 hover:scale-105'
          : 'bg-slate-900/80 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {enabled ? (
        <>
          <Volume2 className="h-4 w-4 text-sky-400 animate-pulse" />
          <span className="hidden sm:inline">Sonido ON</span>
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline">Sonido OFF</span>
        </>
      )}
    </button>
  )
}
