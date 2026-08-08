import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventDetails, useReserveSeats } from '../../hooks/queries';
import { useAuth } from '../../hooks/useAuth';
import { SeatPicker } from '../../components/SeatPicker';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EVENT_STATUS_TONES, formatDateParts, formatPrice } from '../../lib/format';
import { apiErrorMessage } from '../../lib/api';

function statusLabel(status: string): string {
  if (status === 'published') return 'Продажа открыта';
  if (status === 'sold_out') return 'Распродано';
  if (status === 'cancelled') return 'Отменено';
  return 'Черновик';
}

function EventMap({ lat, lng, city, address }: { lat: number | null; lng: number | null; city: string; address: string }) {
  const hasCoords = lat !== null && lng !== null;
  const src = hasCoords
    ? `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=17&pt=${lng},${lat},pm2rdl&l=map`
    : `https://yandex.ru/map-widget/v1/?l=map&z=16&text=${encodeURIComponent(`${city}, ${address}`)}`;
  const mapsUrl = hasCoords
    ? `https://yandex.ru/maps/?pt=${lng},${lat}&z=17`
    : `https://yandex.ru/maps/?text=${encodeURIComponent(`${city}, ${address}`)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <h3 className="font-semibold text-gray-900">Как добраться</h3>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          Открыть в Яндекс.Картах
        </a>
      </div>
      <iframe src={src} title="Площадка на Яндекс.Картах" className="h-72 w-full border-0" loading="lazy" allowFullScreen />
    </div>
  );
}

export function EventDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: event, isLoading, isError } = useEventDetails(id);
  const reserve = useReserveSeats();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleSeat = (seatId: string) => {
    setSelectedIds((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId],
    );
  };

  const total = useMemo(
    () => event?.availableSeats.filter((s) => selectedIds.includes(s.id)).reduce((sum, s) => sum + (s.priceAmount ?? 0), 0) ?? 0,
    [event, selectedIds],
  );

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setError(null);
    try {
      await reserve.mutateAsync(selectedIds);
      navigate('/orders');
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  if (isLoading) return <Spinner />;

  if (isError || !event) {
    return <Alert variant="error">Событие не найдено.</Alert>;
  }

  const date = formatDateParts(event.date);
  const statusTone = EVENT_STATUS_TONES[event.status] ?? 'gray';

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-indigo-900/20 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-12 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={statusTone}>{statusLabel(event.status)}</Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                {date.weekday}, {date.day} {date.month} · {date.time}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight">{event.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-indigo-100">
              <span className="inline-flex items-center gap-1.5">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {event.venueName}, {event.venueCity}
              </span>
              <span>{event.venueAddress}</span>
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/15 px-5 py-4 text-right backdrop-blur">
            <div className="text-xs font-medium uppercase tracking-wide text-indigo-100">Цены</div>
            <div className="font-display text-xl font-bold">
              {formatPrice(event.priceMin)}
              {event.priceMax !== event.priceMin && ` – ${formatPrice(event.priceMax)}`}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-display text-lg font-bold text-gray-900">О событии</h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">{event.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 font-display text-lg font-bold text-gray-900">Выберите места</h2>
            <SeatPicker seats={event.availableSeats} selectedIds={selectedIds} onToggle={toggleSeat} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Ваш заказ</h3>
            <div className="mb-4 text-sm text-gray-500">Выбрано мест: {selectedIds.length}</div>
            <div className="mb-4 flex items-end justify-between">
              <span className="text-sm font-medium text-gray-700">Итого</span>
              <span className="font-display text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
            </div>
            {error && (
              <div className="mb-4">
                <Alert variant="error">{error}</Alert>
              </div>
            )}
            <Button
              size="lg"
              className="w-full"
              loading={reserve.isPending}
              disabled={selectedIds.length === 0}
              onClick={handleReserve}
            >
              {isAuthenticated ? 'Забронировать' : 'Войти и забронировать'}
            </Button>
          </div>

          <EventMap
            lat={event.venueLatitude}
            lng={event.venueLongitude}
            city={event.venueCity}
            address={event.venueAddress}
          />
        </div>
      </section>
    </div>
  );
}