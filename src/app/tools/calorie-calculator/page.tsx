"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw, Save, Download, Calculator, QrCode, Wallet, Type } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

type Units = "metric" | "imperial";
type Sex = "male" | "female" | "other";
type Profile = {
  id: string;
  name: string;
  units: Units;
  age: number;
  sex: Sex;
  weight: number;
  height: number;
  activity: string;
  formula: "mifflin" | "harris";
  goal: "maintain" | "lose" | "gain";
  weeklyKgTarget: number; 
};

const STORAGE_KEY = "toolqs_calorie_profiles_v1";

const activityLevels: { key: string; label: string; multiplier: number }[] = [
  { key: "sedentary", label: "Sedentary (little or no exercise)", multiplier: 1.2 },
  { key: "light", label: "Lightly active (1-3 days/week)", multiplier: 1.375 },
  { key: "moderate", label: "Moderately active (3-5 days/week)", multiplier: 1.55 },
  { key: "very", label: "Very active (6-7 days/week)", multiplier: 1.725 },
  { key: "extra", label: "Extra active (physical job / training twice/day)", multiplier: 1.9 },
];

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function lbToKg(lb: number) {
  return lb * 0.45359237;
}
function kgToLb(kg: number) {
  return kg / 0.45359237;
}
function inchToCm(inch: number) {
  return inch * 2.54;
}
function cmToInch(cm: number) {
  return cm / 2.54;
}

function bmrMifflin(sex: Sex, weightKg: number, heightCm: number, age: number) {
  const s = sex === "male" ? 5 : sex === "female" ? -161 : -78; 
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}
function bmrHarris(sex: Sex, weightKg: number, heightCm: number, age: number) {
  if (sex === "male") {
    return 13.397 * weightKg + 4.799 * heightCm - 5.677 * age + 88.362;
  }
  if (sex === "female") {
    return 9.247 * weightKg + 3.098 * heightCm - 4.330 * age + 447.593;
  }
  return 11.322 * weightKg + 3.949 * heightCm - 4.0 * age + 160;
}

function macrosFromCalories(calories: number, weightKg: number, goal: "lose" | "maintain" | "gain") {
  const proteinPerKg = goal === "gain" ? 1.8 : goal === "lose" ? 1.8 : 1.6; 
  const proteinG = proteinPerKg * weightKg;
  const proteinCalories = proteinG * 4;

  const fatCalories = calories * 0.25;
  const fatG = fatCalories / 9;

  const remainingCalories = Math.max(0, calories - proteinCalories - fatCalories);
  const carbG = remainingCalories / 4;

  return {
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbG: Math.round(carbG),
    proteinCalories: Math.round(proteinCalories),
    fatCalories: Math.round(fatCalories),
    carbCalories: Math.round(remainingCalories),
  };
}

