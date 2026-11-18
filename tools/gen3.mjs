// Poe image generation via Playwright's Chromium network stack (real Chrome TLS fingerprint,
// which is what Cloudflare error 1010 was blocking for python urllib).
// Usage: node gen3.mjs <outDir> [only-name]
import { request } from "playwright-core";
import fs from "node:fs";

const OUT = process.argv[2] || "/config/answers/figs";
const ONLY = process.argv[3] || null;
fs.mkdirSync(OUT, { recursive: true });

const env = {};
for (const line of fs.readFileSync("/config/.hermes/.env", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  env[t.slice(0, i)] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}
const KEY = env.POE_API_KEY;
if (!KEY) throw new Error("POE_API_KEY missing");

const MODEL = process.env.IMG_MODEL || "nano-banana-2";
const STYLE = "Warm editorial illustration in a muted palette of cream, terracotta and teal, " +
  "soft gouache texture, simple shapes, 16:9. No text, no letters, no numbers anywhere.";
const HER = "an elderly Hong Kong woman, 72, short grey hair, round glasses, light blue blouse";
const HIM = "a thin elderly man, white hair, grey cardigan";
const WORKER = "a young Hong Kong male social worker in a pale yellow shirt";

const SHOTS = [
  ["ai_flat", `${HER} stands in a small tidy public housing flat; ${HIM} sits in an armchair behind her; a low table holds three opened envelopes; towers of public housing fill the window.`],
  ["ai_phone", `Close up of ${HER} on a sofa holding a smartphone, tired expression; the phone screen is a blank pale grey rectangle.`],
  ["ai_centre", `${WORKER} sits behind a wooden desk in a community centre and shows a tablet to ${HER}, who sits opposite; a notice board and a plant behind them.`],
  ["ai_asks", `${HER} taps a tablet on a desk while ${WORKER} points at it; over-the-shoulder view; the tablet screen shows only soft blue blocks.`],
  ["ai_list", `${WORKER} and ${HER} look together at a tablet on the desk; the screen glows soft white with faint green rows.`],
  ["ai_form", `${WORKER} helps ${HER} fill in a paper form at a desk; a pen in hand, a small stack of papers, both look relieved.`],
  ["ai_hero", `${HER} and ${HIM} together in a small public housing flat, warm afternoon light through the window, quiet domestic scene.`],
];

const ctx = await request.newContext({
  extraHTTPHeaders: {
    "Authorization": `Bearer ${KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  },
});

const log = [];
for (const [name, prompt] of SHOTS) {
  if (ONLY && name !== ONLY) continue;
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const r = await ctx.post("https://api.poe.com/v1/chat/completions", {
        data: { model: MODEL, messages: [{ role: "user", content: `${STYLE} ${prompt}` }] },
        timeout: 180000,
      });
      if (!r.ok()) {
        console.log(`${name} HTTP ${r.status()} ${(await r.text()).slice(0, 160)}`);
        await new Promise((res) => setTimeout(res, 15000 * attempt));
        continue;
      }
      const j = await r.json();
      const txt = j?.choices?.[0]?.message?.content ?? "";
      const url = (txt.match(/https:\/\/[^\s)"']+/) || [])[0];
      if (!url) { console.log(`${name} no url: ${txt.slice(0, 120)}`); continue; }
      console.log(name, "URL", url.slice(0, 120));
      const clean = await request.newContext({ extraHTTPHeaders: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" } });
      let img = await clean.get(url, { timeout: 120000 });
      if (!img.ok()) { console.log(name, "clean HTTP", img.status()); img = await ctx.get(url, { timeout: 120000 }); }
      if (!img.ok()) { await clean.dispose(); console.log(`${name} image HTTP ${img.status()}`); continue; }
      const buf = await img.body();
      await clean.dispose();
      fs.writeFileSync(`${OUT}/${name}.png`, buf);
      console.log(`${name} ok ${buf.length}`);
      log.push({ name, ok: true, bytes: buf.length });
      ok = true;
    } catch (e) {
      console.log(`${name} ERR ${e.constructor.name} ${String(e.message).slice(0, 120)}`);
      await new Promise((res) => setTimeout(res, 8000));
    }
  }
  if (!ok) log.push({ name, ok: false });
  fs.writeFileSync("/config/answers/figs/_gen_log.json", JSON.stringify(log, null, 1));
  await new Promise((res) => setTimeout(res, 6000));
}
await ctx.dispose();
console.log("done", JSON.stringify(log));
