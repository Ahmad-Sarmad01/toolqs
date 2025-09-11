"use client";

import Head from "next/head";
import { useState, useRef } from "react";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Point pdf.js to your public worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function WordCounterPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Word & Character Counter - ToolQS",
    "url": "https://toolqs.com/tools/word-counter",
    "description":
      "Count words, characters, and estimate reading time online instantly. Upload documents or type your text. Perfect for writers, students, bloggers, and content creators.",
    "publisher": {
      "@type": "Organization",
      "name": "ToolQS",
      "url": "https://toolqs.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://toolqs.com/logo.png",
      },
    },
    "mainEntity": {
      "@type": "WebApplication",
      "name": "Word & Character Counter",
      "applicationCategory": "Utilities",
      "operatingSystem": "Web",
      "url": "https://toolqs.com/tools/word-counter",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
    },
  };

  const [text, setText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file.name);

    const reader = new FileReader();

    if (file.type === "text/plain") {
      reader.onload = () => setText(reader.result as string);
      reader.readAsText(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value);
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type === "application/pdf") {
      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let pdfText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          pdfText += strings.join(" ") + "\n";
        }
        setText(pdfText);
      };
      reader.readAsArrayBuffer(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        try {
          const pptxParser = await import("pptx-parser");
          const slides = await pptxParser.readPptx(arrayBuffer);

          let pptxText = "";
          slides.forEach((slide: any, i: number) => {
            pptxText += `\n--- Slide ${i + 1} ---\n`;
            (slide.texts || []).forEach((t: string) => {
              pptxText += t + " ";
            });
          });

          setText(pptxText);
        } catch (err) {
          console.error("PPTX parsing failed:", err);
          alert("Could not read PPTX file.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
    else {
      alert("Unsupported file type");
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, "").length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <>
      <Head>
        <title>Word & Character Counter - ToolQS</title>
        <meta
          name="description"
          content="Count words, characters, and estimate reading time online instantly. Upload documents or type your text. Perfect for writers, students, bloggers, and content creators."
        />
        <meta
          name="keywords"
          content="word counter, character counter, reading time estimator, online text tools, ToolQS, text analyzer, document upload, word count online"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://toolqs.com/tools/word-counter" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <div className="max-w-5xl mx-auto p-6 space-y-10">
        <h1 className="text-5xl font-extrabold text-blue-700 text-center">
          Word & Character Counter
        </h1>
        <p className="text-gray-500 text-center text-lg">
          Type, paste, or upload a document to get real-time word and character
          count with reading time estimation.
        </p>

        <div
          className="relative border-2 border-dashed border-blue-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all hover:shadow-xl bg-gradient-to-r from-white via-blue-50 to-white text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt,.docx,.pdf,.pptx"
            className="hidden"
            onChange={handleFileUpload}
          />
          <p className="text-gray-500 text-lg">
            Drag & Drop your file here, or{" "}
            <span className="text-blue-600 font-semibold underline">
              click to upload
            </span>
          </p>
          {uploadedFile && (
            <p className="mt-2 text-green-600 font-medium text-md">
              Uploaded: {uploadedFile}
            </p>
          )}
        </div>

        <textarea
          className="w-full p-5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 resize-none h-60 shadow-md placeholder-gray-400 mb-6 transition-all"
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Words", value: wordCount },
            { label: "Characters", value: charCount },
            { label: "Characters (no spaces)", value: charCountNoSpaces },
            { label: "Reading Time", value: `${readingTime} min` },
          ].map((counter) => (
            <div
              key={counter.label}
              className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all"
            >
              <p className="text-gray-600 font-medium">{counter.label}</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {counter.value}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-lg transform hover:-translate-y-1 transition-all"
            onClick={() => {
              setText("");
              setUploadedFile(null);
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
}
