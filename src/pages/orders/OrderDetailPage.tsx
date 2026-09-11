import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useCancelOrder, useOrder, usePayOrder } from '../../hooks/queries';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiErrorMessage } from '../../lib/api';
import { formatDateTime, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../../lib/format';

export function OrderDetailPage() {
    const { id = '' } = useParams();
    const [searchParams] = useSearchParams();
    const paymentResult = searchParams.get('payment');
    useNavigate();
    const { data: order, isLoading, isError } = useOrder(id);
    const pay = usePayOrder();
    const cancel = useCancelOrder();
    const [error, setError] = useState<string | null>(null);

    if (isLoading) return <Spinner />;
    if (isError || !order) return <Alert variant="error">Ошибка загрузки заказа.</Alert>;

    const handlePay = async () => {
        setError(null);
        try {
            const { data } = await pay.mutateAsync(order.id);
            window.location.href = data.paymentUrl;
        } catch (e) {
            setError(apiErrorMessage(e));
        }
    };

    const handleCancel = async () => {
        setError(null);
        try {
            await cancel.mutateAsync(order.id);
        } catch (e) {
            setError(apiErrorMessage(e));
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Заказ {order.id.slice(0, 8)}</h1>
                    <Badge tone={ORDER_STATUS_TONES[order.status] ?? 'gray'}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                </div>
                <div className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</div>
            </div>

            {error && (
                <div className="mb-4">
                    <Alert variant="error">{error}</Alert>
                </div>
            )}

            {paymentResult === 'success' && (
                <div className="mb-4">
                    <Alert variant="success">Заказ успешно оплачен.</Alert>
                </div>
            )}

            {paymentResult === 'failed' && (
                <div className="mb-4">
                    <Alert variant="error">Не удалось оплатить заказ.</Alert>
                </div>
            )}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                {order.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0">
                        <div className="min-w-0">
                            <div className="font-medium text-gray-900">{ticket.eventTitle}</div>
                            <div className="text-sm text-gray-500">
                                {formatDateTime(ticket.eventDate)} • {ticket.venueName}
                            </div>
                            <div className="mt-1 font-mono text-xs text-gray-400">Код: {ticket.code}</div>
                            <div className="mt-1 font-semibold text-gray-900">{formatPrice(ticket.priceAmount)}</div>
                        </div>
                        {order.status === 'paid' && (
                            <div className="shrink-0 rounded-lg border border-gray-200 bg-white p-2">
                                <QRCodeSVG value={`ticket:${ticket.code}`} size={96} bgColor="#ffffff" fgColor="#111827" />
                            </div>
                        )}
                    </div>
                ))}
                <div className="flex items-center justify-between bg-gray-50 p-4">
                    <span className="font-medium text-gray-700">Итого</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
                </div>
            </div>

            {order.status === 'pending' && (
                <div className="flex gap-3">
                    <Button loading={pay.isPending} onClick={handlePay}>
                        Оплатить
                    </Button>
                    <Button variant="secondary" loading={cancel.isPending} onClick={handleCancel}>
                        Отменить заказ
                    </Button>
                </div>
            )}
        </div>
    );
}