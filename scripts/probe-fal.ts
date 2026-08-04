import "dotenv/config";
import { fal } from "@fal-ai/client";

async function main() {
  const key = (process.env.FAL_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!key || !key.includes(":")) {
    console.log(JSON.stringify({ ok: false, reason: "missing_or_bad_format" }));
    process.exit(1);
  }
  fal.config({ credentials: key });
  try {
    // Probe mínimo: upload de 1x1 jpeg
    const tiny = Buffer.from(
      "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z",
      "base64",
    );
    const url = await fal.storage.upload(
      new File([tiny], "probe.jpg", { type: "image/jpeg" }),
    );
    console.log(JSON.stringify({ ok: true, uploaded: Boolean(url) }));
  } catch (err) {
    const e = err as Error & { status?: number };
    console.log(
      JSON.stringify({
        ok: false,
        status: e.status ?? null,
        message: e.message,
        name: e.name,
      }),
    );
    process.exit(1);
  }
}

main();
