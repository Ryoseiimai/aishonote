import test from "node:test";
import assert from "node:assert/strict";
import { validateImport, sanitizeMatch, isValidFighterName, fightersOf, MAX_NAME_LEN, DEFAULT_GAME_ID } from "../js/store.js";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";

function validBase() {
  return {
    version: 2,
    games: {
      [DEFAULT_GAME_ID]: {
        id: DEFAULT_GAME_ID,
        name: "大乱闘スマッシュブラザーズ SPECIAL",
        isPreset: true,
        customFighters: [],
      },
    },
    activeGameId: DEFAULT_GAME_ID,
    myFightersByGame: { [DEFAULT_GAME_ID]: ["マリオ"] },
    activeFighterByGame: { [DEFAULT_GAME_ID]: "マリオ" },
    matches: [
      {
        id: "m1",
        gameId: DEFAULT_GAME_ID,
        date: "2026-09-01",
        my: "マリオ",
        opponent: "リンク",
        result: "win",
        tags: [],
        memo: "テスト",
        createdAt: 123,
      },
    ],
    matchups: {
      [`${DEFAULT_GAME_ID}__マリオ__リンク`]: { mark: "good", memo: "得意" },
    },
  };
}

test("validateImport: 正常系はokかつデータを返す", () => {
  const r = validateImport(validBase());
  assert.equal(r.ok, true);
  assert.equal(r.data.matches.length, 1);
  assert.equal(r.data.myFightersByGame[DEFAULT_GAME_ID][0], "マリオ");
});

test("validateImport: ルートがオブジェクトでなければ失敗", () => {
  const r = validateImport([1, 2, 3]);
  assert.equal(r.ok, false);
  assert.ok(r.errors.length > 0);
});

test("validateImport: versionが不正なら失敗", () => {
  const data = { ...validBase(), version: 1 };
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: matchesが配列でなければ失敗", () => {
  const data = { ...validBase(), matches: "not-array" };
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: 存在しないキャラ名は不正として失敗", () => {
  const data = validBase();
  data.matches[0].my = "存在しないキャラ";
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: 存在しないgameIdの対戦ログは失敗", () => {
  const data = validBase();
  data.matches[0].gameId = "unknown_game";
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: resultがwin/lose以外なら失敗", () => {
  const data = validBase();
  data.matches[0].result = "draw";
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: 許可されていないタグは失敗", () => {
  const data = validBase();
  data.matches[0].tags = ["謎のタグ"];
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: matchesが上限件数を超えたら失敗", () => {
  const data = validBase();
  data.matches = new Array(10001).fill(0).map((_, i) => ({
    id: `m${i}`,
    gameId: DEFAULT_GAME_ID,
    date: "2026-09-01",
    my: "マリオ",
    opponent: "リンク",
    result: "win",
    tags: [],
    memo: "",
    createdAt: i,
  }));
  const r = validateImport(data);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("10000")));
});

test("validateImport: 許可キー以外は捨てられる", () => {
  const data = validBase();
  data.evilKey = "should be dropped";
  const r = validateImport(data);
  assert.equal(r.ok, true);
  assert.equal(r.data.evilKey, undefined);
});

test("validateImport: カスタムゲーム+カスタムキャラの正常系", () => {
  const data = {
    version: 2,
    games: {
      custom_1: { id: "custom_1", name: "自作対戦ゲーム", isPreset: false, customFighters: ["キャラA", "キャラB"] },
    },
    activeGameId: "custom_1",
    myFightersByGame: { custom_1: ["キャラA"] },
    activeFighterByGame: { custom_1: "キャラA" },
    matches: [
      {
        id: "m1",
        gameId: "custom_1",
        date: "2026-09-01",
        my: "キャラA",
        opponent: "キャラB",
        result: "lose",
        tags: ["その他"],
        memo: "",
        createdAt: 1,
      },
    ],
    matchups: {},
  };
  const r = validateImport(data);
  assert.equal(r.ok, true);
});

