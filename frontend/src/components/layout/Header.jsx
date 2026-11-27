import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';
import Logo from './Logo';
import navItems from './navItems';

function navClass({ isActive }) {
  return `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;
}

export default function Header() {
  const { user, logout } = useAuth();
  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="max-w-32 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
              {user?.name || 'Account'}
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Sign out"
          >
            <Icon name="logout" className="h-5 w-5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
