import type {
  AgeBand,
  Carer,
  District,
  Household,
  Housing,
  Income,
  MatchResult,
  Profile,
  Scheme,
} from "./types";

export const AGE_LABELS: Record<AgeBand, string> = {
  under55: "55 歲以下",
  "55to64": "55 至 64 歲",
  "65to69": "65 至 69 歲",
  "70plus": "70 歲或以上",
};

export const HOUSEHOLD_LABELS: Record<Household, string> = {
  single: "獨居",
  couple: "兩人家庭",
  withChildren: "有子女同住",
  withElderly: "有長者同住",
};

export const INCOME_LABELS: Record<Income, string> = {
  low: "低收入",
  mid: "中等收入",
  high: "較高收入",
};

export const HOUSING_LABELS: Record<Housing, string> = {
  public: "公共房屋",
  private: "私人房屋",
};

export const CARER_LABELS: Record<Carer, string> = {
  yes: "有，全職照顧家人",
  no: "沒有",
};

export const DISTRICT_LABELS: Record<District, string> = {
  central: "中西區",
  wanchai: "灣仔",
  eastern: "東區",
  southern: "南區",
  yauTsimMong: "油尖旺",
  shamShuiPo: "深水埗",
  kowloonCity: "九龍城",
  wongTaiSin: "黃大仙",
  kwunTong: "觀塘",
  kwaiTsing: "葵青",
  tsuenWan: "荃灣",
  tuenMun: "屯門",
  yuenLong: "元朗",
  north: "北區",
  taiPo: "大埔",
  shaTin: "沙田",
  saiKung: "西貢",
  islands: "離島",
};

/** Every rule the scheme declares must pass. A missing rule means "no restriction". */
export function matchScheme(profile: Profile, scheme: Scheme): MatchResult {
  const reasons: string[] = [];
  const failures: string[] = [];
  const r = scheme.rules ?? {};

  if (r.ageBands) {
    const ok = r.ageBands.includes(profile.age);
    (ok ? reasons : failures).push(`年齡：${AGE_LABELS[profile.age]}`);
  }
  if (r.households) {
    const ok = r.households.includes(profile.household);
    (ok ? reasons : failures).push(`家庭狀況：${HOUSEHOLD_LABELS[profile.household]}`);
  }
  if (r.incomeBands) {
    const ok = r.incomeBands.includes(profile.income);
    (ok ? reasons : failures).push(`收入組別：${INCOME_LABELS[profile.income]}`);
  }
  if (r.housing) {
    const ok = r.housing.includes(profile.housing);
    (ok ? reasons : failures).push(`住屋：${HOUSING_LABELS[profile.housing]}`);
  }
  if (r.carer) {
    const ok = r.carer.includes(profile.carer);
    (ok ? reasons : failures).push(`照顧者：${CARER_LABELS[profile.carer]}`);
  }

  return { scheme, matched: failures.length === 0, reasons, failures };
}

/** Matched first, then the rest. Order is stable so the page does not jump between renders. */
export function matchAll(profile: Profile, schemes: Scheme[]): MatchResult[] {
  return schemes
    .map((s) => matchScheme(profile, s))
    .sort((a, b) => Number(b.matched) - Number(a.matched) || a.scheme.zh.localeCompare(b.scheme.zh, "zh-Hant"));
}

const AGE_VALUES: AgeBand[] = ["under55", "55to64", "65to69", "70plus"];
const HOUSEHOLD_VALUES: Household[] = ["single", "couple", "withChildren", "withElderly"];
const INCOME_VALUES: Income[] = ["low", "mid", "high"];
const HOUSING_VALUES: Housing[] = ["public", "private"];
const CARER_VALUES: Carer[] = ["yes", "no"];
const DISTRICT_VALUES = Object.keys(DISTRICT_LABELS) as District[];

function pick<T extends string>(value: string | undefined, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Query strings are untrusted input. Anything unknown falls back to a safe default,
 * and `complete` tells the page whether the visitor actually answered all five questions.
 */
export function parseProfile(params: Record<string, string | string[] | undefined>): {
  profile: Profile;
  complete: boolean;
} {
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const profile: Profile = {
    age: pick(one("age"), AGE_VALUES, "65to69"),
    household: pick(one("household"), HOUSEHOLD_VALUES, "couple"),
    income: pick(one("income"), INCOME_VALUES, "low"),
    housing: pick(one("housing"), HOUSING_VALUES, "public"),
    carer: pick(one("carer"), CARER_VALUES, "no"),
    district: pick(one("district"), DISTRICT_VALUES, "kwunTong"),
  };

  const complete = ["age", "household", "income", "housing", "carer", "district"].every(
    (k) => one(k) !== undefined,
  );

  return { profile, complete };
}

export function toQuery(profile: Profile): string {
  return new URLSearchParams({
    age: profile.age,
    household: profile.household,
    income: profile.income,
    housing: profile.housing,
    carer: profile.carer,
    district: profile.district,
  }).toString();
}
