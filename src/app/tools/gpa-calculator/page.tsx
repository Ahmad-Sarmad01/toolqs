"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Type, Wallet, QrCode, Trash2, Download, Save, Upload, GraduationCap } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

type Course = {
  id: string;
  name?: string;
  credits: number;
  gradeInput: string; 
};

type Semester = {
  id: string;
  name: string;
  courses: Course[];
};

type ScaleMapping = {
  letterToGpa: Record<string, number>; 
  percentToGpa?: Array<{ min: number; max: number; gpa: number }>; // ranges
  maxGpa: number;
  name: string;
};

const STORAGE_KEY = "toolqs_gpa_calculator_v1";
const SCALE_PRESETS: ScaleMapping[] = [
  {
    name: "4.0 (common)",
    maxGpa: 4.0,
    letterToGpa: {
      "A+": 4.0,
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
      "D-": 0.7,
      F: 0.0,
    },
    percentToGpa: [
      { min: 93, max: 100, gpa: 4.0 },
      { min: 90, max: 92, gpa: 3.7 },
      { min: 87, max: 89, gpa: 3.3 },
      { min: 83, max: 86, gpa: 3.0 },
      { min: 80, max: 82, gpa: 2.7 },
      { min: 77, max: 79, gpa: 2.3 },
      { min: 73, max: 76, gpa: 2.0 },
      { min: 70, max: 72, gpa: 1.7 },
      { min: 67, max: 69, gpa: 1.3 },
      { min: 63, max: 66, gpa: 1.0 },
      { min: 0, max: 62, gpa: 0.0 },
    ],
  },
  {
    name: "4.3 (Some Canadian / Engineering scales)",
    maxGpa: 4.3,
    letterToGpa: {
      "A+": 4.3,
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
    percentToGpa: [
      { min: 90, max: 100, gpa: 4.3 },
      { min: 85, max: 89, gpa: 4.0 },
      { min: 80, max: 84, gpa: 3.7 },
      { min: 75, max: 79, gpa: 3.3 },
      { min: 70, max: 74, gpa: 3.0 },
      { min: 60, max: 69, gpa: 2.0 },
      { min: 0, max: 59, gpa: 0.0 },
    ],
  },
  {
    name: "5.0 (Some universities / honors scales)",
    maxGpa: 5.0,
    letterToGpa: {
      "A+": 5.0,
      A: 4.5,
      "A-": 4.0,
      "B+": 3.5,
      B: 3.0,
      "B-": 2.5,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    },
    percentToGpa: [
      { min: 85, max: 100, gpa: 5.0 },
      { min: 80, max: 84, gpa: 4.5 },
      { min: 75, max: 79, gpa: 4.0 },
      { min: 70, max: 74, gpa: 3.5 },
      { min: 0, max: 69, gpa: 0.0 },
    ],
  },
];

const uid = (prefix = "") => prefix + Math.random().toString(36).slice(2, 9);

function parseGradeInput(input: string): { kind: "letter" | "percent" | "gpa"; value: number | string } | null {
  if (!input && input !== "0") return null;
  const trimmed = String(input).trim();
  if (trimmed === "") return null;

  const letter = trimmed.toUpperCase();
  if (/^[A-F][+-]?$/.test(letter)) {
    return { kind: "letter", value: letter };
  }

  const num = Number(trimmed);
  if (!Number.isNaN(num)) {
    if (num >= 0 && num <= 100) return { kind: "percent", value: num };
    return { kind: "gpa", value: num };
  }

  return null;
}

function gradeToGpa(valueInput: string, scale: ScaleMapping | null): number | null {
  if (!scale) return null;

  const parsed = parseGradeInput(valueInput);
  if (!parsed) return null;

  if (parsed.kind === "letter") {
    const v = String(parsed.value).toUpperCase();
    if (scale.letterToGpa && scale.letterToGpa[v] !== undefined) return scale.letterToGpa[v];
    const base = v.replace(/[+-]$/, "");
    if (scale.letterToGpa && scale.letterToGpa[base] !== undefined) return scale.letterToGpa[base];
    return null;
  } else if (parsed.kind === "percent") {
    const percent = Number(parsed.value);
    if (scale.percentToGpa) {
      for (const range of scale.percentToGpa) {
        if (percent >= range.min && percent <= range.max) return range.gpa;
      }
    }
    return (percent / 100) * scale.maxGpa;
  } else if (parsed.kind === "gpa") {
    const g = Number(parsed.value);
    return Math.min(g, scale.maxGpa);
  }

  return null;
}

function calculateSemesterGpa(courses: Course[], scale: ScaleMapping) {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    const g = gradeToGpa(c.gradeInput, scale);
    const kred = Number(c.credits) || 0;
    if (g !== null && kred > 0) {
      totalPoints += g * kred;
      totalCredits += kred;
    }
  }
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : null;
  return { gpa, totalCredits, totalPoints };
}

