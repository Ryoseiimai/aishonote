import test from "node:test";
import assert from "node:assert/strict";
import { experience, levelFromXp, levelThreshold, MAX_LEVEL, guideMessage, GUIDE_MESSAGES } from "../js/progression.js";
import { SSBU_CURRICULUM } from "../js/presets/ssbu-curriculum.js";
import { SSBU_CHAR_CURRICULUM } from "../js/presets/ssbu-char-curriculum.js";

const roadmapIds = SSBU_CURRICULUM.roadmap.flatMap((stage) => stage.items.map((item) => item.id));
const menus = Object.values(SSBU_CHAR_CURRICULUM);

test("XP: 未記録・旧データはLv1、0 XPから開始", () => {
  assert.deepEqual(experience(), { xp: 0, level: 1, earned: 0, required: 100, remaining: 100, ratio: 0, maxed: false, checks: 0, minutes: 0 });
  assert.deepEqual(experience({}), experience());
});

test("XP: ロードマップと複数キャラのチェック・複数日の練習を合算", () => {
  const stats = experience({ progress: [roadmapIds[0], menus[0].items[0].id, menus[1].items[0].id], practiceLog: { "2026-09-26": 10, "2026-09-27": 30 } });
  assert.equal(stats.checks, 3);
  assert.equal(stats.minutes, 40);
  assert.equal(stats.xp, 155);
  assert.equal(stats.level, 2);
  assert.equal(stats.earned, 55);
  assert.equal(stats.remaining, 95);
});

test("XP: 重複・未知IDで増えない、チェック解除で戻る", () => {
  const checked = experience({ progress: [roadmapIds[0], roadmapIds[0], "unknown", "__proto__"] });
  assert.equal(checked.xp, 25);
  assert.equal(experience({ progress: [] }).xp, 0);
  assert.equal(experience({ progress: [roadmapIds[0]] }).xp, checked.xp);
});

test("XP: 不正な分数・配列を無視し、1日1440分まで受け付ける", () => {
  const stats = experience({ progress: null, practiceLog: { a: -1, b: NaN, c: Infinity, d: "30", e: 1.5, f: 1441, g: 1440, h: 0 } });
  assert.equal(stats.xp, 2880);
  assert.equal(experience({ practiceLog: null }).xp, 0);
});

test("XP: 入力を書き換えず、再読み込み・キャラ変更でも同じ結果", () => {
  const input = Object.freeze({ progress: Object.freeze([roadmapIds[0]]), practiceLog: Object.freeze({ "2026-09-27": 50 }) });
  const expected = experience(input);
  assert.deepEqual(experience(JSON.parse(JSON.stringify(input))), expected);
  assert.deepEqual(experience({ ...input, activeGameId: "custom", activeFighterByGame: { ssbu: "ルイージ" } }), expected);
});

test("Lv: 全98境界の直前・到達・直後を検証", () => {
  for (let level = 2; level <= MAX_LEVEL; level += 1) {
    const threshold = levelThreshold(level);
    assert.equal(levelFromXp(threshold - 1).level, level - 1);
    assert.equal(levelFromXp(threshold).level, level);
    assert.equal(levelFromXp(threshold + 1).level, level);
    assert.equal(levelFromXp(threshold - 1).remaining, 1);
    assert.equal(levelFromXp(threshold).earned, 0);
  }
  assert.equal(levelThreshold(2), 100);
  assert.equal(levelThreshold(3), 250);
  assert.equal(levelThreshold(4), 450);
});

test("Lv: 複数レベルを一度に上げても、Lv99以降でもXPは保持", () => {
  assert.equal(levelFromXp(1000).level, 6);
  const stats = levelFromXp(1_000_000);
  assert.equal(stats.level, 99);
  assert.equal(stats.xp, 1_000_000);
  assert.equal(stats.maxed, true);
  assert.equal(stats.remaining, 0);
  assert.equal(stats.ratio, 1);
});

test("Lv: 不正値・負数・小数を正規化", () => {
  for (const value of [undefined, null, NaN, Infinity, -100, "100"]) assert.equal(levelFromXp(value).xp, 0);
  assert.equal(levelFromXp(99.9).level, 1);
  assert.equal(levelThreshold(-1), 0);
  assert.equal(levelThreshold(Infinity), 0);
});

test("ガイド: 次の一歩・連続日数・全達成・レベルアップの固定文面", () => {
  assert.equal(guideMessage(), GUIDE_MESSAGES.next);
  assert.equal(guideMessage({ streak: 1 }), GUIDE_MESSAGES.today);
  assert.equal(guideMessage({ streak: 2 }), GUIDE_MESSAGES.streak);
  assert.equal(guideMessage({ streak: 6 }), GUIDE_MESSAGES.streak);
  assert.equal(guideMessage({ streak: 7 }), GUIDE_MESSAGES.week);
  assert.equal(guideMessage({ hasNext: false, streak: 7 }), GUIDE_MESSAGES.complete);
  assert.equal(guideMessage({ levelUp: true, hasNext: false }), GUIDE_MESSAGES.levelUp);
});
