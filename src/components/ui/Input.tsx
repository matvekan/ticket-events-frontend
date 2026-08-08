import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm shadow-gray-900/[0.02] outline-none transition-all focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-100'
        } ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
});
