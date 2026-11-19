import test from "node:test";
import assert from "node:assert/strict";
import { hasFighterPreset, fighterPresetSuggestions } from "../js/fighter-preset-display.js";
import { SF6_FIGHTERS } from "../js/presets/sf6-fighters.js";
import { isValidFighterName, MAX_NAME_LEN } from "../js/store.js";

test("キャラ名プリセット: ストリートファイター6は32体、重複なしで全て1〜50字", () => {
  assert.equal(SF6_FIGHTERS.length, 32);
  assert.equal(new Set(SF6_FIGHTERS).size, SF6_FIGHTERS.length);
  for (const name of SF6_FIGHTERS) {
    assert.equal(isValidFighterName(name), true, `${name} はキャラ名として無効`);
    assert.ok(name.length <= MAX_NAME_LEN);
  }
});

test("hasFighterPreset: 候補があるゲームだけ true", () => {
  assert.equal(hasFighterPreset("sf6"), true);
  assert.equal(hasFighterPreset("tekken8"), false);
  assert.equal(hasFighterPreset("ssbu"), false);
  assert.equal(hasFighterPreset("nope"), false);
});

test("fighterPresetSuggestions: 候補の無いゲームは空配列", () => {
  assert.deepEqual(fighterPresetSuggestions("tekken8", []), []);
  assert.deepEqual(fighterPresetSuggestions("ssbu", []), []);
});

test("fighterPresetSuggestions: 候補があるゲームは全件返し、追加済みの名前は除く", () => {
  const all = fighterPresetSuggestions("sf6", []);
  assert.deepEqual(all, SF6_FIGHTERS);

  const withSome = fighterPresetSuggestions("sf6", ["リュウ", "ケン"]);
  assert.equal(withSome.includes("リュウ"), false);
  assert.equal(withSome.includes("ケン"), false);
  assert.equal(withSome.length, SF6_FIGHTERS.length - 2);

  // customFighters 由来のカスタム名が混じっても候補側には影響しない
  const withCustom = fighterPresetSuggestions("sf6", ["リュウ", "自作キャラ"]);
  assert.equal(withCustom.includes("リュウ"), false);
  assert.equal(withCustom.includes("自作キャラ"), false);
  assert.equal(withCustom.length, SF6_FIGHTERS.length - 1);
});

test("fighterPresetSuggestions: existingFighters が無い/空でも例外にならない", () => {
  assert.deepEqual(fighterPresetSuggestions("sf6", undefined), SF6_FIGHTERS);
  assert.deepEqual(fighterPresetSuggestions("sf6", null), SF6_FIGHTERS);
});
