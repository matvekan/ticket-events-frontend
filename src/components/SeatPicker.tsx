import { useMemo } from 'react';
import type { SeatDto, SeatStatus } from '../types';
import { formatPrice, SEAT_TYPE_LABELS } from '../lib/format';

interface SeatPickerProps {
  seats: SeatDto[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const TYPE_STYLES: Record<string, { base: string; selected: string }> = {
  standard: {
    base: 'border-gray-300 bg-white text-gray-700 hover:border-indigo-500 hover:bg-indigo-50',
    selected: 'border-indigo-600 bg-indigo-500 text-white shadow-md shadow-indigo-500/30',
  },
  vip: {
    base: 'border-amber-400 bg-amber-50 text-amber-800 hover:border-amber-500 hover:bg-amber-100',
    selected: 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/30',
  },
  premium: {
    base: 'border-violet-400 bg-violet-50 text-violet-800 hover:border-violet-500 hover:bg-violet-100',
    selected: 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-500/30',
  },
};

function isOccupied(status: SeatStatus | null | undefined): boolean {
  return status === 'sold' || status === 'reserved';
}

export function SeatPicker({ seats, selectedIds, onToggle }: SeatPickerProps) {
  const rows = useMemo(() => {
    const byRow = new Map<string, SeatDto[]>();
    for (const seat of seats) {
      const list = byRow.get(seat.row) ?? [];
      list.push(seat);
      byRow.set(seat.row, list);
    }
    return [...byRow.entries()]
      .map(([row, list]) => [row, [...list].sort((a, b) => a.number - b.number)] as const)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  }, [seats]);

  const freeCount = useMemo(() => seats.filter((s) => !isOccupied(s.status)).length, [seats]);

  if (seats.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-500">Свободных мест нет.</p>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 shadow-sm sm:p-7">
      <div className="mx-auto mb-8 h-3 w-3/4 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 shadow-inner" />
      <div className="mx-auto mb-8 w-fit rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-md">
        Сцена
      </div>

      <div className="flex flex-col gap-3 overflow-x-auto pb-2">
        {rows.map(([row, list]) => (
          <div key={row} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-center text-xs font-bold text-gray-500">{row}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {list.map((seat) => {
                const occupied = isOccupied(seat.status);
                const isSelected = selectedIds.includes(seat.id);
                const style = TYPE_STYLES[seat.type] ?? TYPE_STYLES.standard;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={occupied}
                    onClick={() => onToggle(seat.id)}
                    aria-label={`Ряд ${seat.row}, место ${seat.number}${occupied ? ', занято' : ''}`}
                    aria-pressed={isSelected}
                    title={
                      occupied
                        ? `Ряд ${seat.row}, место ${seat.number} — занято`
                        : `Ряд ${seat.row}, место ${seat.number} — ${SEAT_TYPE_LABELS[seat.type] ?? seat.type}, ${formatPrice(seat.priceAmount)}`
                    }
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold transition-all sm:size-9 ${
                      occupied
                        ? 'cursor-not-allowed border-transparent bg-gray-200 text-gray-400'
                        : isSelected
                          ? style.selected
                          : `${style.base} hover:-translate-y-0.5 hover:shadow-sm`
                    }`}
                  >
                    {occupied ? '×' : seat.number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-gray-200 pt-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3.5 rounded border border-gray-300 bg-white" /> Свободно
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3.5 rounded bg-violet-100 ring-1 ring-violet-400" /> Premium
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3.5 rounded bg-amber-100 ring-1 ring-amber-400" /> VIP
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3.5 rounded border border-indigo-600 bg-indigo-500" /> Выбрано
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3.5 rounded bg-gray-200" /> Занято
        </span>
        <span className="ml-1 font-semibold text-gray-800">Свободно: {freeCount}</span>
      </div>
    </div>
  );
}