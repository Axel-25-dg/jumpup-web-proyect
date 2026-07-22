import { Gamepad2, BrainCircuit, Type, Sparkles, Play, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

export default function GamesPage() {
  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Encuentra los pares de palabras en diferentes idiomas. Entrena tu memoria y gana XP.',
      icon: BrainCircuit,
      color: 'from-indigo-500/5 to-indigo-650/10 dark:from-indigo-500/10 dark:to-indigo-500/20',
      borderColor: 'border-indigo-500/20',
      iconColor: 'text-indigo-500',
      difficulty: 'Fácil',
      xpReward: 'Hasta 50 XP',
      isLocked: false
    },
    {
      id: 'typing',
      title: 'Speed Typing',
      description: 'Escribe las oraciones lo más rápido posible sin errores ortográficos.',
      icon: Type,
      color: 'from-amber-500/5 to-amber-650/10 dark:from-amber-500/10 dark:to-amber-500/20',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-500',
      difficulty: 'Medio',
      xpReward: 'Hasta 100 XP',
      isLocked: false
    },
    {
      id: 'quiz',
      title: 'Quiz Maestro',
      description: 'Responde preguntas de gramática y cultura general en tiempo límite.',
      icon: Sparkles,
      color: 'from-rose-500/5 to-rose-650/10 dark:from-rose-500/10 dark:to-rose-500/20',
      borderColor: 'border-rose-500/20',
      iconColor: 'text-rose-500',
      difficulty: 'Difícil',
      xpReward: 'Hasta 200 XP',
      isLocked: true,
      unlockRequirement: 'Nivel 5 Requerido'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-[#0e0e11] p-6 sm:p-8 border border-slate-200/60 dark:border-white/[0.06] rounded-none shadow-none">
        <div className="space-y-2">
          <div className="chip">
            <Gamepad2 className="h-3.5 w-3.5 text-sky-500" />
            Zona de Juegos
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            Mini<span className="text-sky-500">juegos</span>.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium max-w-xl">
            Aprende jugando. Gana puntos de experiencia (XP) extra mientras te diviertes y compites en el ranking global.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
        {games.map((game) => {
          const Icon = game.icon
          return (
            <Card 
              key={game.id} 
              className={`rounded-none border-slate-900/10 dark:border-white/10 overflow-hidden transition-all duration-300 relative ${game.isLocked ? 'opacity-70' : 'card-hover'}`}
            >
              <div className={`h-32 bg-gradient-to-br ${game.color} border-b border-slate-900/10 dark:border-white/10 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/[0.02]" />
                <Icon className={`h-14 w-14 ${game.iconColor} relative z-10`} />
                {game.isLocked && (
                  <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-white">
                    <Lock className="h-6 w-6 mb-2 text-slate-300" />
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-200">{game.unlockRequirement}</span>
                  </div>
                )}
              </div>
              <CardHeader className="text-center pt-6">
                <CardTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{game.title}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline" className="rounded-none font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 border-slate-200 dark:border-white/10 text-slate-550 dark:text-slate-400">
                    {game.difficulty}
                  </Badge>
                  <Badge className="rounded-none bg-sky-500/10 text-sky-600 dark:text-sky-400 border-none font-bold uppercase tracking-wider text-[9px] px-2 py-0.5">
                    {game.xpReward}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed min-h-[48px]">
                  {game.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  disabled={game.isLocked}
                  className={`w-full rounded-none font-black h-11 transition-all uppercase text-[10px] tracking-[0.2em] ${game.isLocked ? 'bg-slate-100 dark:bg-white/5 text-slate-400' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all shadow-none'}`}
                >
                  <Play className="mr-2 h-3.5 w-3.5 fill-current" /> Jugar Ahora
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
