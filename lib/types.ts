export type AgeBand =
  | "under18"
  | "18to24"
  | "25to39"
  | "40to54"
  | "55to64"
  | "65to69"
  | "70plus";
export type Household = "single" | "couple" | "withChildren" | "withElderly";
export type Income = "low" | "mid" | "high";
// Tenure, not just building type: several schemes care who the resident rents from
// or whether the household already owns a subsidised flat.
export type Housing =
  | "publicRent"
  | "subsidisedOwner"
  | "privateOwner"
  | "privateRent"
  | "village"
  | "interim";
export type Carer = "yes" | "no";

export type District =
  | "central"
  | "wanchai"
  | "eastern"
  | "southern"
  | "yauTsimMong"
  | "shamShuiPo"
  | "kowloonCity"
  | "wongTaiSin"
  | "kwunTong"
  | "kwaiTsing"
  | "tsuenWan"
  | "tuenMun"
  | "yuenLong"
  | "north"
  | "taiPo"
  | "shaTin"
  | "saiKung"
  | "islands";

export interface Profile {
  age: AgeBand;
  household: Household;
  income: Income;
  housing: Housing;
  carer: Carer;
  district: District;
}

export interface SchemeRules {
  ageBands?: AgeBand[];
  households?: Household[];
  incomeBands?: Income[];
  housing?: Housing[];
  carer?: Carer[];
}

export interface Scheme {
  id: string;
  zh: string;
  en: string;
  dept: string;
  summary: string;
  benefit: string;
  documents: string[];
  apply: string;
  citation: { label: string; ref: string };
  rules: SchemeRules;
}

export interface MatchResult {
  scheme: Scheme;
  matched: boolean;
  reasons: string[];
  failures: string[];
}
