import test from "node:test";
import assert from "node:assert/strict";
import { pixelSprite, pixelIcon, xpBar, guideCard, levelNotice } from "../js/pixel-view.js";
import { levelFromXp } from "../js/progression.js";
import { birthdayCard, showBirthday } from "../js/birthday-view.js";

// 最小のDOMダブル。実際の属性・rect・テキストノードを検査する（外部依存なし）。
class Node extends EventTarget {
  constructor(tag, text = "") { super(); this.tag = tag; this.text = text; this.attrs = {}; this.children = []; }
  setAttribute(key, value) { this.attrs[key] = value; }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  remove() { this.parent.children = this.parent.children.filter((child) => child !== this); }
  showModal() { this.open = true; }
  close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  }
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

test("お祝いカード: 喜びの2コマと装飾の紙吹雪、見出し・ひとこと・閉じるボタン", () => {
  const card = birthdayCard({}, new Date(2026, 9, 15), () => {});
  const nodes = flatten(card);
  assert.equal(nodes.filter((node) => node.attrs.class?.startsWith("pixel-frame")).length, 2);
  assert.ok(nodes.some((node) => node.className === "guide-sprite joy birthday-coach"));
  const confetti = nodes.find((node) => node.className === "birthday-confetti");
  assert.equal(confetti.attrs["aria-hidden"], "true");
  assert.equal(confetti.children.length, 12);
  assert.equal(nodes.filter((node) => node.tag === "button").length, 1);
  assert.match(allText(card), /お誕生日おめでとう！.*今年も一緒に強くなろう！.*閉じる/);
  assert.doesNotMatch(allText(card), /これまでの練習/);
});

test("お祝いカード: 名前はテキストとして表示し、実績を下部に表示する", () => {
  const birthdayName = "<img src=x>";
  const card = birthdayCard({ birthdayName, practiceLog: { "2026-10-15": 50 } }, new Date(2026, 9, 15), () => {});
  const nodes = flatten(card);
  assert.ok(nodes.some((node) => node.tag === "#text" && node.text === `${birthdayName}、お誕生日おめでとう！`));
  assert.ok(!nodes.some((node) => node.tag === "img" || node.tag === "script" || node.attrs.style));
  assert.match(allText(card), /これまでの練習：合計50分・チェック0個・Lv2/);
});

test("お祝いダイアログ: ボタン・Escapeのどちらも1度だけ閉じ、スクロールとホームのフォーカスを戻す", (t) => {
  t.after(() => {
    delete document.body;
    delete document.querySelector;
  });
  for (const action of ["button", "escape"]) {
    const classes = new Set();
    document.body = new Node("body");
    document.body.classList = { add: (name) => classes.add(name), remove: (name) => classes.delete(name) };
    let focused = false;
    document.querySelector = () => ({ focus: () => { focused = true; } });
    let dismissed = 0;
    showBirthday({}, new Date(2026, 9, 15), () => { dismissed += 1; });
    const dialog = document.body.children[0];
    assert.equal(dialog.open, true);
    assert.equal(dialog.attrs["aria-labelledby"], "birthday-title");
    assert.equal(classes.has("birthday-open"), true);
    if (action === "button") {
      flatten(dialog).find((node) => node.tag === "button").dispatchEvent(new Event("click"));
    } else {
      const event = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(event);
      assert.equal(event.defaultPrevented, true);
    }
    dialog.close();
    assert.equal(dismissed, 1);
    assert.equal(document.body.children.length, 0);
    assert.equal(classes.has("birthday-open"), false);
    assert.equal(focused, true);
  }
});
