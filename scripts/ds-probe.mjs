import "dotenv/config";
import OpenAI from "openai";

const c = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});
console.log("[ds] base=" + process.env.OPENAI_BASE_URL + " model=" + process.env.OPENAI_MODEL);
const t0 = Date.now();
try {
  const r = await c.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [{ role: "user", content: 'Say hello strictly as JSON object {"hello":"world"}' }],
    response_format: { type: "json_object" },
    max_tokens: 64,
  });
  console.log(
    "[ds] ok in",
    Math.round((Date.now() - t0) / 1000),
    "s ::",
    r.choices[0]?.message?.content?.slice(0, 200),
  );
} catch (e) {
  console.log(
    "[ds] err in",
    Math.round((Date.now() - t0) / 1000),
    "s ::",
    e.status,
    e.message,
  );
}
