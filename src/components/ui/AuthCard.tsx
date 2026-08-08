import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-indigo-900/[0.05]">
        <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500" />
        <div className="p-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mb-6 text-sm leading-relaxed text-gray-500">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}