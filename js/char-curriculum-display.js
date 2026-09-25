import { SSBU_CHAR_CURRICULUM } from "./presets/ssbu-char-curriculum.js";
import { stageRate } from "./curriculum-stats.js";

/** キャラ専用メニューの表示データ。未選択・未対応・別ゲームはnull。DOM/保存処理に依存しない。 */
export function characterMenuView(gameId, fighter, progressSet) {
  if (gameId !== "ssbu" || !Object.hasOwn(SSBU_CHAR_CURRICULUM, fighter)) return null;
  const menu = SSBU_CHAR_CURRICULUM[fighter];
  return { items: menu.items, sources: menu.sources, rate: stageRate(menu, progressSet) };
}
