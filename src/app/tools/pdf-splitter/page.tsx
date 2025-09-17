"use client";

import Head from "next/head";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Link from "next/link";
import { FilePlus, FileInput, FileText, Image } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

export default function PDFSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [range, setRange] = useState("");
  const [message, setMessage] = useState("");

  const handleSplit = async () => {
    if (!file || !range) {
      setMessage("Please upload a PDF and enter a page range.");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);

      const ranges = range.split(",").map(r => r.trim());
      const pageIndices: number[] = [];

      ranges.forEach(r => {
        if (r.includes("-")) {
          const [start, end] = r.split("-").map(n => parseInt(n) - 1);
          for (let i = start; i <= end; i++) pageIndices.push(i);
        } else {
          pageIndices.push(parseInt(r) - 1);
        }
      });

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(p => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `toolqs-split-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage("Split PDF downloaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Error splitting PDF. Please try again.");
    }
  };

  return (
    <>
      {/* SEO Optimization */}
      <Head>
        <title>PDF Splitter | ToolQS – Quick & Smart Tools</title>
        <meta
          name="description"
          content="Split PDF files into individual pages instantly with ToolQS PDF Splitter. Fast, secure, and free online tool to extract and download pages separately."
        />
        <meta
          name="keywords"
          content="pdf splitter, split pdf, extract pdf pages, online pdf tool, free pdf splitter, ToolQS"
        />
        <meta name="author" content="ToolQS" />
        <meta property="og:title" content="PDF Splitter | ToolQS" />
        <meta
          property="og:description"
          content="Split your PDF into separate pages instantly with ToolQS."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toolqs.com/pdf-splitter" />
        <meta property="og:site_name" content="ToolQS" />
      </Head>

      <main className="min-h-screen bg-white py-10 px-6">
        <section className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
            Split PDF Files — Fast & Secure
          </h1>
          <p className="text-lg text-gray-600">
            Easily split your PDF into pages or extract specific ranges.  
            100% free, private, and browser-based. Drag & drop files, reorder pages, then split and download.
          </p>
        </section>

        <section className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border">
          <div className="mb-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter page range (e.g., 1-3 or 5 or 7-8 or 1-3,5,7-8)"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          <button
            onClick={handleSplit}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Split PDF
          </button>
          {message && (
            <p className="mt-4 text-center text-gray-700 font-medium">
              {message}
            </p>
          )}
        </section>

        <section className="max-w-4xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            How to Split Your PDF
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-gray-700">
            <div className="p-6 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow">
              <h3 className="font-semibold mb-3 text-blue-700">1. Upload Your File</h3>
              <p className="text-gray-600 leading-relaxed">
                Click the <strong>Upload</strong> button and select the PDF you want
                to split. ToolQS processes the file directly in your browser — 
                meaning it never leaves your computer for maximum privacy.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow">
              <h3 className="font-semibold mb-3 text-blue-700">2. Enter Page Range</h3>
              <div className="text-gray-600 leading-relaxed">
                <p>
                  Type the page numbers you want to extract. You can use:
                </p>
                <ul className="text-left mt-2 list-disc list-inside">
                  <li><strong>Single pages:</strong> <code>5</code> (only page 5)</li>
                  <li><strong>Continuous range:</strong> <code>2-6</code> (pages 2 to 6)</li>
                  <li><strong>Mixed ranges:</strong> <code>1-3,7,9-10</code></li>
                </ul>
                <p className="mt-2">
                  This gives you full control to keep only the sections you need.
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow">
              <h3 className="font-semibold mb-3 text-blue-700">3. Download Instantly</h3>
              <p className="text-gray-600 leading-relaxed">
                Hit <strong>Split PDF</strong> and ToolQS instantly generates a new
                file with only the pages you selected. The split PDF is downloaded
                directly to your device in seconds — no waiting, no uploads, no limits.
              </p>
            </div>
          </div>

          <div className="mt-10 text-gray-700 text-base leading-relaxed max-w-2xl mx-auto">
            <p>
              💡 <strong>Tip:</strong> You can repeat the process multiple times if you
              want to split different sections from the same document into separate
              files.
            </p>
            <p className="mt-2">
              ToolQS PDF Splitter is designed for students, professionals, and businesses
              who need quick extraction of chapters, invoices, reports, or any specific
              part of a large PDF.
            </p>
          </div>
        </section>

        <section className="pt-10 mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ToolCard
              name="PDF Merger"
              href="/tools/pdf-merger"
              icon={FilePlus}
              description="Merge or add two or more PDFs into one."
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
                q: "Is ToolQS PDF Splitter free?",
                a: "Yes — it is completely free with no signups required.",
              },
              {
                q: "Can I split by page ranges?",
                a: "Yes — you can enter custom ranges like 1-3,5,7-8 to extract exactly what you need.",
              },
              {
                q: "Does ToolQS store my PDFs?",
                a: "No. All splitting happens in your browser. Your files never leave your device.",
              },
              {
                q: "Is there a file size limit?",
                a: "Most PDFs under 50MB will work smoothly in the browser.",
              },
              {
                q: "Which devices are supported?",
                a: "ToolQS PDF Splitter works on desktop, tablet, and mobile in any modern browser.",
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
      </main>
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
