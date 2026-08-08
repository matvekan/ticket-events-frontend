import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddSeats, useVenue, useVenueSeats } from '../../hooks/queries';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiErrorMessage } from '../../lib/api';
import { SEAT_TYPE_LABELS } from '../../lib/format';
import type { SeatDto } from '../../types';

const seatSchema = z.object({
  row: z.string().min(1, 'Укажите ряд').max(10),
  number: z.coerce.number().int().min(1, 'Номер места'),
  type: z.enum(['standard', 'vip', 'premium']),
  sector: z.string().max(50).optional().or(z.literal('')),
  count: z.coerce.number().int().min(1).max(100).default(1),
});

type SeatForm = z.infer<typeof seatSchema>;

export function VenueDetailPage() {
  const { id = '' } = useParams();
  const { data: venue, isLoading: loadingVenue } = useVenue(id);
  const { data: seats, isLoading: loadingSeats } = useVenueSeats(id);
  const addSeats = useAddSeats(id);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeatForm>({
    resolver: zodResolver(seatSchema),
    defaultValues: { type: 'standard', count: 1 },
  });

  const onSubmit = async (values: SeatForm) => {
    const rows: Array<{ row: string; number: number; type: string; sector: string | null }> = [];
    for (let i = 0; i < values.count; i++) {
      rows.push({
        row: values.row,
        number: values.number + i,
        type: values.type,
        sector: values.sector ? values.sector : null,
      });
    }
    try {
      await addSeats.mutateAsync({ seats: rows });
      reset({ type: 'standard', count: 1 });
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  if (loadingVenue) return <Spinner />;
  if (!venue) return <Alert variant="error">Площадка не найдена.</Alert>;

  const grouped = seats?.reduce<Record<string, SeatDto[]>>((acc, seat) => {
    (acc[seat.row] ??= []).push(seat);
    return acc;
  }, {});

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900">{venue.name}</h2>
        <p className="mb-4 text-sm text-gray-500">
          {venue.city}, {venue.address}
        </p>
        {venue.latitude !== null && venue.longitude !== null && (
          <p className="mb-4 text-xs text-gray-400">
            Координаты: {venue.latitude.toFixed(5)}, {venue.longitude.toFixed(5)}
          </p>
        )}

        <h3 className="mb-3 font-medium text-gray-900">Места ({seats?.length ?? 0})</h3>
        {loadingSeats && <Spinner />}
        {grouped && (
          <div className="space-y-3">
            {Object.entries(grouped).map(([row, rowSeats]) => (
              <div key={row} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 text-sm font-medium text-gray-700">Ряд {row}</div>
                <div className="flex flex-wrap gap-1.5">
                  {rowSeats.map((seat) => (
                    <span
                      key={seat.id}
                      title={`${SEAT_TYPE_LABELS[seat.type]}${seat.sector ? `, сектор ${seat.sector}` : ''}`}
                      className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {seat.number}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Добавить места</h3>
        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ряд" error={errors.row?.message} {...register('row')} />
            <Input label="Первое место №" type="number" error={errors.number?.message} {...register('number')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Тип</span>
              <select
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                {...register('type')}
              >
                <option value="standard">Стандарт</option>
                <option value="vip">VIP</option>
                <option value="premium">Премиум</option>
              </select>
            </label>
            <Input label="Кол-во мест" type="number" error={errors.count?.message} {...register('count')} />
          </div>
          <Input label="Сектор (необязательно)" error={errors.sector?.message} {...register('sector')} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Добавить
          </Button>
        </form>
      </div>
    </div>
  );
}
