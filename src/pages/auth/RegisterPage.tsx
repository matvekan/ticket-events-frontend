import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { AuthCard } from '../../components/ui/AuthCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { apiErrorMessage } from '../../lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов'),
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    try {
      await registerUser(values.name, values.email, values.password);
      navigate('/', { replace: true });
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  return (
    <AuthCard
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы бронировать и оплачивать билеты."
    >
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Имя" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Пароль" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Создать аккаунт
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Войдите
        </Link>
      </p>
    </AuthCard>
  );
}
