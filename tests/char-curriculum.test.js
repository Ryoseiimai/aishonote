import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mergeCharCurriculum, renderCharCurriculumModule } from "../scripts/build-char-curriculum.mjs";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";
import { SSBU_CHAR_CURRICULUM } from "../js/presets/ssbu-char-curriculum.js";
import { SSBU_CURRICULUM } from "../js/presets/ssbu-curriculum.js";
import { characterMenuView } from "../js/char-curriculum-display.js";
import { nextStep, overallRate } from "../js/curriculum-stats.js";
import { emptyState, validateImport } from "../js/store.js";

const batches = Array.from({ length: 6 }, (_, i) => JSON.parse(
  readFileSync(new URL(`../docs/char-curriculum/batch-${i + 1}.json`, import.meta.url), "utf8")
));
const menus = Object.values(SSBU_CHAR_CURRICULUM);

test("char curriculum: 全86キャラのキーがプリセットと一致する", () => {
  assert.equal(SSBU_FIGHTERS.length, 86);
  assert.deepEqual(Object.keys(SSBU_CHAR_CURRICULUM), SSBU_FIGHTERS);
});

test("char curriculum: 全キャラに項目があり、全516項目のidが一意でロードマップとも衝突しない", () => {
  const ids = new Set(SSBU_CURRICULUM.roadmap.flatMap((stage) => stage.items.map((item) => item.id)));
  assert.equal(menus.reduce((n, menu) => n + menu.items.length, 0), 516);
  for (const menu of menus) {
    assert.ok(menu.items.length > 0);
    for (const item of menu.items) {
      assert.ok(!ids.has(item.id), item.id);
      ids.add(item.id);
    }
  }
});

test("char curriculum: 全出典がhttps", () => {
  for (const menu of menus) {
    assert.ok(menu.sources.length > 0);
    for (const source of menu.sources) {
      assert.ok(source.url.startsWith("https://"));
      assert.equal(new URL(source.url).protocol, "https:");
    }
  }
});

test("char curriculum: 調査済みの文面・項目・出典を変更せず再生成できる", () => {
  const original = structuredClone(batches);
  const merged = mergeCharCurriculum(batches);
  assert.deepEqual(batches, original);
  assert.deepEqual(merged, Object.assign({}, ...batches));
  assert.deepEqual(SSBU_CHAR_CURRICULUM, merged);
  assert.equal(readFileSync(new URL("../js/presets/ssbu-char-curriculum.js", import.meta.url), "utf8"),
    renderCharCurriculumModule(merged));
});

test("build-char-curriculum: 不足・余分なキャラを拒否する", () => {
  const missing = structuredClone(batches);
  delete missing[0].マリオ;
  assert.throws(() => mergeCharCurriculum(missing), /SSBU_FIGHTERSと不一致.*マリオ/);
  assert.throws(() => mergeCharCurriculum([...batches, { 未対応: batches[0].マリオ }]), /idが重複/);
  const extra = structuredClone(batches);
  extra[0].未対応 = extra[0].マリオ;
  delete extra[0].マリオ;
  assert.throws(() => mergeCharCurriculum(extra), /不足=\[マリオ\] 余分=\[未対応\]/);
});

test("build-char-curriculum: バッチ間で重複したキャラを拒否する", () => {
  assert.throws(() => mergeCharCurriculum([...batches, batches[0]]), /キャラが重複/);
});

test("build-char-curriculum: キャラ間・キャラ内・ロードマップとのid重複を拒否する", () => {
  for (const id of [batches[0].ドンキーコング.items[0].id, batches[0].マリオ.items[1].id,
    SSBU_CURRICULUM.roadmap[0].items[0].id]) {
    const bad = structuredClone(batches);
    bad[0].マリオ.items[0].id = id;
    assert.throws(() => mergeCharCurriculum(bad), /idが重複/);
  }
});

test("build-char-curriculum: 空のitemsと欠けた項目テキストを拒否する", () => {
  const empty = structuredClone(batches);
  empty[0].マリオ.items = [];
  assert.throws(() => mergeCharCurriculum(empty), /itemsが空/);
  const bad = structuredClone(batches);
  delete bad[0].マリオ.items[0].check;
  assert.throws(() => mergeCharCurriculum(bad), /checkが不正/);
});

