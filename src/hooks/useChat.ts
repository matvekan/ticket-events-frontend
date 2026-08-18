import { useCallback, useEffect, useRef, useState } from 'react';
import { chatSocket, type ChatSocketStatus } from '../lib/chatSocket';
import type { ChatMessageDto } from '../types';

export function useChat() {
  const [status, setStatus] = useState<ChatSocketStatus>(chatSocket.status);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<ChatMessageDto[]>([]);
  const roomRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribeStatus = chatSocket.onStatusChange(setStatus);
    const unsubscribeListener = chatSocket.addListener((payload) => {
      if (payload.type === 'message') {
        const message = payload.message as ChatMessageDto;
        if (message?.roomId === roomRef.current) {
          setIncoming((prev) => [...prev, message]);
        }
      }
    });
    chatSocket.connect();
    return () => {
      unsubscribeStatus();
      unsubscribeListener();
      chatSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    roomRef.current = activeRoomId;
    if (!chatSocket.status) return;
    if (activeRoomId) {
      setIncoming([]);
      chatSocket.sendSubscribe(activeRoomId);
    }
    return () => {
      if (activeRoomId) chatSocket.sendUnsubscribe(activeRoomId);
    };
  }, [activeRoomId]);

  const send = useCallback((text: string) => {
    if (!roomRef.current) return;
    chatSocket.sendMessage(roomRef.current, text);
  }, []);

  return { status, activeRoomId, setActiveRoomId, incoming, send };
}