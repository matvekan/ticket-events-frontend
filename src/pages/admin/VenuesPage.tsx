import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVenue, useVenues } from '../../hooks/queries';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiErrorMessage } from '../../lib/api';

const venueSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(255),
  address: z.string().min(5, 'Минимум 5 символов').max(255),
  city: z.string().min(2, 'Минимум 2 символа').max(100),
  latitude: z.union([z.number().min(-90, 'Широта от -90 до 90').max(90, 'Широта от -90 до 90'), z.literal('')]),
  longitude: z.union([z.number().min(-180, 'Долгота от -180 до 180').max(180, 'Долгота от -180 до 180'), z.literal('')]),
});

type VenueForm = z.infer<typeof venueSchema>;

export function VenuesPage() {
  const { data: venues, isLoading, isError } = useVenues();
  const createVenue = useCreateVenue();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VenueForm>({ resolver: zodResolver(venueSchema) });

  const onSubmit = async (values: VenueForm) => {
    try {
      await createVenue.mutateAsync({
        name: values.name,
        address: values.address,
        city: values.city,
        latitude: values.latitude === '' ? null : values.latitude,
        longitude: values.longitude === '' ? null : values.longitude,
      });
      reset();
      setError(null);
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Площадки</h2>
        {isLoading && <Spinner />}
        {isError && <Alert variant="error">Не удалось загрузить площадки.</Alert>}
        {!isLoading && !isError && venues?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">Площадок пока нет. Создайте первую справа.</p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {venues?.map((venue) => (
            <Link
              key={venue.id}
              to={`/admin/venues/${venue.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="font-medium text-gray-900 group-hover:text-indigo-700">{venue.name}</div>
              <div className="text-sm text-gray-500">
                {venue.city}, {venue.address}
              </div>
              {venue.latitude !== null && venue.longitude !== null && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                  На карте
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Новая площадка</h2>
        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Название" error={errors.name?.message} {...register('name')} />
          <Input label="Адрес" error={errors.address?.message} {...register('address')} />
          <Input label="Город" error={errors.city?.message} {...register('city')} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Широта"
              type="number"
              step="any"
              placeholder="напр. 55.7558"
              error={errors.latitude?.message}
              {...register('latitude', { valueAsNumber: true })}
            />
            <Input
              label="Долгота"
              type="number"
              step="any"
              placeholder="напр. 37.6173"
              error={errors.longitude?.message}
              {...register('longitude', { valueAsNumber: true })}
            />
          </div>
          <p className="text-xs text-gray-400">
            Координаты нужны для показа площадки на карте (Яндекс.Карты). Можно оставить пустыми.
          </p>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Создать
          </Button>
        </form>
      </div>
    </div>
  );
}
