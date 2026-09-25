// 上達タブ(ロードマップ・練習ログ)の純粋な集計関数群。DOM/localStorageに触れない(node:testで検証するため)。

/** ロードマップを段階をまたいで1つの配列に平らにする。順序は元の並びのまま。 */
export function flattenRoadmap(roadmap) {
  const flat = [];
  for (const stage of roadmap || []) {
    for (const item of stage.items || []) {
      flat.push({ stage, item });
    }
  }
  return flat;
}

/** 1つの段階の達成率(0〜1)。項目が無ければ0。 */
export function stageRate(stage, progressSet) {
  const items = (stage && stage.items) || [];
  if (items.length === 0) return 0;
  const checked = items.filter((it) => progressSet.has(it.id)).length;
  return checked / items.length;
}

/** ロードマップ全体の達成率(0〜1)。項目が無ければ0。 */
export function overallRate(roadmap, progressSet) {
  const flat = flattenRoadmap(roadmap);
  if (flat.length === 0) return 0;
  const checked = flat.filter(({ item }) => progressSet.has(item.id)).length;
  return checked / flat.length;
}

/** まだチェックされていない最初の項目(=次の一歩)を返す。全部チェック済みならnull。 */
export function nextStep(roadmap, progressSet) {
  const flat = flattenRoadmap(roadmap);
  const found = flat.find(({ item }) => !progressSet.has(item.id));
  return found ? { stageTitle: found.stage.title, item: found.item } : null;
}

/** 0〜1の達成率をCSSクラス選択用に10%刻みへ丸める(0,10,...,100)。 */
export function roundRateToStep(rate, step = 10) {
  const pct = Math.max(0, Math.min(100, Math.round((rate || 0) * 100)));
  return Math.round(pct / step) * step;
}

function addDaysStr(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** 練習の連続日数。todayStrから遡って、練習分数>0の日が続く限り数える。今日が0分なら0。 */
export function practiceStreak(practiceLog, todayStr) {
  let count = 0;
  let cursor = todayStr;
  while ((practiceLog[cursor] || 0) > 0) {
    count += 1;
    cursor = addDaysStr(cursor, -1);
  }
  return count;
}

/** todayStrを含む直近7日間の練習分数の合計。 */
export function weeklyMinutes(practiceLog, todayStr) {
  let total = 0;
  for (let i = 0; i < 7; i += 1) {
    const day = addDaysStr(todayStr, -i);
    total += practiceLog[day] || 0;
  }
  return total;
}
