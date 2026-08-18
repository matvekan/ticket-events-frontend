import { useEffect, useMemo, useState } from 'react';
import { useOpenChatRoom, useChatMessages } from '../../hooks/queries';
import { useChat } from '../../hooks/useChat';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Alert } from '../../components/ui/Alert';
import type { ChatMessageDto, ChatRoomDto } from '../../types';

function mergeMessages(history: ChatMessageDto[], incoming: ChatMessageDto[]): ChatMessageDto[] {
  const seen = new Set<string>();
  return [...history, ...incoming]
    .filter((message) => (seen.has(message.id) ? false : (seen.add(message.id), true)))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ChatPage() {
  const chat = useChat();
  const openRoom = useOpenChatRoom();
  const [room, setRoom] = useState<ChatRoomDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!room && openRoom.isIdle) {
      openRoom
        .mutateAsync()
        .then(setRoom)
        .catch(() => setError('Не удалось открыть чат. Попробуйте ещё раз.'));
    }
  }, [room, openRoom.isIdle]);

  useEffect(() => {
    if (room) {
      chat.setActiveRoomId(room.id);
    }
  }, [room?.id]);

  const { data: history, isLoading } = useChatMessages(chat.activeRoomId);

  const messages = useMemo(
    () => mergeMessages(history ?? [], chat.incoming),
    [history, chat.incoming],
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Чат с поддержкой</h1>
          <p className="mt-1 text-sm text-gray-500">Напишите вопрос — поддержка ответит в реальном времени.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            chat.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {chat.status === 'connected' ? 'Подключено' : 'Подключение…'}
        </span>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading && !room && <p className="text-sm text-gray-500">Открываем чат…</p>}

      <ChatWindow
        messages={messages}
        mineFor={(message) => !message.isSupport}
        disabled={chat.status !== 'connected'}
        disabledText="Ожидание подключения к серверу чата…"
        emptyText="Сообщений пока нет. Напишите первый вопрос."
        placeholder="Сообщение…"
        onSend={chat.send}
      />
    </div>
  );
}