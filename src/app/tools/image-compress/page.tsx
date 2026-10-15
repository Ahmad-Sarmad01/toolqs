"use client";

import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Download, Trash2, ArrowDownCircle, Upload, Sparkles, FileText, FileInput, Image, FileUser} from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

type InputImage = {
  id: string;
  file: File;
  url: string;
  originalSize: number;
  compressedUrl?: string | null;
  compressedSize?: number | null;
  status: "idle" | "compressing" | "done" | "error";
  error?: string | null;
};

const UID = (p = "") => p + Math.random().toString(36).slice(2, 9);

export default function ImageCompressorPage() {
  const [images, setImages] = useState<InputImage[]>([]);
  const [quality, setQuality] = useState<number>(0.8); // 0-1
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/webp");
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [maxHeight, setMaxHeight] = useState<number | "">("");
  const [keepAspect, setKeepAspect] = useState<boolean>(true);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((im) => {
        URL.revokeObjectURL(im.url);
        if (im.compressedUrl) URL.revokeObjectURL(im.compressedUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files)
      .filter((f) => /^image\//.test(f.type))
      .map((f) => {
        const url = URL.createObjectURL(f);
        return {
          id: UID("img-"),
          file: f,
          url,
          originalSize: f.size,
          compressedUrl: null,
          compressedSize: null,
          status: "idle" as const,
          error: null,
        };
      });
    setImages((prev) => [...arr, ...prev]);
  }

  // drag & drop handlers
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  // single image compression
  async function compressImageItem(item: InputImage) {
    setImages((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "compressing", error: null } : p)));
    try {
      const blob = await fileToCompressedBlob(item.file, {
        quality,
        outputFormat,
        maxWidth: maxWidth === "" ? undefined : Number(maxWidth),
        maxHeight: maxHeight === "" ? undefined : Number(maxHeight),
        keepAspect,
      });

      const compressedUrl = URL.createObjectURL(blob);
      setImages((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? { ...p, compressedUrl, compressedSize: blob.size, status: "done" as const }
            : p
        )
      );
    } catch (err: any) {
      setImages((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "error", error: String(err?.message || err) } : p)));
    }
  }

  // compress all images (sequential to avoid CPU spike)
  async function compressAll() {
    setProcessing(true);
    for (const img of images) {
      // skip already done with same settings (we don't track settings hash — always recompress)
      await compressImageItem(img);
    }
    setProcessing(false);
  }

  // remove image
  function removeImage(id: string) {
    setImages((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) {
        URL.revokeObjectURL(found.url);
        if (found.compressedUrl) URL.revokeObjectURL(found.compressedUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }

  // download one
  function downloadImage(item: InputImage) {
    const url = item.compressedUrl ?? item.url;
    const a = document.createElement("a");
    a.href = url;
    // derive extension
    const ext = item.compressedUrl ? mimeToExt(outputFormat) : getFileExtension(item.file.name) || "png";
    a.download = `${stripExtension(item.file.name)}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // download all sequentially
  function downloadAll() {
    for (const it of images) {
      // delay slightly to avoid browser blocking (optional)
      // But keep it synchronous for simplicity — browsers allow programmatic downloads but may block popup behavior.
      downloadImage(it);
    }
  }

  return (
    <>
      <Head>
        <title>Image Compressor — ToolQS</title>
        <meta
          name="description"
          content="Compress and resize images in your browser. Supports JPEG, WebP and PNG. Batch compress, preview before/after sizes, and download compressed images — private and fast."
        />
        <link rel="canonical" href="https://toolqs.com/tools/image-compressor" />
      </Head>

      <div className="max-w-5xl mx-auto p-6 font-sans space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-700">Image Compressor</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compress and resize images locally in your browser. Preserve privacy — no uploads. Batch-friendly, high quality, and super fast.
          </p>
        </header>

        {/* Controls & uploader */}
          <section
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={(e) => {
              // only open file picker if user clicked the background container itself
              if (e.target === e.currentTarget) inputRef.current?.click();
            }}
            className="relative bg-white p-6 rounded-xl shadow-sm border-dashed border-2 border-blue-100 hover:border-blue-300 cursor-pointer"
            aria-label="Drop images here or click to upload"
          >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded text-blue-600">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="font-semibold">Drag & drop images here</div>
              <div className="text-sm text-gray-500">Or click to select. Supports JPEG, PNG, WebP. Batch upload supported.</div>
            </div>
            <div className="ml-auto flex gap-2">
              <label
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded cursor-pointer"
                onClick={(e) => e.stopPropagation()} 
              >
                <Upload className="w-4 h-4" /> Upload
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>
              <button
                onClick={() => {
                  seedSampleImage().then((f) => addFiles([f] as unknown as FileList));
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"
                title="Add demo image"
              >
                <Sparkles className="w-4 h-4" /> Demo
              </button>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 w-28">Format</label>
              <select className="p-2 border rounded" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as any)}>
                <option value="image/webp">WebP (best)</option>
                <option value="image/jpeg">JPEG (widely supported)</option>
                <option value="image/png">PNG (lossless)</option>
              </select>
              <div className="text-xs text-gray-400 ml-3">Browser support for WebP is recommended.</div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 w-28">Quality</label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={String(quality)}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
                aria-label="Compression quality"
              />
              <div className="w-12 text-right text-sm font-mono">{Math.round(quality * 100)}%</div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 w-28">Max width</label>
              <input
                type="number"
                min={0}
                placeholder="auto"
                className="p-2 border rounded w-36"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <div className="text-xs text-gray-400 ml-2">px</div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 w-28">Max height</label>
              <input
                type="number"
                min={0}
                placeholder="auto"
                className="p-2 border rounded w-36"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <div className="text-xs text-gray-400 ml-2">px</div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 w-28">Keep aspect</label>
              <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => compressAll()}
                disabled={images.length === 0 || processing}
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              >
                <ArrowDownCircle className="w-4 h-4" /> Compress All
              </button>

              <button
                onClick={() => {
                  // clear compressed results & revoke urls
                  setImages((prev) =>
                    prev.map((p) => {
                      if (p.compressedUrl) {
                        URL.revokeObjectURL(p.compressedUrl);
                      }
                      return { ...p, compressedUrl: null, compressedSize: null, status: "idle", error: null };
                    })
                  );
                }}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                Reset Results
              </button>

              <button
                onClick={() => {
                  // remove all
                  images.forEach((im) => {
                    URL.revokeObjectURL(im.url);
                    if (im.compressedUrl) URL.revokeObjectURL(im.compressedUrl);
                  });
                  setImages([]);
                }}
                className="px-3 py-2 bg-red-50 text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4 inline-block" /> Clear All
              </button>

              <button
                onClick={() => downloadAll()}
                disabled={images.length === 0}
                className="ml-auto px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download All
              </button>
            </div>
          </div>
        </section>

        {/* Images grid */}
        <section>
          {images.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center text-sm text-gray-500">No images yet. Drag & drop or click Upload to add images.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((im) => (
                <div key={im.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="relative">
                    <img src={im.compressedUrl ?? im.url} alt={im.file.name} className="w-full h-48 object-contain rounded" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        title="Download"
                        onClick={() => downloadImage(im)}
                        className="p-1 bg-white/80 rounded hover:bg-white"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        title="Remove"
                        onClick={() => removeImage(im.id)}
                        className="p-1 bg-white/80 rounded hover:bg-white"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-500">Name</div>
                      <div className="font-mono">{im.file.name}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-500">Original</div>
                      <div>{formatBytes(im.originalSize)}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-500">Compressed</div>
                      <div>{im.compressedSize ? formatBytes(im.compressedSize) : "—"}</div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => compressImageItem(im)}
                        disabled={im.status === "compressing" || im.status === "done"}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                      >
                        {im.status === "compressing" ? "Compressing…" : im.status === "done" ? "Compressed" : "Compress"}
                      </button>

                      <button
                        onClick={() => {
                          // toggle preview between original and compressed
                          if (!im.compressedUrl) return;
                          setImages((prev) => prev.map((p) => (p.id === im.id ? { ...p, compressedUrl: p.compressedUrl ? p.compressedUrl : null } : p)));
                        }}
                        className="px-3 py-1 bg-gray-100 rounded text-sm"
                      >
                        Preview
                      </button>

                      {im.status === "error" && <div className="text-xs text-red-600">Error: {im.error}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

          <section className="pt-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <ToolCard
                name="Image to PDF Converter"
                href="/tools/image-to-pdf"
                icon={Image}
                description="Convert images into pdfs."
              />
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
            </div>
          </section>

        {/* FAQ */}
        <section className="pt-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Is my image uploaded to a server?",
                a: "No — all compression happens entirely in your browser. Nothing is uploaded to ToolQS servers.",
              },
              {
                q: "Which formats are supported?",
                a: "This tool accepts common image formats (JPEG, PNG, WebP). You can export as WebP, JPEG or PNG depending on browser support.",
              },
              {
                q: "Will quality be preserved?",
                a: "You control quality and max dimensions. WebP at high quality typically gives the best size/quality tradeoff. Try different settings to find what works for you.",
              },
              {
                q: "Can I compress many images at once?",
                a: "Yes — batch upload is supported. Use the Compress All button. For very large batches, your browser CPU/memory limits apply.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-blue-700">
                  {faq.q}
                  <span className="ml-4 text-xl text-gray-500">+</span>
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

async function fileToCompressedBlob(
  file: File,
  opts: {
    quality: number;
    outputFormat: "image/jpeg" | "image/webp" | "image/png";
    maxWidth?: number;
    maxHeight?: number;
    keepAspect?: boolean;
  }
): Promise<Blob> {
  const { quality, outputFormat, maxWidth, maxHeight, keepAspect = true } = opts;

  // load image
  const img = await loadImageFromFile(file);

  let targetW = img.naturalWidth;
  let targetH = img.naturalHeight;

  if (maxWidth || maxHeight) {
    // compute scaled dims
    const mw = maxWidth ?? Infinity;
    const mh = maxHeight ?? Infinity;

    if (keepAspect) {
      const ratio = Math.min(mw / targetW, mh / targetH, 1);
      targetW = Math.round(targetW * ratio);
      targetH = Math.round(targetH * ratio);
    } else {
      targetW = maxWidth ? Math.round(maxWidth) : targetW;
      targetH = maxHeight ? Math.round(maxHeight) : targetH;
    }
  }

  // create canvas and draw
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // draw with smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // toBlob
  const mime = outputFormat;
  const blob: Blob = await new Promise((resolve, reject) => {
    // For PNG, quality is ignored by toBlob; for JPEG/WebP quality is honored
    try {
      canvas.toBlob(
        (b) => {
          if (!b) reject(new Error("Compression produced no output"));
          else resolve(b);
        },
        mime,
        mime === "image/png" ? undefined : quality
      );
    } catch (e) {
      reject(e);
    }
  });

  return blob;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
    // attempt to enable crossOrigin to avoid tainting if possible (not necessary for local files)
    img.crossOrigin = "anonymous";
  });
}

function mimeToExt(mime: string) {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("png")) return "png";
  return "bin";
}

function getFileExtension(name: string) {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1] : null;
}

function stripExtension(name: string) {
  return name.replace(/\.[^/.]+$/, "");
}

/**
 * Small demo image generator — returns a File object (PNG)
 * Helpful for demoing without uploading real images.
 */
async function seedSampleImage(): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d")!;
  // gradient background
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, "#3b82f6");
  g.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // text
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ToolQS Image", canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "28px sans-serif";
  ctx.fillText("Demo compressed image", canvas.width / 2, canvas.height / 2 + 30);

  return await new Promise((resolve) => {
    canvas.toBlob((b) => {
      if (!b) {
        resolve(new File([], "demo.png"));
        return;
      }
      const f = new File([b], `toolqs-demo-${Date.now()}.png`, { type: "image/png" });
      resolve(f);
    }, "image/png");
  });
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
