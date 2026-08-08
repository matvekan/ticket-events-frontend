import type { ReactNode } from 'react';

type Variant = 'error' | 'success' | 'info';

interface AlertProps {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

export function Alert({ variant = 'info', children }: AlertProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}
