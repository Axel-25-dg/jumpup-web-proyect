import AppRouter from './presentation/router/AppRouter'
import { WebSocketProvider } from './presentation/context/WebSocketContext'

export default function App() {
  return (
    <WebSocketProvider>
      <AppRouter />
    </WebSocketProvider>
  )
}
