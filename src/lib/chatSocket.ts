import { getToken } from './api';

const WS_URL = import.meta.env.VITE_CHAT_WS_URL ?? 'ws://localhost:8080';

export type ChatSocketStatus = 'connecting' | 'connected' | 'disconnected';

export type ChatSocketListener = (payload: Record<string, unknown>) => void;

const RECONNECT_DELAY_MS = 2000;

export class ChatSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<ChatSocketListener>();
  private statusListeners = new Set<(status: ChatSocketStatus) => void>();
  private subscriptions = new Set<string>();
  status: ChatSocketStatus = 'disconnected';

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.setStatus('connecting');
    const token = getToken();
    const url = token ? `${WS_URL}/?token=${encodeURIComponent(token)}` : WS_URL;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.setStatus('connected');
      this.subscriptions.forEach((roomId) => this.send({ type: 'subscribe', roomId }));
    };
    this.ws.onclose = () => {
      this.setStatus('disconnected');
      this.scheduleReconnect();
    };
    this.ws.onerror = () => {
      this.ws?.close();
    };
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data)) as Record<string, unknown>;
        if (typeof data.type === 'string') {
          this.emit(data);
        }
      } catch {
        // ignore malformed frames
      }
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.subscriptions.clear();
    this.ws?.close();
    this.ws = null;
    this.setStatus('disconnected');
  }

  sendSubscribe(roomId: string): void {
    this.subscriptions.add(roomId);
    this.send({ type: 'subscribe', roomId });
  }

  sendUnsubscribe(roomId: string): void {
    this.subscriptions.delete(roomId);
    this.send({ type: 'unsubscribe', roomId });
  }

  sendMessage(roomId: string, text: string): void {
    this.send({ type: 'message', roomId, text });
  }

  addListener(listener: ChatSocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatusChange(callback: (status: ChatSocketStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private send(payload: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private emit(payload: Record<string, unknown>): void {
    this.listeners.forEach((listener) => listener(payload));
  }

  private setStatus(status: ChatSocketStatus): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_DELAY_MS);
  }
}

export const chatSocket = new ChatSocket();