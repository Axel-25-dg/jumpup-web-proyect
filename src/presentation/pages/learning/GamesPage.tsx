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
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-[#0e0e11] p-8 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl shadow-xs">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-slate-900 dark:text-white">
            <Gamepad2 className="h-8 w-8 text-sky-500 animate-pulse" /> Minijuegos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium">Aprende jugando. Gana puntos de experiencia (XP) extra mientras te diviertes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {games.map((game) => {
          const Icon = game.icon
          return (
            <Card 
              key={game.id} 
              className={`overflow-hidden transition-all duration-300 relative ${game.isLocked ? 'opacity-70' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/5'}`}
            >
              <div className={`h-32 bg-gradient-to-br ${game.color} border-b ${game.borderColor} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/[0.02]" />
                <Icon className={`h-14 w-14 ${game.iconColor} relative z-10`} />
                {game.isLocked && (
                  <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-white">
                    <Lock className="h-6 w-6 mb-2 text-slate-300" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">{game.unlockRequirement}</span>
                  </div>
                )}
              </div>
              <CardHeader className="text-center pt-6">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{game.title}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline" className="font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 border-slate-200 dark:border-white/10 text-slate-550 dark:text-slate-400">
                    {game.difficulty}
                  </Badge>
                  <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-none font-bold uppercase tracking-wider text-[9px] px-2 py-0.5">
                    {game.xpReward}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed min-h-[48px]">
                  {game.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  disabled={game.isLocked}
                  className={`w-full rounded-xl font-bold h-11 transition-all ${game.isLocked ? 'bg-slate-100 dark:bg-white/5 text-slate-400' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'}`}
                >
                  <Play className="mr-2 h-4 w-4 fill-current" /> Jugar Ahora
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
