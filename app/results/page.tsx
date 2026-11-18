import { Suspense } from "react";
import ResultsView from "./ResultsView";

export const metadata = { title: "你的配對結果 — PolicyMatch HK" };

// Static export: the page shell is HTML, the matcher runs in the browser.
export default function ResultsPage() {
  return (
    <Suspense fallback={<p className="wrap-narrow py-10 text-slate">載入中…</p>}>
      <ResultsView />
    </Suspense>
  );
}
