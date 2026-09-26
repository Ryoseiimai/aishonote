import { isValidBirthdayName, saveState } from "./store.js";

/** giftは採用しない場合も現在の履歴から除去し、保存済みの名前は守る。 */
export function consumeGiftLink(state, browser = window, persist = saveState) {
  const url = new URL(browser.location.href);
  if (!url.searchParams.has("gift")) return state;
  const name = url.searchParams.get("gift");
  url.searchParams.delete("gift");
  browser.history.replaceState(browser.history.state, "", url.href);

  if (state.birthdayName || !isValidBirthdayName(name) || !name.trim()) return state;
  const next = { ...state, birthdayName: name.trim() };
  if (!persist(next)) throw new Error("お祝いの名前を保存できませんでした。");
  return next;
}
