import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'

export default function CreateExercisePage() {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([{ id: 1, text: '', options: ['', '', '', ''], correctOption: 0 }])
  
  const addQuestion = () => {
    setQuestions([...questions, { id: questions.length + 1, text: '', options: ['', '', '', ''], correctOption: 0 }])
  }

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100">
            <Link to="/teacher/courses"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nuevo Ejercicio</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Evalúa a tus estudiantes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl font-bold">Cancelar</Button>
          <Button className="h-12 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 px-6">
            <Save className="mr-2 h-5 w-5" /> Guardar Ejercicio
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">Lección Asociada</label>
                <div className="h-14 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-500 flex items-center px-4 cursor-not-allowed">
                  Selecciona una lección...
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-black text-slate-900">Puntaje Máximo</label>
                 <Input 
                   type="number"
                   defaultValue="100"
                   className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Título del Ejercicio / Prueba</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Quiz de Verbos Irregulares" 
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Builder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Preguntas</h2>
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 px-3 py-1 text-xs">
              {questions.length} Total
            </Badge>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={q.id} className="border-none shadow-lg shadow-slate-200/40 bg-white rounded-[2rem] overflow-hidden relative group">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">
                      {qIndex + 1}
                    </span>
                    Enunciado de la Pregunta
                  </label>
                  <Input 
                    placeholder="Ej. ¿Cuál es el pasado simple del verbo 'Go'?" 
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opciones de Respuesta</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((_, optIndex) => (
                      <div key={optIndex} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors ${q.correctOption === optIndex ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white'}`}>
                         <button 
                           className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.correctOption === optIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}
                           onClick={() => {
                             const newQ = [...questions];
                             newQ[qIndex].correctOption = optIndex;
                             setQuestions(newQ);
                           }}
                         >
                           {q.correctOption === optIndex && <CheckCircle2 className="h-4 w-4" />}
                         </button>
                         <Input 
                           placeholder={`Opción ${optIndex + 1}`}
                           className="h-10 border-none bg-transparent font-medium shadow-none focus-visible:ring-0 px-0"
                         />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            variant="outline" 
            className="w-full h-16 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
            onClick={addQuestion}
          >
            <Plus className="mr-2 h-5 w-5" /> Agregar Nueva Pregunta
          </Button>
        </div>
      </div>
    </div>
  )
}
