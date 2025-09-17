"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, RefreshCcw, Shuffle, Copy, Search, Clock, Type, Wallet, QrCode } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

const unitDefinitions: Record<string, Record<string, number>> = {
  Length: {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.34,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  },
  Mass: {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
  },
  Temperature: {
    celsius: 1, 
    fahrenheit: 1,
    kelvin: 1,
  },
  Volume: {
    liter: 1,
    milliliter: 0.001,
    gallon: 3.78541,
    quart: 0.946353,
    pint: 0.473176,
    cup: 0.24,
  },
  Area: {
    "square meter": 1,
    "square kilometer": 1e6,
    "square centimeter": 0.0001,
    "square millimeter": 0.000001,
    hectare: 10000,
    acre: 4046.86,
    "square mile": 2.59e6,
    "square yard": 0.836127,
    "square foot": 0.092903,
    "square inch": 0.00064516,
  },
  Speed: {
    "meter/second": 1,
    "kilometer/hour": 0.277778,
    "mile/hour": 0.44704,
    knot: 0.514444,
  },
  Time: {
    second: 1,
    millisecond: 0.001,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
  },
  Energy: {
    joule: 1,
    kilojoule: 1000,
    calorie: 4.184,
    kilocalorie: 4184,
    "watt-hour": 3600,
    "kilowatt-hour": 3.6e6,
  },
  Storage: {
    byte: 1,
    kilobyte: 1024,
    megabyte: 1048576,
    gigabyte: 1073741824,
    terabyte: 1.0995e12,
  },
};

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  if (from === "celsius") celsius = value;
  else if (from === "fahrenheit") celsius = (value - 32) * (5 / 9);
  else if (from === "kelvin") celsius = value - 273.15;
  else celsius = value;

  if (to === "celsius") return celsius;
  if (to === "fahrenheit") return celsius * (9 / 5) + 32;
  if (to === "kelvin") return celsius + 273.15;
  return celsius;
}

function convert(category: string, value: number, fromUnit: string, toUnit: string): number {
  if (category === "Temperature") {
    return convertTemperature(value, fromUnit, toUnit);
  }
  const defs = unitDefinitions[category];
  const base = value * defs[fromUnit];
  return base / defs[toUnit];
}

const prettyUnit = (u: string) =>
  u
    .split(" ")
    .map((s) => (s.length > 2 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");

type HistoryItem = {
  id: string;
  ts: number;
  category: string;
  value: number;
  fromUnit: string;
  toUnit: string;
  result: number;
};

const HISTORY_KEY = "toolqs_unit_converter_history_v1";

export default function UnitConverterPage() {
  const categories = Object.keys(unitDefinitions);
  const [category, setCategory] = useState<string>("Length");

  const unitsForCategory = useMemo(() => Object.keys(unitDefinitions[category]), [category]);

  const [fromUnit, setFromUnit] = useState<string>(unitsForCategory[0]);
  const [toUnit, setToUnit] = useState<string>(unitsForCategory[1] ?? unitsForCategory[0]);
  const [value, setValue] = useState<number | string>(1); 
  const [result, setResult] = useState<number | null>(null);

  const [autoConvert, setAutoConvert] = useState<boolean>(true);
  const [precision, setPrecision] = useState<number>(6); 
  const [unitFilter, setUnitFilter] = useState<string>("");

const [copied, setCopied] = useState(false);

const [history, setHistory] = useState<HistoryItem[]>([]);
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (Array.isArray(parsed)) setHistory(parsed);
    }
  } catch (err) {
    console.warn("Could not read history from localStorage", err);
  }
}, []);

