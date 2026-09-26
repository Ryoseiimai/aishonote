// ヘッダーのゲーム選択に出す一覧と「準備中」表示、ゲーム切替・マイキャラ設定の state 更新を決める純粋関数。
// DOM・localStorage に触れないので node:test で検証する（app.js は返ってきた patch を setState するだけ）。
// 準備中のゲームは選んだときに初めて state.games へ（プリセットではない普通のゲームとして）追加し、
// キャラを1体も足さずに別のゲームへ切り替えたら取り除く（選んだだけのゲームが消せずに残らないように）。
// iOSアプリ内では準備中のゲームを一覧に出さない（App Store 審査の「未完成・プレースホルダー」指摘を避けるため）。
// Web版で選んだだけの（キャラが無い）準備中ゲームがエクスポート→iOSでインポートされた場合も隠す。

import { DEFAULT_GAME_ID } from "./store.js";

/** キャラ診断ができるゲーム（スマブラだけ）。 */
export const DIAGNOSIS_GAME_ID = DEFAULT_GAME_ID;

export const COMING_SOON_GAMES = Object.freeze([
  { id: "sf6", name: "ストリートファイター6" },
  { id: "tekken8", name: "鉄拳8" },
  { id: "pokemon", name: "ポケモン対戦" },
  { id: "mariokart", name: "マリオカート" },
]);

export const COMING_SOON_NOTICE = "このゲームのコーチは準備中です。記録と相性表はキャラ名を追加すれば使えます";

const COMING_SOON_IDS = new Set(COMING_SOON_GAMES.map((g) => g.id));

/** 準備中のゲームか（iOSアプリ内では常に false＝準備中として扱わない）。 */
export function isComingSoonGame(gameId, { isNative = false } = {}) {
  return !isNative && COMING_SOON_IDS.has(gameId);
}

/** 準備中のゲームを選んだだけ（キャラが1体も無い）の保存済みゲームか。 */
export function isEmptyComingSoonGame(game) {
  return Boolean(game) && COMING_SOON_IDS.has(game.id) && !(game.customFighters || []).length;
}

/** 一覧に出す保存済みゲーム。iOSアプリ内では、選んだだけの準備中ゲーム（インポート由来）を隠す。 */
export function visibleGames(games, { isNative = false } = {}) {
  const list = Object.values(games || {});
  return isNative ? list.filter((g) => !isEmptyComingSoonGame(g)) : list;
}

/**
 * ゲーム選択の項目。保存済みのゲームはそのまま（準備中なら名前に「（準備中）」）、
 * まだ保存されていない準備中のゲームは Web 版だけ末尾に足す。
 * @returns {Array<{ id: string, label: string, comingSoon: boolean, saved: boolean }>}
 */
export function gameMenuEntries(games, { isNative = false } = {}) {
  const entries = visibleGames(games, { isNative }).map((g) => {
    const comingSoon = isComingSoonGame(g.id, { isNative });
    return { id: g.id, label: comingSoon ? `${g.name}（準備中）` : g.name, comingSoon, saved: true };
  });
  if (isNative) return entries;
  for (const g of COMING_SOON_GAMES) {
    if (games && Object.hasOwn(games, g.id)) continue;
    entries.push({ id: g.id, label: `${g.name}（準備中）`, comingSoon: true, saved: false });
  }
  return entries;
}

/** 準備中のゲームを初めて選んだときに state.games へ足す定義。準備中でない id は null。 */
export function comingSoonGameDefinition(gameId) {
  const game = COMING_SOON_GAMES.find((g) => g.id === gameId);
  return game ? { id: game.id, name: game.name, isPreset: false, customFighters: [] } : null;
}

function withoutGame(state, gameId) {
  const drop = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([id]) => id !== gameId));
  return { games: drop(state.games), myFightersByGame: drop(state.myFightersByGame), activeFighterByGame: drop(state.activeFighterByGame) };
}

/**
 * ゲームを切り替える state の差分。保存済みならそのまま切り替え、まだ保存していない準備中のゲームは
 * 定義を足してから切り替える。キャラの無い準備中ゲームから離れるときは、そのゲームを取り除く。
 * 選べないid（未保存かつ準備中でもない）は null。
 */
export function selectGamePatch(state, gameId) {
  if (gameId === state.activeGameId) return null;
  const saved = Object.hasOwn(state.games, gameId);
  const def = saved ? null : comingSoonGameDefinition(gameId);
  if (!saved && !def) return null;
  const leaving = state.games[state.activeGameId];
  const base = isEmptyComingSoonGame(leaving)
    ? withoutGame(state, leaving.id)
    : { games: state.games, myFightersByGame: state.myFightersByGame, activeFighterByGame: state.activeFighterByGame };
  if (saved) return { ...base, activeGameId: gameId };
  return {
    games: { ...base.games, [gameId]: def },
    myFightersByGame: { ...base.myFightersByGame, [gameId]: [] },
    activeFighterByGame: { ...base.activeFighterByGame, [gameId]: null },
    activeGameId: gameId,
  };
}

/** iOSアプリ内で、選択中のゲームが一覧から隠れる（または存在しない）ならスマブラに戻した state。変更が無ければ同じ参照。 */
export function nativeSafeState(state, { isNative = false } = {}) {
  if (!isNative) return state;
  const active = state.games[state.activeGameId];
  if (active && !isEmptyComingSoonGame(active)) return state;
  return { ...state, activeGameId: DEFAULT_GAME_ID };
}

/** 診断で選んだキャラをスマブラのマイキャラに加えて自キャラにし、スマブラへ切り替える差分。 */
export function makeMyFighterPatch(state, name) {
  const gameId = DIAGNOSIS_GAME_ID;
  const mine = state.myFightersByGame[gameId] || [];
  return {
    myFightersByGame: { ...state.myFightersByGame, [gameId]: mine.includes(name) ? mine : [...mine, name] },
    activeFighterByGame: { ...state.activeFighterByGame, [gameId]: name },
    activeGameId: gameId,
  };
}

/** 描画前に診断画面を開いたままにしてよいか。スマブラ以外、または結果画面なのに結果が無ければ閉じる（null）。 */
export function diagnosisViewFor(view, { activeGameId, hasResult }) {
  if (!view) return null;
  if (activeGameId !== DIAGNOSIS_GAME_ID) return null;
  if (view === "result" && !hasResult) return null;
  return view;
}
