import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

type ProviderId = "openai" | "vertex";

type ModelId =
  | "dall-e-2"
  | "dall-e-3"
  | "gpt-image-1.5"
  | "imagen-4.0-fast-generate-001"
  | "imagen-4.0-generate-001"
  | "imagen-4.0-ultra-generate-001"
  | "imagen-3.0-generate-002"
  | "imagen-3.0-fast-generate-001";

type RequestBody = {
  prompt: string;
  provider: ProviderId;
  model: ModelId;
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:3" | "3:4";
};

function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

function serverError(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 500 });
}

async function openaiGenerateImage(input: RequestBody) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const n = Math.min(Math.max(input.n ?? 1, 1), 4);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      n,
      size: input.size ?? "1024x1024",
      response_format: "b64_json",
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `OpenAI error (${res.status}): ${JSON.stringify(json ?? { message: "no body" })}`
    );
  }

  const data = Array.isArray(json?.data) ? json.data : [];
  const images = data
    .map((d: any) => (typeof d?.b64_json === "string" ? d.b64_json : null))
    .filter(Boolean)
    .map((b64: string) => ({ b64 }));

  return { provider: "openai" as const, model: input.model, images };
}

async function vertexGenerateImage(input: RequestBody) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
  const location = process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  if (!projectId) throw new Error("Missing GOOGLE_CLOUD_PROJECT (or GCP_PROJECT)");
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLIENT_EMAIL) {
    // Vercel commonly uses env-based service account; local uses GOOGLE_APPLICATION_CREDENTIALS path.
    // If you're using a JSON key file, set GOOGLE_APPLICATION_CREDENTIALS.
  }

  // OAuth token for Vertex
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token?.token) throw new Error("Failed to obtain Google access token");

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${input.model}:predict`;

  const n = Math.min(Math.max(input.n ?? 1, 1), 4);

  // Imagen predict format (text-to-image)
  const body = {
    instances: [{ prompt: input.prompt }],
    parameters: {
      sampleCount: n,
      // If you want to wire these up later:
      // aspectRatio: input.aspectRatio ?? "1:1",
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `Vertex error (${res.status}): ${JSON.stringify(json ?? { message: "no body" })}`
    );
  }

  // Vertex returns predictions with bytesBase64Encoded
  const preds = Array.isArray(json?.predictions) ? json.predictions : [];
  const images = preds
    .map((p: any) => {
      const b64 =
        typeof p?.bytesBase64Encoded === "string"
          ? p.bytesBase64Encoded
          : typeof p?.image?.bytesBase64Encoded === "string"
          ? p.image.bytesBase64Encoded
          : null;
      return b64 ? { b64 } : null;
    })
    .filter(Boolean) as { b64: string }[];

  return { provider: "vertex" as const, model: input.model, images };
}

export async function POST(req: Request) {
  let body: RequestBody | null = null;

  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body?.prompt || typeof body.prompt !== "string") return badRequest("Missing 'prompt'");
  if (!body?.provider || (body.provider !== "openai" && body.provider !== "vertex"))
    return badRequest("Invalid 'provider'");
  if (!body?.model || typeof body.model !== "string") return badRequest("Missing 'model'");

  try {
    if (body.provider === "openai") {
      const out = await openaiGenerateImage(body);
      return NextResponse.json(out);
    }

    const out = await vertexGenerateImage(body);
    return NextResponse.json(out);
  } catch (err: any) {
    return serverError("Image generation failed", { message: err?.message ?? String(err) });
  }
}
