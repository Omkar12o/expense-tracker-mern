import Logo from '../layout/Logo';
import Icon from '../ui/Icon';

const benefits = [
  { icon: 'transactions', text: 'Track every transaction in one clean timeline.' },
  { icon: 'target', text: 'Stay ahead with budgets and savings goals.' },
  { icon: 'chart', text: 'Understand trends with real analytics.' },
];

export default function AuthLayout({ title, description, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 p-12 text-white lg:flex">
        <Logo />
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            A calmer way to manage your money.
          </h2>
          <p className="mt-4 text-teal-100">
            Built for focused daily use — private by design, fast on mobile, and clear where every
            rupee goes.
          </p>
          <ul className="mt-10 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit.text} className="flex items-center gap-3 text-sm text-teal-50">
                <span className="rounded-xl bg-white/15 p-2">
                  <Icon name={benefit.icon} className="h-5 w-5" />
                </span>
                {benefit.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-teal-200">Secure sessions · Your data stays yours</p>
      </div>

      <div className="flex flex-col px-4 py-8 sm:px-8 lg:px-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
