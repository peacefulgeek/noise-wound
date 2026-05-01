import "dotenv/config";
import OpenAI from "openai";

const c = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  timeout: 180_000, // 3-minute hard timeout per request
  maxRetries: 0,
});

const t0 = Date.now();
console.log(
  "[ds-real] start  model=" + process.env.OPENAI_MODEL + " base=" + process.env.OPENAI_BASE_URL,
);
try {
  const resp = await c.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You write JSON only. Schema: {\"title\":string, \"bodyHtml\":string, \"wordCount\":number}.",
      },
      {
        role: "user",
        content:
          "Write a 1500-word HTML article about why misophonia is dismissed as 'just being annoyed'. Body in <p> tags. Output strictly the JSON object.",
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.85,
    max_tokens: 16000,
  });
  const t1 = Date.now();
  const content = resp.choices[0]?.message?.content || "";
  console.log("[ds-real] done in", Math.round((t1 - t0) / 1000), "s");
  console.log("[ds-real] usage:", JSON.stringify(resp.usage));
  console.log("[ds-real] content length:", content.length);
  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.log("[ds-real] JSON.parse error:", e.message);
    console.log("[ds-real] head:", content.slice(0, 400));
    console.log("[ds-real] tail:", content.slice(-400));
  }
  if (parsed) {
    console.log("[ds-real] title:", parsed.title?.slice(0, 80));
    console.log("[ds-real] wordCount field:", parsed.wordCount);
    console.log(
      "[ds-real] body words actually:",
      (parsed.bodyHtml || "").split(/\s+/).filter(Boolean).length,
    );
  }
} catch (e) {
  console.log(
    "[ds-real] err in",
    Math.round((Date.now() - t0) / 1000),
    "s ::",
    e.status || "",
    e.message,
  );
}
process.exit(0);
