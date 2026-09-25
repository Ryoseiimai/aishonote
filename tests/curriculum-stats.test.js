import test from "node:test";
import assert from "node:assert/strict";
import {
  flattenRoadmap,
  stageRate,
  overallRate,
  nextStep,
  roundRateToStep,
  practiceStreak,
  weeklyMinutes,
} from "../js/curriculum-stats.js";

function roadmap() {
  return [
    {
      stage: "s1",
      title: "段階1",
      items: [
        { id: "a1", title: "項目A1" },
        { id: "a2", title: "項目A2" },
      ],
    },
    {
      stage: "s2",
      title: "段階2",
      items: [{ id: "b1", title: "項目B1" }],
    },
  ];
}

test("flattenRoadmap: 全段階の項目を順番通りに平らにする", () => {
  const flat = flattenRoadmap(roadmap());
  assert.equal(flat.length, 3);
  assert.deepEqual(flat.map((f) => f.item.id), ["a1", "a2", "b1"]);
});

test("stageRate: チェック数/項目数を返す", () => {
  const rm = roadmap();
  assert.equal(stageRate(rm[0], new Set()), 0);
  assert.equal(stageRate(rm[0], new Set(["a1"])), 0.5);
  assert.equal(stageRate(rm[0], new Set(["a1", "a2"])), 1);
});

test("stageRate: 項目が無い段階は0", () => {
  assert.equal(stageRate({ items: [] }, new Set()), 0);
});

test("overallRate: 全項目に対するチェック済み割合", () => {
  const rm = roadmap();
  assert.equal(overallRate(rm, new Set()), 0);
  assert.equal(overallRate(rm, new Set(["a1", "a2", "b1"])), 1);
  assert.ok(Math.abs(overallRate(rm, new Set(["a1"])) - 1 / 3) < 1e-9);
});

test("nextStep: 未チェックの最初の項目を返す", () => {
  const rm = roadmap();
  const step = nextStep(rm, new Set());
  assert.equal(step.item.id, "a1");
  assert.equal(step.stageTitle, "段階1");

  const step2 = nextStep(rm, new Set(["a1"]));
  assert.equal(step2.item.id, "a2");
});

test("nextStep: 全項目チェック済みならnull", () => {
  const rm = roadmap();
  assert.equal(nextStep(rm, new Set(["a1", "a2", "b1"])), null);
});

test("roundRateToStep: 10%刻みに丸める", () => {
  assert.equal(roundRateToStep(0), 0);
  assert.equal(roundRateToStep(1), 100);
  assert.equal(roundRateToStep(0.33), 30);
  assert.equal(roundRateToStep(0.37), 40);
});

test("practiceStreak: 今日から連続して練習した日数を数える", () => {
  const log = {
    "2026-09-25": 10,
    "2026-09-24": 30,
    "2026-09-23": 20,
    "2026-09-21": 15, // 22日が抜けているので繋がらない
  };
  assert.equal(practiceStreak(log, "2026-09-25"), 3);
});

test("practiceStreak: 今日の記録が無ければ0", () => {
  const log = { "2026-09-24": 10 };
  assert.equal(practiceStreak(log, "2026-09-25"), 0);
});

test("weeklyMinutes: 直近7日分の合計", () => {
  const log = {
    "2026-09-25": 10,
    "2026-09-24": 10,
    "2026-09-18": 100, // 8日前は範囲外
  };
  assert.equal(weeklyMinutes(log, "2026-09-25"), 20);
});
