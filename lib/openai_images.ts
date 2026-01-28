import { env } from "./env";
import { z } from "zod";

export type OpenAIImageOptions = {
  /** For GPT Image models: 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait), or auto. */
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  /** For GPT Image models: auto | high | medium | low */
  quality?: "auto" | "high" | "medium" | "low";
  /** Output format for GPT Image models. */
  output_format?: "png" | "jpeg" | "webp";
};

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
 *
 * Note: `response_format` is not supported for GPT Image models (they always return base64),
 * but we keep a small compatibility retry for older DALL·E flows.
 */
export async function generateImageBase64(prompt: string, opts: OpenAIImageOptions = {}): Promise<string> {
  const model = env.OPENAI_IMAGE_MODEL;

  const baseBody: Record<string, unknown> = {
    model,
    prompt,
    size: opts.size ?? "1024x1024",
    quality: opts.quality ?? "auto",
    output_format: opts.output_format ?? "png",
  };

  const isGptImage = String(model).startsWith("gpt-image");

  try {
    const json = isGptImage
      ? await requestOpenAI(baseBody)
      : await requestOpenAI({ ...baseBody, response_format: "b64_json" });

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
    // Compatibility fallback: if response_format is rejected, retry without.
    const msg = String(e?.message ?? "").toLowerCase();
    const isResponseFormatIssue =
      e?.param === "response_format" || (msg.includes("unknown parameter") && msg.includes("response_format"));
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
