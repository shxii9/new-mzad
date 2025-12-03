import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // الاتصال بالخادم
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5002', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('✅ متصل بـ Socket.IO');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ انقطع الاتصال بـ Socket.IO');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('خطأ في الاتصال:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const joinAuction = (auctionId) => {
        if (socket && connected) {
            socket.emit('join-auction', auctionId);
        }
    };

    const leaveAuction = (auctionId) => {
        if (socket && connected) {
            socket.emit('leave-auction', auctionId);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, connected, joinAuction, leaveAuction }}>
            {children}
        </SocketContext.Provider>
    );
};
