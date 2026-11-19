// 「準備中」のゲームでキャラ名の候補ボタンを出すための純粋関数。DOM・localStorageに触れないので node:test で検証する。
// 対応範囲: 名前の候補一覧だけ。相性・練習メニューのデータは持たない（coming soon のコーチ機能は引き続き準備中）。
// 候補の追加は既存の customFighters の仕組みに乗せる（state のスキーマ・検証は変えない）。

import { SF6_FIGHTERS } from "./presets/sf6-fighters.js";

// gameId -> キャラ名候補一覧。候補を持たないゲームはここに無い。
const FIGHTER_PRESETS_BY_GAME = Object.freeze({
  sf6: SF6_FIGHTERS,
});

/** そのゲームにキャラ名の候補があるか。 */
export function hasFighterPreset(gameId) {
  return Object.hasOwn(FIGHTER_PRESETS_BY_GAME, gameId);
}

/** まだ追加されていない候補名だけを返す（追加済みの名前は出さない）。候補を持たないゲームは空配列。 */
export function fighterPresetSuggestions(gameId, existingFighters) {
  const presets = FIGHTER_PRESETS_BY_GAME[gameId];
  if (!presets) return [];
  const existing = new Set(existingFighters || []);
  return presets.filter((name) => !existing.has(name));
}
