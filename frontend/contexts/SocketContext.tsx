import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinMatchmaking: (gameMode: string) => void;
  leaveMatchmaking: (gameMode: string) => void;
  matchFound: { room_id: string; opponent: string } | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [matchFound, setMatchFound] = useState<{ room_id: string; opponent: string } | null>(null);

  useEffect(() => {
    // Socket is optional for now (bot mode doesn't need it)
    const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
    
    try {
      const socketInstance = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('match_found', (data) => {
        console.log('Match found:', data);
        setMatchFound(data);
      });

      socketInstance.on('searching', (data) => {
        console.log('Searching, position:', data.position);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } catch (error) {
      console.log('Socket connection failed, bot mode only');
    }
  }, []);

  const joinMatchmaking = (gameMode: string) => {
    if (socket) {
      socket.emit('join_matchmaking', { game_mode: gameMode, user_id: 'guest_' + Date.now() });
    }
  };

  const leaveMatchmaking = (gameMode: string) => {
    if (socket) {
      socket.emit('leave_matchmaking', { game_mode: gameMode });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinMatchmaking, leaveMatchmaking, matchFound }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
