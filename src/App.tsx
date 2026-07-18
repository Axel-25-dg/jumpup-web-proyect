import AppRouter from './presentation/router/AppRouter'
import { WebSocketProvider } from './presentation/context/WebSocketContext'
import { Toaster } from './presentation/components/ui/sonner'

export default function App() {
  return (
    <WebSocketProvider>
      <AppRouter />
      <Toaster />
    </WebSocketProvider>
  )
}
