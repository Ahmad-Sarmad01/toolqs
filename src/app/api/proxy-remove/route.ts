// src/app/api/proxy-remove/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "node"; // ensure Node runtime

const MAX_UPLOAD = Number(process.env.MAX_UPLOAD_SIZE || "31457280"); // default 30MB
const UPSTREAM = process.env.U2NET_SERVER_URL || "";
const UPSTREAM_API_KEY = process.env.U2NET_API_KEY || "";
const UPSTREAM_TIMEOUT_MS = Number(process.env.U2NET_TIMEOUT_MS || "30000"); // 30s

export async function POST(req: NextRequest) {
  try {
    if (!UPSTREAM) {
      return NextResponse.json({ error: "U2NET_SERVER_URL not configured on server." }, { status: 500 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    // Read incoming body as ArrayBuffer
    const buffer = await req.arrayBuffer();
    if (buffer.byteLength > MAX_UPLOAD) {
      return NextResponse.json({ error: "Upload too large" }, { status: 413 });
    }

    // Forward to upstream (U2Net/matting server). Keep the incoming Content-Type header (includes boundary).
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    const upstreamResp = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        "Content-Type": contentType, // keep boundary
        "X-API-Key": UPSTREAM_API_KEY,
      },
      body: Buffer.from(buffer),
      signal: controller.signal,
    }).finally(() => clearTimeout(id));

    // If upstream returns non-OK, try to read text or json and forward message
    if (!upstreamResp.ok) {
      const text = await upstreamResp.text().catch(() => "");
      // Try parse json
      try {
        const json = JSON.parse(text || "");
        return NextResponse.json({ error: "Upstream error", detail: json }, { status: upstreamResp.status });
      } catch {
        return NextResponse.json({ error: "Upstream error", detail: text }, { status: upstreamResp.status });
      }
    }

    // Read upstream bytes and forward them back with correct content-type
    const arr = await upstreamResp.arrayBuffer();
    const ct = upstreamResp.headers.get("content-type") || "application/octet-stream";

    // Note: NextResponse can accept a Buffer
    return new NextResponse(Buffer.from(arr), {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Content-Length": String(arr.byteLength),
        // optionally: cache-control / disposition if you want
      },
    });
  } catch (err: any) {
    console.error("proxy-remove error:", err?.message ?? err);
    // If aborted by timeout
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "Upstream request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Proxy internal error" }, { status: 500 });
  }
}
