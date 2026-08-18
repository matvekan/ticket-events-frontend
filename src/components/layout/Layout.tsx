import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-600/30">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9Z"
          />
          <path strokeLinecap="round" d="M10 9.5v5M14 9.5v5" />
        </svg>
      </span>
      <span className="font-display text-base font-bold tracking-tight text-gray-900">
        Ticket<span className="text-indigo-600">Events</span>
      </span>
    </Link>
  );
}

export function Layout() {
  const { isAuthenticated, isAdmin, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/events" className={navLinkClass}>
              События
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/orders" className={navLinkClass}>
                  Мои заказы
                </NavLink>
                <NavLink to="/chat" className={navLinkClass}>
                  Поддержка
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Админка
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden max-w-48 truncate text-sm text-gray-500 sm:inline">{userEmail}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Войти
                </NavLink>
                <Link to="/register">
                  <Button size="sm">Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-gray-400 sm:flex-row">
          <span className="font-medium">Ticket Events</span>
          <span>Билеты на события · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}