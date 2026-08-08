import { Link } from 'react-router-dom';
import { useMyOrders } from '../../hooks/queries';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../../lib/format';

export function OrdersPage() {
  const { data: orders, isLoading, isError } = useMyOrders();

  if (isLoading) return <Spinner />;
  if (isError) return <Alert variant="error">Не удалось загрузить заказы.</Alert>;

  if (orders?.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9Zm9 7h.01M15 16h.01M9 13h.01"
            />
          </svg>
        </div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900">У вас пока нет заказов</h2>
        <p className="mb-4 text-sm text-gray-500">
          Найдите интересное событие и забронируйте места — они появятся здесь.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Выбрать событие
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Мои заказы</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {orders?.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Заказ {order.id.slice(0, 8)}</span>
              <Badge tone={ORDER_STATUS_TONES[order.status] ?? 'gray'}>{ORDER_STATUS_LABELS[order.status]}</Badge>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-sm text-gray-500">
                {formatDateTime(order.createdAt)} · билетов: {order.tickets.length}
              </div>
              <div className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
