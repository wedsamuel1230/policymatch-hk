"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NearMissList, SchemeCard } from "@/components/SchemeCard";
import {
  AGE_LABELS,
  CARER_LABELS,
  DISTRICT_LABELS,
  HOUSEHOLD_LABELS,
  HOUSING_LABELS,
  INCOME_LABELS,
  matchAll,
  parseProfile,
  toQuery,
} from "@/lib/rules";
import { schemes } from "@/lib/schemes";

// The static export has no server to read searchParams, so the matcher runs
// in the browser. It is the same pure function the unit tests cover.
export default function ResultsView() {
  const sp = useSearchParams();
  const params: Record<string, string> = {};
  sp.forEach((v, k) => {
    params[k] = v;
  });

  const { profile, complete } = parseProfile(params);
  const results = matchAll(profile, schemes);
  const matched = results.filter((r) => r.matched);
  const rest = results.filter((r) => !r.matched);

  const answers: [string, string][] = [
    ["年齡", AGE_LABELS[profile.age]],
    ["家庭狀況", HOUSEHOLD_LABELS[profile.household]],
    ["收入組別", INCOME_LABELS[profile.income]],
    ["住屋", HOUSING_LABELS[profile.housing]],
    ["照顧者", CARER_LABELS[profile.carer]],
    ["地區", DISTRICT_LABELS[profile.district]],
  ];

  return (
    <div className="wrap-narrow py-10">
      <nav aria-label="麵包屑" className="text-[14px] text-slate">
        <Link href="/">首頁</Link>
        <span className="mx-2">›</span>
        <span>配對結果</span>
      </nav>

      <h1 className="mt-6 text-[32px] leading-tight sm:text-[38px]">你的配對結果</h1>

      {!complete ? (
        <div className="mt-6 border-l-4 border-warn bg-[#fff8e1] p-4 text-[16px]">
          <p className="font-bold">你未回答全部問題。</p>
          <p className="mt-1">
            下面先用了預設答案示範。
            <Link href="/" className="ml-1">
              返回填寫問題
            </Link>
            。
          </p>
        </div>
      ) : null}

      <p className="mt-5 text-[19px]">
        為你找到 <strong className="text-[24px]">{matched.length}</strong> 項你可能合資格的服務。
        {rest.length > 0 ? `另有 ${rest.length} 項未符合。` : null}
      </p>

      <section aria-labelledby="answers" className="mt-8 border-t border-line pt-6">
        <h2 id="answers" className="text-[18px]">
          你提供的資料
        </h2>
        <dl className="mt-4 border-y border-line text-[15px] sm:columns-2 sm:gap-10">
          {answers.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-6 border-b border-line py-3 last:border-0 sm:break-inside-avoid"
            >
              <dt className="shrink-0 text-slate">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[15px]">
          <Link href={`/?${toQuery(profile)}`}>更改答案</Link>
        </p>
      </section>

      {matched.length > 0 ? (
        <ul className="mt-10 space-y-7">
          {matched.map((r, i) => (
            <SchemeCard key={r.scheme.id} result={r} index={i} />
          ))}
        </ul>
      ) : (
        <div className="mt-10 border-l-4 border-line bg-mist p-5">
          <p className="font-bold">這次沒有配對到服務。</p>
          <p className="mt-1 text-[16px]">
            你可以試試更改收入或照顧者答案，或直接致電 1823 查詢。
          </p>
        </div>
      )}

      <NearMissList results={rest} />

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="text-[22px]">下一步</h2>
        <ol className="mt-4 space-y-3 text-[16px]">
          <li className="flex gap-3">
            <span className="font-bold text-accent">1</span>
            <span>打開清單上任何一項，查看需要準備的文件。</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent">2</span>
            <span>核對政策頁碼。每一項都寫明出處。</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent">3</span>
            <span>帶同文件，去就近的綜合家庭服務中心或長者中心找社工協助。</span>
          </li>
        </ol>
      </section>

      <p className="mt-10 border-t border-line pt-6 text-[14px] text-slate">
        本頁只作示範。資格條件已簡化，最終結果以政府部門的申請須知為準。本工具不提供醫療、
        法律或財務意見。
      </p>
    </div>
  );
}
