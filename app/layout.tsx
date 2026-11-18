import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolicyMatch HK — 政府服務配對（示範）",
  description:
    "回答六條問題，找出你可能合資格申請的香港政府支援服務。學生專題示範，並非政府官方網站。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-HK">
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink focus:outline-4"
        >
          跳至主要內容
        </a>

        <div className="border-b border-line bg-mist">
          <div className="wrap flex items-center justify-between py-2 text-[13px] text-slate">
            <span>學生專題原型 · 非政府官方網站</span>
            <span className="hidden sm:inline">資料版本 2026-11</span>
          </div>
        </div>

        <header className="bg-brand text-paper">
          <div className="wrap flex flex-wrap items-center justify-between gap-4 py-5">
            <Link href="/" className="group flex items-baseline gap-3 no-underline">
              <span className="text-[26px] font-bold tracking-tight text-paper">
                PolicyMatch <span className="text-[#9fc3e0]">HK</span>
              </span>
              <span className="text-[15px] text-[#c8d8e6]">政策配對</span>
            </Link>
            <nav className="flex items-center gap-5 text-[14px] text-[#c8d8e6]" aria-label="主要">
              <span>六條問題 · 一份清單 · 附政策頁碼</span>
              <Link href="/ask" className="border-b border-[#9fc3e0] pb-0.5 text-paper no-underline hover:border-paper">
                問一句
              </Link>
            </nav>
          </div>
        </header>

        <div className="border-b border-line bg-paper">
          <div className="wrap flex flex-wrap items-center gap-3 py-2.5 text-[13px] text-slate">
            <span className="border border-slate px-1.5 py-[1px] text-[11px] font-bold tracking-[0.1em]">
              原型
            </span>
            <p>本服務為課堂示範，資料經簡化。申請前請查閱政策原文。</p>
          </div>
        </div>

        <main id="main">{children}</main>

        <footer className="mt-24 border-t border-line bg-mist">
          <div className="wrap grid gap-10 py-12 text-[14px] leading-relaxed text-[#3a4550] sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="font-bold text-ink">PolicyMatch HK</p>
              <p className="mt-2">
                香港中學資訊科技科專題研習示範項目。資格判斷由程式規則完成，不由語言模型決定。
              </p>
            </div>
            <div>
              <p className="font-bold text-ink">資料來源</p>
              <ul className="mt-2 space-y-1">
                <li>《行政長官2026年施政報告》及附篇</li>
                <li>各部門申請須知（已簡化）</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-ink">重要提示</p>
              <p className="mt-2">
                本工具不提供醫療、法律或財務意見，亦不計算實際金額。一切以政府公布為準。
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
