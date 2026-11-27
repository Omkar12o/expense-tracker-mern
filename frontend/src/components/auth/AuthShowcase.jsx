import Logo from '../layout/Logo';
import Icon from '../ui/Icon';

const highlights = [
  {
    icon: 'transactions',
    title: 'One clear timeline',
    description: 'Income and expenses, organised without the noise.',
  },
  {
    icon: 'target',
    title: 'Plans you can see',
    description: 'Budgets and goals that turn intent into progress.',
  },
  {
    icon: 'chart',
    title: 'Insights that are yours',
    description: 'Charts built only from your own transactions.',
  },
];

export default function AuthShowcase() {
  return (
    <aside className="auth-showcase relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div className="auth-showcase-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="auth-float pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <Logo inverse />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-50 backdrop-blur-sm">
          <Icon name="shield" className="h-3.5 w-3.5 text-teal-300" />
          Private workspace
        </span>
      </div>

      <div className="relative z-10 max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
          Personal finance, simplified
        </p>
        <h2 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
          Know where your money goes.
          <span className="block text-teal-300">Every single day.</span>
        </h2>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-teal-50/80">
          A focused space to record, understand, and improve your spending — designed to feel calm
          on desktop and effortless on mobile.
        </p>

        <ul className="mt-10 grid gap-3">
          {highlights.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-200 ring-1 ring-white/10">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-0.5 text-sm text-teal-50/70">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-xs text-teal-50/70">
        <span className="inline-flex items-center gap-2">
          <Icon name="check" className="h-4 w-4 text-teal-300" />
          Secure sessions
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="check" className="h-4 w-4 text-teal-300" />
          Real data only
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="check" className="h-4 w-4 text-teal-300" />
          Built for mobile
        </span>
      </div>
    </aside>
  );
}
