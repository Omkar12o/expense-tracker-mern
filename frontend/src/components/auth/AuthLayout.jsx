import Logo from '../layout/Logo';
import Icon from '../ui/Icon';
import AuthShowcase from './AuthShowcase';

export default function AuthLayout({
  title,
  description,
  eyebrow = 'Your money workspace',
  children,
}) {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-teal-100/70 via-slate-50/20 to-transparent dark:from-teal-950/40 dark:via-slate-950/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
        <AuthShowcase />

        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-10 xl:px-16">
          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <div className="lg:hidden">
              <Logo />
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 lg:inline-flex">
              <Icon name="lock" className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              Encrypted session
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
            <div className="w-full max-w-[440px]">
              <div className="mb-7">
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
                  {eyebrow}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>

              <div className="auth-card-shadow rounded-3xl border border-slate-200/80 bg-white/90 p-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 sm:p-8">
                {children}
              </div>

              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <Icon name="shield" className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Your data stays scoped to your account.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
