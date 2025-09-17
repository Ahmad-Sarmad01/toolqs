"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, Type, Download, Save, Trash2, Calculator, QrCode } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

type Profile = {
  id: string;
  name: string;
  preset: string;
  principal: number;
  annualRate: number;
  termYears: number;
  paymentsPerYear: number;
  extraRecurring: number;
  extraOneTimePayment?: { paymentNumber: number; amount: number } | null;
};

type PaymentRow = {
  n: number;
  payment: number;
  interest: number;
  principal: number;
  extra: number;
  balance: number;
};

const STORAGE_KEY = "toolqs_loan_calculator_profiles_v1";
const uid = (p = "") => p + Math.random().toString(36).slice(2, 9);

const PRESETS = {
  Mortgage: { paymentsPerYear: 12, termYears: 30 },
  "30-yr Mortgage": { paymentsPerYear: 12, termYears: 30 },
  "15-yr Mortgage": { paymentsPerYear: 12, termYears: 15 },
  Auto: { paymentsPerYear: 12, termYears: 5 },
  Personal: { paymentsPerYear: 12, termYears: 3 },
  Biweekly: { paymentsPerYear: 26, termYears: 5 },
};

function clamp(n: number, min = 0) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, n);
}

function periodicRate(annualRatePercent: number, paymentsPerYear: number) {
  return (annualRatePercent / 100) / paymentsPerYear;
}

function periodicPayment(principal: number, annualRatePercent: number, paymentsPerYear: number, totalPayments: number) {
  const r = periodicRate(annualRatePercent, paymentsPerYear);
  if (r === 0) return principal / totalPayments;
  const pow = Math.pow(1 + r, totalPayments);
  const A = principal * r * pow / (pow - 1);
  return A;
}

function buildSchedule(principal: number, annualRatePercent: number, paymentsPerYear: number, totalPayments: number, basePayment: number, extraRecurring = 0, extraOneTime: { paymentNumber: number; amount: number } | null = null) {
  const rows: PaymentRow[] = [];
  let bal = principal;
  const r = periodicRate(annualRatePercent, paymentsPerYear);

  for (let n = 1; n <= totalPayments && bal > 0.00001; n++) {
    const interest = bal * r;
    const extra = extraOneTime && extraOneTime.paymentNumber === n ? extraOneTime.amount : 0;
    let principalPortion = basePayment - interest;
    if (principalPortion < 0) principalPortion = 0; 
    const totalExtra = extraRecurring + extra;
    let payment = basePayment;
    if (bal - (principalPortion + totalExtra) <= 0) {
      const finalPrincipalNeeded = bal;
      payment = interest + finalPrincipalNeeded;
      rows.push({
        n,
        payment: round(payment + totalExtra, 2),
        interest: round(interest, 2),
        principal: round(finalPrincipalNeeded, 2),
        extra: round(totalExtra, 2),
        balance: 0,
      });
      bal = 0;
      break;
    }

    bal = bal - principalPortion - totalExtra;
    rows.push({
      n,
      payment: round(payment, 2),
      interest: round(interest, 2),
      principal: round(principalPortion, 2),
      extra: round(totalExtra, 2),
      balance: round(Math.max(0, bal), 2),
    });
  }

  return rows;
}

function round(n: number, digits = 2) {
  const p = Math.pow(10, digits);
  return Math.round((n + Number.EPSILON) * p) / p;
}

function totalInterestFromSchedule(rows: PaymentRow[]) {
  return rows.reduce((s, r) => s + r.interest, 0);
}

function formatCurrency(n: number, locale = undefined, currency = undefined) {
  try {
    return Number.isFinite(n) ? n.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : "—";
  } catch {
    return String(round(n, 2));
  }
}

