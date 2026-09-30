import test from "node:test";
import assert from "node:assert/strict";
import { videoSectionView } from "../js/video-display.js";
import { VIDEO_LINKS } from "../js/presets/video-links.js";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";

test("video-display: 動画があるキャラはmode=videosでvideoId・タイトル・URLを返す", () => {
  const links = { "ネス": [{ id: "DrZndkvwqHY", title: "解説", channel: "ch", pinned: false }] };
  const view = videoSectionView("ネス", links);
  assert.equal(view.mode, "videos");
  assert.equal(view.items.length, 1);
  assert.equal(view.items[0].id, "DrZndkvwqHY");
  assert.equal(view.items[0].thumbUrl, "https://i.ytimg.com/vi/DrZndkvwqHY/mqdefault.jpg");
  assert.equal(view.items[0].watchUrl, "https://www.youtube.com/watch?v=DrZndkvwqHY");
  assert.equal(view.items[0].embedUrl, "https://www.youtube-nocookie.com/embed/DrZndkvwqHY");
});

test("video-display: 動画0本のキャラはmode=searchで検索リンクを返す", () => {
  const view = videoSectionView("マリオ", {});
  assert.equal(view.mode, "search");
  assert.match(view.searchUrl, /^https:\/\/www\.youtube\.com\/results\?search_query=/);
  assert.match(view.searchLabel, /マリオ/);
});

test("video-display: videoIdの形式が不正な要素は除外する", () => {
  const links = { "ネス": [{ id: "not-a-valid-id!!", title: "x" }, { id: "DrZndkvwqHY", title: "解説" }] };
  const view = videoSectionView("ネス", links);
  assert.equal(view.mode, "videos");
  assert.equal(view.items.length, 1);
  assert.equal(view.items[0].id, "DrZndkvwqHY");
});

test("video-display: 最大8件までに切り詰める", () => {
  const many = Array.from({ length: 12 }, (_, i) => ({ id: `abcdefghij${i % 10}`, title: `t${i}` }));
  const view = videoSectionView("ネス", { "ネス": many });
  assert.equal(view.mode, "videos");
  assert.ok(view.items.length <= 8);
});

test("video-links: SSBU_FIGHTERSに存在するキーだけを持つ", () => {
  const fighterSet = new Set(SSBU_FIGHTERS);
  for (const name of Object.keys(VIDEO_LINKS)) {
    assert.ok(fighterSet.has(name), `未知のキャラ名: ${name}`);
  }
});

test("video-links: すべてのvideoIdが11文字の正しい形式", () => {
  for (const [name, items] of Object.entries(VIDEO_LINKS)) {
    for (const item of items) {
      assert.match(item.id, /^[A-Za-z0-9_-]{11}$/, `${name}: ${item.id}`);
      assert.ok(item.title.length <= 120, `${name}: タイトルが長すぎる`);
    }
  }
});
