import test from "node:test";
import assert from "node:assert/strict";
import { gameMenuEntries, isComingSoonGame, comingSoonGameDefinition, COMING_SOON_GAMES, COMING_SOON_NOTICE } from "../js/games.js";
import { emptyState, validateImport, fightersOf } from "../js/store.js";
import { isNativePlatform } from "../js/reference-display.js";

const labels = (entries) => entries.map((e) => e.label);

test("準備中のゲーム: Web版はスマブラの後ろに4本を「（準備中）」付きで並べる", () => {
  const entries = gameMenuEntries(emptyState().games, { isNative: false });
  assert.deepEqual(labels(entries), [
    "大乱闘スマッシュブラザーズ SPECIAL",
    "ストリートファイター6（準備中）",
    "鉄拳8（準備中）",
    "ポケモン対戦（準備中）",
    "マリオカート（準備中）",
  ]);
  assert.deepEqual(entries.map((e) => e.comingSoon), [false, true, true, true, true]);
  assert.deepEqual(entries.map((e) => e.saved), [true, false, false, false, false]);
});

test("準備中のゲーム: iOSアプリ内（Capacitorネイティブ）では一覧に出さない", () => {
  const nativeWin = { Capacitor: { isNativePlatform: () => true } };
  const isNative = isNativePlatform(nativeWin);
  assert.equal(isNative, true);
  assert.deepEqual(labels(gameMenuEntries(emptyState().games, { isNative })), ["大乱闘スマッシュブラザーズ SPECIAL"]);
  assert.equal(isComingSoonGame("sf6", { isNative }), false);
  // ブラウザ（Capacitorなし）は Web 版の扱い
  assert.equal(isNativePlatform({}), false);
  assert.equal(labels(gameMenuEntries(emptyState().games, { isNative: isNativePlatform({}) })).length, 5);
});

test("準備中のゲーム: 選んで保存された後は重複させず、iOSでは準備中の表示を付けない", () => {
  const games = { ...emptyState().games, sf6: comingSoonGameDefinition("sf6") };
  const web = gameMenuEntries(games, { isNative: false });
  assert.equal(web.filter((e) => e.id === "sf6").length, 1);
  assert.deepEqual(web.find((e) => e.id === "sf6"), { id: "sf6", label: "ストリートファイター6（準備中）", comingSoon: true, saved: true });
  const native = gameMenuEntries(games, { isNative: true });
  assert.deepEqual(native.find((e) => e.id === "sf6"), { id: "sf6", label: "ストリートファイター6", comingSoon: false, saved: true });
  assert.equal(native.length, 2);
});

test("準備中のゲーム: 判定・定義・案内文", () => {
  for (const g of COMING_SOON_GAMES) {
    assert.equal(isComingSoonGame(g.id), true);
    assert.deepEqual(comingSoonGameDefinition(g.id), { id: g.id, name: g.name, isPreset: false, customFighters: [] });
  }
  assert.equal(isComingSoonGame("ssbu"), false);
  assert.equal(isComingSoonGame("custom_1"), false);
  assert.equal(comingSoonGameDefinition("ssbu"), null);
  assert.equal(comingSoonGameDefinition("__proto__"), null);
  assert.equal(COMING_SOON_NOTICE, "このゲームのコーチは準備中です。記録と相性表はキャラ名を追加すれば使えます");
});

test("準備中のゲーム: キャラ名を追加すれば記録・相性表のデータとして保存/インポートできる", () => {
  const def = { ...comingSoonGameDefinition("tekken8"), customFighters: ["一八", "仁"] };
  const state = {
    ...emptyState(),
    games: { ...emptyState().games, tekken8: def },
    activeGameId: "tekken8",
    myFightersByGame: { ssbu: [], tekken8: ["一八"] },
    activeFighterByGame: { ssbu: null, tekken8: "一八" },
    matches: [{ id: "m1", gameId: "tekken8", date: "2026-09-27", my: "一八", opponent: "仁", result: "lose", tags: ["その他"], memo: "", createdAt: 1 }],
    matchups: { "tekken8__一八__仁": { mark: "bad", memo: "" } },
  };
  const result = validateImport(JSON.parse(JSON.stringify(state)));
  assert.equal(result.ok, true);
  assert.equal(result.data.activeGameId, "tekken8");
  assert.deepEqual(fightersOf(result.data.games.tekken8), ["一八", "仁"]);
  assert.equal(result.data.matches.length, 1);
});
