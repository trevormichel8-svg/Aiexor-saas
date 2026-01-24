import { JWT } from "google-auth-library";
import { env } from "./env";

type VertexParams = {
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  sampleCount?: number;
  negativePrompt?: string;
  personGeneration?: "allow_all" | "allow_adult" | "allow_none";
};

function parseServiceAccountJson(raw: string): { client_email: string; private_key: string } {
  const trimmed = raw.trim();
  const decoded =
    trimmed.startsWith("{") ? trimmed : Buffer.from(trimmed, "base64").toString("utf8");

  const json = JSON.parse(decoded) as { client_email?: string; private_key?: string };
  if (!json.client_email || !json.private_key) {
    throw new Error("Vertex credentials JSON must include client_email and private_key");
  }
  return { client_email: json.client_email, private_key: json.private_key };
}

async function getAccessToken(): Promise<string> {
  if (!env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON for Vertex AI");
  }
  const { client_email, private_key } = parseServiceAccountJson(env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

  const client = new JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const { access_token } = await client.authorize();
  if (!access_token) throw new Error("Failed to obtain Google access token");
  return access_token;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export async function generateVertexImagesBase64(
  prompt: string,
  params: VertexParams = {}
): Promise<string[]> {
  if (!env.VERTEX_PROJECT_ID) throw new Error("Missing VERTEX_PROJECT_ID for Vertex AI");

  const location = env.VERTEX_LOCATION;
  const model = env.VERTEX_IMAGEN_MODEL;

  const token = await getAccessToken();

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${env.VERTEX_PROJECT_ID}/locations/${location}/publishers/google/models/${model}:predict`;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: clampInt(params.sampleCount ?? 1, 1, 4),
      aspectRatio: params.aspectRatio ?? "1:1",
      negativePrompt: params.negativePrompt,
      // Avoid allowlist errors by default:
      personGeneration: params.personGeneration ?? "allow_none",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Vertex error ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = JSON.parse(text) as any;

  const preds: any[] = Array.isArray(json?.predictions) ? json.predictions : [];
  const images: string[] = [];

  for (const p of preds) {
    const b64 =
      p?.bytesBase64Encoded ??
      p?.image?.bytesBase64Encoded ??
      p?.imageBytesBase64Encoded ??
      null;

    if (typeof b64 === "string" && b64.length > 0) {
      images.push(`data:image/png;base64,${b64}`);
    }
  }

  if (images.length === 0) {
    throw new Error("Vertex returned no image data (predictions empty or filtered)");
  }

  return images;
}