test("validateImport: カスタムキャラ名が51字なら失敗", () => {
  const data = {
    version: 2,
    games: {
      custom_1: { id: "custom_1", name: "自作対戦ゲーム", isPreset: false, customFighters: ["a".repeat(51)] },
    },
    activeGameId: "custom_1",
    myFightersByGame: {},
    activeFighterByGame: {},
    matches: [],
    matchups: {},
  };
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: 未知のプリセットゲームIDは失敗", () => {
  const data = {
    version: 2,
    games: { fake_preset: { id: "fake_preset", name: "偽プリセット", isPreset: true, customFighters: [] } },
    activeGameId: "fake_preset",
    myFightersByGame: {},
    activeFighterByGame: {},
    matches: [],
    matchups: {},
  };
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("isValidFighterName: 1〜50字ならtrue、0字・51字・非文字列はfalse", () => {
  assert.equal(isValidFighterName("マリオ"), true);
  assert.equal(isValidFighterName("a".repeat(MAX_NAME_LEN)), true);
  assert.equal(isValidFighterName(""), false);
  assert.equal(isValidFighterName("a".repeat(MAX_NAME_LEN + 1)), false);
  assert.equal(isValidFighterName(123), false);
});

test("fightersOf: プリセットゲームはSSBU_FIGHTERS+customFightersを返す", () => {
  const game = { id: DEFAULT_GAME_ID, isPreset: true, customFighters: ["オリキャラ"] };
  const list = fightersOf(game);
  assert.equal(list.length, SSBU_FIGHTERS.length + 1);
  assert.ok(list.includes("マリオ"));
  assert.ok(list.includes("オリキャラ"));
});

test("fightersOf: カスタムゲームはcustomFightersのみを返す", () => {
  const game = { id: "custom_1", isPreset: false, customFighters: ["A", "B"] };
  assert.deepEqual(fightersOf(game), ["A", "B"]);
});

test("sanitizeMatch: gameIdが未知なら不正", () => {
  const fighterSetByGame = new Map([[DEFAULT_GAME_ID, new Set(["マリオ", "リンク"])]]);
  const m = {
    id: "m1",
    gameId: "unknown",
    date: "2026-09-01",
    my: "マリオ",
    opponent: "リンク",
    result: "win",
    tags: [],
    memo: "",
    createdAt: 1,
  };
  assert.equal(sanitizeMatch(m, fighterSetByGame), null);
});

test("sanitizeMatch: 日付形式が不正なら弾く", () => {
  const fighterSetByGame = new Map([[DEFAULT_GAME_ID, new Set(["マリオ", "リンク"])]]);
  const m = {
    id: "m1",
    gameId: DEFAULT_GAME_ID,
    date: "2026/09/01",
    my: "マリオ",
    opponent: "リンク",
    result: "win",
    tags: [],
    memo: "",
    createdAt: 1,
  };
  assert.equal(sanitizeMatch(m, fighterSetByGame), null);
});

test("validateImport: gamesのキーが__proto__ならgameIdの許可文字制限で拒否される", () => {
  const data = JSON.parse(
    '{"version":2,"games":{"__proto__":{"id":"__proto__","name":"x","isPreset":false,"customFighters":[]}},"activeGameId":"__proto__","myFightersByGame":{},"activeFighterByGame":{},"matches":[],"matchups":{}}'
  );
  const r = validateImport(data);
  assert.equal(r.ok, false);
});

test("validateImport: matchupsのキーに__proto__/constructor/prototypeが含まれても拒否またはスキップされ、Object.prototypeは汚染されない", () => {
  const data = validBase();
  const raw = JSON.parse(JSON.stringify(data));
  // JSON.parseは "__proto__" を通常の自プロパティとして保持する(プロトタイプは書き換わらない)
  raw.matchups = JSON.parse(
    `{"__proto__":{"mark":"bad","memo":"polluted"},"constructor":{"mark":"bad","memo":"polluted"},"${DEFAULT_GAME_ID}__マリオ__リンク":{"mark":"good","memo":"ok"}}`
  );
  const before = {}.polluted;
  const r = validateImport(raw);
  assert.equal(r.ok, true);
  // 汚染されていないことを確認
  assert.equal({}.polluted, before);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(Object.getPrototypeOf(r.data.matchups), null);
  assert.equal(r.data.matchups[`${DEFAULT_GAME_ID}__マリオ__リンク`].mark, "good");
  // __proto__ / constructor というキー名で危険な代入をしていないことを確認
  assert.equal(Object.prototype.hasOwnProperty.call(r.data.matchups, "__proto__"), false);
});

test("validateImport: gameIdに__proto__/constructor/prototypeを含むmyFightersByGame/activeFighterByGameは無視されプロトタイプを汚染しない", () => {
  const data = validBase();
  const raw = JSON.parse(JSON.stringify(data));
  raw.myFightersByGame = JSON.parse('{"__proto__":["マリオ"],"constructor":["マリオ"]}');
  raw.activeFighterByGame = JSON.parse('{"__proto__":"マリオ","prototype":"マリオ"}');
  const r = validateImport(raw);
  assert.equal(r.ok, true);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(Array.isArray(({}).__proto__), false);
  assert.equal(Object.getPrototypeOf(r.data.myFightersByGame), null);
  assert.equal(Object.getPrototypeOf(r.data.activeFighterByGame), null);
});
