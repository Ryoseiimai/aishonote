import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GUIDE_FRAMES, PIXEL_ICONS, PIXEL_PALETTE } from "../js/pixel-art.js";

function checkGrid(rows, size) {
  assert.equal(rows.length, size);
  for (const row of rows) {
    assert.equal(row.length, size);
    for (const dot of row) assert.ok(dot === "." || Object.hasOwn(PIXEL_PALETTE, dot), `unknown pixel: ${dot}`);
  }
  assert.ok(rows.some((row) => row.includes("k")));
}

test("ガイド: 待機2枚・喜び2枚、全て32×32で異なるフレーム", () => {
  assert.deepEqual(Object.keys(GUIDE_FRAMES), ["idle", "joy"]);
  for (const frames of Object.values(GUIDE_FRAMES)) {
    assert.equal(frames.length, 2);
    frames.forEach((rows) => checkGrid(rows, 32));
  }
  assert.equal(new Set(Object.values(GUIDE_FRAMES).flat().map((rows) => rows.join(""))).size, 4);
});

test("アイコン: 4段階・炎・トロフィー・チェック・5タブの全12種は16×16", () => {
  assert.deepEqual(Object.keys(PIXEL_ICONS).sort(), ["stage1", "stage2", "stage3", "stage4", "flame", "trophy", "check", "home", "log", "growth", "matchup", "settings"].sort());
  Object.values(PIXEL_ICONS).forEach((rows) => checkGrid(rows, 16));
  assert.equal(new Set(Object.values(PIXEL_ICONS).map((rows) => rows.join(""))).size, 12);
});

test("同梱フォント: WOFF2実体とOFLがあり、CSS/CSPはself読込だけを許可", () => {
  const font = readFileSync(new URL("../fonts/DotGothic16-Regular.woff2", import.meta.url));
  assert.equal(font.subarray(0, 4).toString(), "wOF2");
  assert.match(readFileSync(new URL("../fonts/OFL.txt", import.meta.url), "utf8"), /SIL OPEN FONT LICENSE Version 1.1/);
  const css = readFileSync(new URL("../css/style.css", import.meta.url), "utf8");
  assert.match(css, /url\("\.\.\/fonts\/DotGothic16-Regular\.woff2"\)/);
  assert.doesNotMatch(css, /https?:\/\/|@import/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  // 2クラスの通常アニメ指定と同等の詳細度を持たせ、確実に上書きする。
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.guide-sprite \.pixel-frame, \.level-notice, \.level-particles i \{ animation: none; \}/);
  assert.match(readFileSync(new URL("../index.html", import.meta.url), "utf8"), /font-src 'self'/);
});
