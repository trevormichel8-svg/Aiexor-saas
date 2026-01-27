import { env } from "./env";
import { z } from "zod";

const OpenAIImagesResponse = z.object({
  data: z.array(
    z.object({
      b64_json: z.string().optional(),
      url: z.string().optional(),
    })
  ),
});

function arrayBufferToBase64(buf: ArrayBuffer): string {
  // Node.js (most Vercel serverless builds)
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buf).toString("base64");
  }

  // Edge / browser fallback
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  // btoa exists in edge/browser
  return btoa(binary);
}

export async function generateImageBase64(prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_IMAGE_MODEL,
      prompt,
      size: "1024x1024",
      // NOTE: Do NOT send response_format — OpenAI can reject it now.
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${msg.slice(0, 400)}`);
  }

  const json = OpenAIImagesResponse.parse(await res.json());

  // If OpenAI returns base64 directly
  const b64 = json.data[0]?.b64_json;
  if (b64) {
    return `data:image/png;base64,${b64}`;
  }

  // If OpenAI returns a URL, fetch it and convert to base64
  const url = json.data[0]?.url;
  if (url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      const msg = await imgRes.text().catch(() => "");
      throw new Error(`OpenAI image fetch error ${imgRes.status}: ${msg.slice(0, 200)}`);
    }

    const ct = imgRes.headers.get("content-type") || "image/png";
    const buf = await imgRes.arrayBuffer();
    const imgB64 = arrayBufferToBase64(buf);
    return `data:${ct};base64,${imgB64}`;
  }

  throw new Error("OpenAI returned no image data (no b64_json or url)");
}