export default function CalorieCalculatorPage() {
  const [units, setUnits] = useState<Units>("metric");
  const [age, setAge] = useState<number>(30);
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState<number>(70); 
  const [height, setHeight] = useState<number>(175);
  const [activity, setActivity] = useState<string>("moderate");
  const [formula, setFormula] = useState<"mifflin" | "harris">("mifflin");
  const [goal, setGoal] = useState<"maintain" | "lose" | "gain">("maintain");
  const [weeklyKgTarget, setWeeklyKgTarget] = useState<number>(0); 

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
    } catch {}
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.slice(0, 50)));
    } catch {}
  }, [profiles, isMounted]);

  const weightKg = useMemo(() => (units === "metric" ? weight : lbToKg(weight)), [units, weight]);
  const heightCm = useMemo(() => (units === "metric" ? height : inchToCm(height)), [units, height]);

  const bmr = useMemo(() => {
    if (formula === "mifflin") return Math.max(0, bmrMifflin(sex, weightKg, heightCm, age));
    return Math.max(0, bmrHarris(sex, weightKg, heightCm, age));
  }, [formula, sex, weightKg, heightCm, age]);

  const activityMultiplier = useMemo(() => {
    const found = activityLevels.find((a) => a.key === activity);
    return found ? found.multiplier : 1.2;
  }, [activity]);

  const tdee = useMemo(() => Math.round(bmr * activityMultiplier), [bmr, activityMultiplier]);

  const caloriesForGoal = useMemo(() => {
    if (goal === "maintain" || weeklyKgTarget === 0) return tdee;
    const dailyDelta = (weeklyKgTarget * 7700) / 7;
    return Math.round(tdee + dailyDelta);
  }, [tdee, goal, weeklyKgTarget]);

  const macros = useMemo(() => macrosFromCalories(caloriesForGoal, weightKg, goal === "lose" ? "lose" : goal === "gain" ? "gain" : "maintain"), [caloriesForGoal, weightKg, goal]);

  const prettyCalories = (n: number) => (Number.isFinite(n) ? `${n.toLocaleString()} kcal` : "—");

  function saveProfile() {
    const prof: Profile = {
      id: uid("p-"),
      name: `Profile ${new Date().toLocaleDateString()}`,
      units,
      age,
      sex,
      weight,
      height,
      activity,
      formula,
      goal,
      weeklyKgTarget,
    };
    setProfiles((p) => [prof, ...p].slice(0, 50));
    alert("Profile saved locally.");
  }

  function loadProfile(id: string) {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    setUnits(p.units);
    setAge(p.age);
    setSex(p.sex);
    setWeight(p.weight);
    setHeight(p.height);
    setActivity(p.activity);
    setFormula(p.formula);
    setGoal(p.goal);
    setWeeklyKgTarget(p.weeklyKgTarget);
    alert("Profile loaded.");
  }

  function deleteProfile(id: string) {
    setProfiles((p) => p.filter((x) => x.id !== id));
  }

  function exportProfile() {
    const payload = { units, age, sex, weight, height, activity, formula, goal, weeklyKgTarget };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calorie-profile-${uid("")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importProfile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed) {
          if (parsed.units) setUnits(parsed.units);
          if (parsed.age) setAge(Number(parsed.age));
          if (parsed.sex) setSex(parsed.sex);
          if (parsed.weight) setWeight(Number(parsed.weight));
          if (parsed.height) setHeight(Number(parsed.height));
          if (parsed.activity) setActivity(parsed.activity);
          if (parsed.formula) setFormula(parsed.formula);
          if (parsed.goal) setGoal(parsed.goal);
          if (parsed.weeklyKgTarget !== undefined) setWeeklyKgTarget(Number(parsed.weeklyKgTarget));
          alert("Profile imported (loaded into form). Save to persist locally.");
        }
      } catch {
        alert("Invalid file.");
      }
    };
    reader.readAsText(file);
  }

  function resetForm() {
    setUnits("metric");
    setAge(30);
    setSex("male");
    setWeight(70);
    setHeight(175);
    setActivity("moderate");
    setFormula("mifflin");
    setGoal("maintain");
    setWeeklyKgTarget(0);
  }

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Calorie Calculator - ToolQS",
    url: "https://toolqs.com/tools/calorie-calculator",
    description: "Calculate BMR and TDEE, adjust for weight goals and get macronutrient suggestions. Supports metric and imperial units.",
    publisher: { "@type": "Organization", name: "ToolQS", url: "https://toolqs.com", logo: { "@type": "ImageObject", url: "https://toolqs.com/logo.png" } },
  };

  return (
    <>
      <Head>
        <title>Calorie Calculator — ToolQS</title>
        <meta name="description" content="Calorie and macronutrient calculator. Compute BMR (Mifflin/Harris), TDEE with activity multipliers, and daily calories for weight goals." />
        <link rel="canonical" href="https://toolqs.com/tools/calorie-calculator" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      </Head>

      <div className="max-w-6xl mx-auto p-6 font-sans space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700">Calorie Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Estimate your daily calories and macros — supports metric & imperial units and several BMR formulas. Use activity & goal settings to tailor targets.</p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Units</label>
              <select className="w-full p-2 border rounded mt-1" value={units} onChange={(e) => setUnits(e.target.value as Units)}>
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lb, in)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Age</label>
              <input type="number" min={10} max={120} className="w-full p-2 border rounded mt-1" value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Sex</label>
              <select className="w-full p-2 border rounded mt-1" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Activity level</label>
              <select className="w-full p-2 border rounded mt-1" value={activity} onChange={(e) => setActivity(e.target.value)}>
                {activityLevels.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Weight ({units === "metric" ? "kg" : "lb"})</label>
              <input type="number" min={1} step="0.1" className="w-full p-2 border rounded mt-1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Height ({units === "metric" ? "cm" : "in"})</label>
              <input type="number" min={20} step="0.1" className="w-full p-2 border rounded mt-1" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">BMR Formula</label>
              <select className="w-full p-2 border rounded mt-1" value={formula} onChange={(e) => setFormula(e.target.value as any)}>
                <option value="mifflin">Mifflin-St Jeor (recommended)</option>
                <option value="harris">Harris-Benedict (legacy)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Goal</label>
              <select className="w-full p-2 border rounded mt-1" value={goal} onChange={(e) => setGoal(e.target.value as any)}>
                <option value="maintain">Maintain weight</option>
                <option value="lose">Lose weight</option>
                <option value="gain">Gain weight</option>
              </select>
            </div>

            {goal !== "maintain" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700">Weekly target (kg/week, negative to lose)</label>
                <input type="number" min={-2} max={2} step="0.01" className="w-full p-2 border rounded mt-1" value={weeklyKgTarget} onChange={(e) => setWeeklyKgTarget(Number(e.target.value))} />
                <div className="text-xs text-gray-400 mt-1">Common safe ranges: -0.25 to -1 kg/week (lose), 0.25 to 0.5 kg/week (gain)</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={resetForm} className="px-4 py-2 rounded bg-gray-100"><RefreshCcw className="inline-block mr-2" />Reset</button>
            <button onClick={saveProfile} className="px-4 py-2 rounded bg-blue-600 text-white"><Save className="inline-block mr-2" />Save</button>
            <button onClick={exportProfile} className="ml-auto px-4 py-2 rounded bg-green-600 text-white"><Download className="inline-block mr-2" />Export</button>
            <label className="px-4 py-2 rounded bg-gray-100 cursor-pointer">
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importProfile(e.target.files[0])} />
              Import
            </label>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold">Basal Metabolic Rate (BMR)</h3>
            <div className="mt-3">
              <div className="text-sm text-gray-500">Formula used</div>
              <div className="font-semibold">{formula === "mifflin" ? "Mifflin-St Jeor" : "Harris-Benedict"}</div>

              <div className="mt-4">
                <div className="text-sm text-gray-500">Estimated BMR</div>
                <div className="text-2xl font-bold">{Math.round(bmr)} kcal/day</div>
                <div className="text-xs text-gray-400 mt-1">This is the approximate calories you'd burn at rest.</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold">Total Daily Energy Expenditure (TDEE)</h4>
              <div className="mt-2 text-lg font-bold">{prettyCalories(tdee)}</div>
              <div className="text-sm text-gray-500">Activity multiplier: {activityMultiplier}</div>

              <div className="mt-3">
                <div className="text-sm text-gray-500">Calories for goal</div>
                <div className="text-lg font-semibold">{prettyCalories(caloriesForGoal)}</div>
                <div className="text-xs text-gray-400 mt-1">Based on goal: <strong>{goal}</strong> {goal !== "maintain" && `(weekly ${weeklyKgTarget >= 0 ? "+" : ""}${weeklyKgTarget} kg)`}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Macro suggestions</h3>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Protein</div>
                <div className="font-semibold">{macros.proteinG} g/day ({macros.proteinCalories} kcal)</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Fat</div>
                <div className="font-semibold">{macros.fatG} g/day ({macros.fatCalories} kcal)</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Carbohydrates</div>
                <div className="font-semibold">{macros.carbG} g/day ({macros.carbCalories} kcal)</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold">Saved Profiles</h4>
              <div className="mt-2 space-y-2">
                {profiles.length === 0 ? (
                  <div className="text-sm text-gray-500">No saved profiles.</div>
                ) : (
                  profiles.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.units} · {p.age} yrs · {p.sex}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadProfile(p.id)} className="px-2 py-1 border rounded">Load</button>
                        <button onClick={() => deleteProfile(p.id)} className="px-2 py-1 border rounded bg-red-50 text-red-600">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
                q: "Which BMR formula is best?",
                a: "Mifflin-St Jeor is commonly recommended for modern populations; Harris-Benedict is older but included for comparison.",
              },
              {
                q: "How accurate are these numbers?",
                a: "These are estimates — individual metabolic rate varies. Use these numbers as starting points and track your progress to adjust.",
              },
              {
                q: "What is a safe rate of weight loss?",
                a: "A common safe guideline is 0.25–1 kg per week depending on starting weight and health. Consult a healthcare professional for personalized advice.",
              },
              {
                q: "Do macros need to be exact?",
                a: "Macros are guidelines. Hitting protein targets is important for muscle preservation, while carbs and fats can be adjusted to preference.",
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
