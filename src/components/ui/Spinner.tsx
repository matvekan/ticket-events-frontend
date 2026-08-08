export function Spinner({ label = 'Загрузка...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
      <span className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