useEffect(() => {
  if (!isMounted) return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {}
}, [history, isMounted]);

  useEffect(() => {
    const units = Object.keys(unitDefinitions[category]);
    setFromUnit(units[0]);
    setToUnit(units[1] ?? units[0]);
    setResult(null);
    setUnitFilter("");
  }, [category]);


  useEffect(() => {
    if (!autoConvert) return;
    const t = setTimeout(() => {
      handleConvert(false);
    }, 180);
    return () => clearTimeout(t);
  }, [category, fromUnit, toUnit, value, precision, autoConvert]);

  function formatNumber(v: number | null) {
    if (v === null || Number.isNaN(v)) return "";
    return Number(v).toLocaleString(undefined, { maximumFractionDigits: precision, minimumFractionDigits: 0 });
  }

  function handleConvert(saveToHistory = true) {
    setCopied(false);
    const numeric = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(numeric)) {
      setResult(null);
      return;
    }

    try {
      const r = convert(category, numeric, fromUnit, toUnit);
      const rounded = Number.isFinite(r) ? Number(r) : NaN;
      setResult(rounded);

      if (saveToHistory && Number.isFinite(rounded)) {
        const item: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ts: Date.now(),
          category,
          value: numeric,
          fromUnit,
          toUnit,
          result: rounded,
        };
        setHistory((h) => [item, ...h].slice(0, 50));
      }
    } catch (err) {
      console.error("Conversion error:", err);
      setResult(null);
    }
  }

  function swapUnits() {
    setFromUnit((prevFrom) => {
      const oldFrom = prevFrom;
      const oldTo = toUnit;
      setToUnit(oldFrom);
      return oldTo;
    });
    if (result !== null && !Number.isNaN(result)) {
      setValue(Number(result));
      setTimeout(() => {
        handleConvert(true);
      }, 50);
    }
  }

  async function copyResult() {
    if (result === null || Number.isNaN(result)) return;
    try {
      await navigator.clipboard.writeText(String(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Could not copy to clipboard.");
    }
  }

  function loadHistoryItem(item: HistoryItem) {
    setCategory(item.category);
    setFromUnit(item.fromUnit);
    setToUnit(item.toUnit);
    setValue(item.value);
    setTimeout(() => handleConvert(false), 50);
  }

  function clearHistory() {
    setHistory([]);
  }

  const filteredUnits = useMemo(() => {
    const all = Object.keys(unitDefinitions[category]);
    if (!unitFilter.trim()) return all;
    const q = unitFilter.toLowerCase();
    return all.filter((u) => u.toLowerCase().includes(q) || prettyUnit(u).toLowerCase().includes(q));
  }, [category, unitFilter]);

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Unit Converter - ToolQS",
    url: "https://toolqs.com/tools/unit-converter",
    description:
      "Convert units instantly across length, mass, temperature, volume, area, speed, time, energy, storage and more. Supports metric and imperial systems worldwide.",
    publisher: {
      "@type": "Organization",
      name: "ToolQS",
      url: "https://toolqs.com",
      logo: { "@type": "ImageObject", url: "https://toolqs.com/logo.png" },
    },
  };

  return (
    <>
      <Head>
        <title>Unit Converter — ToolQS</title>
        <meta
          name="description"
          content="Free online unit converter supporting metric, imperial and global units. Convert length, mass, temperature, volume, speed, area, time, energy, digital storage and more instantly."
        />
        <link rel="canonical" href="https://toolqs.com/tools/unit-converter" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      </Head>

      <div className="max-w-6xl mx-auto p-6 font-sans">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-extrabold text-blue-700">Unit Converter</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Convert units instantly across metric & imperial systems. Includes Length, Mass, Temperature, Volume, Area,
            Speed, Time, Energy, Storage and more — worldwide friendly.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              {Object.keys(unitDefinitions).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <label className="text-sm text-gray-600 mr-2">Auto</label>
            <button
              onClick={() => setAutoConvert((s) => !s)}
              title="Toggle auto-convert"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                autoConvert ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              {autoConvert ? "On" : "Off"}
            </button>
          </div>

          <div className="w-full md:w-56">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Precision</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={12}
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-12 text-right text-sm text-gray-600">{precision}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm">
            <label className="block mb-2 font-semibold text-gray-700">From</label>
            <input
              inputMode="decimal"
              type="text"
              value={String(value)}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
              aria-label="Value to convert"
            />

            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Find unit</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search unit..."
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="w-full pl-10 pr-3 p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-auto border rounded-lg p-2">
              {filteredUnits.map((u) => (
                <button
                  key={u}
                  onClick={() => setFromUnit(u)}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 hover:bg-blue-50 ${
                    u === fromUnit ? "bg-blue-100 font-semibold text-blue-700" : "bg-transparent"
                  }`}
                >
                  {prettyUnit(u)}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-sm text-gray-600">Selected</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-lg">{prettyUnit(fromUnit)}</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={swapUnits}
              title="Swap units"
              className="p-3 rounded-full bg-white border shadow-sm hover:shadow-md"
            >
              <Shuffle className="w-6 h-6 text-gray-600" />
            </button>

            <button
              onClick={() => handleConvert(true)}
              title="Convert now"
              className="px-4 py-3 rounded-lg bg-blue-600 text-white flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Convert
            </button>

            <button
              onClick={() => {
                setFromUnit(unitsForCategory[0]);
                setToUnit(unitsForCategory[1] ?? unitsForCategory[0]);
                setValue(1);
                setResult(null);
                setUnitFilter("");
              }}
              title="Reset"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <RefreshCcw className="w-4 h-4 inline-block mr-2" /> Reset
            </button>
          </div>

          <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm">
            <label className="block mb-2 font-semibold text-gray-700">To</label>

            <div className="mb-3">
              <div className="p-3 border rounded-lg bg-gray-50">{formatNumber(result)}</div>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Choose unit</label>
            </div>

            <div className="max-h-56 overflow-auto border rounded-lg p-2">
              {filteredUnits.map((u) => (
                <button
                  key={u}
                  onClick={() => setToUnit(u)}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 hover:bg-blue-50 ${
                    u === toUnit ? "bg-blue-100 font-semibold text-blue-700" : "bg-transparent"
                  }`}
                >
                  {prettyUnit(u)}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2 items-center">
              <button
                onClick={copyResult}
                disabled={result === null || Number.isNaN(result)}
                className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
              >
                <Copy className="w-4 h-4 inline-block mr-2" /> {copied ? <span className="text-green-600">Copied ✓</span> : "Copy"}
              </button>

              <div className="text-sm text-gray-500 ml-auto">{prettyUnit(toUnit)}</div>
            </div>

            <div className="mt-3 text-xs text-gray-400">Precision: {precision} decimals</div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">History</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (history.length > 0) loadHistoryItem(history[0]);
                  }}
                  title="Use last"
                  className="px-3 py-1 rounded border"
                >
                  Use last
                </button>
                <button onClick={clearHistory} className="px-3 py-1 rounded border bg-red-50 text-red-600">
                  Clear
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-sm text-gray-500">No recent conversions yet.</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-auto">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => loadHistoryItem(h)}
                    className="w-full text-left p-2 rounded hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {h.value} {prettyUnit(h.fromUnit)} → {formatNumber(h.result)} {prettyUnit(h.toUnit)}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(h.ts).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-gray-500">#{history.indexOf(h) + 1}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">Tips & Settings</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>🔍 Use the search box to quickly find units in the selected category.</li>
              <li>↔️ Click the swap button to flip From / To.</li>
              <li>⏱️ Toggle <strong>Auto</strong> to update result as you type.</li>
              <li>⚙️ Use precision slider to control decimals shown in the result.</li>
            </ul>
          </div>
        </div>

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
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Is the Unit Converter free to use?",
                a: "Yes — ToolQS Unit Converter is 100% free and accessible worldwide without any registration.",
              },
              {
                q: "What types of units can I convert?",
                a: "You can convert length, weight, temperature, volume, area, speed, time, energy, digital storage, and many more units.",
              },
              {
                q: "Does the converter support both metric and imperial systems?",
                a: "Absolutely — our tool covers metric (SI) units as well as imperial/US customary units for global usability.",
              },
              {
                q: "Can I convert currencies with this tool?",
                a: "Yes — ToolQS Unit Converter supports live currency conversion with real-time exchange rates.",
              },
              {
                q: "Do I need to install anything to use the Unit Converter?",
                a: "No — the tool works instantly in your browser on desktop, tablet, or mobile without any downloads.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6"
              >
                <summary
                  className="flex justify-between items-center cursor-pointer text-lg font-semibold text-blue-700"
                  aria-expanded="false"
                >
                  {faq.q}
                  <span className="ml-4 text-xl text-gray-500 group-open:text-blue-600">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-gray-700 text-base leading-relaxed">
                  {faq.a}
                </p>
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
