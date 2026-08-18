import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ChatMessageDto } from '../../types';
import { formatTime } from '../../lib/format';
import { Button } from '../ui/Button';

interface ChatWindowProps {
  messages: ChatMessageDto[];
  mineFor: (message: ChatMessageDto) => boolean;
  disabled?: boolean;
  disabledText?: string;
  emptyText: string;
  placeholder: string;
  onSend: (text: string) => void;
}

function MessageBubble({ message, mine }: { message: ChatMessageDto; mine: boolean }) {
  const { senderName, isSupport, text, createdAt } = message;
  const title = isSupport ? `${senderName} · поддержка` : senderName;
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          mine ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md bg-white text-gray-900'
        }`}
      >
        <div className={`mb-0.5 text-xs font-semibold ${mine ? 'text-indigo-200' : 'text-indigo-600'}`}>{title}</div>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</p>
        <div className={`mt-1 text-right text-[11px] ${mine ? 'text-indigo-200' : 'text-gray-400'}`}>
          {formatTime(createdAt)}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({ messages, mineFor, disabled, disabledText, emptyText, placeholder, onSend }: ChatWindowProps) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText('');
  };

  return (
    <div className="flex h-[28rem] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="pt-10 text-center text-sm text-gray-400">{emptyText}</p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} mine={mineFor(message)} />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={2000}
          disabled={disabled}
          placeholder={disabled ? (disabledText ?? 'Ожидание подключения…') : placeholder}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <Button type="submit" disabled={disabled || !text.trim()} className="shrink-0">
          Отправить
        </Button>
      </form>
    </div>
  );
}