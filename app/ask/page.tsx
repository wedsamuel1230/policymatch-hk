"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { search } from "@/lib/rag";

const SAMPLES = ["生果金要幾歲先有？", "醫療券可以點用？", "照顧者有什麼支援？", "在職家庭津貼要什麼文件？"];

export default function AskPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  const hits = useMemo(() => (submitted ? search(submitted, 3) : []), [submitted]);

  return (
    <div className="wrap-narrow py-10">
      <nav aria-label="麵包屑" className="text-[14px] text-slate">
        <Link href="/">首頁</Link>
        <span className="mx-2">›</span>
        <span>問一句</span>
      </nav>

      <h1 className="mt-6 text-[32px] leading-tight sm:text-[38px]">問一句，找出相關的政策段落</h1>
      <p className="mt-4 text-[17px] text-slate">
        這個框只會在你手上的十一項服務裡搜尋，然後原文照登，並附上頁碼。它不會自己作一句答案。
      </p>

      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(q.trim());
        }}
      >
        <label htmlFor="q" className="block text-[15px] font-bold">
          你的問題
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="例如：生果金要幾歲先有？"
            className="w-full border border-line bg-white px-4 py-3 text-[17px] focus:border-accent focus:outline-none focus:ring-4 focus:ring-[#ffc72c]"
          />
          <button
            type="submit"
            className="shrink-0 bg-ink px-6 py-3 text-[16px] font-bold text-white hover:bg-[#0d2b46]"
          >
            搜尋
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQ(s);
                setSubmitted(s);
              }}
              className="border border-line px-3 py-1.5 text-[14px] text-slate hover:border-ink hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {submitted ? (
        <section className="mt-10" aria-live="polite">
          {hits.length === 0 ? (
            <div className="border-l-4 border-warn bg-[#fff8e1] p-5">
              <p className="font-bold">找不到相關段落。</p>
              <p className="mt-1 text-[16px]">
                這個工具只有十一項服務的資料。找不到就說找不到，不會猜。你可以試試用政策名稱搜尋，或直接致電 1823。
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[18px]">
                找到 {hits.length} 段相關內容<span className="ml-2 text-[14px] font-normal text-slate">原文照登</span>
              </h2>
              <ul className="mt-4 space-y-4">
                {hits.map((h) => (
                  <li key={h.id} className="border border-line p-5">
                    <p className="text-[13px] font-bold tracking-wide text-slate">{h.kind}</p>
                    <p className="mt-2 text-[17px] leading-relaxed">{h.text}</p>
                    <p className="mt-3 text-[14px] text-slate">
                      出處：{h.source}
                      <span className="mx-2">·</span>
                      <Link href={`/scheme/${h.schemeId}`}>查看完整條目</Link>
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : null}

      <p className="mt-12 border-t border-line pt-6 text-[14px] text-slate">
        本頁在你的瀏覽器內完成搜尋，問題不會傳送到任何伺服器。資料為示範簡化版，申請前請查閱政策原文。
      </p>
    </div>
  );
}