export default function LoanCalculatorPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Loan Calculator — ToolQS",
    url: "https://toolqs.com/tools/loan-calculator",
    description: "Global loan calculator: mortgage, auto, personal loans — amortization schedule, extra payments, required periodic payment and total interest.",
    publisher: { "@type": "Organization", name: "ToolQS", url: "https://toolqs.com", logo: { "@type": "ImageObject", url: "https://toolqs.com/logo.png" } },
  };

  const [preset, setPreset] = useState<string>("Mortgage");
  const [principal, setPrincipal] = useState<number>(300000);
  const [annualRate, setAnnualRate] = useState<number>(3.5);
  const [termYears, setTermYears] = useState<number>(30);
  const [paymentsPerYear, setPaymentsPerYear] = useState<number>(12);
  const [extraRecurring, setExtraRecurring] = useState<number>(0);
  const [extraOneTimePaymentNumber, setExtraOneTimePaymentNumber] = useState<number | "">("");
  const [extraOneTimeAmount, setExtraOneTimeAmount] = useState<number>(0);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setProfiles(parsed);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.slice(0, 50)));
    } catch {}
  }, [profiles, isMounted]);

  useEffect(() => {
    const p = PRESETS[preset as keyof typeof PRESETS];
    if (p) {
      setPaymentsPerYear(p.paymentsPerYear);
      setTermYears(p.termYears);
    }
  }, [preset]);

  const totalPayments = useMemo(() => clamp(Math.round(termYears * paymentsPerYear), 1), [termYears, paymentsPerYear]);

  const basePayment = useMemo(() => {
    const p = clamp(principal, 0);
    const A = periodicPayment(p, annualRate, paymentsPerYear, totalPayments);
    return round(A, 2);
  }, [principal, annualRate, paymentsPerYear, totalPayments]);

  const schedule = useMemo(() => {
    const oneTime = (extraOneTimePaymentNumber === "" || Number.isNaN(Number(extraOneTimePaymentNumber))) ? null : { paymentNumber: Number(extraOneTimePaymentNumber), amount: Math.max(0, extraOneTimeAmount) };
    return buildSchedule(principal, annualRate, paymentsPerYear, totalPayments, basePayment, Math.max(0, extraRecurring), oneTime);
  }, [principal, annualRate, paymentsPerYear, totalPayments, basePayment, extraRecurring, extraOneTimePaymentNumber, extraOneTimeAmount]);

  const totalInterest = useMemo(() => totalInterestFromSchedule(schedule), [schedule]);
  const totalPaid = useMemo(() => schedule.reduce((s, r) => s + r.payment + r.extra, 0), [schedule]);

  const sparklinePoints = useMemo(() => {
    if (!schedule || schedule.length === 0) return "";
    const max = schedule[0].balance || principal;
    const points = schedule.map((r, i) => {
      const x = (i / (schedule.length - 1 || 1)) * 100;
      const y = (r.balance / max) * 100;
      return `${x},${100 - y}`; 
    });
    return points.join(" ");
  }, [schedule, principal]);

  function exportScheduleCsv() {
    const rows: string[] = [];
    rows.push(["#", "Payment", "Interest", "Principal", "Extra", "Balance"].join(","));
    for (const r of schedule) {
      rows.push([r.n, r.payment.toFixed(2), r.interest.toFixed(2), r.principal.toFixed(2), r.extra.toFixed(2), r.balance.toFixed(2)].join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan-schedule-${uid("")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function saveProfile() {
    const pr: Profile = {
      id: uid("p-"),
      name: `${preset} ${formatCurrency(principal)}`,
      preset,
      principal,
      annualRate,
      termYears,
      paymentsPerYear,
      extraRecurring,
      extraOneTimePayment: (extraOneTimePaymentNumber === "" ? null : { paymentNumber: Number(extraOneTimePaymentNumber), amount: extraOneTimeAmount }),
    };
    setProfiles((p) => [pr, ...p].slice(0, 50));
    alert("Profile saved locally.");
  }

  function loadProfile(id: string) {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    setPreset(p.preset);
    setPrincipal(p.principal);
    setAnnualRate(p.annualRate);
    setTermYears(p.termYears);
    setPaymentsPerYear(p.paymentsPerYear);
    setExtraRecurring(p.extraRecurring);
    if (p.extraOneTimePayment) {
      setExtraOneTimePaymentNumber(p.extraOneTimePayment.paymentNumber);
      setExtraOneTimeAmount(p.extraOneTimePayment.amount);
    } else {
      setExtraOneTimePaymentNumber("");
      setExtraOneTimeAmount(0);
    }
  }

  function deleteProfile(id: string) {
    setProfiles((p) => p.filter((x) => x.id !== id));
  }

  function clearAllProfiles() {
    setProfiles([]);
  }

  function importProfile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.principal) {
          setPreset(parsed.preset ?? "Custom");
          setPrincipal(Number(parsed.principal) || 0);
          setAnnualRate(Number(parsed.annualRate) || 0);
          setTermYears(Number(parsed.termYears) || 0);
          setPaymentsPerYear(Number(parsed.paymentsPerYear) || 12);
          setExtraRecurring(Number(parsed.extraRecurring) || 0);
          if (parsed.extraOneTimePayment) {
            setExtraOneTimePaymentNumber(parsed.extraOneTimePayment.paymentNumber ?? "");
            setExtraOneTimeAmount(parsed.extraOneTimePayment.amount ?? 0);
          }
          alert("Profile imported (loaded into form). Save if you want to persist locally.");
        } else {
          alert("Invalid profile file.");
        }
      } catch {
        alert("Could not parse file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <Head>
        <title>Loan Calculator — ToolQS</title>
        <meta name="description" content="Loan & mortgage calculator with amortization schedule. Calculate periodic payments, total interest, extra payments, and export schedules." />
        <link rel="canonical" href="https://toolqs.com/tools/loan-calculator" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      </Head>

      <div className="max-w-5xl mx-auto p-6 font-sans space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700">Loan Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate monthly/periodic payments, amortization schedule, total interest and payoff with extra payments. Works for mortgages, auto loans, and personal loans.
          </p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Preset</label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                aria-label="Loan preset"
              >
                {Object.keys(PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Principal</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full p-2 border rounded mt-1"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                aria-label="Loan principal"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Annual Interest Rate (%)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full p-2 border rounded mt-1"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                aria-label="Annual interest rate"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Term (years)</label>
              <input type="number" min={0} step="1" className="w-full p-2 border rounded mt-1" value={termYears} onChange={(e) => setTermYears(Number(e.target.value))} aria-label="Term in years" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Payments per year</label>
              <select value={paymentsPerYear} onChange={(e) => setPaymentsPerYear(Number(e.target.value))} className="w-full p-2 border rounded mt-1" aria-label="Payments per year">
                <option value={12}>Monthly (12)</option>
                <option value={26}>Biweekly (26)</option>
                <option value={24}>Semimonthly (24)</option>
                <option value={52}>Weekly (52)</option>
                <option value={1}>Annual (1)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Extra recurring payment (per period)</label>
              <input type="number" min={0} step="0.01" className="w-full p-2 border rounded mt-1" value={extraRecurring} onChange={(e) => setExtraRecurring(Number(e.target.value))} aria-label="Extra recurring payment" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">One-time extra: payment #</label>
              <input type="number" min={1} step="1" className="w-full p-2 border rounded mt-1" value={String(extraOneTimePaymentNumber)} onChange={(e) => setExtraOneTimePaymentNumber(e.target.value === "" ? "" : Number(e.target.value))} aria-label="One time extra payment number" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">One-time extra: amount</label>
              <input type="number" min={0} step="0.01" className="w-full p-2 border rounded mt-1" value={extraOneTimeAmount} onChange={(e) => setExtraOneTimeAmount(Number(e.target.value))} aria-label="One time extra amount" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => { setPrincipal(0); setAnnualRate(0); setTermYears(0); setExtraRecurring(0); setExtraOneTimeAmount(0); setExtraOneTimePaymentNumber(""); }} className="px-4 py-2 rounded bg-gray-100">Reset</button>
            <button onClick={() => saveProfile()} className="px-4 py-2 rounded bg-blue-600 text-white"><Save className="inline-block mr-2" />Save Profile</button>
            <label className="px-4 py-2 rounded bg-gray-100 cursor-pointer">
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importProfile(e.target.files[0])} />
              Import Profile
            </label>
            <button onClick={() => exportScheduleCsv()} className="ml-auto px-4 py-2 rounded bg-green-600 text-white"><Download className="inline-block mr-2" />Export Schedule</button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="font-semibold">Payment Summary</h3>
            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-500">Periodic payment</div>
              <div className="text-2xl font-bold">{formatCurrency(basePayment)}</div>

              <div className="text-sm text-gray-500 mt-2">Total payments made</div>
              <div className="text-lg">{schedule.length} payments</div>

              <div className="text-sm text-gray-500 mt-2">Total interest</div>
              <div className="text-lg font-semibold">{formatCurrency(totalInterest)}</div>

              <div className="text-sm text-gray-500 mt-2">Total cost (principal + interest + extras)</div>
              <div className="text-lg font-semibold">{formatCurrency(totalPaid)}</div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium">Balance over time</h4>
              <div className="mt-2">
                {schedule.length > 1 ? (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-28 bg-gray-50 rounded">
                    <polyline fill="none" stroke="#3b82f6" strokeWidth={1.5} points={sparklinePoints} />
                  </svg>
                ) : (
                  <div className="text-sm text-gray-500">Schedule not available</div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Quick payoff estimates</h3>
            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-500">Estimated payoff time: <strong>{schedule.length > 0 ? `${Math.ceil(schedule.length / paymentsPerYear)} years` : "—"}</strong></div>
              <div className="text-sm text-gray-500">Payments per year: <strong>{paymentsPerYear}</strong></div>
              <div className="text-sm text-gray-500">Interest rate (annual): <strong>{annualRate}%</strong></div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium">Saved Profiles</h4>
              <div className="mt-2 space-y-2">
                {profiles.length === 0 ? (
                  <div className="text-sm text-gray-500">No saved profiles.</div>
                ) : (
                  profiles.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.preset} · {formatCurrency(p.principal)} · {p.termYears}y</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadProfile(p.id)} className="px-2 py-1 border rounded">Load</button>
                        <button onClick={() => deleteProfile(p.id)} className="px-2 py-1 border rounded bg-red-50 text-red-600"><Trash2 className="inline-block" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {profiles.length > 0 && (
                <div className="mt-2">
                  <button onClick={() => clearAllProfiles()} className="px-3 py-2 rounded bg-red-50 text-red-600">Clear all</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Amortization Schedule</h3>
            <div className="text-sm text-gray-500">Rows: {schedule.length}</div>
          </div>

          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="p-2">#</th>
                  <th className="p-2">Payment</th>
                  <th className="p-2">Interest</th>
                  <th className="p-2">Principal</th>
                  <th className="p-2">Extra</th>
                  <th className="p-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((r) => (
                  <tr key={r.n} className="border-b">
                    <td className="p-2">{r.n}</td>
                    <td className="p-2">{formatCurrency(r.payment)}</td>
                    <td className="p-2">{formatCurrency(r.interest)}</td>
                    <td className="p-2">{formatCurrency(r.principal)}</td>
                    <td className="p-2">{formatCurrency(r.extra)}</td>
                    <td className="p-2">{formatCurrency(r.balance)}</td>
                  </tr>
                ))}
                {schedule.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-gray-500">No schedule — adjust loan parameters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pt-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ToolCard
              name="GPA Calculator"
              href="/tools/gpa-calculator"
              icon={Calculator}
              description="Easily calculate your GPA."
            />
            <ToolCard
              name="Loan Calculator"
              href="/tools/loan-calculator"
              icon={Wallet}
              description="Plan your loan repayments."
            />
            <ToolCard
              name="QR Generator"
              href="/tools/qr-code"
              icon={QrCode}
              description="Generate QR codes in seconds."
            />
            <ToolCard
              name="Word Counter"
              href="/tools/word-counter"
              icon={Type}
              description="Count words and characters."
            />
          </div>
        </section>

        <section className="pt-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Frequently Asked Questions</h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Can I include extra payments?",
                a: "Yes — add recurring extra payments (applied every period) or a one-time extra payment at a specific payment number to see how they speed payoff and reduce interest.",
              },
              {
                q: "What payment frequencies are supported?",
                a: "Monthly, biweekly, weekly, semimonthly and annual frequencies are supported. Choose payments-per-year according to your loan's schedule.",
              },
              {
                q: "Does this account for changing interest rates?",
                a: "This basic calculator assumes a fixed interest rate for the loan term. For adjustable-rate loans, use a refinance/advanced amortization tool to model rate changes.",
              },
              {
                q: "Are profiles saved on your servers?",
                a: "No — any profile saved with this tool is stored locally in your browser using localStorage. Use Export to save a JSON file if you need to move data.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-blue-700" aria-expanded="false">
                  {faq.q}
                  <span className="ml-4 text-xl text-gray-500 group-open:text-blue-600">+</span>
                </summary>
                <p className="mt-4 text-gray-700 text-base leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <ExploreCTA />
    </>
  );
}

function ToolCard({
  name,
  href,
  icon: Icon,
  description,
}: {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1 text-center"
      aria-label={`Open ${name}`}
    >
      <Icon className="w-10 h-10 text-blue-600 mb-4" />
      <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </Link>
  );
}
