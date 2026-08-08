import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPassword } from '../../hooks/queries';
import { AuthCard } from '../../components/ui/AuthCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { apiErrorMessage } from '../../lib/api';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPassword = useResetPassword();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (values: ResetForm) => {
    setError(null);
    try {
      await resetPassword.mutateAsync({ token, password: values.password });
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  return (
    <AuthCard title="Новый пароль" subtitle="Придумайте новый пароль для входа в аккаунт.">
      {!token ? (
        <Alert variant="error">Ссылка некорректна. Запросите восстановление пароля заново.</Alert>
      ) : resetPassword.isSuccess ? (
        <>
          <div className="mb-4">
            <Alert variant="success">Пароль успешно изменён.</Alert>
          </div>
          <Link
            to="/login"
            className="block w-full rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
          >
            Войти
          </Link>
        </>
      ) : (
        <>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Новый пароль" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
            <Input label="Повторите пароль" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <Button type="submit" className="w-full" loading={resetPassword.isPending}>
              Сохранить пароль
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
