import assert from "node:assert/strict";
import test from "node:test";
import { buildPassages, createIndex, tokenize } from "../lib/rag-core.ts";

// A small fixture: the real dataset is bound in lib/rag.ts, which needs the
// bundler. The retrieval maths and the "not found" rule are what these cover.
const fixture = [
  { id: "health_voucher", zh: "長者醫療券", en: "Elderly Health Care Voucher", dept: "醫務衞生局",
    summary: "資助長者使用私營基層醫療服務。", benefit: "每年定額資助。", documents: ["香港身份證"],
    apply: "直接向服務提供者使用。", citation: { label: "施政報告2026 附篇 第7章，p.73", ref: "p.73" }, rules: {} },
  { id: "oaa", zh: "高齡津貼（生果金）", en: "Old Age Allowance", dept: "社會福利署",
    summary: "為七十歲或以上長者提供每月津貼。", benefit: "每月現金津貼。", documents: ["香港身份證"],
    apply: "向社會福利署申請。", citation: { label: "部門須知", ref: "部門須知" }, rules: {} },
  { id: "wfa", zh: "在職家庭津貼", en: "Working Family Allowance", dept: "在職家庭及學生資助事務處",
    summary: "為低收入在職家庭提供津貼。", benefit: "按工時及入息發放。", documents: ["入息證明", "工時證明"],
    apply: "郵寄或網上申請。", citation: { label: "施政報告2026 附篇 第7章，p.71", ref: "p.71" }, rules: {} },
] as const;

const passages = buildPassages(fixture as never);
const search = createIndex(passages);

test("tokenizer keeps latin words and cuts CJK into pairs", () => {
  const t = tokenize("長者醫療券 Health");
  assert.ok(t.includes("health"));
  assert.ok(t.includes("醫療"));
  assert.ok(t.includes("療券"));
});

test("every passage carries a source reference", () => {
  for (const p of passages) {
    assert.ok(p.ref.length > 0, `${p.id} has no ref`);
    assert.ok(p.source.length > 0, `${p.id} has no source label`);
  }
});

test("a scheme name finds that scheme first", () => {
  const hits = search("長者醫療券");
  assert.ok(hits.length > 0);
  assert.equal(hits[0].schemeId, "health_voucher");
});

test("a colloquial name still finds the scheme", () => {
  const hits = search("生果金");
  assert.ok(hits.length > 0);
  assert.equal(hits[0].schemeId, "oaa");
});

test("documents query surfaces the documents passage", () => {
  const hits = search("在職家庭津貼 需要什麼文件");
  assert.ok(hits.some((h) => h.kind === "所需文件" || h.kind === "簡介"));
});

test("nonsense returns nothing rather than a near miss", () => {
  assert.deepEqual(search("zzz qqq 火星殖民"), []);
});

test("empty query returns nothing", () => {
  assert.deepEqual(search("   "), []);
});

test("results are ordered by score", () => {
  const hits = search("照顧者支援", 3);
  for (let i = 1; i < hits.length; i++) {
    assert.ok(hits[i - 1].score >= hits[i].score);
  }
});
