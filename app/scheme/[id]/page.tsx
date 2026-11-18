import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AGE_LABELS,
  CARER_LABELS,
  HOUSEHOLD_LABELS,
  HOUSING_LABELS,
  INCOME_LABELS,
} from "@/lib/rules";
import { getScheme, schemes } from "@/lib/schemes";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return schemes.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const scheme = getScheme(id);
  return { title: scheme ? `${scheme.zh} — PolicyMatch HK` : "找不到服務 — PolicyMatch HK" };
}

export default async function SchemePage({ params }: { params: Params }) {
  const { id } = await params;
  const scheme = getScheme(id);
  if (!scheme) notFound();

  const rules = scheme.rules ?? {};
  const conditions: string[] = [];
  if (rules.ageBands) conditions.push(`年齡：${rules.ageBands.map((a) => AGE_LABELS[a]).join("、")}`);
  if (rules.households)
    conditions.push(`家庭狀況：${rules.households.map((h) => HOUSEHOLD_LABELS[h]).join("、")}`);
  if (rules.incomeBands)
    conditions.push(`收入組別：${rules.incomeBands.map((i) => INCOME_LABELS[i]).join("、")}`);
  if (rules.housing) conditions.push(`住屋：${rules.housing.map((h) => HOUSING_LABELS[h]).join("、")}`);
  if (rules.carer) conditions.push(`照顧者：${rules.carer.map((c) => CARER_LABELS[c]).join("、")}`);

  return (
    <div className="wrap-narrow py-10">
      <nav aria-label="麵包屑" className="text-[14px] text-slate">
        <Link href="/">首頁</Link>
        <span className="mx-2">›</span>
        <Link href="/results">配對結果</Link>
        <span className="mx-2">›</span>
        <span>{scheme.zh}</span>
      </nav>

      <p className="mt-6 text-[14px] font-bold tracking-wide text-accent">{scheme.dept}</p>
      <h1 className="mt-2 text-[30px] leading-tight sm:text-[36px]">{scheme.zh}</h1>
      <p className="mt-1 text-[17px] text-slate">{scheme.en}</p>

      <p className="mt-6 text-[19px]">{scheme.summary}</p>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-[20px]">你可以得到甚麼</h2>
        <p className="mt-2 text-[16px]">{scheme.benefit}</p>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-[20px]">需要準備的文件</h2>
        <ul className="mt-3 space-y-2 text-[16px]">
          {scheme.documents.map((d) => (
            <li key={d} className="flex gap-3">
              <span aria-hidden="true" className="text-brand">
                ▪
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[14px] text-slate">
          文件清單為示範版本，實際要求以部門公布為準。
        </p>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-[20px]">申請方法</h2>
        <p className="mt-2 text-[16px]">{scheme.apply}</p>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-[20px]">資格條件（示範簡化）</h2>
        {conditions.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2 text-[15px]">
            {conditions.map((c) => (
              <li key={c} className="rounded-[2px] bg-mist px-3 py-1.5">
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[16px]">此服務沒有設定簡化條件，適用於所有使用者。</p>
        )}
      </section>

      <aside className="mt-8 border-l-4 border-brand bg-[#eef3f8] p-5">
        <p className="text-[15px] font-bold">政策依據</p>
        <p className="mt-1 text-[16px]">{scheme.citation.label}</p>
        <p className="mt-2 text-[14px] text-slate">
          頁碼：{scheme.citation.ref} · 申請前請查閱原文，本頁只作示範。
        </p>
      </aside>

      <p className="mt-10 text-[15px]">
        <Link href="/results">← 返回配對結果</Link>
      </p>
    </div>
  );
}
