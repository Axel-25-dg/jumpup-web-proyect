  import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/presentation/store/auth.store';
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage';
import { API_CONFIG } from '@/infrastructure/config/api.config';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    if (!user || !API_CONFIG.WS_URL) return;
    if (sessionStorage.getItem('ws_notifications_disabled') === 'true') return;
    if (API_CONFIG.WS_URL.includes('guaman-idiomas-ute.online')) return;

    let disposed = false;
    let hasOpenedOnce = false;

    const connect = () => {
      if (disposed || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) return;
      if (sessionStorage.getItem('ws_notifications_disabled') === 'true') return;

      const token = localTokenStorage.getAccessToken();
      if (!token) return;

      const ws = new WebSocket(`${API_CONFIG.WS_URL}/notifications/?token=${token}`);
      socketRef.current = ws;

      ws.onopen = () => {
        if (disposed) return;
        setIsConnected(true);
        hasOpenedOnce = true;
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          window.dispatchEvent(new CustomEvent('ws:message', { detail: JSON.parse(event.data) }));
        } catch {
          console.error('Error parsing WS message');
        }
      };

      ws.onclose = () => {
        if (disposed) return;
        socketRef.current = null;
        setIsConnected(false);
        if (!hasOpenedOnce) {
          sessionStorage.setItem('ws_notifications_disabled', 'true');
          return;
        }
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        if (!hasOpenedOnce) {
          sessionStorage.setItem('ws_notifications_disabled', 'true');
        }
        ws.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      socketRef.current?.close();
      socketRef.current = null;
      setIsConnected(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [user]);

  const sendMessage = (data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn('Cannot send message: WS not connected');
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
