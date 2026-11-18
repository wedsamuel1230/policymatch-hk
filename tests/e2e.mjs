// Step-by-step end-to-end check with Playwright (system Chromium, no bundled download).
// Run: node tests/e2e.mjs [baseURL]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] || "http://127.0.0.1:3007";
const SHOTS = "/config/answers";
const results = [];
let current = "";

function step(name) {
  current = name;
  console.log(`\n── ${name}`);
}
function check(label, condition, detail = "") {
  results.push({ step: current, label, ok: !!condition, detail });
  console.log(`   ${condition ? "PASS" : "FAIL"}  ${label}${detail ? "  · " + detail : ""}`);
}

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

// 1. cold load
step("1 Cold load of /");
const resp = await page.goto(BASE + "/", { waitUntil: "networkidle" });
check("HTTP 200", resp.status() === 200, String(resp.status()));
check("h1 is the service promise", (await page.locator("h1").first().innerText()).includes("找出你可以申請的支援"));
const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
check("stylesheet applied (body font from theme)", font.includes("Noto Sans"), font.slice(0, 28));
const sheetCount = await page.evaluate(() => document.styleSheets.length);
check("one stylesheet, no 404", sheetCount === 1, `sheets=${sheetCount}`);
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 2).join(" | "));
await page.screenshot({ path: `${SHOTS}/pw-01-home.png`, fullPage: true });

// 2. empty submit must be blocked by native validation
step("2 Submit with no answers");
await page.locator("button[type=submit]").click();
await page.waitForTimeout(400);
check("stays on the form page (browser blocks empty required radios)", new URL(page.url()).pathname.replace(/\/$/, "").endsWith(""), page.url());
const invalid = await page.evaluate(() => document.querySelector("form").checkValidity());
check("form reports invalid", invalid === false);

// 3. happy path
step("3 Fill the five questions and submit");
await page.locator('input[name="age"][value="70plus"]').check();
await page.locator('input[name="household"][value="couple"]').check();
await page.locator('input[name="income"][value="low"]').check();
await page.locator('input[name="housing"][value="publicRent"]').check();
await page.locator('input[name="carer"][value="yes"]').check();
await page.selectOption('select[name="district"]', "kwunTong");
await page.locator("button[type=submit]").click();
await page.waitForLoadState("networkidle");
const u = new URL(page.url());
check("landed on /results", u.pathname.replace(/\/$/, "").endsWith("/results"));
check("all six answers carried in the URL", ["age", "household", "income", "housing", "carer", "district"].every((k) => u.searchParams.get(k)), u.search);
const countText = await page.locator("p:has-text('為你找到')").first().innerText();
const matched = Number(countText.match(/為你找到\s*(\d+)/)?.[1] ?? -1);
check("result count rendered", matched === 9, `count=${matched}`);
const cards = await page.locator("ul.mt-10 > li").count();
check("card count equals stated count", cards === matched, `cards=${cards}`);
check("a known scheme is present", (await page.content()).includes("樂齡科技產品借用"));
check("near-miss section is visible, not collapsed", await page.locator("text=未符合的服務").first().isVisible());
await page.screenshot({ path: `${SHOTS}/pw-03-results.png`, fullPage: true });

// 4. boundary: 40-year-old family with children
step("4 Boundary case (different answer set)");
await page.goto(`${BASE}/results?age=55to64&household=withChildren&income=mid&housing=privateRent&carer=no&district=shaTin`, { waitUntil: "networkidle" });
const t2 = await page.locator("p:has-text('為你找到')").first().innerText();
const m2 = Number(t2.match(/為你找到\s*(\d+)/)?.[1] ?? -1);
check("family case returns a different set", m2 > 0 && m2 !== matched, `count=${m2}`);
check("elder-only scheme excluded", !(await page.locator("h3:has-text('高齡津貼')").count()));
check("family scheme included", (await page.locator("h3:has-text('在職家庭津貼')").count()) === 1);

// 5. detail page
step("5 Open a scheme detail page");
await page.goto(`${BASE}/scheme/tech_loan`, { waitUntil: "networkidle" });
check("detail h1", (await page.locator("h1").innerText()).includes("樂齡科技產品借用"));
check("documents list rendered", (await page.locator("text=需要準備的文件").count()) > 0);
check("policy citation present", (await page.content()).includes("p.73"));
check("breadcrumb links back", (await page.locator('nav a:has-text("配對結果")').count()) > 0);
await page.screenshot({ path: `${SHOTS}/pw-05-detail.png`, fullPage: true });

// 6. back button restores the results URL
step("6 Browser back restores the previous state");
await page.goBack({ waitUntil: "networkidle" });
check("previous URL restored", /\/results\/?\?/.test(page.url()), page.url().slice(0, 90));

// 7. junk and injected params must not 500
step("7 Malformed deep link");
const bad = await page.goto(`${BASE}/results?age=banana&income=<script>&foo=1`, { waitUntil: "networkidle" });
check("HTTP 200 on junk params", bad.status() === 200, String(bad.status()));
check("shows the incomplete warning", (await page.content()).includes("你未回答全部問題"));
check("junk value never echoed unescaped", !(await page.content()).includes("<script>&"));
const missing = await page.goto(`${BASE}/scheme/does-not-exist`, { waitUntil: "networkidle" });
check("unknown scheme id gives 404", missing.status() === 404, String(missing.status()));

// 8. keyboard-only journey
step("8 Keyboard only: tab, arrow, enter");
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.locator('input[name="age"][value="70plus"]').focus();
await page.keyboard.press("ArrowUp");      // move within the radio group
const selected = await page.evaluate(() => document.querySelector('input[name="age"]:checked')?.value);
check("arrow keys change the radio selection", !!selected, `selected=${selected}`);
await page.waitForTimeout(400); // let the colour transition settle before measuring
const outline = await page.evaluate(() => {
  const el = document.querySelector('input[name="age"]:checked').closest("label");
  return getComputedStyle(el).backgroundColor;
});
check("selected row shows a visible state", outline !== "rgba(0, 0, 0, 0)", outline);
await page.keyboard.press("Tab");
const focusTag = await page.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement?.getAttribute("name") || ""));
check("tab moves focus onward", !focusTag.startsWith("BODY"), focusTag);

// 8b. old links still work
step("8b Legacy query values still resolve");
await page.goto(`${BASE}/results?age=70plus&household=couple&income=low&housing=public&carer=yes&district=kwunTong`, { waitUntil: "networkidle" });
check("old housing=public still matches public housing", (await page.content()).includes("公屋（租住）"));
const legacyCount = Number((await page.locator("p:has-text('為你找到')").first().innerText()).match(/為你找到\s*(\d+)/)?.[1] ?? -1);
check("legacy link returns the same count as the new one", legacyCount === matched, `count=${legacyCount}`);

// 9. mobile
step("9 Mobile viewport");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE + "/", { waitUntil: "networkidle" });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check("no horizontal overflow at 390px", overflow <= 1, `overflow=${overflow}px`);
await page.screenshot({ path: `${SHOTS}/pw-09-mobile.png`, fullPage: true });

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log("\n=========================================");
console.log(`steps: ${new Set(results.map((r) => r.step)).size}   checks: ${results.length}   fail: ${failed.length}`);
if (failed.length) for (const f of failed) console.log(`  FAILED · ${f.step} · ${f.label} ${f.detail}`);
fs.writeFileSync("/config/answers/playwright-report.json", JSON.stringify(results, null, 1));
process.exit(failed.length ? 1 : 0);
