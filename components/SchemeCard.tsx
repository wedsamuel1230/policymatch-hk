import Link from "next/link";
import type { MatchResult } from "@/lib/types";

export function SchemeCard({ result, index }: { result: MatchResult; index: number }) {
  const { scheme } = result;
  return (
    <li className="border-l-4 border-brand bg-paper pl-5">
      <div className="flex gap-4">
        <span className="pt-1 text-[13px] font-bold tabular-nums text-slate">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3 className="text-[20px] leading-snug">
            <Link href={`/scheme/${scheme.id}`} className="text-ink no-underline hover:underline">
              {scheme.zh}
            </Link>
          </h3>
          <p className="mt-1 text-[15px] text-[#55606b]">{scheme.en}</p>
          <p className="mt-1 text-[14px] text-slate">{scheme.dept}</p>
          <p className="mt-3 text-[16px] leading-relaxed">{scheme.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
            <Link
              href={`/scheme/${scheme.id}`}
              className="inline-flex items-center gap-1.5 border-b border-link/40 pb-0.5 font-medium no-underline hover:border-link"
            >
              查看文件及申請方法
              <span aria-hidden="true">→</span>
            </Link>
            <span className="text-slate">依據：{scheme.citation.label}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

export function NearMissList({ results }: { results: MatchResult[] }) {
  if (results.length === 0) return null;
  return (
    <section className="mt-12 border border-line">
      <h2 className="border-b border-line px-5 py-4 text-[17px] font-bold">
        未符合的服務（{results.length} 項）
        <span className="ml-2 text-[14px] font-normal text-slate">以下列明未符合的條件</span>
      </h2>
      <div className="border-t border-line px-5 pb-5 pt-4">
      <ul className="mt-5 space-y-4">
        {results.map((r) => (
          <li key={r.scheme.id} className="border-l-4 border-line pl-5">
            <p className="text-[17px] font-medium">{r.scheme.zh}</p>
            <p className="mt-1 text-[15px] text-slate">
              未符合：
              {r.failures.map((f) => (
                <span key={f} className="mr-2 inline-block rounded-[2px] bg-mist px-2 py-0.5 text-ink">
                  {f}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
