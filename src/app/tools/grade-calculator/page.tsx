"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Save, Upload, Download, Calculator, RefreshCcw, Wallet, QrCode, Type } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

type ComponentItem = {
  id: string;
  name: string;
  weight: number; 
  score?: number | null; 
  maxScore?: number | null; 
};

type Profile = {
  id: string;
  name: string;
  components: ComponentItem[];
  gradingScaleIndex: number; 
  customScale?: ScaleMapping | null;
};

type ScaleMapping = {
  name: string;
  maxGpa: number;
  letterToGpa: Record<string, number>;
  percentToLetter?: Array<{ min: number; max: number; letter: string; gpa?: number }>;
};

const STORAGE_KEY = "toolqs_grade_calculator_profile_v1";

const uid = (p = "") => p + Math.random().toString(36).slice(2, 9);

const DEFAULT_COMPONENTS: ComponentItem[] = [
  { id: uid("c-"), name: "Homework", weight: 30, score: 85 },
  { id: uid("c-"), name: "Midterm", weight: 30, score: 78 },
  { id: uid("c-"), name: "Final", weight: 40, score: null },
];

const SCALE_PRESETS: ScaleMapping[] = [
  {
    name: "Percent → Letter (US common)",
    maxGpa: 4.0,
    letterToGpa: {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0.0,
    },
    percentToLetter: [
      { min: 93, max: 100, letter: "A", gpa: 4.0 },
      { min: 90, max: 92, letter: "A-", gpa: 3.7 },
      { min: 87, max: 89, letter: "B+", gpa: 3.3 },
      { min: 83, max: 86, letter: "B", gpa: 3.0 },
      { min: 80, max: 82, letter: "B-", gpa: 2.7 },
      { min: 77, max: 79, letter: "C+", gpa: 2.3 },
      { min: 73, max: 76, letter: "C", gpa: 2.0 },
      { min: 70, max: 72, letter: "C-", gpa: 1.7 },
      { min: 67, max: 69, letter: "D+", gpa: 1.3 },
      { min: 63, max: 66, letter: "D", gpa: 1.0 },
      { min: 0, max: 62, letter: "F", gpa: 0.0 },
    ],
  },
  {
    name: "Percent → Letter (Common 4.3)",
    maxGpa: 4.3,
    letterToGpa: {
      A: 4.0,
      "A+": 4.3,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    },
    percentToLetter: [
      { min: 90, max: 100, letter: "A+", gpa: 4.3 },
      { min: 85, max: 89, letter: "A", gpa: 4.0 },
      { min: 80, max: 84, letter: "A-", gpa: 3.7 },
      { min: 0, max: 79, letter: "B/C/D/F", gpa: 0 }, // fallback
    ],
  },
];

function clamp(n: number, min = 0, max = 100) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function percentToLetter(percent: number, scale: ScaleMapping) {
  if (!scale.percentToLetter) return null;
  const p = clamp(percent, 0, 100);
  for (const r of scale.percentToLetter) {
    if (p >= r.min && p <= r.max) return r;
  }
  return null;
}

function percentToGpa(percent: number, scale: ScaleMapping) {
  const r = percentToLetter(percent, scale);
  if (r && r.gpa !== undefined) return r.gpa;
  return (clamp(percent) / 100) * scale.maxGpa;
}

