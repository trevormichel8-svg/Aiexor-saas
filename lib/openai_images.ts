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
  if (typeof Buffer !== "undefined") return Buffer.from(buf).toString("base64");

  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  // eslint-disable-next-line no-undef
  return btoa(binary);
}

async function requestOpenAI(body: Record<string, unknown>) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as any)?.error?.message ?? (json as any)?.message ?? (await res.text().catch(() => ""));
    const err = new Error(String(msg).slice(0, 400)) as Error & { param?: string; status?: number };
    err.param = (json as any)?.error?.param;
    err.status = res.status;
    throw err;
  }

  return OpenAIImagesResponse.parse(json);
}

/**
 * Generate an image and return a data URL (base64).
 * This is compatible with both older endpoints that accept `response_format`
 * and newer ones that reject it (we retry without).
 */
export async function generateImageBase64(prompt: string): Promise<string> {
  const baseBody: Record<string, unknown> = {
    model: env.OPENAI_IMAGE_MODEL,
    prompt,
    size: "1024x1024",
  };

  try {
    const json = await requestOpenAI({ ...baseBody, response_format: "b64_json" });
    const b64 = json.data[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    const url = json.data[0]?.url;
    if (url) {
      const imgRes = await fetch(url);
      const ct = imgRes.headers.get("content-type") || "image/png";
      const buf = await imgRes.arrayBuffer();
      return `data:${ct};base64,${arrayBufferToBase64(buf)}`;
    }
    throw new Error("OpenAI returned no image data");
  } catch (e: any) {
    const msg = String(e?.message ?? "").toLowerCase();
    const isResponseFormatIssue = e?.param === "response_format" || (msg.includes("unknown parameter") && msg.includes("response_format"));
    if (!isResponseFormatIssue) throw e;

    const json = await requestOpenAI(baseBody);
    const b64 = json.data[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    const url = json.data[0]?.url;
    if (url) {
      const imgRes = await fetch(url);
      const ct = imgRes.headers.get("content-type") || "image/png";
      const buf = await imgRes.arrayBuffer();
      return `data:${ct};base64,${arrayBufferToBase64(buf)}`;
    }
    throw new Error("OpenAI returned no image data");
  }
}
