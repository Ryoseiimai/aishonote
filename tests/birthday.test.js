import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { shouldShowBirthday, isBirthdayPreview, birthdayDismissalPatch, birthdayHeading, birthdaySummary } from "../js/birthday.js";
import { emptyState, validateImport, saveState, loadState, STORAGE_KEY } from "../js/store.js";
import { SSBU_CURRICULUM } from "../js/presets/ssbu-curriculum.js";

const birthday = (year = 2026) => new Date(year, 9, 15, 12);
const check = SSBU_CURRICULUM.roadmap[0].items[0].id;

test("お祝い: 毎年10/15だけ表示し、前後の日・月は表示しない", () => {
  for (const year of [2026, 2027, 2028]) {
    assert.equal(shouldShowBirthday(emptyState(), birthday(year)), true);
    for (const date of [new Date(year, 9, 14, 23, 59), new Date(year, 9, 16), new Date(year, 8, 15), new Date(year, 10, 15)]) {
      assert.equal(shouldShowBirthday(emptyState(), date), false);
    }
    assert.equal(shouldShowBirthday(emptyState(), new Date(year, 9, 15)), true);
    assert.equal(shouldShowBirthday(emptyState(), new Date(year, 9, 15, 23, 59)), true);
  }
});

test("お祝い: UTCとの日付境界でも端末の日付を使う", () => {
  for (const [zone, timestamp, expected] of [
    ["Asia/Tokyo", "2026-10-14T15:00:00Z", true],
    ["Asia/Tokyo", "2026-10-15T15:00:00Z", false],
    ["America/Los_Angeles", "2026-10-15T06:59:00Z", false],
    ["America/Los_Angeles", "2026-10-16T06:59:00Z", true],
  ]) {
    const source = `import { shouldShowBirthday } from ${JSON.stringify(new URL("../js/birthday.js", import.meta.url).href)};
      process.stdout.write(String(shouldShowBirthday({}, new Date(${JSON.stringify(timestamp)}))));`;
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", source], { env: { ...process.env, TZ: zone }, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, String(expected), `${zone}: ${timestamp}`);
  }
});

test("お祝い: 閉じるまでは表示し、その年は閉じた後の再起動で表示しない", (t) => {
  const storage = new Map();
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: {
    setItem: (key, value) => storage.set(key, value), getItem: (key) => storage.get(key),
  } };
  t.after(() => { globalThis.window = previousWindow; });
  const state = emptyState();
  saveState(state);
  assert.equal(shouldShowBirthday(loadState(), birthday()), true);
  assert.equal(shouldShowBirthday(loadState(), birthday()), true);
  saveState({ ...state, ...birthdayDismissalPatch(birthday()) });
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).birthdayDismissedYear, 2026);
  const loaded = loadState();
  assert.equal(shouldShowBirthday(loaded, birthday()), false);
  assert.equal(shouldShowBirthday(loaded, birthday(2027)), true);
});

test("お祝い: bday=1は日付・閉じた年を問わず表示、プレビューでは閉じた年を変えない", () => {
  const state = { ...emptyState(), birthdayDismissedYear: 2026 };
  for (const now of [birthday(), new Date(2026, 0, 1)]) {
    assert.equal(shouldShowBirthday(state, now, "?bday=1"), true);
    assert.deepEqual(birthdayDismissalPatch(now, "?bday=1"), {});
  }
  assert.equal(isBirthdayPreview("?other=ok&bday=1"), true);
  for (const search of ["", "?bday=0", "?bday=true", "?bday=11", "?other=bday=1"]) {
    assert.equal(shouldShowBirthday(state, birthday(), search), false);
  }
});

test("お祝い: 省略・空欄は名前なし、指定名は読点でつなぐ", () => {
  for (const name of [undefined, "", "  ", null, "あ".repeat(21)]) {
    assert.equal(birthdayHeading(name), "お誕生日おめでとう！");
  }
  assert.equal(birthdayHeading("  テスト  "), "テスト、お誕生日おめでとう！");
});

test("お祝い: 当日までの練習・既知チェック・同じXP規則のLvを表示", () => {
  const state = { ...emptyState(), progress: [check, check, "unknown"], practiceLog: {
    "2025-10-15": 10, "2026-10-14": 20, "2026-10-15": 10, "2026-10-16": 1440,
  } };
  assert.equal(birthdaySummary(state, birthday()), "これまでの練習：合計40分・チェック1個・Lv2");
  assert.equal(state.practiceLog["2026-10-16"], 1440);
});

test("お祝い: 記録ゼロなら非表示、分数かチェックがあれば表示", () => {
  assert.equal(birthdaySummary(emptyState(), birthday()), "");
  assert.equal(birthdaySummary({ practiceLog: { "2026-10-15": 0, "2026-10-16": 30 }, progress: ["unknown"] }, birthday()), "");
  assert.equal(birthdaySummary({ progress: [check] }, birthday()), "これまでの練習：合計0分・チェック1個・Lv1");
  assert.equal(birthdaySummary({ practiceLog: { "2026-10-15": 1 } }, birthday()), "これまでの練習：合計1分・チェック0個・Lv1");
});

test("お祝い: 保存スキーマを通した閉じた年が翌年のお祝いを妨げない", () => {
  const result = validateImport({ ...emptyState(), birthdayDismissedYear: 2026 });
  assert.equal(result.ok, true);
  assert.equal(shouldShowBirthday(result.data, birthday(2027)), true);
});
