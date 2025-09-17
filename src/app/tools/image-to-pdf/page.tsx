"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Image as ImageIcon, Download, Trash2, FileUser, FileText, FileInput } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ExploreCTA from "@/components/ExploreCTA";

export default function ImageToPdfPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Image to PDF Converter - ToolQS",
    url: "https://toolqs.com/tools/image-to-pdf",
    description:
      "Convert images (PNG, JPG, WEBP) to a single PDF online. Upload images, reorder them, and download a multi-page PDF. Fast, private, and runs in your browser.",
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
        name: "Which image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PNG, JPG/JPEG and WEBP are supported. WEBP images are converted to PNG in the browser before embedding.",
        },
      },
      {
        "@type": "Question",
        name: "Are my files uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No — conversion happens entirely in your browser. ToolQS does not upload or store your files.",
        },
      },
      {
        "@type": "Question",
        name: "Can I reorder images before exporting?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — you can add multiple images, remove any, and the PDF will respect the current order.",
        },
      },
    ],
  };

  type UploadedImage = {
    id: string;
    file: File;
    previewUrl: string;
    width?: number;
    height?: number;
  };

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  const setPdfUrlAndRevokePrevious = (newUrl: string | null) => {
    if (pdfUrl && pdfUrl !== newUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(newUrl);
  };

  const getImageSize = (file: File): Promise<{ width: number; height: number; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.onload = () => {
        const dataUrl = String(reader.result);
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight, dataUrl });
        };
        img.onerror = () => reject(new Error("Invalid image file"));
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const convertWebpToPngDataUrl = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas not supported");
          ctx.drawImage(img, 0, 0);
          const png = canvas.toDataURL("image/png");
          resolve(png);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to convert WEBP"));
      img.src = dataUrl;
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith("image/")) {
        setError("Only image files are supported (PNG, JPG, WEBP).");
        continue;
      }

      try {
        const { width, height, dataUrl } = await getImageSize(file);
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          previewUrl,
          width,
          height,
        });
      } catch (err) {
        console.error("Image read error:", err);
        setError("One or more images could not be read. Make sure files are valid images.");
      }
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const moveImage = (id: string, direction: "up" | "down") => {
    setImages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[swapIdx];
      copy[swapIdx] = copy[idx];
      copy[idx] = tmp;
      return copy;
    });
  };

  const createPdf = async () => {
    if (images.length === 0) {
      setError("Please add at least one image.");
      return;
    }

    setLoading(true);
    setError(null);
    setPdfUrlAndRevokePrevious(null);

    try {

      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        const arr = await img.file.arrayBuffer();
        const mime = img.file.type.toLowerCase();

        let embeddedImage;
        if (mime === "image/jpeg" || mime === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(arr);
        } else if (mime === "image/png") {
          embeddedImage = await pdfDoc.embedPng(arr);
        } else if (mime === "image/webp") {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Failed to read WEBP file"));
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(img.file);
          });
          const pngDataUrl = await convertWebpToPngDataUrl(dataUrl);
          const bstr = atob(pngDataUrl.split(",")[1]);
          const u8 = new Uint8Array(bstr.length);
          for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
          embeddedImage = await pdfDoc.embedPng(u8);
        } else {
          try {
            embeddedImage = await pdfDoc.embedPng(arr);
          } catch {
            embeddedImage = await pdfDoc.embedJpg(arr);
          }
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        const page = pdfDoc.addPage([imgWidth, imgHeight]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrlAndRevokePrevious(url);
    } catch (err) {
      console.error("PDF creation failed:", err);
      setError("Failed to create PDF. Make sure images are valid and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Image to PDF Converter — ToolQS</title>
        <meta
          name="description"
          content="Convert PNG, JPG or WEBP images to a single PDF online. Drag & drop or upload images, reorder them, and download a multi-page PDF — private and fast in your browser."
        />
        <meta
          name="keywords"
          content="image to pdf, convert images to pdf, png to pdf, jpg to pdf, webp to pdf, online image pdf converter, ToolQS"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://toolqs.com/tools/image-to-pdf" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <div className={dark ? "dark" : ""}>
        <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-extrabold text-blue-700">Image to PDF Converter</h1>
            <p className="text-gray-500 text-lg mt-2">
              Upload images and convert them into a single PDF. Supports PNG, JPG/JPEG and WEBP. Conversion happens inside your browser.
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
            aria-label="Upload images by clicking or drag and drop"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              multiple
              className="hidden"
              aria-hidden
            />
            <p className="text-gray-900 dark:text-gray-800 text-lg">
              Drag & Drop your <b>images</b> here, or{" "}
              <span className="text-blue-600 font-semibold underline">click to upload</span>
            </p>
            <p className="mt-2 text-sm text-gray-800 dark:text-gray-700">PNG, JPG/JPEG and WEBP supported • You can upload multiple images</p>

            {images.length > 0 && (
              <p className="mt-3 text-sm text-green-600 dark:text-green-300 font-medium">
                {images.length} image{images.length > 1 ? "s" : ""} ready
              </p>
            )}

            {loading && <p className="mt-3 text-sm text-gray-600">Generating PDF... please wait.</p>}
            {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
          </div>

          {images.length > 0 && (
            <section className="text-center justify-center items-center">
              <h2 className="text-2xl font-bold mt-6 mb-4 text-gray-800">Preview & Order</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={img.id} className="bg-white rounded-xl p-3 shadow-sm flex flex-col">
                    <div className="relative pb-2/3 mb-3 overflow-hidden rounded">
                      <img
                        src={img.previewUrl}
                        alt={`preview-${idx}`}
                        className="object-contain w-full h-40 mx-auto"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-gray-700 truncate">{img.file.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveImage(img.id, "up")}
                          disabled={idx === 0}
                          title="Move up"
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveImage(img.id, "down")}
                          disabled={idx === images.length - 1}
                          title="Move down"
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                          ↓
                        </button>

                        <button
                          onClick={() => removeImage(img.id)}
                          title="Remove"
                          className="p-2 rounded bg-red-50 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={createPdf}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-lg font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Create PDF
                </button>

                <button
                  onClick={() => {
                    // clear previews and revoke urls
                    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
                    setImages([]);
                    setPdfUrlAndRevokePrevious(null);
                    setError(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  Clear all
                </button>

                <label className="ml-2 text-sm text-gray-600">or add more images</label>
              </div>
            </section>
          )}

          {pdfUrl && (
            <div className="text-center mt-6">
              <a
                href={pdfUrl}
                download={`toolqs-image-to-pdf-${Date.now()}.pdf`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition text-lg font-semibold"
              >
                <Download className="w-5 h-5" />
                Download PDF
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
                href="/tools/pdf-merger"
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
                name="PDF-to-Word"
                href="/tools/pdf-to-word"
                icon={ImageIcon}
                description="Convert PDF into word format."
              />
            </div>
          </section>

          <section className="pt-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Frequently Asked Questions</h2>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                { q: "Which image formats are supported?", a: "PNG, JPG/JPEG and WEBP are supported. WEBP is converted to PNG in the browser." },
                { q: "Are my files safe?", a: "Yes — conversion happens inside your browser. No files are uploaded." },
                { q: "Can I reorder images?", a: "Yes — use the up/down buttons on each preview card to reorder images before export." },
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