test("build-char-curriculum: https以外・不正なURL・出典なしを拒否する", () => {
  for (const url of ["http://example.com/", "javascript:alert(1)", "https://"]) {
    const bad = structuredClone(batches);
    bad[0].マリオ.sources[0].url = url;
    assert.throws(() => mergeCharCurriculum(bad));
  }
  const bad = structuredClone(batches);
  bad[0].マリオ.sources = [];
  assert.throws(() => mergeCharCurriculum(bad), /sourcesが空/);
});

test("characterMenuView: 全キャラでそのキャラの項目と出典を返す", () => {
  for (const fighter of SSBU_FIGHTERS) {
    const view = characterMenuView("ssbu", fighter, new Set());
    assert.deepEqual(view.items, SSBU_CHAR_CURRICULUM[fighter].items);
    assert.deepEqual(view.sources, SSBU_CHAR_CURRICULUM[fighter].sources);
    assert.equal(view.rate, 0);
  }
});

test("characterMenuView: 自キャラの項目だけで達成率を計算し、progressを変更しない", () => {
  const mario = SSBU_CHAR_CURRICULUM.マリオ;
  const progress = new Set([mario.items[0].id, SSBU_CHAR_CURRICULUM.インクリング.items[0].id,
    SSBU_CURRICULUM.roadmap[0].items[0].id, "ness-common-mistakes", "unknown-old-id"]);
  const before = new Set(progress);
  assert.equal(characterMenuView("ssbu", "マリオ", progress).rate, 1 / mario.items.length);
  assert.deepEqual(progress, before);
  assert.equal(characterMenuView("ssbu", "マリオ", new Set(mario.items.map((item) => item.id))).rate, 1);
});

test("characterMenuView: 未選択・カスタムキャラ・別ゲームの同名キャラは準備中", () => {
  for (const fighter of [null, undefined, "", "カスタム", "constructor", "__proto__", "toString"]) {
    assert.equal(characterMenuView("ssbu", fighter, new Set()), null);
  }
  assert.equal(characterMenuView("custom_game", "マリオ", new Set()), null);
});

test("characterMenuView: 旧ネスの保存idを保持し、新ネスの共通idだけを達成扱いにする", () => {
  const state = emptyState();
  state.progress = SSBU_CURRICULUM.ness.map((item) => item.id);
  const imported = validateImport(state);
  assert.equal(imported.ok, true);
  assert.deepEqual(imported.data.progress, state.progress);
  const view = characterMenuView("ssbu", "ネス", new Set(imported.data.progress));
  assert.deepEqual(view.items, SSBU_CHAR_CURRICULUM.ネス.items);
  assert.ok(!view.items.some((item) => item.id === "ness-common-mistakes"));
  assert.equal(view.rate, 3 / 6);
});

test("characterMenuView: 全キャラ達成でもホームの次の一歩・ロードマップ達成率に影響しない", () => {
  const progress = new Set(menus.flatMap((menu) => menu.items.map((item) => item.id)));
  const roadmap = SSBU_CURRICULUM.roadmap;
  assert.deepEqual(nextStep(roadmap, progress), nextStep(roadmap, new Set()));
  assert.equal(overallRate(roadmap, progress), 0);
  progress.add(roadmap[0].items[0].id);
  assert.equal(nextStep(roadmap, progress).item.id, roadmap[0].items[1].id);
});

test("char curriculum: CIは新ファイルの出典URLだけを完全一致で許可する", () => {
  const ci = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  const patterns = ci.split("\n").filter((line) => line.includes("| grep -vE '^js/presets/ssbu-char-curriculum"))
    .map((line) => new RegExp(line.split("'")[1]));
  assert.ok(patterns.length > 0);
  const allows = (url, file = "js/presets/ssbu-char-curriculum.js") =>
    patterns.some((pattern) => pattern.test(`${file}:123:${url}`));
  for (const { url } of menus.flatMap((menu) => menu.sources)) {
    assert.ok(allows(url), url);
    assert.ok(!allows(`${url}/unreviewed`), url);
    assert.ok(!allows(`${url}?unreviewed=1`), url);
    assert.ok(!allows(url, "js/app.js"), url);
  }
  assert.ok(!allows("https://game8.jp/smashbros-special/999999"));
  assert.ok(!allows("https://cdn.example.com/library.js"));
});
