"use client";

import { useState, useRef } from "react";
import Head from "next/head";
import Script from "next/script";
import { QRCodeCanvas } from "qrcode.react";
import { toPng, toSvg } from "html-to-image";
import Link from "next/link";
import { Calculator, Type, FilePlus, Ruler, Download, Upload } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "QR Code Generator - ToolQS",
    url: "https://toolqs.com/tools/qr-code",
    description:
      "Generate QR codes instantly for URLs, text, or any content. Customize colors, size, add a logo, then download or share.",
    publisher: {
      "@type": "Organization",
      name: "ToolQS",
      url: "https://toolqs.com",
      logo: { "@type": "ImageObject", url: "https://toolqs.com/logo.png" },
    },
    mainEntity: {
      "@type": "WebApplication",
      name: "QR Code Generator",
      applicationCategory: "Utilities",
      operatingSystem: "Web",
      url: "https://toolqs.com/tools/qr-code",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  };

  // Handlers
  const handleDownloadPNG = async () => {
    if (!qrRef.current) return;
    const dataUrl = await toPng(qrRef.current);
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSVG = async () => {
    if (!qrRef.current) return;
    const dataUrl = await toSvg(qrRef.current);
    const link = document.createElement("a");
    link.download = "qr-code.svg";
    link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataUrl)}`;
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Head>
        <title>QR Code Generator - ToolQS</title>
        <meta
          name="description"
          content="Generate QR codes instantly for URLs, text, or any content. Customize colors, size, add a logo, then download or share."
        />
        <meta
          name="keywords"
          content="QR code generator, QR code maker, online QR code, ToolQS, free QR code, custom QR code"
        />
        <link rel="canonical" href="https://toolqs.com/tools/qr-code" />
      </Head>

      {/* JSON-LD via next/script */}
      <Script
        id="ld-json"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700">
            QR Code Generator
          </h1>
          <p className="text-gray-500 text-sm sm:text-lg">
            Generate QR codes instantly for any text or URL. Customize size, colors, add an optional logo, and download as PNG or SVG.
          </p>
        </div>

        {/* Input & Controls */}
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1 space-y-3">
            <label htmlFor="qr-text" className="font-medium">Enter text or URL:</label>
            <input
              id="qr-text"
              type="text"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter URL or text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              <div>
                <label htmlFor="qr-size" className="font-medium">Size:</label>
                <select
                  id="qr-size"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={128}>Small</option>
                  <option value={256}>Medium</option>
                  <option value={512}>Large</option>
                </select>
              </div>
              <div>
                <label htmlFor="qr-fg" className="font-medium">Foreground:</label>
                <input
                  id="qr-fg"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full h-10 border rounded-xl cursor-pointer p-0"
                />
              </div>
              <div>
                <label htmlFor="qr-bg" className="font-medium">Background:</label>
                <input
                  id="qr-bg"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 border rounded-xl cursor-pointer p-0"
                />
              </div>
              <div>
                <label htmlFor="qr-logo" className="font-medium block">Logo (optional):</label>
                <label
                  htmlFor="qr-logo"
                  className="flex items-center justify-center gap-2 px-3 py-2 border rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-gray-600"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </label>
                <input
                  id="qr-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex gap-2 mt-2 md:mt-5">
                <button
                  onClick={handleCopy}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm"
                >
                  {copied ? "Copied!" : "Copy Text"}
                </button>
                <button
                  onClick={handleDownloadPNG}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PNG
                </button>
                <button
                  onClick={handleDownloadSVG}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  SVG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Preview */}
        <div className="flex flex-col items-center p-4 border rounded-xl bg-white shadow-md relative">
          {text ? (
            <>
              <div ref={qrRef} className="p-6 bg-white inline-block relative">
                <QRCodeCanvas
                  value={text}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  includeMargin={true}
                />
                {logo && (
                  <img
                    src={logo}
                    alt="Logo"
                    loading="lazy"
                    className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 object-contain rounded"
                  />
                )}
              </div>
              <p className="mt-4 text-blue-700 font-medium text-center">
                🎉 Your QR code is ready! Share it with friends or download below.
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-center">
              QR code preview will appear here.
            </p>
          )}
        </div>

        {/* Related Tools */}
        <section className="pt-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ToolCard
              name="GPA Calculator"
              href="/tools/gpa-calculator"
              icon={Calculator}
              description="Convert Word documents into PDFs easily."
            />
            <ToolCard
              name="Word Counter"
              href="/tools/word-counter"
              icon={Type}
              description="Extract text and content by converting PDFs into Word."
            />
            <ToolCard
              name="PDF Merger"
              href="/tools/pdf-merger"
              icon={FilePlus}
              description="Create professional resumes."
            />
            <ToolCard
              name="Unit Converter"
              href="/tools/unit-converter"
              icon={Ruler}
              description="Reduce image file size."
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Is the QR Code Generator free to use?",
                a: "Yes — ToolQS QR Code Generator is completely free and does not require any signups.",
              },
              {
                q: "What types of content can I convert into a QR code?",
                a: "You can generate QR codes for URLs, plain text, contact details, or any custom information you want to share.",
              },
              {
                q: "Can I customize the QR code design?",
                a: "Yes — you can change the size, foreground color, and background color of the QR code before downloading.",
              },
              {
                q: "Which formats can I download my QR code in?",
                a: "You can download your QR code in both PNG and SVG formats. Both are high quality and suitable for digital or print use.",
              },
              {
                q: "Does ToolQS store my generated QR codes?",
                a: "No — all QR codes are generated instantly in your browser. ToolQS does not store your content or codes.",
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
