import {
  Users,
  Video,
  BookOpen,
  MessageSquare,
  Plus,
  Clock,
  Sparkles,
  Trophy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Link } from 'react-router-dom'

export default function TeacherDashboardPage() {
  const teacherStats = [
    { label: 'Mis Estudiantes', value: '142', sub: 'Activos hoy', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Aulas Activas', value: '8', sub: '3 niveles MCER', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Tareas Pendientes', value: '24', sub: 'Por calificar', icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'XP Otorgado', value: '12.5k', sub: 'Este mes', icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Panel del Profesor</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Gestiona tus clases y motiva a tus alumnos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-2xl font-bold border-2 px-6">Ver Horario</Button>
          <Button className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            <Plus className="mr-2 h-5 w-5" /> Nueva Sesión Live
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {teacherStats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl w-fit mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
              <div className="flex flex-col mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                <span className="text-xs font-bold text-slate-500 mt-1">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content: Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black">Próximas Sesiones en Vivo</CardTitle>
              <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Tus clases programadas para hoy y mañana</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {[
                { title: 'Inglés Avanzado - C1', students: 12, time: '14:00', date: 'Hoy', status: 'ready' },
                { title: 'Conversación Pro - B2', students: 8, time: '16:30', date: 'Hoy', status: 'ready' },
                { title: 'Gramática Intensiva - A2', students: 24, time: '09:00', date: 'Mañana', status: 'scheduled' },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-indigo-100 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${session.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Video className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{session.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                          <Users className="h-3 w-3" /> {session.students} alumnos
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> {session.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm" className={`rounded-xl font-black px-6 ${session.status === 'ready' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Link to="/live/preview">
                      {session.status === 'ready' ? 'Iniciar Sesión' : 'Configurar'}
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions for Teachers */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/classrooms" className="group">
              <div className="p-6 rounded-[2rem] bg-sky-600 text-white shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-all">
                <Users className="h-8 w-8 mb-4 opacity-50" />
                <h4 className="text-xl font-black mb-1">Mis Aulas</h4>
                <p className="text-sky-100/70 text-xs font-bold">Ver y gestionar alumnos</p>
              </div>
            </Link>
            <Link to="/forum" className="group">
              <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 hover:border-sky-500/50 transition-all">
                <MessageSquare className="h-8 w-8 mb-4 text-sky-600" />
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">Moderación</h4>
                <p className="text-slate-400 text-xs font-bold">4 hilos nuevos hoy</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar: Leaderboard of their students */}
        <aside className="space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black">Top Alumnos</CardTitle>
              <CardDescription className="text-indigo-300 font-bold uppercase tracking-widest text-[10px]">Tus mejores JumpUpers</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
               {[
                 { name: 'Sofia Mendez', xp: '4,250', level: 12 },
                 { name: 'Lucas Silva', xp: '3,890', level: 11 },
                 { name: 'Maria Jose', xp: '3,420', level: 9 },
                 { name: 'Diego Torres', xp: '2,100', level: 7 },
               ].map((student, i) => (
                 <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                   <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-black">
                     {student.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-black">{student.name}</p>
                     <p className="text-[10px] font-black text-sky-400 uppercase">Nivel {student.level}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-black">{student.xp}</p>
                     <p className="text-[9px] font-black uppercase text-white/30 tracking-tighter">XP</p>
                   </div>
                 </div>
               ))}
               <Button variant="ghost" className="w-full mt-4 h-12 rounded-xl text-sky-400 hover:text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest">
                 Ver ranking completo
               </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-amber-500 text-slate-900 rounded-[2.5rem] p-8">
            <Sparkles className="h-8 w-8 mb-4 opacity-50" />
            <h3 className="text-xl font-black mb-2">Tip del Día</h3>
            <p className="text-amber-900/70 text-sm font-bold">Las sesiones con feedback visual tienen un 40% más de retención.</p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
