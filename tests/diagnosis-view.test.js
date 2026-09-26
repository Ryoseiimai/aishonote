import test from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS } from "../js/diagnosis-questions.js";
import { diagnose } from "../js/diagnosis.js";
import { diagnosisResult, tremoExplainer, starLabel, DIAGNOSIS_DISCLAIMER } from "../js/diagnosis-view.js";

// 最小のDOMダブル（tests/pixel-view.test.js と同じ形）。テキストと属性だけを検査する。
class Node extends EventTarget {
  constructor(tag, text = "") { super(); this.tag = tag; this.text = text; this.attrs = {}; this.children = []; this.dataset = {}; this.style = {}; }
  setAttribute(key, value) { this.attrs[key] = value; }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
}
const previousDocument = globalThis.document;
globalThis.document = {
  createElement: (tag) => new Node(tag),
  createElementNS: (_ns, tag) => new Node(tag),
  createTextNode: (value) => new Node("#text", value),
};
test.after(() => { globalThis.document = previousDocument; });
const flatten = (node) => [node, ...node.children.flatMap(flatten)];
const allText = (node) => flatten(node).map((item) => item.text).join("");
const byClass = (node, cls) => flatten(node).filter((n) => (n.className || "").split(" ").includes(cls));

const answersOf = (indexes) => Object.fromEntries(QUESTIONS.map((q, i) => [q.id, indexes[i]]));
const neutral = answersOf(QUESTIONS.map((q) => Math.floor((q.options.length - 1) / 2)));
const noop = () => {};
const view = (result, extra = {}) => diagnosisResult({
  result, focus: result.picks[0]?.name, focusMenu: null, roadmapStep: null, activeFighter: null, status: "", date: "2026-09-27",
  onFocus: noop, onMakeMine: noop, onOpenMenu: noop, onRetry: noop, onClose: noop, ...extra,
});

test("結果画面: 目安である旨を折りたたみの外に常に出し、タイプ名は「傾向」として言う", () => {
  const node = view(diagnose(answersOf([0, 0, 0, 0, 4, 2, 0, 4, 0, 2])));
  const disclaimer = byClass(node, "diag-disclaimer");
  assert.equal(disclaimer.length, 1);
  assert.equal(allText(disclaimer[0]), DIAGNOSIS_DISCLAIMER);
  // details（折りたたみ）の中ではない
  for (let n = disclaimer[0]; n; n = n.parent) assert.notEqual(n.tag, "details");
  assert.match(allText(node), /傾向としては「突撃スピードスター」タイプ寄り！/);
  assert.doesNotMatch(allText(node), /あなたは「/);
});

test("結果画面: 全問「どちらでもない」は、バッジ・太字で片側を強調せずオールラウンダーと出す", () => {
  const node = view(diagnose(neutral));
  assert.match(allText(node), /あなたの傾向は「オールラウンダー」/);
  assert.doesNotMatch(allText(node), /突撃スピードスター/);
  assert.equal(byClass(node, "strong").length, 0);
  const badges = byClass(node, "badge");
  assert.equal(badges.length, 4);
  for (const b of badges) assert.match(allText(b), /のバランス$/);
});

test("結果画面: 「相性NN%」を出さず、おすすめ度を★3段階で出す", () => {
  const result = diagnose(neutral);
  const node = view(result);
  assert.doesNotMatch(allText(node), /相性\d+%|\d+%/);
  const stars = byClass(node, "pick-stars");
  assert.equal(stars.length, 3);
  stars.forEach((s, i) => {
    assert.equal(s.attrs["aria-label"], `おすすめ度 3段階中${result.picks[i].stars}`);
    assert.match(allText(s), new RegExp(`おすすめ度${starLabel(result.picks[i].stars)}`));
  });
  assert.equal(starLabel(3), "★★★");
  assert.equal(starLabel(1), "★☆☆");
});

test("結果画面: おすすめ3体すべての出典をキャラ名の見出し付きで並べる", () => {
  const result = diagnose(neutral);
  const node = view(result);
  const headings = byClass(node, "diag-source-name").map(allText);
  assert.deepEqual(headings, [...result.picks.map((p) => `${p.name}の特徴データの出典`), "重さ・走る速さの順位の出典"]);
  const hrefs = flatten(node).filter((n) => n.tag === "a").map((a) => a.attrs.href);
  for (const p of result.picks) for (const url of p.profile.sources) assert.ok(hrefs.includes(url), url);
});

test("結果画面: おすすめ候補が0体でも落ちず「診断データを準備中です」を出す", () => {
  const empty = diagnose(neutral, { profiles: {} });
  assert.deepEqual(empty.picks, []);
  const node = view(empty);
  assert.match(allText(node), /診断データを準備中です/);
});

test("結果画面: 「トレモ」は初出だけ「トレーニングモード（トレモ）」にする", () => {
  const explain = tremoExplainer();
  assert.equal(explain("崖の練習"), "崖の練習");
  assert.equal(explain("トレモでA。トレモでB"), "トレーニングモード（トレモ）でA。トレモでB");
  assert.equal(explain("トレモでC"), "トレモでC");
  const focusMenu = { items: [
    { title: "一歩目", desc: "トレモで小ジャンプを練習", check: "トレモで10回" },
    { title: "二歩目", desc: "対戦で試す", check: "3戦" },
  ] };
  const node = view(diagnose(neutral), { focusMenu });
  const text = allText(node);
  assert.ok(text.includes("トレーニングモード（トレモ）で小ジャンプを練習"));
  assert.equal(text.split("トレーニングモード（トレモ）").length - 1, 1);
});
