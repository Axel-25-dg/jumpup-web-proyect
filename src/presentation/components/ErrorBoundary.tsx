import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4 border border-slate-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">¡Ups! Algo salió mal.</h1>
            <p className="text-sm text-slate-500 font-medium">
              Ha ocurrido un error inesperado en la aplicación.
            </p>
            {this.state.error && (
              <div className="bg-slate-100 p-4 rounded-xl text-left overflow-auto text-xs font-mono text-rose-600 mt-4 max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              Recargar la página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
