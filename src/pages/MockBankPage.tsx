import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../lib/api';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

interface MockBankPayment {
    paymentId: string;
    orderId: string;
    amount: number;
    amountFormatted: string;
    status: string;
}

export function MockBankPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['mock-bank', id],
        queryFn: async () => {
            const { data } = await api.get<MockBankPayment>(`/mock-bank/${id}`);
            return data;
        },
    });

    const actionMutation = useMutation({
        mutationFn: async (action: 'charge' | 'decline') => {
            const { data } = await api.post<{ status: string; orderId: string }>(`/mock-bank/${id}/${action}`);
            return data;
        },
    });

    if (isLoading) return <Spinner />;

    if (isError) return <Alert variant="error">{apiErrorMessage(error)}</Alert>;
    if (!data) return <Alert variant="error">Данные платежа отсутствуют.</Alert>;

    const handleAction = async (action: 'charge' | 'decline') => {
        try {
            const result = await actionMutation.mutateAsync(action);
            // Возвращаем пользователя к заказу и передаем параметр результата
            navigate(`/orders/${result.orderId}?payment=${result.status}`);
        } catch (e) {
            alert('Произошла ошибка при обработке платежа');
        }
    };

    return (
        <div className="mx-auto mt-10 max-w-md">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">Mock Bank Checkout</h1>

                <div className="mb-6 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-500">Платеж:</span>
                        <span className="font-mono text-xs">{data.paymentId}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-500">Заказ:</span>
                        <span className="font-mono text-xs">{data.orderId}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-500">Сумма:</span>
                        <span className="font-bold">{data.amountFormatted}</span>
                    </div>
                </div>

                <p className="mb-6 text-sm text-gray-500">
                    Demo mode: выберите действие для завершения тестового платежа.
                </p>

                <div className="flex gap-3">
                    <Button onClick={() => handleAction('charge')} loading={actionMutation.isPending} className="w-full">
                        Оплатить
                    </Button>
                    <Button variant="danger" onClick={() => handleAction('decline')} loading={actionMutation.isPending} className="w-full">
                        Отклонить
                    </Button>
                </div>
            </div>
        </div>
    );
}