import { type ComponentType, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { AppShell } from '../ui/AppShell';
import { ControlInput } from '../ui/control';
import { cn } from '../../lib/utils';

type FinanceView = 'quote' | 'budget' | 'runway';

const currency = new Intl.NumberFormat('en-ZA', {
  currency: 'ZAR',
  maximumFractionDigits: 0,
  style: 'currency',
});

const percent = new Intl.NumberFormat('en-ZA', {
  maximumFractionDigits: 1,
  style: 'percent',
});

const numberValue = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-os-line-dark bg-os-ink-900 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="os-type-label text-white/35">{label}</p>
        <Icon className="h-4 w-4 text-white/35" />
      </div>
      <p className="os-type-title-3 text-white">{value}</p>
      {detail && <p className="os-type-caption mt-1 text-white/35">{detail}</p>}
    </div>
  );
}

function NumberField({
  icon,
  label,
  value,
  onChange,
  suffix,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="os-type-label mb-1.5 block text-white/35">{label}</span>
      <div className="relative">
        <ControlInput
          icon={icon}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          className={suffix ? 'pr-10' : undefined}
        />
        {suffix && (
          <span className="os-type-caption pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export function Finance() {
  const [view, setView] = useState<FinanceView>('quote');
  const [hourlyRate, setHourlyRate] = useState('650');
  const [projectHours, setProjectHours] = useState('80');
  const [complexity, setComplexity] = useState('15');
  const [taxRate, setTaxRate] = useState('15');
  const [depositRate, setDepositRate] = useState('50');

  const [monthlyIncome, setMonthlyIncome] = useState('45000');
  const [tools, setTools] = useState('2800');
  const [operations, setOperations] = useState('8500');
  const [personalDraw, setPersonalDraw] = useState('18000');
  const [savingsRate, setSavingsRate] = useState('20');

  const [cashOnHand, setCashOnHand] = useState('120000');
  const [monthlyBurn, setMonthlyBurn] = useState('29300');
  const [pipeline, setPipeline] = useState('65000');
  const [closeRate, setCloseRate] = useState('40');

  const quote = useMemo(() => {
    const base = numberValue(hourlyRate) * numberValue(projectHours);
    const complexityAmount = base * (numberValue(complexity) / 100);
    const subtotal = base + complexityAmount;
    const tax = subtotal * (numberValue(taxRate) / 100);
    const total = subtotal + tax;
    const deposit = total * (numberValue(depositRate) / 100);
    return { base, complexityAmount, deposit, subtotal, tax, total };
  }, [complexity, depositRate, hourlyRate, projectHours, taxRate]);

  const budget = useMemo(() => {
    const income = numberValue(monthlyIncome);
    const fixedCosts = numberValue(tools) + numberValue(operations) + numberValue(personalDraw);
    const savings = income * (numberValue(savingsRate) / 100);
    const available = income - fixedCosts - savings;
    const margin = income > 0 ? available / income : 0;
    return { available, fixedCosts, income, margin, savings };
  }, [monthlyIncome, operations, personalDraw, savingsRate, tools]);

  const runway = useMemo(() => {
    const expectedPipeline = numberValue(pipeline) * (numberValue(closeRate) / 100);
    const adjustedCash = numberValue(cashOnHand) + expectedPipeline;
    const months = numberValue(monthlyBurn) > 0 ? adjustedCash / numberValue(monthlyBurn) : 0;
    return {
      adjustedCash,
      expectedPipeline,
      months,
      reviewDate: addDays(Math.max(14, Math.floor(months * 30 * 0.5))),
    };
  }, [cashOnHand, closeRate, monthlyBurn, pipeline]);

  const quoteRows = [
    ['Base work', currency.format(quote.base)],
    ['Complexity buffer', currency.format(quote.complexityAmount)],
    ['Subtotal', currency.format(quote.subtotal)],
    ['VAT / tax estimate', currency.format(quote.tax)],
    ['Deposit request', currency.format(quote.deposit)],
  ];

  return (
    <AppShell>
      <div className="flex shrink-0 flex-col gap-3 border-b border-os-line-dark bg-os-ink-900 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-os-line-dark bg-os-ink-950">
            <Icons.WalletCards className="h-5 w-5 text-fg-brand" />
          </div>
          <div>
            <h1 className="os-type-title-4 text-white">Finance</h1>
            <p className="os-type-caption text-white/35">Quote, budget, and runway decisions without leaving the OS.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-os-line-dark bg-os-ink-950/70 p-1">
          {[
            { icon: Icons.ReceiptText, label: 'Quote', value: 'quote' },
            { icon: Icons.PieChart, label: 'Budget', value: 'budget' },
            { icon: Icons.CalendarClock, label: 'Runway', value: 'runway' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value as FinanceView)}
              className={cn(
                'os-focus-ring flex h-8 items-center gap-2 rounded-md px-3 text-xs font-semibold transition-colors',
                view === item.value
                  ? 'bg-brand-600 text-white'
                  : 'text-white/45 hover:bg-os-ink-800 hover:text-white'
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-os-ink-950 p-4">
        {view === 'quote' && (
          <div className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_1fr]">
            <section className="rounded-lg border border-os-line-dark bg-os-ink-900 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="os-type-label text-white/35">Project quote</p>
                  <p className="os-type-caption mt-1 text-white/35">Use this to rough out a client estimate quickly.</p>
                </div>
                <Icons.SlidersHorizontal className="h-4 w-4 text-white/30" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <NumberField icon={Icons.BadgeCent} label="Hourly rate" value={hourlyRate} onChange={setHourlyRate} />
                <NumberField icon={Icons.Clock3} label="Estimated hours" value={projectHours} onChange={setProjectHours} />
                <NumberField icon={Icons.GitBranchPlus} label="Complexity buffer" value={complexity} onChange={setComplexity} suffix="%" />
                <NumberField icon={Icons.Percent} label="Tax estimate" value={taxRate} onChange={setTaxRate} suffix="%" />
                <NumberField icon={Icons.HandCoins} label="Deposit" value={depositRate} onChange={setDepositRate} suffix="%" />
              </div>
            </section>

            <section className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric icon={Icons.FileDigit} label="Total quote" value={currency.format(quote.total)} detail="Including buffer and tax" />
                <Metric icon={Icons.HandCoins} label="Deposit" value={currency.format(quote.deposit)} detail={`${depositRate}% upfront`} />
                <Metric icon={Icons.CalendarDays} label="Valid until" value={formatDate(addDays(14))} detail="Suggested quote expiry" />
              </div>

              <div className="rounded-lg border border-os-line-dark bg-os-ink-900">
                <div className="flex items-center justify-between border-b border-os-line-dark px-4 py-3">
                  <p className="os-type-label text-white/35">Quote breakdown</p>
                  <span className="os-type-caption rounded border border-os-line-dark bg-os-ink-950 px-2 py-1 text-white/35">
                    Draft summary
                  </span>
                </div>
                <div className="divide-y divide-os-line-dark">
                  {quoteRows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3">
                      <span className="os-type-body text-white/55">{label}</span>
                      <span className="os-type-body-strong text-white">{value}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 bg-os-ink-950/60 px-4 py-4">
                    <span className="os-type-title-4 text-white">Total</span>
                    <span className="os-type-title-4 text-fg-brand">{currency.format(quote.total)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'budget' && (
          <div className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_1fr]">
            <section className="rounded-lg border border-os-line-dark bg-os-ink-900 p-4">
              <p className="os-type-label text-white/35">Monthly operating budget</p>
              <p className="os-type-caption mt-1 text-white/35">Balance income, running costs, and owner draw.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <NumberField icon={Icons.TrendingUp} label="Monthly income" value={monthlyIncome} onChange={setMonthlyIncome} />
                <NumberField icon={Icons.Wrench} label="Tools and subscriptions" value={tools} onChange={setTools} />
                <NumberField icon={Icons.Building2} label="Operations" value={operations} onChange={setOperations} />
                <NumberField icon={Icons.UserRound} label="Personal draw" value={personalDraw} onChange={setPersonalDraw} />
                <NumberField icon={Icons.PiggyBank} label="Savings target" value={savingsRate} onChange={setSavingsRate} suffix="%" />
              </div>
            </section>

            <section className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric icon={Icons.CircleDollarSign} label="Income" value={currency.format(budget.income)} />
                <Metric icon={Icons.Receipt} label="Fixed costs" value={currency.format(budget.fixedCosts)} />
                <Metric icon={Icons.PiggyBank} label="Savings" value={currency.format(budget.savings)} />
              </div>
              <div className="rounded-lg border border-os-line-dark bg-os-ink-900 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="os-type-label text-white/35">Remaining after plan</p>
                    <p className={cn('os-type-title-1 mt-1', budget.available >= 0 ? 'text-fg-brand' : 'text-fg-error')}>
                      {currency.format(budget.available)}
                    </p>
                  </div>
                  <p className="os-type-caption text-white/35">Margin: {percent.format(budget.margin)}</p>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-os-ink-700">
                  <div
                    className={cn('h-full rounded-full', budget.available >= 0 ? 'bg-brand-600' : 'bg-fg-error')}
                    style={{ width: `${Math.min(100, Math.max(4, Math.abs(budget.margin) * 100))}%` }}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'runway' && (
          <div className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_1fr]">
            <section className="rounded-lg border border-os-line-dark bg-os-ink-900 p-4">
              <p className="os-type-label text-white/35">Runway planner</p>
              <p className="os-type-caption mt-1 text-white/35">Estimate how long current cash can carry the studio.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <NumberField icon={Icons.Landmark} label="Cash on hand" value={cashOnHand} onChange={setCashOnHand} />
                <NumberField icon={Icons.Flame} label="Monthly burn" value={monthlyBurn} onChange={setMonthlyBurn} />
                <NumberField icon={Icons.Briefcase} label="Pipeline value" value={pipeline} onChange={setPipeline} />
                <NumberField icon={Icons.Target} label="Close probability" value={closeRate} onChange={setCloseRate} suffix="%" />
              </div>
            </section>

            <section className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric icon={Icons.CalendarClock} label="Estimated runway" value={`${runway.months.toFixed(1)} months`} />
                <Metric icon={Icons.Handshake} label="Weighted pipeline" value={currency.format(runway.expectedPipeline)} />
                <Metric icon={Icons.AlarmClock} label="Review by" value={formatDate(runway.reviewDate)} />
              </div>
              <div className="rounded-lg border border-os-line-dark bg-os-ink-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="os-type-label text-white/35">Cash horizon</p>
                  <span className="os-type-caption text-white/35">{currency.format(runway.adjustedCash)} adjusted cash</span>
                </div>
                <div className="grid gap-2">
                  {Array.from({ length: 12 }).map((_, index) => {
                    const active = index < Math.floor(runway.months);
                    const partial = index === Math.floor(runway.months);
                    return (
                      <div key={index} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
                        <span className="os-type-caption text-white/35">Month {index + 1}</span>
                        <div className="h-2 overflow-hidden rounded-full bg-os-ink-700">
                          <div
                            className={cn('h-full rounded-full', active || partial ? 'bg-brand-600' : 'bg-white/10')}
                            style={{ width: active ? '100%' : partial ? `${(runway.months % 1) * 100}%` : '100%' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
