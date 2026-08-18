import { useEffect, useMemo, useState } from 'react';
import { useAdminChatRooms, useChatMessages } from '../../hooks/queries';
import { useChat } from '../../hooks/useChat';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Alert } from '../../components/ui/Alert';
import { formatTime } from '../../lib/format';
import type { ChatMessageDto, ChatRoomDto } from '../../types';

function mergeMessages(history: ChatMessageDto[], incoming: ChatMessageDto[]): ChatMessageDto[] {
  const seen = new Set<string>();
  return [...history, ...incoming]
    .filter((message) => (seen.has(message.id) ? false : (seen.add(message.id), true)))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function RoomItem({ room, active, onClick }: { room: ChatRoomDto; active: boolean; onClick: () => void }) {
  const last = room.lastMessage;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
        active ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25' : 'bg-white text-gray-900 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold">{room.userEmail}</span>
        {last && <span className={`shrink-0 text-[11px] ${active ? 'text-indigo-200' : 'text-gray-400'}`}>{formatTime(last.createdAt)}</span>}
      </div>
      <p className={`mt-0.5 truncate text-xs ${active ? 'text-indigo-100' : 'text-gray-500'}`}>
        {last ? `${last.isSupport ? 'Поддержка' : last.senderName}: ${last.text}` : 'Сообщений пока нет'}
      </p>
    </button>
  );
}

export function SupportChatPage() {
  const chat = useChat();
  const roomsQuery = useAdminChatRooms();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && roomsQuery.data?.length) {
      setSelectedId(roomsQuery.data[0].id);
    }
  }, [roomsQuery.data, selectedId]);

  useEffect(() => {
    if (selectedId) {
      chat.setActiveRoomId(selectedId);
    }
  }, [selectedId]);

  const { data: history, isLoading } = useChatMessages(selectedId);

  const messages = useMemo(
    () => mergeMessages(history ?? [], chat.incoming),
    [history, chat.incoming],
  );

  const selected = roomsQuery.data?.find((room) => room.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Чат с пользователями</h2>
          <p className="mt-1 text-sm text-gray-500">Отвечайте на обращения в реальном времени.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            chat.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {chat.status === 'connected' ? 'Подключено' : 'Подключение…'}
        </span>
      </div>

      {roomsQuery.isError && <Alert variant="error">Не удалось загрузить список обращений.</Alert>}

      <div className="grid gap-4 lg:grid-cols-[19rem_1fr]">
        <div className="space-y-2">
          {roomsQuery.isLoading && <p className="text-sm text-gray-500">Загрузка…</p>}
          {roomsQuery.data?.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              active={room.id === selectedId}
              onClick={() => setSelectedId(room.id)}
            />
          ))}
          {roomsQuery.data && roomsQuery.data.length === 0 && (
            <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">Обращений пока нет.</p>
          )}
        </div>

        <ChatWindow
          messages={messages}
          mineFor={(message) => message.isSupport}
          disabled={chat.status !== 'connected' || !selectedId}
          disabledText={isLoading && !messages.length ? 'Загрузка истории…' : 'Ожидание подключения к серверу чата…'}
          emptyText={selected ? 'Сообщений пока нет. Напишите первый ответ.' : 'Выберите обращение слева.'}
          placeholder="Ответ…"
          onSend={chat.send}
        />
      </div>
    </div>
  );
}