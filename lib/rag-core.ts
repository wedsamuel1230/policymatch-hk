import type { Scheme } from "./types";

/**
 * Retrieval core. Pure: it takes the schemes as data, so it can be unit-tested
 * without a bundler, and the page binds the real dataset at the edge.
 *
 * Design rule: the answer shown to the user is a passage that exists in the
 * source data, never a generated sentence. Every passage carries its page ref.
 */
export interface Passage {
  id: string;
  schemeId: string;
  kind: "簡介" | "可得支援" | "所需文件" | "申請方法" | "名稱";
  text: string;
  ref: string;
  source: string;
}

export function buildPassages(schemes: Scheme[]): Passage[] {
  return schemes.flatMap((s) => {
    const blocks: { kind: Passage["kind"]; text: string }[] = [
      { kind: "名稱", text: `${s.zh} ${s.en}（${s.dept}）` },
      { kind: "簡介", text: s.summary },
      { kind: "可得支援", text: s.benefit },
      { kind: "所需文件", text: `需要準備：${s.documents.join("、")}。` },
      { kind: "申請方法", text: s.apply },
    ];
    return blocks.map((b, i) => ({
      id: `${s.id}-${i}`,
      schemeId: s.id,
      kind: b.kind,
      text: b.text,
      ref: s.citation.ref,
      source: s.citation.label,
    }));
  });
}

/** Latin words stay whole; CJK is cut into overlapping pairs, which is what
 *  makes "醫療券" find "長者醫療券" without a dictionary. */
export function tokenize(s: string): string[] {
  const out: string[] = [];
  const text = s.toLowerCase();
  out.push(...(text.match(/[a-z0-9]+/g) ?? []));
  for (const run of text.match(/[\u3400-\u9fff]+/g) ?? []) {
    if (run.length === 1) {
      out.push(run);
      continue;
    }
    for (let i = 0; i < run.length - 1; i++) out.push(run.slice(i, i + 2));
  }
  return out;
}

const K1 = 1.2;
const B = 0.75;
const MIN_SCORE = 1.5;

export interface Hit extends Passage {
  score: number;
}

export function createIndex(passages: Passage[]) {
  const docs = passages.map((p) => tokenize(`${p.kind} ${p.text}`));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLen = docs.reduce((a, d) => a + d.length, 0) / Math.max(docs.length, 1);

  const idf = (term: string): number => {
    const n = df.get(term) ?? 0;
    return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
  };

  /** BM25. Returns nothing when the best hit is weak, so the page can say
   *  "not found" instead of presenting a near miss as an answer. */
  return function search(query: string, limit = 3): Hit[] {
    const q = [...new Set(tokenize(query))];
    if (q.length === 0) return [];

    const scored = docs.map((d, i) => {
      const freq = new Map<string, number>();
      for (const t of d) freq.set(t, (freq.get(t) ?? 0) + 1);
      let score = 0;
      for (const term of q) {
        const f = freq.get(term);
        if (!f) continue;
        score += idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.length) / avgLen)));
      }
      return { i, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0]?.score ?? 0;
    if (best < MIN_SCORE) return [];

    return scored
      .filter((s) => s.score > 0 && s.score >= best * 0.45)
      .slice(0, limit)
      .map((s) => ({ ...passages[s.i], score: s.score }));
  };
}
