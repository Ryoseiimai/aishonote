import test from "node:test";
import assert from "node:assert/strict";
import { gameMenuEntries, isComingSoonGame, comingSoonGameDefinition, COMING_SOON_GAMES, COMING_SOON_NOTICE, visibleGames, selectGamePatch, nativeSafeState, makeMyFighterPatch, diagnosisViewFor, isEmptyComingSoonGame } from "../js/games.js";
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

test("準備中のゲーム: 選んで保存された後は重複させない。iOSではキャラの無い準備中ゲーム（インポート由来）を出さない", () => {
  const games = { ...emptyState().games, sf6: comingSoonGameDefinition("sf6") };
  const web = gameMenuEntries(games, { isNative: false });
  assert.equal(web.filter((e) => e.id === "sf6").length, 1);
  assert.deepEqual(web.find((e) => e.id === "sf6"), { id: "sf6", label: "ストリートファイター6（準備中）", comingSoon: true, saved: true });
  // 選んだだけ（キャラ0体）の sf6 は iOS の一覧・設定のゲーム一覧に出さない
  assert.equal(isEmptyComingSoonGame(games.sf6), true);
  assert.deepEqual(labels(gameMenuEntries(games, { isNative: true })), ["大乱闘スマッシュブラザーズ SPECIAL"]);
  assert.deepEqual(visibleGames(games, { isNative: true }).map((g) => g.id), ["ssbu"]);
  assert.deepEqual(visibleGames(games, { isNative: false }).map((g) => g.id), ["ssbu", "sf6"]);
  // キャラを足して記録に使っている sf6 は、iOSでは準備中の表示なしの普通のゲームとして出す
  const used = { ...games, sf6: { ...games.sf6, customFighters: ["リュウ"] } };
  const native = gameMenuEntries(used, { isNative: true });
  assert.deepEqual(native.find((e) => e.id === "sf6"), { id: "sf6", label: "ストリートファイター6", comingSoon: false, saved: true });
  assert.equal(native.length, 2);
});

test("準備中のゲーム: iOSで隠れるゲームが選択中のままインポートされたら、スマブラに戻す", () => {
  const imported = {
    ...emptyState(),
    games: { ...emptyState().games, sf6: comingSoonGameDefinition("sf6") },
    activeGameId: "sf6",
    myFightersByGame: { ssbu: [], sf6: [] },
    activeFighterByGame: { ssbu: null, sf6: null },
  };
  const result = validateImport(JSON.parse(JSON.stringify(imported)));
  assert.equal(result.ok, true);
  assert.equal(result.data.activeGameId, "sf6");
  assert.equal(nativeSafeState(result.data, { isNative: true }).activeGameId, "ssbu");
  // Web版はそのまま（同じ参照）
  assert.equal(nativeSafeState(result.data, { isNative: false }), result.data);
  // キャラがあるゲームは iOS でも選んだまま
  const used = { ...result.data, games: { ...result.data.games, sf6: { ...result.data.games.sf6, customFighters: ["リュウ"] } } };
  assert.equal(nativeSafeState(used, { isNative: true }), used);
});

test("ゲーム切替: 未保存の準備中ゲームは選んだときに追加し、キャラ0体のまま離れたら取り除く", () => {
  const start = emptyState();
  const toSf6 = selectGamePatch(start, "sf6");
  assert.deepEqual(toSf6, {
    games: { ...start.games, sf6: comingSoonGameDefinition("sf6") },
    myFightersByGame: { ssbu: [], sf6: [] },
    activeFighterByGame: { ssbu: null, sf6: null },
    activeGameId: "sf6",
  });
  const onSf6 = { ...start, ...toSf6 };
  // sf6 → 鉄拳8: 空の sf6 は消え、tekken8 が追加される
  const toTekken = selectGamePatch(onSf6, "tekken8");
  assert.deepEqual(Object.keys(toTekken.games), ["ssbu", "tekken8"]);
  assert.deepEqual(Object.keys(toTekken.myFightersByGame), ["ssbu", "tekken8"]);
  assert.deepEqual(Object.keys(toTekken.activeFighterByGame), ["ssbu", "tekken8"]);
  assert.equal(toTekken.activeGameId, "tekken8");
  // sf6 → スマブラ: 空の sf6 は消える
  const back = selectGamePatch(onSf6, "ssbu");
  assert.deepEqual(Object.keys(back.games), ["ssbu"]);
  assert.equal(back.activeGameId, "ssbu");
  // キャラを足した sf6 からは、離れても残る
  const usedSf6 = { ...onSf6, games: { ...onSf6.games, sf6: { ...onSf6.games.sf6, customFighters: ["リュウ"] } } };
  assert.deepEqual(Object.keys(selectGamePatch(usedSf6, "ssbu").games), ["ssbu", "sf6"]);
  // 同じゲーム・知らないidは何もしない
  assert.equal(selectGamePatch(start, "ssbu"), null);
  assert.equal(selectGamePatch(start, "nope"), null);
  assert.equal(selectGamePatch(start, "__proto__"), null);
  // 元の state は書き換えない
  assert.deepEqual(Object.keys(onSf6.games), ["ssbu", "sf6"]);
});

test("マイキャラ設定: 診断のキャラをスマブラのマイキャラに加え（重複なし）、スマブラへ切り替える", () => {
  const onTekken = {
    ...emptyState(),
    games: { ...emptyState().games, tekken8: { ...comingSoonGameDefinition("tekken8"), customFighters: ["一八"] } },
    activeGameId: "tekken8",
    myFightersByGame: { ssbu: ["マリオ"], tekken8: ["一八"] },
    activeFighterByGame: { ssbu: "マリオ", tekken8: "一八" },
  };
  const patch = makeMyFighterPatch(onTekken, "リンク");
  assert.equal(patch.activeGameId, "ssbu");
  assert.deepEqual(patch.myFightersByGame, { ssbu: ["マリオ", "リンク"], tekken8: ["一八"] });
  assert.deepEqual(patch.activeFighterByGame, { ssbu: "リンク", tekken8: "一八" });
  const again = makeMyFighterPatch({ ...onTekken, ...patch }, "リンク");
  assert.deepEqual(again.myFightersByGame.ssbu, ["マリオ", "リンク"]);
});

test("診断画面: スマブラ以外、または結果画面なのに結果が無ければ描画前に閉じる", () => {
  assert.equal(diagnosisViewFor(null, { activeGameId: "ssbu", hasResult: true }), null);
  assert.equal(diagnosisViewFor("quiz", { activeGameId: "ssbu", hasResult: false }), "quiz");
  assert.equal(diagnosisViewFor("result", { activeGameId: "ssbu", hasResult: true }), "result");
  assert.equal(diagnosisViewFor("result", { activeGameId: "ssbu", hasResult: false }), null);
  assert.equal(diagnosisViewFor("quiz", { activeGameId: "sf6", hasResult: true }), null);
  assert.equal(diagnosisViewFor("result", { activeGameId: "custom_1", hasResult: true }), null);
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
