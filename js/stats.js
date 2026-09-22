// 純粋な集計関数群。DOM/localStorage に触れない(node:test で単体テストするため)。

/** 日付文字列(YYYY-MM-DD)からその週の月曜日の日付文字列を返す */
export function weekStartOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay(); // 0=日
  const diff = (day === 0 ? -6 : 1) - day; // 月曜始まり
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** 勝率を計算。対戦数0なら rate は null */
export function winRate(matches) {
  const total = matches.length;
  const wins = matches.filter((m) => m.result === "win").length;
  const losses = total - wins;
  const rate = total === 0 ? null : wins / total;
  return { total, wins, losses, rate };
}

/** 日付降順(新しい順)にソートした配列を返す(元配列は変更しない) */
export function sortByDateDesc(matches) {
  return [...matches].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

/** 直近n戦の勝率(新しい順に並べてから先頭n件) */
export function recentWinRate(matches, n) {
  const sorted = sortByDateDesc(matches);
  return winRate(sorted.slice(0, n));
}

/** 連勝/連敗。新しい順の先頭から同じ結果が続く数を数える */
export function currentStreak(matches) {
  const sorted = sortByDateDesc(matches);
  if (sorted.length === 0) return { type: null, count: 0 };
  const type = sorted[0].result;
  let count = 0;
  for (const m of sorted) {
    if (m.result === type) count += 1;
    else break;
  }
  return { type, count };
}

/** 直近days日以内の負け理由タグを集計し、多い順に上位topNを返す */
export function topLossTags(matches, { days = 30, topN = 3, now = new Date() } = {}) {
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() - days);
  const thresholdStr = threshold.toISOString().slice(0, 10);
  const counts = new Map();
  for (const m of matches) {
    if (m.result !== "lose") continue;
    if (m.date < thresholdStr) continue;
    for (const tag of m.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([tag, count]) => ({ tag, count }));
}

/** 週ごとの勝率を週開始日の昇順で返す */
export function weeklyWinRates(matches) {
  const byWeek = new Map();
  for (const m of matches) {
    const week = weekStartOf(m.date);
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week).push(m);
  }
  return [...byWeek.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([week, ms]) => ({ week, ...winRate(ms) }));
}

/** 自キャラ×相手キャラの相性を対戦ログから自動集計する。
 * 戻り値: [{ opponent, total, wins, rate, provisional }]
 * provisional: 対戦数が5未満(まだ様子見)
 */
export function matchupStats(matches, myFighter) {
  const byOpponent = new Map();
  for (const m of matches) {
    if (m.my !== myFighter) continue;
    if (!byOpponent.has(m.opponent)) byOpponent.set(m.opponent, []);
    byOpponent.get(m.opponent).push(m);
  }
  return [...byOpponent.entries()].map(([opponent, ms]) => {
    const { total, wins, rate } = winRate(ms);
    return { opponent, total, wins, rate, provisional: total < 5 };
  });
}

/** 苦手順(勝率が低い×対戦数が多い順)に並べ替える。provisionalは末尾に回す */
export function sortByWeakness(matchupList) {
  return [...matchupList].sort((a, b) => {
    if (a.provisional !== b.provisional) return a.provisional ? 1 : -1;
    if (a.rate !== b.rate) return a.rate - b.rate;
    return b.total - a.total;
  });
}
