import test from "node:test";
import assert from "node:assert/strict";
import { MATCHUP_REFERENCE } from "../js/presets/matchup-reference.js";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";

test("MATCHUP_REFERENCE: ネスのgood/badキャラ名はfighters.js(SSBU_FIGHTERS)に実在する", () => {
  const fighterSet = new Set(SSBU_FIGHTERS);
  const ref = MATCHUP_REFERENCE["ネス"];
  assert.ok(ref, "ネスのデータが存在する");
  for (const item of [...ref.good, ...ref.bad]) {
    assert.ok(fighterSet.has(item.name), `${item.name} はSSBU_FIGHTERSに存在するべき`);
    assert.ok(typeof item.note === "string" && item.note.length > 0, `${item.name} にnoteがあるべき`);
  }
});

test("MATCHUP_REFERENCE: good/badに重複キャラがない", () => {
  const ref = MATCHUP_REFERENCE["ネス"];
  const goodNames = new Set(ref.good.map((x) => x.name));
  for (const b of ref.bad) {
    assert.ok(!goodNames.has(b.name), `${b.name} がgoodとbad両方に入っている`);
  }
});

test("MATCHUP_REFERENCE: sourcesはhttpsのURL配列", () => {
  const ref = MATCHUP_REFERENCE["ネス"];
  assert.ok(Array.isArray(ref.sources) && ref.sources.length >= 1);
  for (const url of ref.sources) {
    assert.match(url, /^https:\/\//);
  }
});
