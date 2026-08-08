import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents } from '../../hooks/queries';
import { EventCard } from '../../components/EventCard';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { apiErrorMessage } from '../../lib/api';

export function EventsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const { data: events, isLoading, isError, error } = useEvents(query);

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-indigo-900/20 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Бронирование билетов онлайн
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            События, которые стоит увидеть
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
            Концерты, спектакли и выставки в одном месте. Выбирайте площадку, место и оплачивайте за пару минут.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchParams(draft ? { q: draft } : {});
            }}
            className="mt-6 flex max-w-lg items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lg"
          >
            <svg className="ml-3 size-5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
            </svg>
            <input
              type="search"
              placeholder="Поиск по названию, описанию или городу"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Найти
            </button>
          </form>
        </div>
      </section>

      <div className="mb-4 mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-gray-900">
          {query ? `Результаты по запросу «${query}»` : 'Все события'}
        </h2>
        {events && !isLoading && (
          <span className="text-sm text-gray-400">{events.length}</span>
        )}
      </div>

      {isLoading && <Spinner />}
      {isError && <Alert variant="error">{apiErrorMessage(error)}</Alert>}

      {events && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">Событий не найдено</h3>
          <p className="text-sm text-gray-500">
            {query ? 'Попробуйте изменить запрос — или посмотрите все события.' : 'Билеты появятся здесь, как только площадки опубликуют события.'}
          </p>
          {query && (
            <button
              onClick={() => {
                setDraft('');
                setSearchParams({});
              }}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Показать все
            </button>
          )}
        </div>
      )}

      {events && events.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}