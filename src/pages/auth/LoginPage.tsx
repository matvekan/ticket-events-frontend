import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { AuthCard } from '../../components/ui/AuthCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { apiErrorMessage } from '../../lib/api';

const loginSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  return (
    <AuthCard
      title="Вход"
      subtitle="Войдите, чтобы бронировать места и следить за заказами."
    >
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Пароль" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Войти
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        <Link to="/forgot-password" className="font-medium text-indigo-600 hover:underline">
          Забыли пароль?
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-gray-500">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline">
          Зарегистрируйтесь
        </Link>
      </p>
    </AuthCard>
  );
}
