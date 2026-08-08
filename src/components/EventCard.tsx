import { Link } from 'react-router-dom';
import { EVENT_STATUS_LABELS, formatDateParts, formatPrice, type BadgeTone } from '../lib/format';
import { Badge } from './ui/Badge';
import type { EventDto } from '../types';

const EVENT_TONES: Record<string, BadgeTone> = {
  cancelled: 'red',
  sold_out: 'blue',
};

export function EventCard({ event }: { event: EventDto }) {
  const date = formatDateParts(event.date);
  const statusTone = EVENT_TONES[event.status];

  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/[0.06]"
    >
      <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 opacity-90" />

      <div className="flex flex-1 gap-4 p-5">
        <div className="flex h-fit w-14 shrink-0 flex-col items-center rounded-xl bg-indigo-50 py-2 text-indigo-700">
          <span className="font-display text-xl font-bold leading-none">{date.day}</span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide">{date.month}</span>
          <span className="mt-0.5 text-[10px] text-indigo-400">{date.weekday.slice(0, 3)}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-start gap-2">
            <h3 className="line-clamp-2 flex-1 font-semibold text-gray-900 transition-colors group-hover:text-indigo-700">
              {event.title}
            </h3>
            {statusTone && (
              <Badge tone={statusTone}>
                {EVENT_STATUS_LABELS[event.status] ?? event.status}
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-gray-500">{event.description}</p>
        </div>
      </div>

      <div className="relative border-t border-dashed border-gray-200 px-5 py-3">
        <span className="pointer-events-none absolute -left-2.5 -top-2.5 size-5 rounded-full bg-[#f7f6fb] ring-1 ring-gray-200/60" />
        <span className="pointer-events-none absolute -right-2.5 -top-2.5 size-5 rounded-full bg-[#f7f6fb] ring-1 ring-gray-200/60" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <span className="truncate">
              {event.venueName} · {event.venueCity}
            </span>
          </div>
          <div className="shrink-0 text-sm font-bold text-gray-900">
            {event.priceMin === 0 && event.priceMax === 0 ? (
              <span className="font-semibold text-gray-400">Цена уточняется</span>
            ) : (
              <>
                {formatPrice(event.priceMin)}
                {event.priceMax !== event.priceMin && (
                  <span className="font-semibold text-gray-400"> – {formatPrice(event.priceMax)}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}