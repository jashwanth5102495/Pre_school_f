import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

const getSocketUrl = () => {
  const isBrowser = typeof window !== 'undefined';
  const isRemoteHost =
    isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  if (isBrowser) {
    const customUrl = localStorage.getItem('custom_backend_url');
    if (customUrl) return customUrl.replace('/api/v1', '').replace(/\/+$/, '');
  }

  const envUrl = (import.meta.env.VITE_SOCKET_URL || '').trim();

  if (isRemoteHost) {
    if (envUrl && /^https?:\/\//i.test(envUrl) && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('anvimerbackend')) {
      return envUrl.replace(/\/+$/, '');
    }
    return window.location.origin;
  }

  if (envUrl && !envUrl.includes('anvimerbackend')) {
    return envUrl;
  }

  return (
    import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
    import.meta.env.VITE_API_URL?.replace('/api/v1', '') ||
    'http://localhost:5000'
  );
};

const SOCKET_URL = getSocketUrl();

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
