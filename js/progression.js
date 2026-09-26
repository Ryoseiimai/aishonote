// 保存済みのチェックと練習記録から毎回計算。XP自体は保存しない。
import { SSBU_CURRICULUM } from "./presets/ssbu-curriculum.js";
import { SSBU_CHAR_CURRICULUM } from "./presets/ssbu-char-curriculum.js";

export const CHECK_XP = 25;
export const MINUTE_XP = 2;
export const MAX_LEVEL = 99;
const knownIds = new Set([
  ...SSBU_CURRICULUM.roadmap.flatMap((stage) => stage.items.map((item) => item.id)),
  ...Object.values(SSBU_CHAR_CURRICULUM).flatMap((menu) => menu.items.map((item) => item.id)),
]);

/** Lv1は0、Lv2は100、Lv3は250。次のレベルまでの必要XPは50ずつ増える。 */
export function levelThreshold(level) {
  const safeLevel = Number.isFinite(level) ? Math.min(MAX_LEVEL, Math.max(1, Math.floor(level))) : 1;
  return 25 * (safeLevel - 1) * (safeLevel + 2);
}

/** 不正値を0に正規化。上限到達後も総XPは保持する。DOM・時刻・保存領域には触れない。 */
export function levelFromXp(value) {
  const xp = Number.isFinite(value) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(value))) : 0;
  let level = 1;
  while (level < MAX_LEVEL && xp >= levelThreshold(level + 1)) level += 1;
  const maxed = level === MAX_LEVEL;
  const earned = xp - levelThreshold(level);
  const required = maxed ? 0 : levelThreshold(level + 1) - levelThreshold(level);
  return { xp, level, earned, required, remaining: maxed ? 0 : required - earned, ratio: maxed ? 1 : earned / required, maxed };
}

/** 全キャラ共通の積み重ね。既知IDだけを重複なしで数え、解除・インポートもそのまま反映。 */
export function experience({ progress = [], practiceLog = {} } = {}) {
  const checks = [...new Set(Array.isArray(progress) ? progress : [])].filter((id) => knownIds.has(id)).length;
  const minutes = Object.values(practiceLog || {}).reduce((total, value) =>
    total + (Number.isInteger(value) && value >= 0 && value <= 1440 ? value : 0), 0);
  return { ...levelFromXp(checks * CHECK_XP + minutes * MINUTE_XP), checks, minutes };
}

export const GUIDE_MESSAGES = Object.freeze({
  levelUp: "練習が実を結んで、レベルアップ！ むすびコーチもガッツポーズ！",
  complete: "ロードマップ達成、おめでとう！ むすびコーチと得意な動きを磨こう。",
  week: "一週間以上、よく続けたね！ おにぎりでひと息。休む時間も大切にね。",
  streak: "練習が続いているね。ひとつずつ、上達につなげよう！",
  today: "今日の一歩、記録できたね。むすびコーチからも、おつかれさま！",
  next: "ぼくはむすびコーチ！ 「次の一歩」から、一緒に練習しよう。",
});

/** 固定文面のみを選ぶ。ロードマップの次項目と連続日数に応じて切り替える。 */
export function guideMessage({ hasNext = true, streak = 0, levelUp = false } = {}) {
  if (levelUp) return GUIDE_MESSAGES.levelUp;
  if (!hasNext) return GUIDE_MESSAGES.complete;
  if (streak >= 7) return GUIDE_MESSAGES.week;
  if (streak >= 2) return GUIDE_MESSAGES.streak;
  if (streak === 1) return GUIDE_MESSAGES.today;
  return GUIDE_MESSAGES.next;
}