export default function GpaCalculatorPage() {
  const [scaleIndex, setScaleIndex] = useState<number>(0);
  const [customScale, setCustomScale] = useState<ScaleMapping | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>(() => [
    {
      id: uid("s-"),
      name: "Semester 1",
      courses: [
        { id: uid("c-"), name: "Course 1", credits: 3, gradeInput: "A" },
        { id: uid("c-"), name: "Course 2", credits: 4, gradeInput: "B+" },
      ],
    },
  ]);

  const [profileName, setProfileName] = useState<string>("My GPA Profile");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.semesters) setSemesters(parsed.semesters);
        if (parsed?.profileName) setProfileName(parsed.profileName);
        if (parsed?.scaleIndex !== undefined) setScaleIndex(parsed.scaleIndex);
        if (parsed?.customScale) setCustomScale(parsed.customScale);
      }
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const payload = { semesters, profileName, scaleIndex, customScale };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
    }
  }, [semesters, profileName, scaleIndex, customScale, isMounted]);

  const activeScale = useMemo(() => {
    if (scaleIndex === -1) {
      return customScale ?? SCALE_PRESETS[0];
    }
    return SCALE_PRESETS[scaleIndex] ?? SCALE_PRESETS[0];
  }, [scaleIndex, customScale]);

  const semesterResults = useMemo(() => semesters.map((s) => ({ id: s.id, name: s.name, result: calculateSemesterGpa(s.courses, activeScale) })), [semesters, activeScale]);

  const cumulative = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const s of semesters) {
      const { totalPoints: tp, totalCredits: tc } = calculateSemesterGpa(s.courses, activeScale);
      totalPoints += tp;
      totalCredits += tc;
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : null;
    return { gpa, totalCredits, totalPoints };
  }, [semesters, activeScale]);

  function addSemester() {
    setSemesters((prev) => [...prev, { id: uid("s-"), name: `Semester ${prev.length + 1}`, courses: [] }]);
  }

  function removeSemester(id: string) {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  }

  function addCourse(semesterId: string) {
    setSemesters((prev) =>
      prev.map((s) => (s.id === semesterId ? { ...s, courses: [...s.courses, { id: uid("c-"), name: "", credits: 3, gradeInput: "" }] } : s))
    );
  }

  function updateCourse(semesterId: string, courseId: string, patch: Partial<Course>) {
    setSemesters((prev) =>
      prev.map((s) => (s.id === semesterId ? { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)) } : s))
    );
  }

  function removeCourse(semesterId: string, courseId: string) {
    setSemesters((prev) => prev.map((s) => (s.id === semesterId ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) } : s)));
  }

  function resetAll() {
    setSemesters([{ id: uid("s-"), name: "Semester 1", courses: [{ id: uid("c-"), name: "Course 1", credits: 3, gradeInput: "" }] }]);
    setProfileName("My GPA Profile");
    setCustomScale(null);
    setScaleIndex(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function exportCsv() {
    const rows: string[] = [];
    rows.push(["Profile", profileName].join(","));
    rows.push(["Scale", activeScale.name].join(","));
    rows.push(["Semester", "Course", "Credits", "Grade"].join(","));
    for (const s of semesters) {
      for (const c of s.courses) {
        rows.push([s.name, `"${c.name ?? ""}"`, String(c.credits), `"${c.gradeInput ?? ""}"`].join(","));
      }
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profileName.replace(/\s+/g, "-").toLowerCase() || "gpa"}-export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result || "");
      const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const semMap: Record<string, Semester> = {};
      for (const line of lines) {
        if (line.startsWith("Profile,")) {
          try {
            const v = line.split(",", 2)[1];
            setProfileName(v.replace(/"/g, ""));
            continue;
          } catch {}
        }
        if (line.startsWith("Scale,")) continue;
        if (line.startsWith("Semester,Course")) continue;
        const parts = line.split(",");
        if (parts.length >= 4) {
          const semName = parts[0].replace(/"/g, "").trim() || "Semester 1";
          const courseName = parts[1].replace(/"/g, "").trim();
          const credits = Number(parts[2]) || 0;
          const grade = parts.slice(3).join(",").replace(/"/g, "").trim();
          if (!semMap[semName]) semMap[semName] = { id: uid("s-"), name: semName, courses: [] };
          semMap[semName].courses.push({ id: uid("c-"), name: courseName, credits, gradeInput: grade });
        }
      }
      const newSemesters = Object.values(semMap);
      if (newSemesters.length > 0) setSemesters(newSemesters);
    };
    reader.readAsText(file);
  }

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GPA Calculator - ToolQS",
    url: "https://toolqs.com/tools/gpa-calculator",
    description: "Powerful global GPA calculator supporting multiple grading systems, weighted credits, semesters and cumulative GPA.",
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
        <title>GPA Calculator — ToolQS</title>
        <meta name="description" content="Accurate & flexible GPA Calculator for universities worldwide. Supports letter/percent/GPA inputs, weighted credits, multiple scales (4.0/4.3/5.0) and semesters." />
        <link rel="canonical" href="https://toolqs.com/tools/gpa-calculator" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      </Head>

      <div className="max-w-6xl mx-auto p-6 font-sans space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700">GPA Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compute semester and cumulative GPAs using global grading systems. Supports letter grades, percentages, and numeric GPA input — fully weighted by credits.
          </p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">Profile name</label>
              <input className="w-full p-2 border rounded mt-1" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Grading scale</label>
              <select
                className="p-2 border rounded mt-1"
                value={scaleIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setScaleIndex(idx);
                  if (idx === -1 && !customScale) {
                    setCustomScale(SCALE_PRESETS[0]);
                  }
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

            <div className="flex items-end gap-2">
              <button
                title="Save profile"
                onClick={() => {
                  try {
                    const payload = { semesters, profileName, scaleIndex, customScale };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
                    alert("Profile saved locally in your browser.");
                  } catch {
                    alert("Could not save profile.");
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save
              </button>

              <button
                title="Export CSV"
                onClick={exportCsv}
                className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export
              </button>

              <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" /> <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files && importCsv(e.target.files[0])} />
              </label>
            </div>
          </div>

          {scaleIndex === -1 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold">Custom scale editor</h3>
              <p className="text-sm text-gray-600">Create a custom letter → GPA and percent → GPA mapping for your university. Changes persist locally.</p>
              <textarea
                className="w-full mt-2 p-2 border rounded"
                rows={6}
                placeholder={`Enter JSON for a ScaleMapping (example):\n{\n  \"name\": \"My Uni Scale\",\n  \"maxGpa\": 4.0,\n  \"letterToGpa\": {\"A\":4.0, \"A-\":3.7, \"B+\":3.3},\n  \"percentToGpa\": [{\"min\":90,\"max\":100,\"gpa\":4.0},{\"min\":0,\"max\":89,\"gpa\":0}]\n}`}
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

        <section className="space-y-6">
          {semesters.map((s, si) => {
            const semRes = semesterResults.find((r) => r.id === s.id)?.result;
            return (
              <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <input value={s.name} onChange={(e) => setSemesters((prev) => prev.map((p) => (p.id === s.id ? { ...p, name: e.target.value } : p)))} className="p-2 border rounded" />
                    <div className="text-sm text-gray-600">Credits: {semRes?.totalCredits ?? 0}</div>
                    <div className="text-sm text-gray-600">GPA: {semRes?.gpa !== null ? (semRes?.gpa as number).toFixed(3) : "—"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => addCourse(s.id)} className="px-3 py-1 rounded bg-blue-50 hover:bg-blue-100">+ Course</button>
                    {semesters.length > 1 && (
                      <button onClick={() => removeSemester(s.id)} className="px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Remove</button>
                    )}
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left text-sm text-gray-600">
                        <th className="p-2">Course</th>
                        <th className="p-2">Credits</th>
                        <th className="p-2">Grade (letter / % / gpa)</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.courses.map((c) => (
                        <tr key={c.id} className="align-top">
                          <td className="p-2">
                            <input className="w-full p-2 border rounded" value={c.name} onChange={(e) => updateCourse(s.id, c.id, { name: e.target.value })} />
                          </td>
                          <td className="p-2 w-28">
                            <input type="number" className="w-full p-2 border rounded" value={c.credits} onChange={(e) => updateCourse(s.id, c.id, { credits: Number(e.target.value) })} />
                          </td>
                          <td className="p-2">
                            <input className="w-full p-2 border rounded" value={c.gradeInput} onChange={(e) => updateCourse(s.id, c.id, { gradeInput: e.target.value })} />
                            <div className="text-xs text-gray-400 mt-1">Examples: A, B+, 87, 3.7</div>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button title="Remove course" onClick={() => removeCourse(s.id, c.id)} className="p-2 bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {s.courses.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-sm text-gray-500">
                            No courses yet. Click + Course to add.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <div className="flex gap-3">
            <button onClick={addSemester} className="px-4 py-2 rounded bg-blue-600 text-white">+ Add Semester</button>
            <button onClick={resetAll} className="px-4 py-2 rounded bg-gray-100">Reset</button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-2">Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Cumulative GPA</div>
              <div className="text-2xl font-bold">{cumulative.gpa !== null ? (cumulative.gpa as number).toFixed(3) : "—"}</div>
              <div className="text-xs text-gray-400">Based on {cumulative.totalCredits} total credits</div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Total Points</div>
              <div className="text-2xl font-bold">{Number(cumulative.totalPoints || 0).toFixed(2)}</div>
              <div className="text-xs text-gray-400">Sum of (GPA × credits)</div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Active scale</div>
              <div className="text-lg font-semibold">{activeScale.name}</div>
              <div className="text-xs text-gray-400">Top GPA: {activeScale.maxGpa}</div>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ToolCard
              name="Grade Calculator"
              href="/tools/grade-calculator"
              icon={GraduationCap}
              description="Easily calculate your Grade."
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
                q: "Is this GPA calculator accurate for my university?",
                a:
                  "This calculator provides an accurate GPA estimate when you choose the grading scale that matches your university. For exact official calculations, refer to your university's registrar.",
              },
              {
                q: "What grading inputs are supported?",
                a: "You can enter letter grades (A, B+, A-), percentages (like 87) or numeric GPA values (e.g., 3.7). Credits (weights) are used for weighted averages.",
              },
              {
                q: "Can I define my university's custom grading scale?",
                a:
                  "Yes — choose 'Custom...' in the Grading scale dropdown and paste your custom mapping in JSON format. This is saved locally in your browser.",
              },
              {
                q: "Are my data saved to your servers?",
                a: "No — all data is stored locally in your browser using localStorage unless you export and send the CSV yourself.",
              },
              {
                q: "Can I import/export my semesters?",
                a: "Yes — use Export to download a CSV of your profile and Import to load a CSV (CSV expects columns: Semester, Course, Credits, Grade).",
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
