import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPassword } from '../../hooks/queries';
import { AuthCard } from '../../components/ui/AuthCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { apiErrorMessage } from '../../lib/api';

const forgotSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotForm) => {
    setError(null);
    try {
      await forgotPassword.mutateAsync({ email: values.email });
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  return (
    <AuthCard
      title="Восстановление пароля"
      subtitle="Укажите email, привязанный к аккаунту. Мы отправим ссылку для сброса пароля."
    >
      {forgotPassword.isSuccess && (
        <div className="mb-4">
          <Alert variant="success">
            Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.
          </Alert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {!forgotPassword.isSuccess && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" className="w-full" loading={forgotPassword.isPending}>
            Отправить ссылку
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Вспомнили пароль?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Войдите
        </Link>
      </p>
    </AuthCard>
  );
}
