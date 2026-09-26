// ヘッダーのゲーム選択に出す一覧と「準備中」表示を決める純粋関数。DOM・localStorage に触れない。
// 準備中のゲームは選んだときに初めて state.games へ（プリセットではない普通のゲームとして）追加する。
// iOSアプリ内では準備中のゲームを一覧に出さない（App Store 審査の「未完成・プレースホルダー」指摘を避けるため）。

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

/**
 * ゲーム選択の項目。保存済みのゲームはそのまま（準備中なら名前に「（準備中）」）、
 * まだ保存されていない準備中のゲームは Web 版だけ末尾に足す。
 * @returns {Array<{ id: string, label: string, comingSoon: boolean, saved: boolean }>}
 */
export function gameMenuEntries(games, { isNative = false } = {}) {
  const entries = Object.values(games || {}).map((g) => {
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
