export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export type BadgeTone = 'gray' | 'green' | 'red' | 'amber' | 'blue' | 'indigo';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  cancelled: 'Отменён',
  refunded: 'Возврат',
};

export const ORDER_STATUS_TONES: Record<string, BadgeTone> = {
  pending: 'amber',
  paid: 'green',
  cancelled: 'gray',
  refunded: 'red',
};

export const SEAT_TYPE_LABELS: Record<string, string> = {
  standard: 'Стандарт',
  vip: 'VIP',
  premium: 'Премиум',
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
  cancelled: 'Отменено',
  sold_out: 'Продано',
};

export const EVENT_STATUS_TONES: Record<string, BadgeTone> = {
  draft: 'amber',
  published: 'green',
  cancelled: 'red',
  sold_out: 'blue',
};

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDateParts(iso: string): { day: string; month: string; weekday: string; time: string } {
  const date = new Date(iso);
  return {
    day: new Intl.DateTimeFormat('ru-RU', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(date).replace('.', ''),
    weekday: new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date),
    time: new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date),
  };
}
