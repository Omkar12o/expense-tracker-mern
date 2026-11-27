import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';
import navItems from './navItems';

const primary = navItems.slice(0, 4);
const secondary = navItems.slice(4);

function itemClass({ isActive }) {
  return `flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-center text-[11px] font-semibold leading-tight ${
    isActive ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
  }`;
}

function navLabel(item) {
  const visible = item.shortLabel || item.label;
  return visible === item.label ? visible : `${visible} (${item.label})`;
}

export default function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1 backdrop-blur xl:hidden dark:border-slate-800 dark:bg-slate-950/95"
      >
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={itemClass}
            aria-label={navLabel(item)}
            title={navLabel(item)}
          >
            <Icon name={item.icon} className="h-5 w-5 shrink-0" />
            <span className="max-w-full truncate">{item.shortLabel || item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={itemClass({ isActive: false })}
          aria-label="More sections"
        >
          <Icon name="menu" className="h-5 w-5 shrink-0" />
          <span className="max-w-full truncate">More</span>
        </button>
      </nav>

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More sections"
        description="Manage the rest of your money."
        size="sm"
      >
        <nav className="space-y-1" aria-label="More navigation">
          {secondary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
              <Icon name="chevronRight" className="ml-auto h-4 w-4" />
            </NavLink>
          ))}
        </nav>
      </Modal>
    </>
  );
}
