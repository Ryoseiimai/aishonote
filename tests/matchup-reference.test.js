import test from "node:test";
import assert from "node:assert/strict";
import { MATCHUP_REFERENCE } from "../js/presets/matchup-reference.js";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";

const fighterSet = new Set(SSBU_FIGHTERS);

test("MATCHUP_REFERENCE: 収録キーはすべてSSBU_FIGHTERSに存在し、全86体を網羅する", () => {
  assert.deepEqual(Object.keys(MATCHUP_REFERENCE).sort(), [...SSBU_FIGHTERS].sort());
});

test("MATCHUP_REFERENCE: 全キャラのgood/badに1〜6件の実在する相手と統計勝率帯がある", () => {
  for (const [my, ref] of Object.entries(MATCHUP_REFERENCE)) {
    assert.ok(fighterSet.has(my), my);
    for (const kind of ["good", "bad"]) {
      assert.ok(Array.isArray(ref[kind]) && ref[kind].length >= 1 && ref[kind].length <= 6, `${my}: ${kind}`);
      for (const item of ref[kind]) {
        assert.ok(fighterSet.has(item.name), `${my}: ${item.name}`);
        assert.notEqual(item.name, my, `${my}: 自分自身を含まない`);
        // noteは区分だけ。統合5組のときだけ合算注記を括弧で付ける（期・統計の文言は画面の説明文に集約）。
        assert.match(item.note, /^(?:有利|微有利|不利|微不利|五分)(?:（(?:自キャラ|相手): [^（）]+合算(?:・相手: [^（）]+合算)?）)?$/);
        assert.ok(item.note.length <= 500, `${my}: noteの長さ`);
        assert.ok(!item.note.includes("n="), "非公開の対戦数を作らない");
      }
    }
  }
});

test("MATCHUP_REFERENCE: 各キャラのgood/badの内部・両方に重複する相手がいない", () => {
  for (const [my, ref] of Object.entries(MATCHUP_REFERENCE)) {
    const names = [...ref.good, ...ref.bad].map((item) => item.name);
    assert.equal(new Set(names).size, names.length, my);
  }
});

test("MATCHUP_REFERENCE: 全キャラのsourcesはhttpsのURL配列", () => {
  for (const [my, ref] of Object.entries(MATCHUP_REFERENCE)) {
    assert.ok(Array.isArray(ref.sources) && ref.sources.length >= 1, my);
    for (const source of ref.sources) assert.equal(new URL(source).protocol, "https:", my);
  }
});

test("MATCHUP_REFERENCE: 合算5組は同じ出典を持ち、合算対象を表示する", () => {
  for (const [a, b] of [["サムス", "ダークサムス"], ["ピーチ", "デイジー"], ["マルス", "ルキナ"], ["ピット", "ブラックピット"], ["シモン", "リヒター"]]) {
    assert.deepEqual(MATCHUP_REFERENCE[a], MATCHUP_REFERENCE[b]);
    for (const item of [...MATCHUP_REFERENCE[a].good, ...MATCHUP_REFERENCE[a].bad]) {
      assert.ok(item.note.includes(`自キャラ: ${a}／${b}合算`));
      assert.ok(![a, b].includes(item.name));
    }
  }
});
