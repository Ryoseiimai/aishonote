import test from "node:test";
import assert from "node:assert/strict";
import { pixelSprite, pixelIcon, xpBar, guideCard, levelNotice } from "../js/pixel-view.js";
import { levelFromXp } from "../js/progression.js";

// 最小のDOMダブル。実際の属性・rect・テキストノードを検査する（外部依存なし）。
class Node {
  constructor(tag, text = "") { this.tag = tag; this.text = text; this.attrs = {}; this.children = []; }
  setAttribute(key, value) { this.attrs[key] = value; }
  appendChild(child) { this.children.push(child); return child; }
  addEventListener() {}
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

test("ドット描画: 透明セルを飛ばし、整数rectとパレットクラスのみを生成", () => {
  const svg = pixelSprite(["k.", ".a"]);
  assert.equal(svg.attrs.viewBox, "0 0 2 2");
  assert.equal(svg.attrs["shape-rendering"], "crispEdges");
  assert.equal(svg.attrs["aria-hidden"], "true");
  assert.deepEqual(svg.children.map((node) => node.attrs), [
    { x: "0", y: "0", width: "1", height: "1", class: "dot-ink" },
    { x: "1", y: "1", width: "1", height: "1", class: "dot-accent" },
  ]);
  assert.equal(pixelIcon("home").attrs.viewBox, "0 0 16 16");
});

test("XPバー: 0・途中・直前・最高レベルを正確なARIA値と24ドットで表示", () => {
  for (const [xp, count] of [[0, 0], [50, 12], [99, 23], [100, 0], [1_000_000, 24]]) {
    const stats = levelFromXp(xp);
    const svg = xpBar(stats);
    assert.equal(svg.children.length, 24);
    assert.equal(svg.children.filter((node) => node.attrs.class === "xp-dot filled").length, count);
    assert.equal(svg.attrs["aria-valuenow"], String(stats.maxed ? 1 : stats.earned));
    assert.equal(svg.attrs["aria-valuemax"], String(stats.maxed ? 1 : stats.required));
  }
});

test("ガイドカード: 二つのフレーム・名前・次の一歩・XPと安全なテキスト", () => {
  const title = '<img src=x onerror="bad()">';
  const card = guideCard({ stats: levelFromXp(125), step: { item: { title }, stageTitle: "操作" }, streak: 0, onNext: () => {} });
  const nodes = flatten(card);
  assert.equal(nodes.filter((node) => node.attrs.class?.startsWith("pixel-frame")).length, 2);
  assert.equal(nodes.filter((node) => node.tag === "button").length, 1);
  assert.ok(nodes.some((node) => node.tag === "#text" && node.text === title));
  assert.ok(!nodes.some((node) => node.tag === "img" || node.attrs.style));
  assert.match(allText(card), /むすびコーチ/);
  assert.match(nodes.find((node) => node.attrs.role === "img").attrs["aria-label"], /むすびコーチ（おにぎり型のオリジナルキャラ）/);
  assert.match(allText(card), /次のLvまで 125 XP/);
});

test("達成時のガイドとレベル通知: テキストでも結果が伝わる", () => {
  const card = guideCard({ stats: levelFromXp(1_000_000), step: null, streak: 7 });
  assert.match(allText(card), /ロードマップの全項目を達成/);
  assert.match(allText(card), /Lv.99 達成/);
  assert.equal(flatten(card).filter((node) => node.tag === "button").length, 0);
  assert.match(allText(levelNotice(3)), /Lv.3 にレベルアップ/);
});
