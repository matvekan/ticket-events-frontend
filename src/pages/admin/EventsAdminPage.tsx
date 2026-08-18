import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminEvents, useCancelEvent, useCreateEvent, usePublishEvent, useVenueSeats, useVenues } from '../../hooks/queries';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { apiErrorMessage } from '../../lib/api';
import { EVENT_STATUS_LABELS, EVENT_STATUS_TONES, formatDateTime, formatPrice } from '../../lib/format';

const eventSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа').max(100),
  description: z.string().min(10, 'Минимум 10 символов').max(5000),
  date: z.string().min(1, 'Укажите дату'),
  venueId: z.string().min(1, 'Выберите площадку'),
});

type EventForm = z.infer<typeof eventSchema>;

export function EventsAdminPage() {
  const { data: venues } = useVenues();
  const { data: events, isLoading: loadingEvents } = useAdminEvents();
  const createEvent = useCreateEvent();
  const publishEvent = usePublishEvent();
  const cancelEvent = useCancelEvent();

  const [selectedVenue, setSelectedVenue] = useState('');
  const { data: venueSeats, isLoading: loadingSeats } = useVenueSeats(selectedVenue);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventForm>({ resolver: zodResolver(eventSchema) });

  const watchVenueId = watch('venueId');

  useEffect(() => {
    setSelectedVenue(watchVenueId);
    setPrices({});
  }, [watchVenueId]);

  const onSubmit = async (values: EventForm) => {
    const seats = Object.entries(prices)
      .filter(([, price]) => price.trim() !== '')
      .map(([seatId, price]) => ({ seatId, priceAmount: Math.round(Number(price) * 100) }));

    if (seats.length === 0) {
      setError('Укажите цену хотя бы для одного места.');
      return;
    }

    try {
      await createEvent.mutateAsync({
        title: values.title,
        description: values.description,
        date: new Date(values.date).toISOString(),
        venueId: values.venueId,
        seats,
      });
      reset();
      setSelectedVenue('');
      setPrices({});
      setError(null);
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Новое событие</h2>
        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Название" error={errors.title?.message} {...register('title')} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Описание</span>
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm shadow-gray-900/[0.02] outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              rows={5}
              {...register('description')}
            />
            {errors.description?.message && (
              <span className="mt-1 block text-sm text-red-600">{errors.description.message}</span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата и время" type="datetime-local" error={errors.date?.message} {...register('date')} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Площадка</span>
              <select
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                {...register('venueId')}
              >
                <option value="">— Выберите —</option>
                {venues?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.city})
                  </option>
                ))}
              </select>
              {errors.venueId?.message && <span className="mt-1 block text-sm text-red-600">{errors.venueId.message}</span>}
            </label>
          </div>

          {selectedVenue && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 text-sm font-medium text-gray-700">Цены за места</div>
              {loadingSeats && <Spinner label="Загрузка мест..." />}
              {!loadingSeats && venueSeats && (
                <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                  {venueSeats.map((seat) => (
                    <label key={seat.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-1.5 text-sm">
                      <span className="text-gray-600">
                        Ряд {seat.row}, место {seat.number}
                        {seat.sector ? ` · сектор ${seat.sector}` : ''}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Цена, Br"
                        value={prices[seat.id] ?? ''}
                        onChange={(e) => setPrices((prev) => ({ ...prev, [seat.id]: e.target.value }))}
                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-right text-sm outline-none focus:border-indigo-500"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Создать событие
          </Button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Все события</h2>
        {loadingEvents && <Spinner />}
        {!loadingEvents && events?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">Событий пока нет. Создайте первое слева.</p>
          </div>
        )}
        <div className="space-y-3">
          {events?.map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-500">
                  {formatDateTime(event.date)} · {event.venueCity} · {formatPrice(event.priceMin)}–{formatPrice(event.priceMax)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={EVENT_STATUS_TONES[event.status] ?? 'gray'}>
                  {EVENT_STATUS_LABELS[event.status] ?? event.status}
                </Badge>
                {event.status === 'draft' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={publishEvent.isPending}
                    onClick={() => publishEvent.mutate(event.id)}
                  >
                    Опубликовать
                  </Button>
                )}
                {event.status === 'published' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={cancelEvent.isPending}
                    onClick={() => cancelEvent.mutate(event.id)}
                  >
                    Отменить
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
