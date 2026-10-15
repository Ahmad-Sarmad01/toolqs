"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, FileText, FileInput, FileUser, Image, Download } from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import ExploreCTA from "@/components/ExploreCTA";

export default function PdfToWordPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "PDF to Word Converter - ToolQS",
    url: "https://toolqs.com/tools/pdf-to-word",
    description:
      "Free online PDF to Word converter. Upload a PDF and download an editable Word (.docx) file instantly. Fast, private, and secure in your browser.",
    publisher: {
      "@type": "Organization",
      name: "ToolQS",
      url: "https://toolqs.com",
      logo: {
        "@type": "ImageObject",
        url: "https://toolqs.com/logo.png",
      },
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is ToolQS PDF to Word Converter free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free with no registration required.",
        },
      },
      {
        "@type": "Question",
        name: "Are my files uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, the conversion happens entirely in your browser. ToolQS does not upload or store your files.",
        },
      },
      {
        "@type": "Question",
        name: "Which files are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently supports PDF to .docx conversion.",
        },
      },
    ],
  };

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [wordUrl, setWordUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    return () => {
      if (wordUrl) {
        URL.revokeObjectURL(wordUrl);
      }
    };
  }, []);

  const setWordUrlAndRevokePrevious = (newUrl: string | null) => {
    if (wordUrl && wordUrl !== newUrl) {
      URL.revokeObjectURL(wordUrl);
    }
    setWordUrl(newUrl);
  };

  function reconstructStyledLinesFromTextContent(content: any) {
    const linesMap = new Map<number, Array<{ x: number; str: string; fontName?: string }>>();

    for (const item of content.items) {
      const str = item.str ?? "";
      const transform = item.transform ?? [];
      const y = typeof transform[5] === "number" ? transform[5] : 0;
      const x = typeof transform[4] === "number" ? transform[4] : 0;

      const yKey = Math.round(y * 10); 

      if (!linesMap.has(yKey)) linesMap.set(yKey, []);
      linesMap.get(yKey)!.push({ x, str, fontName: item.fontName });
    }

    const sortedYKeys = Array.from(linesMap.keys()).sort((a, b) => b - a);

    const styledLines: Array<Array<{ text: string; bold: boolean; italics: boolean }>> = [];

    for (const yKey of sortedYKeys) {
      const items = linesMap.get(yKey)!;
      items.sort((a, b) => a.x - b.x);

      const runs: Array<{ text: string; bold: boolean; italics: boolean }> = [];

      for (const itm of items) {
        const text = (itm.str ?? "").replace(/\s+/g, " ");
        if (!text) continue;

        const fontName = itm.fontName ?? "";

        const lower = String(fontName).toLowerCase();
        const isBold = /bold/.test(lower) || /700/.test(lower);
        const isItalic = /italic/.test(lower) || /oblique/.test(lower) || /it\b/.test(lower);

        const last = runs[runs.length - 1];
        if (last && last.bold === isBold && last.italics === isItalic) {
          last.text += " " + text;
        } else {
          runs.push({ text, bold: isBold, italics: isItalic });
        }
      }

      const cleanedRuns = runs.map((r) => ({ text: r.text.trim(), bold: r.bold, italics: r.italics })).filter(r => r.text.length > 0);

      if (cleanedRuns.length === 0) {
        styledLines.push([]);
      } else {
        styledLines.push(cleanedRuns);
      }
    }

    return styledLines;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a .pdf file.");
      return;
    }

    setUploadedFileName(file.name);
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

      try {
        if (pdfjs && (pdfjs as any).GlobalWorkerOptions) {
          (pdfjs as any).GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        }
      } catch (wErr) {
        console.warn("Could not set GlobalWorkerOptions.workerSrc:", wErr);
      }

      let pdf: any;
      try {
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
      } catch (firstErr: any) {
        const message = String(firstErr?.message || firstErr || "");
        const isWorkerError =
          message.includes("GlobalWorkerOptions") ||
          message.toLowerCase().includes("worker") ||
          /No \"GlobalWorkerOptions.workerSrc\" specified/.test(message);

        if (isWorkerError) {
          console.warn("pdf.js worker error detected, retrying with disableWorker:true", firstErr);
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          pdf = await loadingTask.promise;
        } else {
          throw firstErr;
        }
      }

      const docChildren: Paragraph[] = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();

        const styledLines = reconstructStyledLinesFromTextContent(content);

        if (styledLines.length === 0) {
          docChildren.push(new Paragraph({ text: "" }));
        } else {
          for (const lineRuns of styledLines) {
            if (lineRuns.length === 0) {
              // blank line
              docChildren.push(new Paragraph({ text: "" }));
              continue;
            }

            const textRuns = lineRuns.map((run) => {
              return new TextRun({
                text: run.text,
                bold: run.bold || undefined,
                italics: run.italics || undefined,
              });
            });

            docChildren.push(new Paragraph({ children: textRuns }));
          }
        }

        if (p < pdf.numPages) docChildren.push(new Paragraph({ text: "" }));
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docChildren as any,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      setWordUrlAndRevokePrevious(url);
    } catch (err: any) {
      console.error("Conversion failed:", err);
      setError(
        "Conversion failed. Make sure the PDF is not password-protected and contains selectable text (not scanned images). " +
          "If you need OCR for scanned PDFs, I can add a Tesseract.js fallback (increases bundle size)."
      );
      setWordUrlAndRevokePrevious(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileObject = async (file: File) => {
    const ev = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await handleFileUpload(ev);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileObject(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <Head>
        <title>Free PDF to Word Converter — ToolQS</title>
        <meta
          name="description"
          content="Convert PDF files to Word (.docx) instantly online. Free, private, and works in your browser — no uploads required."
        />
        <meta
          name="keywords"
          content="pdf to word, convert pdf to docx, free pdf converter, ToolQS PDF Word tool, online pdf word converter"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://toolqs.com/tools/pdf-to-word" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <div className={dark ? "dark" : ""}>
        <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-extrabold text-blue-700">PDF to Word Converter</h1>
            <p className="text-gray-500 text-lg mt-2">
              Upload your PDF file and instantly convert it into an editable Word (.docx) file.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 mb-6">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
            >
              {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            className="relative border-2 border-dashed border-blue-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all hover:shadow-xl bg-gradient-to-r from-white via-blue-50 to-white text-center"
            aria-label="Upload PDF by clicking or drag and drop"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              aria-hidden
            />
            <p className="text-gray-900 dark:text-gray-800 text-lg">
              Drag & Drop your <b>PDF</b> file here, or{" "}
              <span className="text-blue-600 font-semibold underline">click to upload</span>
            </p>
            <p className="mt-2 text-sm text-gray-800 dark:text-gray-700">Only .pdf files are supported</p>

            {uploadedFileName && (
              <p className="mt-3 text-sm text-green-600 dark:text-green-300 font-medium">Uploaded: {uploadedFileName}</p>
            )}

            {loading && (
              <p className="mt-3 text-sm text-gray-600">Converting... please wait.</p>
            )}

            {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
          </div>

          {wordUrl && (
            <div className="text-center mt-6">
              <a
                href={wordUrl}
                download={`toolqs-pdf-to-word-${Date.now()}.docx`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-lg font-semibold"
              >
                <Download className="w-5 h-5" />
                Download Word File
              </a>
            </div>
          )}

          <section className="pt-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <ToolCard
                name="Word to PDF Converter"
                href="/tools/word-to-pdf"
                icon={FileInput}
                description="Convert Word files into PDF instantly."
              />
              <ToolCard
                name="PDF Merger"
                href="/tools/pdf-merge"
                icon={FileText}
                description="Combine multiple PDFs into one."
              />
              <ToolCard
                name="PDF Splitter"
                href="/tools/pdf-splitter"
                icon={FileUser}
                description="Split large PDFs into smaller files."
              />
              <ToolCard
                name="Image to PDF"
                href="/tools/image-to-pdf"
                icon={Image}
                description="Convert images into PDF format."
              />
            </div>
          </section>

          <section className="pt-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Frequently Asked Questions</h2>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                { q: "Is ToolQS PDF to Word Converter free?", a: "Yes — it’s completely free and requires no signup." },
                { q: "Are my files safe?", a: "Yes, conversion happens inside your browser. No files are uploaded to any server." },
                { q: "Which files are supported?", a: "Currently PDF to .docx (Microsoft Word)." },
              ].map((faq, idx) => (
                <details key={idx} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6">
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-blue-700">
                    {faq.q}
                    <span className="ml-4 text-xl text-gray-500 group-open:text-blue-600">+</span>
                  </summary>
                  <p className="mt-4 text-gray-700 text-base leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
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
