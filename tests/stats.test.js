import test from "node:test";
import assert from "node:assert/strict";
import {
  winRate,
  recentWinRate,
  currentStreak,
  topLossTags,
  weeklyWinRates,
  matchupStats,
  sortByWeakness,
  weekStartOf,
} from "../js/stats.js";

function mkMatch(overrides) {
  return {
    id: "id",
    date: "2026-09-01",
    my: "マリオ",
    opponent: "リンク",
    result: "win",
    tags: [],
    memo: "",
    createdAt: 0,
    ...overrides,
  };
}

test("winRate: 空配列は rate=null", () => {
  const r = winRate([]);
  assert.equal(r.total, 0);
  assert.equal(r.rate, null);
});

test("winRate: 勝敗を正しく集計する", () => {
  const matches = [mkMatch({ result: "win" }), mkMatch({ result: "win" }), mkMatch({ result: "lose" })];
  const r = winRate(matches);
  assert.equal(r.total, 3);
  assert.equal(r.wins, 2);
  assert.equal(r.losses, 1);
  assert.equal(r.rate, 2 / 3);
});

test("recentWinRate: 直近n戦だけを見る", () => {
  const matches = [
    mkMatch({ id: "1", date: "2026-09-01", result: "lose", createdAt: 1 }),
    mkMatch({ id: "2", date: "2026-09-02", result: "win", createdAt: 2 }),
    mkMatch({ id: "3", date: "2026-09-03", result: "win", createdAt: 3 }),
  ];
  const r = recentWinRate(matches, 2);
  assert.equal(r.total, 2);
  assert.equal(r.wins, 2);
});

test("currentStreak: 新しい順で同じ結果が続く数を数える", () => {
  const matches = [
    mkMatch({ id: "1", date: "2026-09-01", result: "win", createdAt: 1 }),
    mkMatch({ id: "2", date: "2026-09-02", result: "win", createdAt: 2 }),
    mkMatch({ id: "3", date: "2026-09-03", result: "lose", createdAt: 3 }),
  ];
  const s = currentStreak(matches);
  assert.equal(s.type, "lose");
  assert.equal(s.count, 1);
});

test("currentStreak: 記録なしなら count=0, type=null", () => {
  const s = currentStreak([]);
  assert.equal(s.type, null);
  assert.equal(s.count, 0);
});

test("topLossTags: 直近days日以内の負け理由タグを多い順に返す", () => {
  const now = new Date("2026-09-30T00:00:00");
  const matches = [
    mkMatch({ date: "2026-09-29", result: "lose", tags: ["復帰阻止された"] }),
    mkMatch({ date: "2026-09-28", result: "lose", tags: ["復帰阻止された", "崖攻めが弱い"] }),
    mkMatch({ date: "2026-01-01", result: "lose", tags: ["ステージ不利"] }), // 範囲外
    mkMatch({ date: "2026-09-27", result: "win", tags: [] }), // 勝ちは無視
  ];
  const top = topLossTags(matches, { days: 30, topN: 3, now });
  assert.deepEqual(top[0], { tag: "復帰阻止された", count: 2 });
  assert.ok(!top.some((t) => t.tag === "ステージ不利"));
});

test("weeklyWinRates: 週開始日の昇順で勝率を返す", () => {
  const matches = [
    mkMatch({ date: "2026-09-01", result: "win" }), // 火曜
    mkMatch({ date: "2026-09-08", result: "lose" }), // 翌週火曜
  ];
  const weeks = weeklyWinRates(matches);
  assert.equal(weeks.length, 2);
  assert.ok(weeks[0].week < weeks[1].week);
  assert.equal(weeks[0].rate, 1);
  assert.equal(weeks[1].rate, 0);
});

test("weekStartOf: 月曜始まりで週の開始日を返す", () => {
  // 2026-09-01 は火曜日
  assert.equal(weekStartOf("2026-09-01"), "2026-08-31");
  // 2026-08-31 は月曜日
  assert.equal(weekStartOf("2026-08-31"), "2026-08-31");
});

test("matchupStats: 自キャラ視点で相手ごとの勝率を集計し5戦未満はprovisional", () => {
  const matches = [
    mkMatch({ my: "マリオ", opponent: "リンク", result: "win" }),
    mkMatch({ my: "マリオ", opponent: "リンク", result: "lose" }),
    mkMatch({ my: "ルイージ", opponent: "リンク", result: "win" }), // 別キャラは無視
  ];
  const stats = matchupStats(matches, "マリオ");
  assert.equal(stats.length, 1);
  assert.equal(stats[0].opponent, "リンク");
  assert.equal(stats[0].total, 2);
  assert.equal(stats[0].provisional, true);
});

test("sortByWeakness: 勝率が低い順、provisionalは末尾", () => {
  const list = [
    { opponent: "A", total: 10, wins: 8, rate: 0.8, provisional: false },
    { opponent: "B", total: 10, wins: 2, rate: 0.2, provisional: false },
    { opponent: "C", total: 2, wins: 1, rate: 0.5, provisional: true },
  ];
  const sorted = sortByWeakness(list);
  assert.deepEqual(sorted.map((s) => s.opponent), ["B", "A", "C"]);
});
