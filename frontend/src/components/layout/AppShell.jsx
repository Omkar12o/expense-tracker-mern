import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNav from './MobileNav';

export default function AppShell() {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl px-4 pb-32 pt-5 sm:px-6 sm:pb-28 sm:pt-6 lg:px-8 xl:pb-12"
      >
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
