"use client";

import Head from "next/head";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import Link from "next/link";
import { Scissors, FileInput, FileText, Image } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

type UploadedPDF = {
  id: string;
  name: string;
  size: number;
  pages?: number;
  arrayBuffer: ArrayBuffer;
};

export default function PDFMergerPage() {
  const [files, setFiles] = useState<UploadedPDF[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "PDF Merger - ToolQS",
    url: "https://toolqs.com/tools/pdf-merger",
    description:
      "Merge multiple PDF files online quickly and securely. Drag & drop PDFs, reorder pages, and download a single merged PDF — free and private.",
    mainEntity: {
      "@type": "WebApplication",
      name: "PDF Merger",
      applicationCategory: "Utilities",
      operatingSystem: "Web",
      url: "https://toolqs.com/tools/pdf-merger",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  };

  const readFileAsArrayBuffer = (file: File) =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });

  const addFiles = async (fileList: FileList | File[]) => {
    const list = Array.from(fileList);
    const accepted = list.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));

    if (accepted.length === 0) {
      setMessage("Please upload one or more PDF files.");
      setTimeout(() => setMessage(null), 3500);
      return;
    }

    const newUploads: UploadedPDF[] = [];

    for (const f of accepted) {
      try {
        const buffer = await readFileAsArrayBuffer(f);
        let pages = undefined;
        try {
          const pdfDoc = await PDFDocument.load(buffer);
          pages = pdfDoc.getPageCount();
        } catch {
          pages = undefined;
        }
        newUploads.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: f.name,
          size: f.size,
          pages,
          arrayBuffer: buffer,
        });
      } catch (err) {
        console.error("File read error", err);
      }
    }

    setFiles((prev) => [...prev, ...newUploads]);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveDown = (index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const handleMerge = async () => {
    if (files.length < 1) {
      setMessage("Add at least one PDF to merge.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsMerging(true);
    setMessage(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const f of files) {
        const src = await PDFDocument.load(f.arrayBuffer);
        const copied = await mergedPdf.copyPages(src, src.getPageIndices());
        copied.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `toolqs-merged-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage("✅ Merged PDF downloaded.");
    } catch (err) {
      console.error("Merge failed:", err);
      setMessage("❌ Merge failed. Try again with different files.");
    } finally {
      setIsMerging(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const clearAll = () => setFiles([]);

  const humanFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
      <Head>
        <title>PDF Merger - ToolQS | Merge PDF files online</title>
        <meta
          name="description"
          content="Merge PDF files online. Drag & drop PDFs, reorder them, and download a single merged PDF. Free, fast, and private — ToolQS PDF Merger."
        />
        <meta
          name="keywords"
          content="pdf merger, merge pdf online, combine pdf, online pdf merge, toolqs pdf tools"
        />
        <link rel="canonical" href="https://toolqs.com/tools/pdf-merger" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 font-sans">
        <section className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-3">
            Merge PDF Files — Fast & Secure
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Combine multiple PDF documents into a single file in your browser. Private — no uploads to our server.
            Drag & drop files, reorder pages, then merge and download.
          </p>
        </section>

        <section>
          <div
            role="region"
            aria-label="PDF upload"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-6 p-6 rounded-xl border-2 transition-shadow cursor-pointer focus:outline-none ${
              dragOver
                ? "border-blue-400 shadow-lg bg-blue-50"
                : "border-dashed border-gray-300 bg-white hover:shadow-md"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  addFiles(e.target.files);
                  e.target.value = "";
                }
              }}
              className="hidden"
              aria-hidden
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-lg font-medium text-gray-800">
                  Drag & drop PDF files here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Or click to choose files. Supported: <span className="font-medium">.pdf</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-white border rounded-lg hover:shadow-sm transition text-sm"
                  aria-label="Upload PDF files"
                >
                  Upload PDFs
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                    setMessage("Cleared all files.");
                    setTimeout(() => setMessage(null), 2000);
                  }}
                  className="px-4 py-2 bg-gray-50 border rounded-lg hover:shadow-sm transition text-sm"
                  aria-label="Clear all files"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            {files.length === 0 ? (
              <div className="text-center text-gray-500 py-8 rounded-md bg-gray-50">No PDFs added yet.</div>
            ) : (
              <ul className="space-y-3">
                {files.map((f, idx) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-blue-600 font-semibold">
                        PDF
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{f.name}</div>
                        <div className="text-xs text-gray-500">
                          {f.pages ? `${f.pages} page${f.pages > 1 ? "s" : ""} • ` : ""}
                          {humanFileSize(f.size)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col md:flex-row gap-2">
                        <button
                          onClick={() => moveUp(idx)}
                          className="px-2 py-1 text-sm bg-gray-50 border rounded hover:bg-gray-100"
                          aria-label={`Move ${f.name} up`}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          className="px-2 py-1 text-sm bg-gray-50 border rounded hover:bg-gray-100"
                          aria-label={`Move ${f.name} down`}
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeFile(f.id)}
                          className="px-3 py-1 text-sm bg-red-50 text-red-700 border rounded hover:bg-red-100"
                          aria-label={`Remove ${f.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Order matters — pages are appended in the order shown. You can move files up/down before merging.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMerge}
                disabled={isMerging || files.length === 0}
                className={`px-5 py-3 rounded-lg font-semibold text-white transition ${
                  isMerging || files.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                aria-disabled={isMerging || files.length === 0}
                aria-label="Merge PDFs"
              >
                {isMerging ? "Merging..." : "Merge & Download"}
              </button>

              <button
                onClick={() => {
                  files.forEach((f) => {
                    const blob = new Blob([f.arrayBuffer], { type: "application/pdf" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = f.name;
                    link.click();
                    URL.revokeObjectURL(url);
                  });
                }}
                className="px-4 py-3 bg-white border rounded-lg hover:shadow-sm text-sm"
                aria-label="Download individual PDFs"
              >
                Download Originals
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-4 p-3 rounded text-sm bg-blue-50 text-blue-800">{message}</div>
          )}
        </section>

        <section className="mt-8 bg-gradient-to-r from-blue-50 to-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Why use ToolQS PDF Merger?</h2>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Private — files are processed in your browser only.</li>
            <li>Fast — merge locally without uploads or wait times.</li>
            <li>Mobile-friendly — works on phones and tablets.</li>
            <li>Free — no signup or hidden fees.</li>
          </ul>
        </section>

        <section className="pt-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ToolCard
              name="PDF Splitter"
              href="/tools/pdf-splitter"
              icon={Scissors}
              description="Split PDFs as you require them and get what you want."
            />
            <ToolCard
              name="Word to PDF Converter"
              href="/tools/word-to-pdf"
              icon={FileText}
              description="Extract text and content by converting Word into PDFs."
            />
            <ToolCard
              name="PDF to Word Converter"
              href="/tools/pdf-to-word"
              icon={FileInput}
              description="Extract text and content by converting PDFs into Word."
            />
            <ToolCard
              name="Image to PDF Converter"
              href="/tools/image-to-pdf"
              icon={Image}
              description="Convert image content into PDFs."
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
                q: "Is the PDF Merger free to use?",
                a: "Yes — ToolQS PDF Merger is completely free and does not require any signups.",
              },
              {
                q: "Which file formats are supported?",
                a: "Currently, the tool supports PDF files only. Other formats are not supported for merging.",
              },
              {
                q: "Is there a limit on the number of PDFs I can merge?",
                a: "You can merge multiple PDF files in one go, depending on your browser’s performance. For best results, merge up to 10–15 files at a time.",
              },
              {
                q: "Are my PDFs uploaded to your server?",
                a: "No — all merging is processed directly in your browser. ToolQS does not upload, view, or store your files.",
              },
              {
                q: "Will the merged PDF maintain the original quality?",
                a: "Yes — the PDF Merger keeps the original pages exactly as they are without reducing quality.",
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
