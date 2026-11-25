import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
  import.meta.env.VITE_API_URL?.replace('/api/v1', '') ||
  'http://localhost:5000';

export function useSocket(onEvent?: (event: string, payload: any) => void) {
  const token = useAuthStore((state) => state.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to real-time events engine');
    });

    const events = [
      'platform:announcement',
      'school:created',
      'school:updated',
      'school:status_updated',
      'subscription:renewed',
      'payment:completed',
    ];

    events.forEach((ev) => {
      socket.on(ev, (data) => {
        if (onEvent) onEvent(ev, data);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, onEvent]);

  return socketRef.current;
}
