import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export function AdminLayout() {
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-gray-900">Администрирование</h1>
      <nav className="mb-8 flex gap-1 border-b border-gray-200 pb-2">
        <NavLink to="/admin" end className={linkClass}>
          Площадки
        </NavLink>
        <NavLink to="/admin/events" className={linkClass}>
          События
        </NavLink>
        <NavLink to="/admin/refunds" className={linkClass}>
          Возвраты
        </NavLink>
        <NavLink to="/admin/analytics" className={linkClass}>
          Аналитика
        </NavLink>
        <NavLink to="/admin/tickets-check" className={linkClass}>
          Проверка билетов
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
