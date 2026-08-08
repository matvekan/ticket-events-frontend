import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRefundOrder } from '../../hooks/queries';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiErrorMessage } from '../../lib/api';

const refundSchema = z.object({
  orderId: z.string().min(1, 'Введите ID заказа'),
});

type RefundForm = z.infer<typeof refundSchema>;

export function RefundsPage() {
  const refund = useRefundOrder();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RefundForm>({ resolver: zodResolver(refundSchema) });

  const onSubmit = async (values: RefundForm) => {
    setError(null);
    setSuccess(null);
    try {
      await refund.mutateAsync(values.orderId);
      setSuccess(`Заказ ${values.orderId} возвращён.`);
      reset();
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Возврат заказа</h2>
        <p className="mb-4 text-sm text-gray-500">Введите ID заказа, чтобы оформить возврат средств.</p>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        {success && (
          <div className="mb-4">
            <Alert variant="success">{success}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="ID заказа" placeholder="Например: 550e8400-e29b-41d4-a716-446655440000" error={errors.orderId?.message} {...register('orderId')} />
          <Button type="submit" variant="danger" className="w-full" loading={isSubmitting}>
            Оформить возврат
          </Button>
        </form>
      </div>
    </div>
  );
}
