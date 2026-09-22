import test from "node:test";
import assert from "node:assert/strict";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";
import {
  SOURCE_FIGHTERS,
  discoverSlugs,
  parseMatchupPage,
  makeReference,
  createFetcher,
  collectReferences,
} from "../scripts/fetch-matchups.mjs";

// 出典HTMLの構造だけを再現。実データのダウンロードなしで抽出の境界を検証する。
const labels = ["不利", "微不利", "五分", "微有利", "有利", "不明"];
const definitions = "不利:0～45.5%、微不利:45.5～48.5%、五分:48.5～51.5%、微有利:51.5～54.5%、有利:54.5～100%";
const link = (slug) => `<a href="../chara/${slug}.html"><img src="../img/chara1/${slug}.jpg"></a>`;
function section(period, groups) {
  return `<h3 id="introduction">スマメイト${period}期相性表(オンライン)</h3><p><div class="fd">${labels.map((label) => `<div class="fdi1"><div>${label}</div></div><div class="fdi2">${(groups[label] || []).map(link).join("")}</div>`).join("")}</div>`;
}
const page = (...sections) => `<p>${definitions}</p>${sections.join("")}`;
const basicGroups = { 不利: ["ness", "peach", "mario"], 五分: ["lucina"], 有利: ["fox", "snake"], 不明: ["sora"] };

// 5組の共通ページを2回取得しないことも保証する。
test("fetch-matchups: 81ページの対応表は重複なく86ファイターを網羅する", () => {
  assert.equal(Object.keys(SOURCE_FIGHTERS).length, 81);
  assert.deepEqual(Object.values(SOURCE_FIGHTERS).flat().sort(), [...SSBU_FIGHTERS].sort());
});

test("fetch-matchups: キャラ一覧のslugを抽出し、重複リンクを除く", () => {
  assert.deepEqual(discoverSlugs('<a href="chara/ness.html">ネス</a><a href="chara/ness.html"><img></a><a href="chara/mario.html">マリオ</a>'), ["ness", "mario"]);
});

test("fetch-matchups: 数値として最新の期だけを抽出し、不明枠を除く", () => {
  const parsed = parseMatchupPage(page(section(9, { 有利: ["sora"] }), section(21, basicGroups), section(20, { 不利: ["sora"] })));
  assert.equal(parsed.period, 21);
  assert.deepEqual(parsed.rows.map((row) => row.slug), ["ness", "peach", "mario", "lucina", "fox", "snake"]);
  assert.deepEqual(parsed.rows[0].band, [0, 45.5]);
  assert.deepEqual(parsed.rows.at(-1).band, [54.5, 100]);
});

test("fetch-matchups: 最新期が壊れているときは過去期に黙って戻さない", () => {
  assert.throws(() => parseMatchupPage(page(section(21, {}), section(20, basicGroups))), /不足/);
  assert.throws(() => parseMatchupPage("<html>メンテナンス中</html>"), /見出し/);
});

test("fetch-matchups: 未対応slugは警告して除外する", () => {
  const warnings = [];
  const parsed = parseMatchupPage(page(section(21, { ...basicGroups, 有利: ["new_fighter", "fox", "snake"] })), (message) => warnings.push(message));
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /new_fighter/);
  assert.ok(parsed.rows.every((row) => row.slug !== "new_fighter"));
});

test("fetch-matchups: 区分欠落・重複相手・不正な勝率帯を拒否する", () => {
  const valid = page(section(21, basicGroups));
  assert.throws(() => parseMatchupPage(valid.replace('<div class="fdi1"><div>五分</div></div>', "")), /区分/);
  assert.throws(() => parseMatchupPage(page(section(21, { ...basicGroups, 有利: ["ness"] }))), /重複/);
  assert.throws(() => parseMatchupPage(valid.replace("54.5～100", "54.5～101")), /勝率帯/);
});

test("fetch-matchups: 両端の各6件を選び、自己・同じ統合枠を除く", () => {
  const slugs = ["peach", "mario", "ness", "fox", "pikachu", "luigi", "pichu", "falco", "zelda", "link", "kirby", "snake", "sora"];
  const parsed = parseMatchupPage(page(section(21, { 不利: slugs.slice(0, 7), 有利: slugs.slice(7) })));
  const ref = makeReference("デイジー", "peach", parsed);
  assert.equal(ref.good.length, 6);
  assert.equal(ref.bad.length, 6);
  assert.equal(ref.bad[0].name, "マリオ");
  assert.equal(ref.good[0].name, "ソラ");
  const items = [...ref.good, ...ref.bad];
  assert.equal(new Set(items.map((item) => item.name)).size, 12);
  assert.ok(items.every((item) => !["ピーチ", "デイジー"].includes(item.name)));
  assert.ok(items.every((item) => item.note.includes("21期") && item.note.includes("自キャラ: ピーチ／デイジー合算")));
});

test("fetch-matchups: 統合された相手を正規化して注記し、数値を推定しない", () => {
  const parsed = parseMatchupPage(page(section(21, basicGroups)));
  const ref = makeReference("ネス", "ness", parsed);
  assert.deepEqual(ref.bad.slice(0, 2).map((item) => item.name), ["ピーチ", "デイジー"]);
  assert.equal(ref.bad[0].note, "不利（スマメイト統計・第21期・相手: ピーチ／デイジー合算）");
  assert.ok([...ref.good, ...ref.bad].every((item) => !item.note.includes("n=")));
});

test("fetch-matchups: HTTP取得ごとに1秒待ち、User-Agentを明記する", async () => {
  const calls = [];
  const fetchPage = createFetcher(async (url, options) => {
    calls.push(url);
    assert.match(options.headers["User-Agent"], /SmashNote/);
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, text: async () => "html" };
  }, async (ms) => calls.push(ms));
  assert.equal(await fetchPage("first"), "html");
  assert.equal(await fetchPage("second"), "html");
  assert.deepEqual(calls, [1000, "first", 1000, "second"]);
});

test("fetch-matchups: HTTP失敗はページ内容として扱わない", async () => {
  const fetchPage = createFetcher(async () => ({ ok: false, status: 403 }), async () => {});
  await assert.rejects(fetchPage("blocked"), /HTTP 403/);
});

test("fetch-matchups: 一部失敗でも直列取得を続け、取得分と欠落一覧を返す", async () => {
  const requests = [];
  let inFlight = false;
  const { references, failures } = await collectReferences(async (url) => {
    assert.equal(inFlight, false, "並列アクセスしない");
    inFlight = true;
    requests.push(url);
    await Promise.resolve();
    inFlight = false;
    if (url.endsWith("chara_link.html")) return '<a href="chara/mario.html"></a><a href="chara/ness.html"></a>';
    if (url.endsWith("mario.html")) throw new Error("HTTP 503");
    return page(section(21, basicGroups));
  }, () => {});
  assert.equal(requests.length, 3);
  assert.deepEqual(Object.keys(references), ["ネス"]);
  assert.equal(failures.flatMap((failure) => failure.names).length, 85);
  assert.ok(failures.some((failure) => failure.names.includes("マリオ") && failure.reason === "HTTP 503"));
});
