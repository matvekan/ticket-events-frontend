import { useState } from 'react';
import type { SeatDto } from '../types';
import { formatPrice, SEAT_TYPE_LABELS } from '../lib/format';

interface SeatPickerProps {
  seats: SeatDto[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function SeatPicker({ seats, selectedIds, onToggle }: SeatPickerProps) {
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const sectors = [...new Set(seats.map((s) => s.sector).filter((s): s is string => s !== null))];
  const types = [...new Set(seats.map((s) => s.type))];

  const visible = seats.filter(
    (s) => (sectorFilter === 'all' || s.sector === sectorFilter) && (typeFilter === 'all' || s.type === typeFilter),
  );

  if (seats.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-500">Свободных мест нет.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">Все сектора</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              Сектор {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">Все типы</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {SEAT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <div className="ml-auto hidden items-center gap-4 text-xs text-gray-500 sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded border border-gray-200 bg-white" /> Свободно
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded border border-indigo-600 bg-indigo-50" /> Выбрано
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
        {visible.map((seat) => {
          const isSelected = selectedIds.includes(seat.id);
          return (
            <button
              key={seat.id}
              type="button"
              onClick={() => onToggle(seat.id)}
              title={`Ряд ${seat.row}, место ${seat.number} — ${formatPrice(seat.priceAmount)}`}
              className={`rounded-xl border p-3 text-left text-sm transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm ring-2 ring-indigo-100'
                  : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="font-medium">
                Ряд {seat.row}, место {seat.number}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>{SEAT_TYPE_LABELS[seat.type]}</span>
                <span className="font-semibold text-gray-900">{formatPrice(seat.priceAmount)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
