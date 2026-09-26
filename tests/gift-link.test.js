import test from "node:test";
import assert from "node:assert/strict";
import { consumeGiftLink } from "../js/gift-link.js";
import { emptyState, loadState, STORAGE_KEY } from "../js/store.js";

function setup(t, search = "", birthdayName = "") {
  const state = { ...emptyState(), birthdayName };
  const storage = new Map([[STORAGE_KEY, JSON.stringify(state)]]);
  const replacements = [];
  const browser = {
    location: { href: `https://example.test/note/${search}#settings` },
    history: {
      state: { tab: "settings" },
      replaceState(...args) {
        replacements.push(args);
        browser.location.href = args[2];
      },
    },
    localStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
    },
  };
  const previousWindow = globalThis.window;
  globalThis.window = browser;
  t.after(() => { globalThis.window = previousWindow; });
  return { state, browser, replacements };
}

test("gift: URLエンコードされた名前を保存し、履歴のgiftだけ削除する", (t) => {
  const { state, browser, replacements } = setup(t, `?bday=1&gift=${encodeURIComponent("  テスト &+%  ")}&other=ok`);
  const next = consumeGiftLink(state);
  assert.equal(next.birthdayName, "テスト &+%");
  assert.equal(loadState().birthdayName, next.birthdayName);
  assert.deepEqual(next, { ...state, birthdayName: "テスト &+%" });
  assert.equal(state.birthdayName, "");
  assert.deepEqual(replacements, [[browser.history.state, "", "https://example.test/note/?bday=1&other=ok#settings"]]);
  assert.strictEqual(consumeGiftLink(next), next);
  assert.equal(replacements.length, 1);
});

test("gift: 既存の名前を上書きせず、保存処理も行わずURLを消す", (t) => {
  const { state, browser } = setup(t, "?gift=changed", "既存の設定");
  assert.strictEqual(consumeGiftLink(state, browser, () => assert.fail("上書き禁止")), state);
  assert.equal(loadState().birthdayName, "既存の設定");
  assert.equal(new URL(browser.location.href).search, "");
});

test("gift: 20字は保存できる", (t) => {
  const name = "あ".repeat(20);
  const { state } = setup(t, `?gift=${encodeURIComponent(name)}`);
  assert.equal(consumeGiftLink(state).birthdayName, name);
  assert.equal(loadState().birthdayName, name);
});

for (const [label, value] of [["空欄", ""], ["空白", "  "], ["21字", "あ".repeat(21)], ["trim前に21字", ` ${"あ".repeat(20)}`]]) {
  test(`gift: ${label}は保存せずURLから削除する`, (t) => {
    const { state, browser } = setup(t, `?gift=${encodeURIComponent(value)}`);
    assert.strictEqual(consumeGiftLink(state, browser, () => assert.fail("不正値の保存禁止")), state);
    assert.equal(new URL(browser.location.href).search, "");
  });
}

test("gift: パラメータがなければ保存・履歴変更を行わない", (t) => {
  const { state, browser, replacements } = setup(t, "?bday=1");
  assert.strictEqual(consumeGiftLink(state, browser, () => assert.fail("不要な保存")), state);
  assert.equal(replacements.length, 0);
});

test("gift: 重複パラメータもすべて除去し、最初の値を使用する", (t) => {
  const { state, browser } = setup(t, "?gift=first&gift=second");
  assert.equal(consumeGiftLink(state).birthdayName, "first");
  assert.equal(new URL(browser.location.href).search, "");
});

for (const fails of ["false", "throw"]) {
  test(`gift: 保存失敗(${fails})でもURLに名前を残さず状態を変更しない`, (t) => {
    const { state, browser } = setup(t, "?gift=test");
    assert.throws(() => consumeGiftLink(state, browser, () => {
      assert.equal(new URL(browser.location.href).search, "");
      if (fails === "throw") throw new Error("storage unavailable");
      return false;
    }));
    assert.equal(state.birthdayName, "");
    assert.equal(loadState().birthdayName, "");
  });
}
