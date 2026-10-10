import { ATTENDANCE_THRESHOLD } from '../data/fixtures'

export function chartOptions({ min, max }) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.parsed.y}%` } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8c857a', font: { family: 'JetBrains Mono', size: 11 } } },
      y: {
        min,
        max,
        grid: { color: 'rgba(28,26,23,0.06)' },
        border: { display: false },
        ticks: { color: '#8c857a', callback: (v) => `${v}%`, font: { family: 'JetBrains Mono', size: 11 } },
      },
    },
  }
}

export function Stat({ icon: Icon, label, value, hint, tone }) {
  const color = tone === 'bad' ? 'text-vermilion' : tone === 'good' ? 'text-moss' : 'text-ink'
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="flex items-center justify-between text-sm text-ink-soft">
        {label}
        <Icon size={16} className="text-ink-faint" />
      </div>
      <p className={`num mt-3 text-3xl font-semibold ${color}`}>
        {value}
        {hint && <span className="ml-2 font-sans text-sm font-normal text-ink-faint">{hint}</span>}
      </p>
    </div>
  )
}

export function Panel({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-line bg-card p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-ink-faint">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Meter({ value }) {
  const low = value < ATTENDANCE_THRESHOLD
  return (
    <span className="flex w-36 items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
        <span
          className={`block h-full rounded-full ${low ? 'bg-vermilion' : 'bg-moss'}`}
          style={{ width: `${value}%` }}
        />
      </span>
      <span className={`num w-12 text-right text-sm ${low ? 'text-vermilion' : 'text-ink'}`}>{value}%</span>
    </span>
  )
}
