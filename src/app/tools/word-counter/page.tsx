"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useRef, useMemo } from "react";
import * as mammoth from "mammoth";
import { readPptx } from "@/lib/fileHandlers";
import { Clipboard, Download, Sun, Moon, FileText, FileInput, Image, FileUser } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

export default function WordCounterPage() {

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Word & Character Counter - ToolQS",
    url: "https://toolqs.com/tools/word-counter",
    description:
      "Count words, characters, and estimate reading time online instantly. Upload documents or type your text. Perfect for writers, students, bloggers, and content creators.",
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
        name: "Is ToolQS Word Counter free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — the Word & Character Counter on ToolQS is 100% free to use with no signup required.",
        },
      },
      {
        "@type": "Question",
        name: "Which file types can I upload?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can upload .txt, .docx, .pdf and .pptx files. PDF and PPTX parsing happen in your browser for privacy.",
        },
      },
      {
        "@type": "Question",
        name: "Does ToolQS store my text or files?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No — ToolQS processes files in your browser and doesn't store uploads on the server.",
        },
      },
      {
        "@type": "Question",
        name: "How is reading time estimated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Reading time is estimated using an average reading speed of 200 words per minute.",
        },
      },
    ],
  };

  const [text, setText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file.name);

    const reader = new FileReader();

    if (file.type === "text/plain") {
      reader.onload = () => setText(reader.result as string);
      reader.readAsText(file);
    }

    else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value || "");
      };
      reader.readAsArrayBuffer(file);
    }

    else if (file.type === "application/pdf") {
      reader.onload = async () => {
        try {
          const { getDocument, GlobalWorkerOptions } = await import(
            "pdfjs-dist"
          );
          GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await getDocument({ data: typedArray }).promise;

          let pdfText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str);
            pdfText += strings.join(" ") + "\n";
          }
          setText(pdfText);
        } catch (err) {
          console.error("PDF parse error:", err);
          alert("Could not parse PDF file in this browser.");
        }
      };
      reader.readAsArrayBuffer(file);
    }

    else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;
        try {

          const fakeFile = new File([arrayBuffer], file.name, { type: file.type });
          const pptxText = await readPptx(fakeFile);
          setText(pptxText || "");
        } catch (err) {
          console.error("PPTX parsing failed:", err);
          alert("Could not read PPTX file in this browser.");
        }
      };
      reader.readAsArrayBuffer(file);
    }

    else {
      alert("Unsupported file type — please upload .txt, .docx, .pdf or .pptx");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      const inputEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(inputEvent);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const wordCount = useMemo(() => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }, [text]);
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, "").length;
  const readingTime = Math.ceil(wordCount / 200);

  const copyToClipboard = async (what: "text" | "counts") => {
    try {
      if (what === "text") {
        await navigator.clipboard.writeText(text);
        setCopied("text");
      } else {
        const counts = `Words: ${wordCount}\nCharacters: ${charCount}\nCharacters (no spaces): ${charCountNoSpaces}\nReading time: ${readingTime} min`;
        await navigator.clipboard.writeText(counts);
        setCopied("counts");
      }
      setTimeout(() => setCopied(null), 1800);
    } catch {
      alert("Copy failed. Please allow clipboard permissions.");
    }
  };

  const downloadReport = (format: "txt" | "csv") => {
    const now = new Date().toISOString();
    let content = "";
    if (format === "txt") {
      content += `ToolQS Word Counter Report\nGenerated: ${now}\n\n`;
      content += `File: ${uploadedFile ?? "N/A"}\n\n`;
      content += `Words: ${wordCount}\nCharacters: ${charCount}\nCharacters (no spaces): ${charCountNoSpaces}\nReading time: ${readingTime} min\n\n--- Text ---\n\n`;
      content += text;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toolqs-wordcount-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {

      const rows = [
        ["generated_at", now],
        ["file", uploadedFile ?? "N/A"],
        ["words", String(wordCount)],
        ["characters", String(charCount)],
        ["characters_no_spaces", String(charCountNoSpaces)],
        ["reading_time_min", String(readingTime)],
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toolqs-wordcount-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyTextSelection = async () => {
    if (!text) return alert("Nothing to copy.");
    await copyToClipboard("text");
  };

  return (
    <>
      <Head>
        <title>Free Online Word & Character Counter — ToolQS</title>
        <meta
          name="description"
          content="Free online word counter and character counter. Paste text or upload .docx, .pdf, .pptx, or .txt to get word & character counts and reading time. Fast, private, and free."
        />
        <meta
          name="keywords"
          content="free word counter, character counter, reading time estimator, word count online, count words, docx word counter, pdf word count, ToolQS, letter counter, essay word counter, character count tool"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://toolqs.com/tools/word-counter" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <div className={dark ? "dark" : ""}>
        <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-extrabold text-blue-700">
              Word & Character Counter
            </h1>
            <p className="text-gray-500 text-lg mt-2">
              Type, paste, or upload a document to get real-time word and character
              count with reading time estimation.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 mb-6">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
            >
              {dark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            <button
              onClick={() => copyToClipboard("counts")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border hover:shadow-md transition text-sm"
              title="Copy counts"
            >
              <Clipboard className="w-4 h-4" />
              <span>{copied === "counts" ? "Copied!" : "Copy Counts"}</span>
            </button>

            <div className="relative inline-flex">
              <button
                onClick={() => downloadReport("txt")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                title="Download TXT report"
              >
                <Download className="w-4 h-4" />
                TXT
              </button>
              <button
                onClick={() => downloadReport("csv")}
                className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition text-sm"
                title="Download CSV report"
              >
                CSV
              </button>
            </div>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-blue-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all hover:shadow-xl bg-gradient-to-r from-white via-blue-50 to-white text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.docx,.pdf,.pptx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-gray-900 dark:text-gray-800 text-lg">
              Drag & Drop a file here, or <span className="text-blue-600 font-semibold underline">click to upload</span>
            </p>
            <p className="mt-2 text-sm text-gray-800 dark:text-gray-700">
              Supported: .txt · .docx · .pdf · .pptx 
            </p>
            {uploadedFile && (
              <p className="mt-3 text-sm text-green-600 dark:text-green-300 font-medium">Uploaded: {uploadedFile}</p>
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className={
              "w-full p-5 border rounded-xl focus:outline-none focus:ring-1 resize-none min-h-[240px] sm:h-60 shadow-md placeholder-gray-400 mb-2 transition " +
              (dark ? "bg-gray-900 text-white border-gray-700 focus:ring-blue-900" : "bg-white text-gray-900")
            }
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => { setText(""); setUploadedFile(null); }}
                className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
              >
                Clear
              </button>

              <button
                onClick={copyTextSelection}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                Copy Text
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Words", value: wordCount },
              { label: "Characters", value: charCount },
              { label: "Characters (no spaces)", value: charCountNoSpaces },
              { label: "Reading Time", value: `${readingTime} min` },
            ].map((c) => (
              <div key={c.label} className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all">
                <p className="text-gray-600 font-medium">{c.label}</p>
                <p className="text-2xl font-bold text-blue-700 mt-2">{c.value}</p>
              </div>
            ))}
          </div>

          <section className="pt-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <ToolCard
                name="Word to PDF Converter"
                href="/tools/word-to-pdf"
                icon={FileText}
                description="Convert Word documents into PDFs easily."
              />
              <ToolCard
                name="PDF to Word Converter"
                href="/tools/pdf-to-word"
                icon={FileInput}
                description="Extract text and content by converting PDFs into Word."
              />
              <ToolCard
                name="Resume Builder"
                href="/tools/resume-builder"
                icon={FileUser}
                description="Create professional resumes."
              />
              <ToolCard
                name="Image Compressor"
                href="/tools/image-compress"
                icon={Image}
                description="Reduce image file size."
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
                  q: "Is ToolQS Word Counter free to use?",
                  a: "Yes — the word counter is completely free with no signups required.",
                },
                {
                  q: "Which file types can I upload?",
                  a: "Supported formats: .txt, .docx, .pdf and .pptx. Files are parsed locally in your browser for privacy.",
                },
                {
                  q: "Does ToolQS store my text or files?",
                  a: "No. Uploaded files are processed in the browser and not stored on our servers.",
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6"
                >
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-blue-700">
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
      </div>

      <ExploreCTA />
    </>
  );
}

function ToolCard({ name, href, icon: Icon, description }: { name: string; href: string; icon: React.ElementType; description: string; }) {
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
