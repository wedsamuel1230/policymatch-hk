import test from "node:test";
import assert from "node:assert/strict";
import { matchAll, matchScheme, parseProfile } from "../lib/rules.ts";
import type { Profile, Scheme } from "../lib/types.ts";

const base: Profile = {
  age: "70plus",
  household: "couple",
  income: "low",
  housing: "public",
  carer: "yes",
  district: "kwunTong",
};

const voucher: Scheme = {
  id: "ccsv",
  zh: "長者社區照顧服務券",
  en: "Community Care Service Voucher",
  dept: "社會福利署",
  summary: "",
  benefit: "",
  documents: [],
  apply: "",
  citation: { label: "", ref: "" },
  rules: { ageBands: ["65to69", "70plus"], incomeBands: ["low", "mid"] },
};

const childScheme: Scheme = {
  ...voucher,
  id: "wfa",
  rules: { households: ["withChildren"], incomeBands: ["low", "mid"] },
};

test("an eligible household matches", () => {
  const r = matchScheme(base, voucher);
  assert.equal(r.matched, true);
  assert.deepEqual(r.failures, []);
});

test("a failing rule is reported, not hidden", () => {
  const r = matchScheme({ ...base, age: "under55" }, voucher);
  assert.equal(r.matched, false);
  assert.equal(r.failures.length, 1);
  assert.match(r.failures[0], /年齡/);
});

test("a household without children misses the family scheme", () => {
  assert.equal(matchScheme(base, childScheme).matched, false);
  assert.equal(matchScheme({ ...base, household: "withChildren" }, childScheme).matched, true);
});

test("a scheme with no rules always matches", () => {
  assert.equal(matchScheme(base, { ...voucher, rules: {} }).matched, true);
});

test("matched schemes sort before unmatched ones", () => {
  const sorted = matchAll(base, [childScheme, voucher]);
  assert.equal(sorted[0].scheme.id, "ccsv");
  assert.equal(sorted[1].scheme.id, "wfa");
});

test("junk query values fall back and are reported as incomplete", () => {
  const { profile, complete } = parseProfile({ age: "banana", income: "low" });
  assert.equal(complete, false);
  assert.equal(profile.age, "65to69");
  assert.equal(profile.income, "low");
  assert.equal(profile.district, "kwunTong");
});

test("a full query is complete and round-trips", () => {
  const params = {
    age: "70plus",
    household: "couple",
    income: "low",
    housing: "public",
    carer: "yes",
    district: "kwunTong",
  };
  const { profile, complete } = parseProfile(params);
  assert.equal(complete, true);
  assert.deepEqual(profile, base);
});
