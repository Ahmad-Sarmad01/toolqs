"use client";

import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, Download, Settings, ImageIcon } from "lucide-react";
import ExploreCTA from "@/components/ExploreCTA";

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Image Background Remover - ToolQS",
  url: "https://toolqs.com/tools/image-background-remover",
  description:
    "Remove backgrounds from images instantly in your browser. Free client-side mode for people (private, no upload), optional API mode for general objects and higher quality.",
  publisher: {
    "@type": "Organization",
    name: "ToolQS",
    url: "https://toolqs.com",
    logo: { "@type": "ImageObject", url: "https://toolqs.com/logo.png" },
  },
};

export default function ImageBgRemoverPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resultAvailable, setResultAvailable] = useState(false);
  const [mode, setMode] = useState<"auto" | "api">("auto");
  const [apiKey, setApiKey] = useState<string>("");
  const [segmentationThreshold, setSegmentationThreshold] = useState<number>(0.7);
  const [internalResolution, setInternalResolution] = useState<number>(0.5);
  const [bgColor, setBgColor] = useState<string>("#00000000"); // trailing 00 means transparent
  const [lastFileName, setLastFileName] = useState<string>("image");

  // cleanup on unmount: revoke any object URLs
  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]);

  // load image from file input, revoke previous url if any
  const handleFile = useCallback(
    (file?: File | null) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setLastFileName(file.name.replace(/\.[^/.]+$/, ""));
      setResultAvailable(false);
      // revoke previous
      setSourceUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    },
    []
  );

  const onChooseFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    handleFile(f ?? null);
  }, [handleFile]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const clear = useCallback(() => {
    setStatus(null);
    setResultAvailable(false);
    setProcessing(false);
    setSourceUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    // clear canvas
    const c = canvasRef.current;
    if (c) {
      c.width = 0;
      c.height = 0;
    }
  }, []);

  // CLIENT-side BodyPix (people segmentation)
  async function removeBgClientSide() {
    if (!imgRef.current || !canvasRef.current) {
      setStatus("No image loaded");
      return;
    }
    setProcessing(true);
    setStatus("Loading model...");
    try {
      const tf = await import("@tensorflow/tfjs");
      try {
        await tf.setBackend("webgl");
      } catch {}
      const bodyPix = await import("@tensorflow-models/body-pix");

      setStatus("Loading segmentation model (this may take a few seconds)...");
      const model = await bodyPix.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      });

      setStatus("Segmenting person...");
      const input = imgRef.current;
      const segmentation = await model.segmentPerson(input, {
        internalResolution: internalResolution === 1 ? "full" : internalResolution === 0.5 ? "medium" : "low",
        segmentationThreshold,
        maxDetections: 1,
        scoreThreshold: 0.3,
        nmsRadius: 20,
      });

      setStatus("Compositing image...");

      const canvas = canvasRef.current!;
      canvas.width = input.naturalWidth;
      canvas.height = input.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!bgColor || bgColor === "transparent" || bgColor.endsWith("00")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const mask = bodyPix.toMask(segmentation);

      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const offCtx = off.getContext("2d")!;
      offCtx.putImageData(mask, 0, 0);

      const tmp = document.createElement("canvas");
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      const tmpCtx = tmp.getContext("2d")!;
      tmpCtx.drawImage(input, 0, 0, canvas.width, canvas.height);

      ctx.drawImage(tmp, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(off, 0, 0);
      ctx.restore();

      setResultAvailable(true);
      setStatus("Done — background removed (client)");
    } catch (err: any) {
      console.error("Client-side removal failed:", err);
      setStatus("Client-side removal failed. See console. Try API mode for objects.");
    } finally {
      setProcessing(false);
    }
  }

  // API mode via our Next.js proxy (/api/proxy-remove)
  async function removeBgApiMode() {
    if (!sourceUrl) {
      setStatus("Load an image first");
      return;
    }
    setProcessing(true);
    setStatus("Preparing image...");

    try {
      const resp = await fetch(sourceUrl);
      if (!resp.ok) throw new Error("Could not fetch uploaded image");
      const blob = await resp.blob();

      const form = new FormData();
      form.append("file", blob, `${lastFileName}.png`);
      if (bgColor && !bgColor.endsWith("00")) form.append("bg_color", (bgColor || "#ffffff").slice(0, 7));

      setStatus("Uploading to server (proxy)...");
      const apiResp = await fetch("/api/proxy-remove", { method: "POST", body: form });

      if (!apiResp.ok) {
        // try to read JSON error body (proxy returns structured JSON on error)
        const txt = await apiResp.text().catch(() => "");
        try {
          const parsed = JSON.parse(txt);
          setStatus(`Server error: ${parsed.error || "Unknown"}`);
        } catch {
          setStatus(`Server error: ${apiResp.status} — ${txt}`);
        }
        setProcessing(false);
        return;
      }

      const ct = apiResp.headers.get("content-type") || "";
      const blobResult = await apiResp.blob();

      // If upstream returned JSON by mistake, show it as error
      if (ct.includes("application/json")) {
        const txt = await (new Response(blobResult).text().catch(() => ""));
        try {
          const j = JSON.parse(txt);
          setStatus("Server returned error: " + (j.error ?? txt));
        } catch {
          setStatus("Server returned unexpected response.");
        }
        setProcessing(false);
        return;
      }

      const url = URL.createObjectURL(blobResult);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        setResultAvailable(true);
        setStatus("Done — background removed (server)");
        setProcessing(false);
      };
      img.onerror = (e) => {
        console.error("Failed to load processed image", e);
        setStatus("Failed to load processed image");
        setProcessing(false);
      };
      img.src = url;
    } catch (err: any) {
      console.error("API removal error", err);
      setStatus("API removal failed — see console.");
      setProcessing(false);
    }
  }

  async function handleRemove() {
    setStatus(null);
    setResultAvailable(false);
    if (!sourceUrl) {
      setStatus("Load an image first");
      return;
    }
    if (mode === "auto") {
      await removeBgClientSide();
    } else {
      await removeBgApiMode();
    }
  }

  function downloadResult(asPng = true) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const filename = `${lastFileName}-${asPng ? "transparent" : "bg"}.${asPng ? "png" : "jpg"}`;
    if (asPng) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }, "image/png");
    } else {
      const bg = bgColor && !bgColor.endsWith("00") ? bgColor : "#ffffff";
      const tmp = document.createElement("canvas");
      const imgCanvas = canvas;
      tmp.width = imgCanvas.width;
      tmp.height = imgCanvas.height;
      const ctx = tmp.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(imgCanvas, 0, 0);
      tmp.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }, "image/jpeg", 0.92);
    }
  }

  return (
    <>
      <Head>
        <title>Image Background Remover — ToolQS</title>
        <meta
          name="description"
          content="Remove image backgrounds quickly in your browser. Free client-side removal for people (private) and optional API mode for general object removal. Download transparent PNGs."
        />
        <link rel="canonical" href="https://toolqs.com/tools/image-background-remover" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      </Head>

      <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-700">Image Background Remover</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Remove backgrounds instantly. Client-side mode (private) for people/portraits. Use API mode for general objects and higher quality.
          </p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 transition"
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onChooseFile} className="hidden" />
                {!sourceUrl ? (
                  <div>
                    <Upload className="mx-auto w-8 h-8 text-gray-400" />
                    <div className="text-gray-700 font-semibold mt-2">Click or drop an image here</div>
                    <div className="text-sm text-gray-500 mt-1">JPEG, PNG, WebP. Max recommended size: 10MB.</div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <img
                      ref={imgRef}
                      src={sourceUrl}
                      alt="uploaded preview"
                      className="max-h-64 object-contain rounded-md border"
                      onLoad={() => {
                        const c = canvasRef.current;
                        if (c) {
                          c.width = 0;
                          c.height = 0;
                          setResultAvailable(false);
                        }
                      }}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{lastFileName}</div>
                      <div className="text-sm text-gray-500 mt-1">Preview — ready to remove background</div>
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-2 bg-red-50 text-red-600 rounded" onClick={clear}>
                          <Trash2 className="inline-block w-4 h-4 mr-2" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={mode === "auto"} onChange={() => setMode("auto")} />{" "}
                  <span className="ml-1">Client-side (free, private) — best for people</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={mode === "api"} onChange={() => setMode("api")} />{" "}
                  <span className="ml-1">API (recommended for objects) — uses server proxy</span>
                </label>
              </div>

              {mode === "api" && (
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-700">
                    API mode uploads the image to the server you configured (U2Net). This site uses a secure server proxy so your API key (server) stays hidden.
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    If you want to call a 3rd-party provider directly (client-side), you may paste a provider key below — but this will expose the key in your browser (not recommended).
                  </div>
                  <input
                    className="w-full p-2 mt-2 border rounded"
                    placeholder="(Optional) External provider API Key — only for direct calls"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Segmentation threshold</label>
                  <input
                    type="range"
                    min={0.4}
                    max={0.95}
                    step={0.01}
                    value={segmentationThreshold}
                    onChange={(e) => setSegmentationThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">Higher value = stricter (less background noise)</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Internal resolution</label>
                  <select value={internalResolution} onChange={(e) => setInternalResolution(Number(e.target.value))} className="w-full p-2 border rounded">
                    <option value={0.25}>Low (fast)</option>
                    <option value={0.5}>Medium (balanced)</option>
                    <option value={1}>Full (slow / high quality)</option>
                  </select>
                  <div className="text-xs text-gray-500">Bigger = higher quality, slower.</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Background</label>
                  <input type="color" value={bgColor && bgColor.length >= 7 ? bgColor.slice(0, 7) : "#ffffff"} onChange={(e) => setBgColor(e.target.value + (bgColor.endsWith("00") ? "00" : ""))} className="w-full h-10 p-0 border rounded" />
                  <div className="text-xs text-gray-500">Choose a background color (or keep transparent).</div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleRemove} disabled={!sourceUrl || processing} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                  <Settings className="w-4 h-4" /> {processing ? "Working..." : "Remove Background"}
                </button>

                <button
                  onClick={() => {
                    if (!sourceUrl) return;
                    const a = document.createElement("a");
                    a.href = sourceUrl;
                    a.download = lastFileName;
                    a.click();
                    a.remove();
                  }}
                  className="px-4 py-2 bg-gray-100 rounded flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Original
                </button>
              </div>

              {status && <div className="mt-3 text-sm text-gray-600">{status}</div>}
            </div>

            <aside className="space-y-4">
              <div className="bg-gray-50 p-3 rounded text-center">
                <div className="text-sm text-gray-600">Result preview</div>
                <div className="mt-2 border rounded overflow-hidden">
                  <canvas ref={canvasRef} className="w-full" />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <button onClick={() => downloadResult(true)} disabled={!resultAvailable} className="px-3 py-2 bg-green-600 text-white rounded flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download PNG (transparent)
                  </button>
                  <button onClick={() => downloadResult(false)} disabled={!resultAvailable} className="px-3 py-2 bg-yellow-50 text-gray-800 rounded border flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Download JPG (with background)
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">PNG keeps transparency (recommended). JPG flattens with chosen background color.</div>
              </div>

              <div className="bg-white p-3 rounded shadow-sm text-sm text-gray-600">
                <div className="font-semibold mb-2">Tips for best results</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Client-side mode works best for clear portraits with a single person.</li>
                  <li>For products or complex backgrounds use API mode (remove.bg / server-side U-2-Net).</li>
                  <li>Use medium/internal resolution for speed; use full for best edges.</li>
                  <li>Remove or inline third-party images to avoid CORS issues.</li>
                </ul>
              </div>

              <div className="bg-white p-3 rounded shadow-sm text-xs text-gray-500">
                <div className="font-semibold">Privacy</div>
                <div>Client-side mode runs entirely in your browser — images are not uploaded. API mode uploads to the external provider you choose (or your own matting server via the proxy).</div>
              </div>
            </aside>
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Frequently Asked Questions</h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "How does client-side removal work?",
                a: "We run a segmentation model in your browser (TensorFlow.js BodyPix) to detect human subjects and remove the background. No upload required.",
              },
              {
                q: "Can I remove backgrounds from product photos?",
                a: "For many product images, a server-side matting model (U-2-Net / remove.bg) produces better results. You can use API mode with a provider that supports general object removal.",
              },
              {
                q: "Is my image uploaded?",
                a: "Not in client-side mode — everything runs locally. API mode will upload the image to the chosen provider (or your own server via the proxy).",
              },
              {
                q: "What formats can I download?",
                a: "Download a transparent PNG (recommended) or a flattened JPG with a background color of your choice.",
              },
              {
                q: "Why didn't it remove my background perfectly?",
                a: "Results depend on the model and photo. Try adjusting threshold/resolution or use API mode for better matting.",
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

        <ExploreCTA />
      </div>
    </>
  );
}
