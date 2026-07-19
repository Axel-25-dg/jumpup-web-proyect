import { useState, useEffect } from 'react'
import { Users, BookOpen, Plus } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { getAdminDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { AdminDashboardData } from '@/domain/ports/dashboard.repository'

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAdminDashboardUseCase.execute().then(setData).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Skeleton className="h-96 w-full" />

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black">Panel de Control</h1>
          <p className="text-slate-500">{data?.users ?? 0} usuarios registrados</p>
        </div>
        <Button asChild><Link to="/admin/management/courses/new"><Plus className="mr-2"/>Nuevo Curso</Link></Button>
      </section>

      <div className="grid gap-px lg:grid-cols-3 border border-slate-900/10">
        <div className="lg:col-span-2 p-8 bg-white dark:bg-black">
          <h2 className="text-xl font-bold mb-4">Resumen</h2>
          {/* Contenido adicional aquí */}
        </div>
        
        <aside className="p-8 bg-white dark:bg-black border-l border-slate-900/10">
          <h2 className="text-xl font-bold mb-4">Gestión</h2>
          <div className="space-y-4">
             <Link to="/admin/users" className="flex items-center gap-2"><Users size={16}/> Usuarios</Link>
             <Link to="/admin/management/courses" className="flex items-center gap-2"><BookOpen size={16}/> Cursos</Link>
          </div>
        </aside>
      </div> 
    </div>
  )
}