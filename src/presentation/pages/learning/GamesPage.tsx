import { Gamepad2, BrainCircuit, Type, Sparkles, Play, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

export default function GamesPage() {
  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Encuentra los pares de palabras en diferentes idiomas. ¡Entrena tu memoria y gana XP!',
      icon: BrainCircuit,
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-500/30',
      difficulty: 'Fácil',
      xpReward: 'Hasta 50 XP',
      isLocked: false
    },
    {
      id: 'typing',
      title: 'Speed Typing',
      description: 'Escribe las oraciones lo más rápido posible sin errores ortográficos.',
      icon: Type,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/30',
      difficulty: 'Medio',
      xpReward: 'Hasta 100 XP',
      isLocked: false
    },
    {
      id: 'quiz',
      title: 'Quiz Maestro',
      description: 'Responde preguntas de gramática y cultura general en tiempo límite.',
      icon: Sparkles,
      color: 'bg-rose-500',
      shadow: 'shadow-rose-500/30',
      difficulty: 'Difícil',
      xpReward: 'Hasta 200 XP',
      isLocked: true,
      unlockRequirement: 'Nivel 5 Requerido'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            <Gamepad2 className="h-10 w-10 text-emerald-400" /> Minijuegos
          </h1>
          <p className="text-slate-400 text-lg font-medium">Aprende jugando. ¡Gana puntos de experiencia (XP) extra mientras te diviertes!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {games.map((game) => {
          const Icon = game.icon
          return (
            <Card 
              key={game.id} 
              className={`border-none shadow-xl rounded-[2rem] overflow-hidden transition-all duration-300 ${game.isLocked ? 'opacity-80 grayscale-[0.5]' : 'hover:-translate-y-2 hover:shadow-2xl'}`}
            >
              <div className={`h-32 ${game.color} ${game.shadow} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <Icon className="h-16 w-16 text-white relative z-10" />
                {game.isLocked && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white">
                    <Lock className="h-8 w-8 mb-2" />
                    <span className="font-black text-sm uppercase tracking-widest">{game.unlockRequirement}</span>
                  </div>
                )}
              </div>
              <CardHeader className="text-center pt-6">
                <CardTitle className="text-2xl font-black text-slate-800">{game.title}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline" className="font-black uppercase tracking-wider text-[10px]">
                    {game.difficulty}
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-black uppercase tracking-wider text-[10px]">
                    {game.xpReward}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm font-medium text-slate-500 leading-relaxed">
                  {game.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  disabled={game.isLocked}
                  className={`w-full rounded-xl font-black h-12 shadow-lg ${game.color} hover:opacity-90`}
                >
                  <Play className="mr-2 h-5 w-5 fill-current" /> Jugar Ahora
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
