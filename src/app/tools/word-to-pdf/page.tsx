"use client";

import Head from "next/head";
import Script from "next/script";
import Link from "next/link";
import { useState, useRef } from "react";
import { Sun, Moon, Download, FileInput, FileText, FileUser, Image } from "lucide-react";
import * as mammoth from "mammoth";
import ExploreCTA from "@/components/ExploreCTA";

export default function WordToPDFPage() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [dark, setDark] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Word to PDF Converter - ToolQS",
    url: "https://toolqs.com/tools/word-to-pdf",
    description:
      "Free online Word to PDF converter. Upload a DOCX file and download a high-quality PDF instantly. Fast, private, and works in your browser.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is ToolQS Word to PDF Converter free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, the Word to PDF tool is 100% free with no registration required." },
      },
      {
        "@type": "Question",
        name: "Does my file get uploaded to a server?",
        acceptedAnswer: { "@type": "Answer", text: "No, conversion happens entirely in your browser. ToolQS does not store or process your files on any server." },
      },
    ],
  };

  async function ensureFontsLoaded() {
    try {
      if ((document as any).fonts) {
        const already = (document as any).fonts.check('12px "Noto Sans"');
        if (!already) {
          const f = new FontFace("Noto Sans", `url(/fonts/NotoSans-Regular.ttf)`);
          await f.load();
          (document as any).fonts.add(f);
        }
        await (document as any).fonts.ready;
      }
    } catch (err) {
      console.warn("Font load failed or not supported:", err);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setMessage("Please upload a .docx file.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setUploadedFile(file.name);
    setHtmlContent(null);
    setMessage("Converting .docx to HTML...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      const wrapped = `
        <div class="toolqs-docx-content" style="
          font-family: 'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          color: #111827;
          line-height: 1.45;
          font-size: 14px;
          padding: 20px;
        ">
          ${result.value}
        </div>
      `;

      setHtmlContent(wrapped);
      setMessage(null);
    } catch (err) {
      console.error("mammoth error:", err);
      setMessage("Could not parse the .docx file.");
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleDownloadPdf = async () => {
    if (!htmlContent || !previewRef.current) {
      setMessage("Nothing to convert — upload a .docx first.");
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setPdfGenerating(true);
    setMessage("Preparing PDF...");

    try {
      await ensureFontsLoaded();

      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = (html2pdfModule as unknown as {
        default: () => {
          set: (options: Record<string, unknown>) => {
            from: (element: HTMLElement) => {
              save: () => Promise<void>;
            };
          };
        };
      }).default;

      const element = previewRef.current;

      const filename = `toolqs-word-to-pdf-${Date.now()}.pdf`;
      const opt = {
        margin: [10, 10, 10, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await new Promise<void>((resolve, reject) => {
        try {
          html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => resolve())
            .catch((err: any) => {
              console.error("html2pdf error:", err);
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });

      setMessage("PDF generated — check downloads.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      setMessage("PDF generation failed. Try again or reduce content size.");
    } finally {
      setPdfGenerating(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      const input = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(input);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  return (
    <>
      <Head>
        <title>Free Word to PDF Converter — ToolQS</title>
        <meta name="description" content="Convert Word (.docx) files to PDF instantly online. Fast, free, and private — works directly in your browser." />
        <meta name="keywords" content="word to pdf, docx to pdf, convert word file, free pdf converter, ToolQS Word to PDF, online word pdf tool" />
        <link rel="canonical" href="https://toolqs.com/tools/word-to-pdf" />
      </Head>

      <Script id="page-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className={dark ? "dark" : ""}>
        <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-extrabold text-blue-700">Word to PDF Converter</h1>
            <p className="text-gray-500 text-lg mt-2">
              Upload a .docx Word file and convert it to a printable PDF in your browser. Unicode & emojis supported.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 mb-6">
            <button
              onClick={() => setDark(d => !d)}
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
            className="relative border-2 border-dashed border-blue-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all hover:shadow-xl bg-gradient-to-r from-white via-blue-50 to-white text-center"
            role="button"
            aria-label="Upload a DOCX file"
          >
            <input ref={fileInputRef} type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
            <p className="text-gray-900 dark:text-gray-800 text-lg">
              Drag & Drop your <b>.docx</b> file here, or{" "}
              <span className="text-blue-600 font-semibold underline">click to upload</span>
            </p>
            <p className="mt-2 text-sm text-gray-800 dark:text-gray-700">Only .docx (Word) files are supported. Images embedded in the Word file will be preserved where possible.</p>
            {uploadedFile && <p className="mt-3 text-sm text-green-600 dark:text-green-300 font-medium">Uploaded: {uploadedFile}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setHtmlContent(null); setUploadedFile(null); setMessage(null); }}
                      className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={!htmlContent || pdfGenerating}
                      className={`px-4 py-2 rounded-lg text-white ${!htmlContent || pdfGenerating ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                      aria-disabled={!htmlContent || pdfGenerating}
                    >
                      {pdfGenerating ? "Generating..." : <><Download className="w-4 h-4 inline mr-2" /> Download PDF</>}
                    </button>
                  </div>
                </div>

                <div className="min-h-[220px] max-h-[600px] overflow-auto border rounded p-4 bg-gray-50">
                  {!htmlContent ? (
                    <p className="text-gray-500">Upload a .docx file to see a live preview. This preview is what will be converted to PDF.</p>
                  ) : (
                    <div
                      ref={previewRef}
                      style={{
                        fontFamily: "'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                        color: "#111827",
                        lineHeight: 1.45,
                        fontSize: 14,
                        padding: 20,
                        background: "white"
                      }}
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  )}
                </div>
              </div>

              {message && <div className="text-sm text-center text-blue-800 bg-blue-50 p-2 rounded">{message}</div>}
            </div>

            <aside className="space-y-4">
              <div className="p-4 bg-white rounded-xl border shadow-sm">
                <h4 className="font-semibold mb-2">How it works</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  <li>We convert the .docx to HTML inside your browser (no uploads).</li>
                  <li>We render that preview into a high-quality PDF using html2pdf (html2canvas + jsPDF).</li>
                  <li>The PDF supports Unicode (emoji, Arabic, Urdu, etc.) — we load a Noto Sans font to improve coverage.</li>
                </ol>
                <p className="mt-3 text-xs text-gray-500">Tip: If your document contains unusual fonts, try saving as plain text or use a font compatible with web rendering.</p>
              </div>

              <div className="p-4 bg-white rounded-xl border shadow-sm">
                <h4 className="font-semibold mb-2">Quality & margins</h4>
                <p className="text-sm text-gray-700">The converter uses a margin/padding when generating the PDF so text doesn't touch the edges. You can increase the scale for higher-quality images (slower).</p>
              </div>

              <div className="p-4 bg-white rounded-xl border shadow-sm">
                <h4 className="font-semibold mb-2">Privacy</h4>
                <p className="text-sm text-gray-700">Everything runs in your browser — files are not uploaded.</p>
              </div>
            </aside>
          </div>

          <section className="pt-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <ToolCard name="PDF to Word Converter" href="/tools/pdf-to-word" icon={FileInput} description="Convert PDFs back into editable Word files." />
              <ToolCard name="Word Counter" href="/tools/word-counter" icon={FileText} description="Count words, characters, and reading time." />
              <ToolCard name="Resume Builder" href="/tools/resume-builder" icon={FileUser} description="Build a professional resume in minutes." />
              <ToolCard name="Image Compressor" href="/tools/image-compress" icon={Image} description="Compress images to reduce file size." />
            </div>
          </section>

          <section className="pt-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                { q: "Is the converter free?", a: "Yes — it’s completely free and requires no signup." },
                { q: "Are my Word files safe?", a: "Conversion happens locally in your browser; files are not uploaded." },
                { q: "Which files are supported?", a: "Currently we support .docx Microsoft Word files." },
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

function ToolCard({ name, href, icon: Icon, description }: { name: string; href: string; icon: React.ElementType; description: string; }) {
  return (
    <Link href={href} className="block bg-white p-6 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1 text-center" aria-label={`Open ${name}`}>
      <Icon className="w-10 h-10 text-blue-600 mb-4" />
      <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </Link>
  );
}
