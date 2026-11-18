// Print the worksheet preview HTML to A4 PDF and page PNGs using Chromium.
import { chromium } from "playwright-core";

const url = "file:///config/answers/worksheet_preview3.html";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.pdf({ path: "/config/answers/VCP3202_Worksheet_v3.pdf", format: "A4", printBackground: true,
  margin: { top: "16mm", bottom: "14mm", left: "15mm", right: "15mm" } });
await browser.close();

// rasterise each PDF page with pdftoppm if available
import { execSync } from "node:child_process";
try {
  execSync("pdftoppm -r 110 -png /config/answers/VCP3202_Worksheet_v3.pdf /config/answers/v3-page", { stdio: "inherit" });
} catch { console.log("pdftoppm unavailable"); }
console.log("pdf written");