export default function GradeCalculatorPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Grade Calculator - ToolQS",
    url: "https://toolqs.com/tools/grade-calculator",
    description:
      "Grade Calculator for courses: compute current percent, estimate required final grade to hit a target, convert percent ↔ letter ↔ GPA. Supports weighted components.",
    publisher: {
      "@type": "Organization",
      name: "ToolQS",
      url: "https://toolqs.com",
      logo: { "@type": "ImageObject", url: "https://toolqs.com/logo.png" },
    },
  };

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  const [profileName, setProfileName] = useState<string>("My Course");
  const [components, setComponents] = useState<ComponentItem[]>(() => DEFAULT_COMPONENTS.map((c) => ({ ...c })));
  const [gradingScaleIndex, setGradingScaleIndex] = useState<number>(0);
  const [customScale, setCustomScale] = useState<ScaleMapping | null>(null);

  const [targetPercent, setTargetPercent] = useState<number | "">(""); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setProfiles(parsed);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch {
    }
  }, [profiles, isMounted]);

  const activeScale: ScaleMapping = useMemo(() => {
    if (gradingScaleIndex === -1) return customScale ?? SCALE_PRESETS[0];
    return SCALE_PRESETS[gradingScaleIndex] ?? SCALE_PRESETS[0];
  }, [gradingScaleIndex, customScale]);

  const totalWeight = useMemo(() => components.reduce((s, c) => s + (Number(c.weight) || 0), 0), [components]);

  const currentWeightedPercent = useMemo(() => {
    let sum = 0;
    let weights = 0;
    for (const c of components) {
      const w = Number(c.weight) || 0;
      if (c.score !== undefined && c.score !== null && !Number.isNaN(Number(c.score))) {
        sum += (Number(c.score) * w) / 100;
        weights += w;
      }
    }
    if (weights <= 0) return { percent: null, accountedWeight: 0 };
    const percent = (sum / (weights === 0 ? 1 : weights)) * 100;
    return { percent, accountedWeight: weights };
  }, [components]);

  const projectedCoursePercent = useMemo(() => {
    if (totalWeight <= 0) return null;
    let total = 0;
    for (const c of components) {
      const s = c.score ?? null;
      const w = Number(c.weight) || 0;
      if (s !== null && s !== undefined && !Number.isNaN(Number(s))) {
        total += (Number(s) * w) / 100;
      }
    }
    return (total / totalWeight) * 100;
  }, [components, totalWeight]);

  function requiredScoreForTarget(target: number) {
    const scoredContribution = components.reduce((sum, c) => {
      const s = c.score;
      const w = Number(c.weight) || 0;
      return sum + ((s !== null && s !== undefined && !Number.isNaN(Number(s))) ? (Number(s) * w) / 100 : 0);
    }, 0);

    const remainingWeight = components.reduce((sum, c) => {
      const s = c.score;
      const w = Number(c.weight) || 0;
      return sum + ((s === null || s === undefined || Number.isNaN(Number(s))) ? w : 0);
    }, 0);

    if (remainingWeight <= 0) return { possible: false, reason: "No remaining weight (all components scored)" };

    const req = ((target / 100) * totalWeight - scoredContribution) * (100 / remainingWeight);
    return { possible: true, requiredAverage: req, remainingWeight };
  }

  function percentToLetterAndGpa(percent: number) {
    const letterRange = percentToLetter(percent, activeScale);
    const gpa = percentToGpa(percent, activeScale);
    return { letter: letterRange ? letterRange.letter : null, gpa: Number.isFinite(gpa) ? gpa : null };
  }

  function addComponent() {
    setComponents((p) => [...p, { id: uid("c-"), name: "New", weight: 0, score: null }]);
  }
  function updateComponent(id: string, patch: Partial<ComponentItem>) {
    setComponents((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function removeComponent(id: string) {
    setComponents((p) => p.filter((c) => c.id !== id));
  }

  function saveProfile() {
    const pr: Profile = {
      id: uid("p-"),
      name: profileName || "Untitled",
      components,
      gradingScaleIndex,
      customScale: customScale ?? undefined,
    };
    setProfiles((p) => [pr, ...p]);
    setActiveProfileId(pr.id);
    alert("Profile saved locally.");
  }

  function loadProfile(id: string) {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    setActiveProfileId(p.id);
    setProfileName(p.name);
    setComponents(p.components.map((c) => ({ ...c })));
    setGradingScaleIndex(p.gradingScaleIndex ?? 0);
    setCustomScale(p.customScale ?? null);
  }

  function deleteProfile(id: string) {
    setProfiles((p) => p.filter((x) => x.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(null);
      setProfileName("My Course");
      setComponents(DEFAULT_COMPONENTS.map((c) => ({ ...c })));
      setGradingScaleIndex(0);
      setCustomScale(null);
    }
  }

  function exportProfile() {
    const payload = { name: profileName, components, gradingScaleIndex, customScale };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(profileName || "grade-profile").replace(/\s+/g, "-").toLowerCase()}.json`;
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
        if (parsed?.components) {
          setProfileName(parsed.name ?? "Imported");
          setComponents(parsed.components);
          setGradingScaleIndex(parsed.gradingScaleIndex ?? 0);
          setCustomScale(parsed.customScale ?? null);
          alert("Profile imported.");
        } else {
          alert("Invalid profile file.");
        }
      } catch {
        alert("Could not parse file.");
      }
    };
    reader.readAsText(file);
  }

  const currentPercent = projectedCoursePercent;
  const currentLetterAndGpa = currentPercent !== null ? percentToLetterAndGpa(currentPercent) : { letter: null, gpa: null };

  const requiredForTarget = typeof targetPercent === "number" ? requiredScoreForTarget(targetPercent) : null;

  return (
    <>
      <Head>
        <title>Grade Calculator — ToolQS</title>
        <meta
          name="description"
          content="Grade Calculator: compute current course percent, convert percent ↔ letter ↔ GPA, and calculate the required final/remaining grade to reach your target."
        />
        <link rel="canonical" href="https://toolqs.com/tools/grade-calculator" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      </Head>

      <div className="max-w-6xl mx-auto p-6 font-sans space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700">Grade Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compute course percent from weighted components, convert percent to letter/GPA, and discover what you need on remaining assessments to hit your target grade.
          </p>
        </header>

        <section className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">Profile name</label>
              <input className="w-full p-2 border rounded mt-1" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Scale</label>
              <select
                className="p-2 border rounded mt-1"
                value={gradingScaleIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setGradingScaleIndex(idx);
                  if (idx === -1 && !customScale) setCustomScale(SCALE_PRESETS[0]);
                }}
              >
                {SCALE_PRESETS.map((s, i) => (
                  <option key={s.name} value={i}>
                    {s.name}
                  </option>
                ))}
                <option value={-1}>Custom...</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={saveProfile} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>

              <button onClick={exportProfile} className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>

              <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" /> <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importProfile(e.target.files[0])} />
              </label>
            </div>
          </div>

          {gradingScaleIndex === -1 && (
            <div className="mt-3 border-t pt-3">
              <p className="text-sm text-gray-600 mb-2">Custom scale JSON (name, maxGpa, percentToLetter array, letterToGpa)</p>
              <textarea
                rows={5}
                className="w-full p-2 border rounded"
                placeholder='{"name":"Custom","maxGpa":4.0,"letterToGpa":{"A":4.0,"B":3.0,"C":2.0,"D":1.0,"F":0.0},"percentToLetter":[{"min":90,"max":100,"letter":"A","gpa":4.0},{"min":0,"max":89,"letter":"B","gpa":3.0}] }'
                value={customScale ? JSON.stringify(customScale, null, 2) : ""}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setCustomScale(parsed);
                  } catch {
                    setCustomScale(null);
                  }
                }}
              />
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Graded Components</h2>
            <div className="flex items-center gap-2">
              <button onClick={addComponent} className="px-3 py-2 bg-blue-50 rounded">+ Add</button>
              <button
                title="Reset defaults"
                onClick={() => {
                  setComponents(DEFAULT_COMPONENTS.map((c) => ({ ...c })));
                }}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                <RefreshCcw className="w-4 h-4 inline-block" /> Reset
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-2">Name</th>
                  <th className="p-2 w-28">Weight (%)</th>
                  <th className="p-2 w-28">Score (%)</th>
                  <th className="p-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {components.map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="p-2">
                      <input className="w-full p-2 border rounded" value={c.name} onChange={(e) => updateComponent(c.id, { name: e.target.value })} />
                    </td>
                    <td className="p-2">
                      <input type="number" min={0} max={100} className="w-full p-2 border rounded" value={String(c.weight)} onChange={(e) => updateComponent(c.id, { weight: Number(e.target.value) })} />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-full p-2 border rounded"
                        value={c.score === null || c.score === undefined ? "" : String(c.score)}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateComponent(c.id, { score: v === "" ? null : Number(v) });
                        }}
                        placeholder="leave blank if not yet"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button onClick={() => removeComponent(c.id)} className="p-2 bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {components.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-sm text-gray-500">No components yet. Add one to get started.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-600">Total configured weight: <strong>{Number(totalWeight).toFixed(1)}%</strong> (should be 100% for a complete setup)</div>
        </section>

        <section className="bg-white p-4 rounded-xl shadow-sm grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Current / Projected Percent</h3>
            <div className="mt-3">
              <div className="text-2xl font-bold">{currentPercent !== null ? `${currentPercent.toFixed(2)}%` : "—"}</div>
              <div className="text-sm text-gray-500 mt-1">Accounted weight: {currentWeightedPercent.accountedWeight}%</div>

              <div className="mt-3">
                <div className="text-sm text-gray-600">Projected course percent (if all scores entered):</div>
                <div className="mt-1 text-lg font-medium">{currentPercent !== null ? `${projectedCoursePercent!.toFixed(2)}%` : "Incomplete data"}</div>
                <div className="text-sm text-gray-400">Tip: leave future assessments blank to compute required final.</div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Estimated Letter</div>
                  <div className="font-semibold mt-1">{currentLetterAndGpa.letter ?? "—"}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Estimated GPA</div>
                  <div className="font-semibold mt-1">{currentLetterAndGpa.gpa !== null ? currentLetterAndGpa.gpa.toFixed(2) : "—"}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">What you need to hit a target</h3>
            <div className="mt-3">
              <label className="block text-sm text-gray-600">Target course percent</label>
              <input type="number" min={0} max={100} className="w-full p-2 border rounded mt-1" value={String(targetPercent)} onChange={(e) => setTargetPercent(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>

            {typeof targetPercent === "number" && (
              <div className="mt-3">
                {!requiredForTarget ? (
                  <div className="text-sm text-gray-500">Enter target to see required average on remaining components.</div>
                ) : requiredForTarget.possible ? (
                  <>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">Remaining weight</div>
                      <div className="font-semibold mt-1">{requiredForTarget.remainingWeight}%</div>

                      <div className="text-sm text-gray-500 mt-2">Required average across remaining assessments</div>
                      <div className="font-semibold mt-1">
                        {requiredForTarget.requiredAverage !== undefined
                          ? `${requiredForTarget.requiredAverage.toFixed(2)}%`
                          : "Unable to calculate"}
                      </div>

                      {requiredForTarget.requiredAverage !== undefined &&
                        requiredForTarget.requiredAverage > 100 && (
                       <div className="mt-2 text-sm text-red-600">Note: Required average {'>'} 100% — target is not achievable with current data.</div>
                      )}
                      {requiredForTarget.requiredAverage !== undefined &&
                        requiredForTarget.requiredAverage <= 0 && (
                        <div className="mt-2 text-sm text-green-600">Congrats — youve already secured this target based on current scores (required average {'<='} 0%).</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">{requiredForTarget.reason}</div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Saved Profiles</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  saveProfile();
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                Save Current
              </button>
              <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" /> <input className="hidden" type="file" accept="application/json" onChange={(e) => e.target.files && importProfile(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm">
            {profiles.length === 0 ? (
              <div className="text-sm text-gray-500">No saved profiles yet.</div>
            ) : (
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.components.length} components · scale: {SCALE_PRESETS[p.gradingScaleIndex]?.name ?? (p.gradingScaleIndex === -1 ? p.customScale?.name ?? "Custom" : "Custom")}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadProfile(p.id)} className="px-2 py-1 border rounded">Load</button>
                      <button onClick={() => deleteProfile(p.id)} className="px-2 py-1 border rounded bg-red-50 text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                q: "Can I calculate what I need on the final to get an A?",
                a: "Yes — leave the final's score blank and set your target course percent. The tool will compute the average you need on remaining (unscored) components to hit that target.",
              },
              {
                q: "Do component weights need to sum to 100?",
                a: "Ideally yes. If they don't sum to 100, the tool still computes using your provided weights and shows the total configured weight. Adjust weights to match your syllabus for accurate results.",
              },
              {
                q: "Can I use custom letter/GPA scales?",
                a: "Yes — select Custom in the scale dropdown and paste a JSON mapping (percent ranges and letter/GPA values). This is stored locally in your browser.",
              },
              {
                q: "Are my profiles saved to your servers?",
                a: "No — profiles are saved locally in your browser via localStorage. You can export/import profiles as JSON files to move between devices.",
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
