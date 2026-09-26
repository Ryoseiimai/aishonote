import { experience } from "./progression.js";
import { isValidBirthdayName } from "./store.js";

export function isBirthdayPreview(search = "") {
  return new URLSearchParams(search).get("bday") === "1";
}

/** UTCではなく端末の月日で判定。閉じるまでは次の起動でも表示する。 */
export function shouldShowBirthday(state, now = new Date(), search = "") {
  return isBirthdayPreview(search) || (
    now.getMonth() === 9 && now.getDate() === 15 &&
    state.birthdayDismissedYear !== now.getFullYear()
  );
}

/** プレビューを閉じても本番のお祝いを消費しない。 */
export function birthdayDismissalPatch(now, search = "") {
  return isBirthdayPreview(search) ? {} : { birthdayDismissedYear: now.getFullYear() };
}

export function birthdayHeading(name = "") {
  const displayName = isValidBirthdayName(name) ? name.trim() : "";
  return `${displayName ? `${displayName}、` : ""}お誕生日おめでとう！`;
}

/** チェックには日付がないので現在の記録を使用。未来日の練習は含めない。 */
export function birthdaySummary(state, now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const practiceLog = Object.fromEntries(Object.entries(state.practiceLog || {}).filter(([date]) => date <= today));
  const { minutes, checks, level } = experience({ progress: state.progress, practiceLog });
  return minutes || checks ? `これまでの練習：合計${minutes}分・チェック${checks}個・Lv${level}` : "";
}
