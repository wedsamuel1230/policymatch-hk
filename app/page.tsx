import Link from "next/link";
import {
  AGE_LABELS,
  CARER_LABELS,
  DISTRICT_LABELS,
  HOUSEHOLD_LABELS,
  HOUSING_LABELS,
  INCOME_LABELS,
} from "@/lib/rules";
import type { AgeBand, Carer, District, Household, Housing, Income } from "@/lib/types";

const ages = Object.entries(AGE_LABELS) as [AgeBand, string][];
const households = Object.entries(HOUSEHOLD_LABELS) as [Household, string][];
const incomes = Object.entries(INCOME_LABELS) as [Income, string][];
const housings = Object.entries(HOUSING_LABELS) as [Housing, string][];
const carers = Object.entries(CARER_LABELS) as [Carer, string][];
const districts = Object.entries(DISTRICT_LABELS) as [District, string][];

const step = "border-t border-line pt-8 mt-8 first:border-0 first:pt-0 first:mt-0";

function Option({
  name,
  value,
  label,
  hint,
}: {
  name: string;
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <label className="opt-row flex cursor-pointer items-start gap-3 border-b border-line py-3 transition-colors hover:bg-mist px-2 -mx-2">
      <input
        type="radio"
        name={name}
        value={value}
        required
        className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#123a5e]"
      />
      <span className="flex-1">
        <span className="block text-[17px] leading-snug">{label}</span>
        {hint ? <span className="mt-0.5 block text-[14px] text-slate">{hint}</span> : null}
      </span>
    </label>
  );
}

function Legend({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <legend className="mb-2 flex items-baseline gap-3">
      <span className="text-[15px] font-bold tabular-nums text-slate">{String(n).padStart(2, "0")}</span>
      <span className="text-[21px] font-bold leading-tight">{children}</span>
    </legend>
  );
}

export default function Home() {
  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="wrap-narrow py-12 sm:py-16">
          <p className="text-[14px] font-bold tracking-[0.14em] text-slate">香港政府支援服務</p>
          <h1 className="mt-3 text-[34px] leading-[1.15] sm:text-[44px]">
            找出你可以申請的支援
          </h1>
          <p className="mt-5 max-w-[46ch] text-[19px] text-slate">
            回答五條問題。系統會對照政策條文，列出你可能合資格而未申請的服務，
            並附上政策頁碼，方便你自行核對。
          </p>
          <p className="mt-7 max-w-[52ch] border-l-2 border-line pl-4 text-[15px] leading-relaxed text-slate">
            需時約一分鐘 · 不用文件、不用登記 · 對照 11 項服務示範資料
          </p>
        </div>
      </section>

      <div className="wrap-narrow py-12">
        <div className="mb-10 border border-line bg-mist px-5 py-4 text-[15px] leading-relaxed">
          <p>
            <strong className="font-bold">私隱</strong>
            <span className="mx-2 text-line">|</span>
            不需要填寫姓名、身份證號碼或聯絡方法。答案只會用於即時配對，不會儲存。
          </p>
        </div>

        <form
          action={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/results/`}
          method="get"
          className="space-y-0"
        >
          <fieldset className={step}>
            <Legend n={1}>年齡組別</Legend>
            <p className="mb-4 ml-9 text-[15px] text-slate">請選擇最接近的一組。</p>
            <div className="ml-9 mt-1 grid border-t border-line">
              {ages.map(([v, l]) => (
                <Option key={v} name="age" value={v} label={l} />
              ))}
            </div>
          </fieldset>

          <fieldset className={step}>
            <Legend n={2}>家庭狀況</Legend>
            <p className="mb-4 ml-9 text-[15px] text-slate">同住的人包括誰？</p>
            <div className="ml-9 mt-1 grid border-t border-line">
              {households.map(([v, l]) => (
                <Option key={v} name="household" value={v} label={l} />
              ))}
            </div>
          </fieldset>

          <fieldset className={step}>
            <Legend n={3}>每月收入組別</Legend>
            <p className="mb-4 ml-9 text-[15px] text-slate">不用填寫金額，只需要選一個組別。</p>
            <div className="ml-9 mt-1 grid border-t border-line">
              {incomes.map(([v, l]) => (
                <Option key={v} name="income" value={v} label={l} />
              ))}
            </div>
          </fieldset>

          <fieldset className={step}>
            <Legend n={4}>住屋類型</Legend>
            <div className="ml-9 mt-1 grid border-t border-line">
              {housings.map(([v, l]) => (
                <Option key={v} name="housing" value={v} label={l} />
              ))}
            </div>
          </fieldset>

          <fieldset className={step}>
            <Legend n={5}>你是否全職照顧家人？</Legend>
            <p className="mb-4 ml-9 text-[15px] text-slate">
              例如照顧長期病患的配偶、父母或子女。
            </p>
            <div className="ml-9 mt-1 grid border-t border-line">
              {carers.map(([v, l]) => (
                <Option key={v} name="carer" value={v} label={l} />
              ))}
            </div>
          </fieldset>

          <fieldset className={step}>
            <Legend n={6}>居住地區</Legend>
            <p className="mb-4 ml-9 text-[15px] text-slate">用於顯示附近可用的服務。</p>
            <div className="ml-9 max-w-md">
              <label htmlFor="district" className="mb-2 block text-[15px] font-medium">
                十八區
              </label>
              <select
                id="district"
                name="district"
                required
                defaultValue=""
                className="w-full rounded-[3px] border-2 border-slate bg-paper px-3 py-3 text-[17px]"
              >
                <option value="" disabled>
                  請選擇
                </option>
                {districts.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <div className="mt-12 border-t border-line pt-8">
            <button
              type="submit"
              className="inline-flex items-center gap-3 rounded-[3px] bg-brand px-7 py-4 text-[18px] font-bold text-paper transition-colors hover:bg-brand-dark"
            >
              查看我的清單
              <span aria-hidden="true">→</span>
            </button>
            <p className="mt-4 text-[15px] text-slate">
              下一步會顯示你可能合資格的服務，以及不合資格的原因。
            </p>
          </div>
        </form>

        <section className="mt-16 border-t border-line pt-10">
          <h2 className="text-[22px]">這個工具會做甚麼</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            {[
              ["對照規則", "把你的答案與政策條文的資格條件逐項比對。"],
              ["列出清單", "只顯示你可能合資格而未申請的服務。"],
              ["附上頁碼", "每一項都註明政策頁碼，你可以自行核對。"],
            ].map(([t, d]) => (
              <div key={t} className="border-t-2 border-brand pt-3">
                <p className="font-bold">{t}</p>
                <p className="mt-1 text-[15px] text-slate">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[15px] text-slate">
            需要看完整說明？
            <Link href="/results?age=65to69&household=couple&income=low&housing=public&carer=yes&district=kwunTong" className="ml-1">
              用示範個案試一次
            </Link>
            。
          </p>
        </section>
      </div>
    </>
  );
}
