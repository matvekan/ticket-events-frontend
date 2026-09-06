import { useAdminAnalytics } from '../../hooks/queries';
import { Alert } from '../../components/ui/Alert';
import { formatDateTime, formatPrice } from '../../lib/format';

export function AnalyticsPage() {
  const { data, isLoading, isError, error } = useAdminAnalytics();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Загрузка аналитики…</p>;
  }

  if (isError || !data) {
    return (
      <Alert variant="error">
        {error instanceof Error ? error.message : 'Не удалось получить аналитику.'}
      </Alert>
    );
  }

  const { totals, byDay, topUsers, recentPayments } = data;
  const maxRevenue = Math.max(1, ...byDay.map((d) => d.revenue));

  const stats = [
    {
      label: 'Выручка',
      value: formatPrice(Math.round(totals.payments.amount)),
      sub: `${totals.payments.count} оплаченных заказов`,
      tone: 'bg-indigo-600',
    },
    {
      label: 'Возвраты',
      value: formatPrice(Math.round(totals.refunds.amount)),
      sub: `${totals.refunds.count} возвратов`,
      tone: 'bg-red-500',
    },
    {
      label: 'Отмены',
      value: String(totals.cancellations),
      sub: 'отменённых заказов',
      tone: 'bg-amber-500',
    },
    {
      label: 'Бронирования',
      value: String(totals.reservations),
      sub: 'зарезервированных мест',
      tone: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 h-1.5 w-10 rounded-full ${s.tone}`} />
            <p className="text-sm font-medium text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {byDay.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Динамика за 14 дней</h2>
          <div className="space-y-2">
            {byDay.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-right text-xs text-gray-500">
                  {new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(`${d.day}T00:00:00`))}
                </span>
                <div className="flex h-6 flex-1 items-center gap-0.5 overflow-hidden rounded-md bg-gray-50">
                  <div
                    className="flex h-full items-center rounded-l-md bg-indigo-500"
                    style={{ width: `${Math.max(2, (d.revenue / maxRevenue) * 100)}%` }}
                    title={`Выручка: ${formatPrice(Math.round(d.revenue))}`}
                  />
                  {d.refunds > 0 && (
                    <div
                      className="flex h-full items-center rounded-r-md bg-red-400"
                      style={{ width: `${Math.max(2, (d.refunds / maxRevenue) * 100)}%` }}
                      title={`Возвраты: ${formatPrice(Math.round(d.refunds))}`}
                    />
                  )}
                </div>
                <span className="w-24 shrink-0 text-xs font-medium text-gray-700">
                  {formatPrice(Math.round(d.revenue))}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Выручка
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Возвраты
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Топ покупателей</h2>
          {topUsers.length === 0 ? (
            <p className="text-sm text-gray-500">Пока нет оплаченных заказов.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-400">
                  <th className="pb-2 font-medium">Пользователь</th>
                  <th className="pb-2 text-right font-medium">Заказов</th>
                  <th className="pb-2 text-right font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u) => (
                  <tr key={u.userId} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 font-mono text-xs text-gray-700">{u.userId.slice(0, 13)}…</td>
                    <td className="py-2 text-right text-gray-700">{u.orders}</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {formatPrice(Math.round(u.revenue))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Последние платежи</h2>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-500">Пока нет платежей.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPayments.map((p) => (
                <li key={p.orderId} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-gray-700">{p.orderId.slice(0, 13)}…</p>
                    <p className="text-xs text-gray-400">{formatDateTime(p.timestamp)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-600">
                    +{formatPrice(Math.round(p.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
