# PolicyMatch HK

學生專題示範：回答五條問題，找出你可能合資格申請的香港政府支援服務，並附政策頁碼。

**這不是政府官方網站。** 資料為示範用簡化版本，不能代替部門的申請須知。

## 技術

- Next.js 16（App Router、Turbopack）
- React 19
- Tailwind CSS v4（CSS-first `@theme`）
- TypeScript，零額外 runtime 依賴（無資料庫、無登入、無 LLM）

資格判斷由 `lib/rules.ts` 的純函數完成，不經語言模型。這是設計決定：數字與條件交程式，文字才交模型。

## 在 Windows 上跑

需要 Node.js 20.9 或以上（建議 22 LTS）。

```bat
cd policymatch-hk
npm install
npm run dev
```

開 http://localhost:3000 。

第一次 `npm install` 約需一至兩分鐘。

### 其他指令

```bat
npm run build     :: 生產建置
npm run start     :: 跑生產版本（預設 3000）
npm test          :: 規則引擎單元測試（7 個）
```

## 專案結構

```
app/
  layout.tsx            頁首、頁尾、原型聲明
  page.tsx              五條問題（純 HTML 表單，無需 JavaScript）
  results/page.tsx      配對結果
  scheme/[id]/page.tsx  單一服務詳情（靜態生成）
components/
  SchemeCard.tsx        結果卡、未符合清單
lib/
  types.ts              型別
  rules.ts              配對引擎 + query 解析
  schemes.ts            讀取資料
data/
  schemes.json          11 項服務 + 簡化資格規則
tests/
  rules.test.ts         規則引擎測試
```

## 加一項服務

在 `data/schemes.json` 的 `schemes` 陣列加一個物件，`rules` 留空的欄位代表「無限制」。

```json
{
  "id": "my_scheme",
  "zh": "服務名稱",
  "en": "Scheme Name",
  "dept": "負責部門",
  "summary": "一句話說明。",
  "benefit": "可以得到甚麼。",
  "documents": ["香港身份證"],
  "apply": "如何申請。",
  "citation": { "label": "政策文件及頁碼", "ref": "p.00" },
  "rules": { "ageBands": ["65to69", "70plus"], "incomeBands": ["low"] }
}
```

可用欄位：`ageBands`（under55 / 55to64 / 65to69 / 70plus）、`households`（single / couple / withChildren / withElderly）、
`incomeBands`（low / mid / high）、`housing`（public / private）、`carer`（yes / no）。

## 部署到 GitHub Pages（已設定）

Live：<https://wedsamuel1230.github.io/policymatch-hk/> （由 GitHub Actions 發佈）

推送 `main` 就會自動建置並發佈（`.github/workflows/pages.yml`）：

1. repo Settings → Pages → Source 選 **GitHub Actions**。
2. push 後等 workflow 綠燈。
3. 網址形如 `https://<user>.github.io/policymatch-hk/`。

因為是 project page，建置時會注入 `NEXT_PUBLIC_BASE_PATH=/policymatch-hk`。本機 `npm run dev` 不受影響（變數留空＝根路徑）。

靜態匯出的兩個限制，已處理：

- `/results` 冇 server 讀 `searchParams`，所以配對喺瀏覽器跑（同一份 `lib/rules.ts` 純函數）。
- 表單 `action` 要自己補 basePath，`next/link` 會自動補。
- `public/.nojekyll` 必須存在，否則 `_next/` 會被 Jekyll 忽略。

## 部署到 Vercel（另一選擇）

Vercel 匯入 repo，框架偵測為 Next.js，直接 Deploy，無環境變數。

## 已知限制

- 資格條件為示範簡化版，不是官方標準。
- 不做金額計算，不提供醫療、法律或財務意見。
- 沒有後端儲存，答案只存在網址參數中。
