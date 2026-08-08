import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import { useVerifyTicket, type VerifyTicketResult } from '../../hooks/queries';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../lib/format';

const verifySchema = z.object({
  code: z.string().min(1, 'Введите код билета'),
});

type VerifyForm = z.infer<typeof verifySchema>;

export function TicketsCheckPage() {
  const verify = useVerifyTicket();
  const [checked, setChecked] = useState<VerifyTicketResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyForm>({ resolver: zodResolver(verifySchema) });

  const onSubmit = async (values: VerifyForm) => {
    try {
      setChecked(await verify.mutateAsync(values.code));
    } catch (e) {
      setChecked({ valid: false, reason: 'Ошибка запроса к серверу.' });
    }
  };

  const ticket = checked?.ticket;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Проверка билета</h2>
        <p className="mb-4 text-sm text-gray-500">Введите код билета (TKT-XXXXXXXX) или отсканируйте QR-код с билета.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Код билета" placeholder="TKT-AB12CD34" error={errors.code?.message} {...register('code')} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Проверить
          </Button>
        </form>
      </div>

      {checked?.valid && ticket && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Билет действителен</h3>
              <p className="mt-1 font-mono text-sm text-green-700">{ticket.code}</p>
            </div>
            <div className="rounded-lg bg-white p-2">
              <QRCodeSVG value={`ticket:${ticket.code}`} size={80} bgColor="#ffffff" fgColor="#111827" />
            </div>
          </div>
          <dl className="space-y-1 text-sm text-green-900">
            <div className="flex justify-between gap-4">
              <dt className="text-green-700">Событие</dt>
              <dd className="text-right font-medium">{ticket.eventTitle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-green-700">Когда</dt>
              <dd className="text-right font-medium">{formatDateTime(ticket.eventDate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-green-700">Площадка</dt>
              <dd className="text-right font-medium">{ticket.venueName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-green-700">Место</dt>
              <dd className="text-right font-medium">{ticket.seat}</dd>
            </div>
          </dl>
        </div>
      )}

      {checked && !checked.valid && (
        <Alert variant="error">
          {checked.reason ?? 'Билет недействителен.'}
        </Alert>
      )}
    </div>
  );
}
