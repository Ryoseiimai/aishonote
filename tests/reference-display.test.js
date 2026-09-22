import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  EMBED_REFERENCE_ON_NATIVE,
  UNRELATED_NOTICE,
  aboutSourceView,
  isNativePlatform,
  referenceDescription,
  referenceView,
} from "../js/reference-display.js";
import * as externalLinks from "../js/external-links.js";
import { MATCHUP_REFERENCE, MATCHUP_REFERENCE_META } from "../js/presets/matchup-reference.js";
import { MATCHUP_LINKS } from "../js/presets/matchup-links.js";

const { SHIRATSUKI_URL, PRIVACY_POLICY_URL } = externalLinks;
const meta = MATCHUP_REFERENCE_META;

const ness = MATCHUP_REFERENCE["ネス"];

test("reference-display: iOS版1.0は許諾待ちのため同梱データを出さない設定で出荷する", () => {
  assert.equal(EMBED_REFERENCE_ON_NATIVE, false);
});

test("reference-display: Capacitorのネイティブ判定はisNativePlatform()がtrueのときだけ", () => {
  assert.equal(isNativePlatform({}), false);
  assert.equal(isNativePlatform(undefined), false);
  assert.equal(isNativePlatform({ Capacitor: {} }), false);
  assert.equal(isNativePlatform({ Capacitor: { isNativePlatform: true } }), false);
  assert.equal(isNativePlatform({ Capacitor: { isNativePlatform: () => false } }), false);
  assert.equal(isNativePlatform({ Capacitor: { isNativePlatform: () => "yes" } }), false);
  assert.equal(isNativePlatform({ Capacitor: { isNativePlatform: () => true } }), true);
  // Node にはCapacitorが無いので既定(globalThis)はfalse
  assert.equal(isNativePlatform(), false);
});

test("reference-display: Webでは同梱データを一覧表示し、出典リンクの文言はキャラ名入り", () => {
  const view = referenceView("ネス", ness, { isNative: false, meta });
  assert.equal(view.mode, "embed");
  assert.equal(view.url, ness.sources[0]);
  assert.equal(view.texts.description, referenceDescription(meta));
  assert.equal(view.texts.sourceLink, "ネスの相性表をすべて見る（シラツキ理論）");
  assert.ok(!/https?:\/\//.test(view.texts.sourceLink), "URLを生で表示しない");
});

test("reference-display: iOSアプリ内では出典ページへのリンク案内だけにする", () => {
  const view = referenceView("ネス", ness, { isNative: true });
  assert.equal(view.mode, "link");
  assert.equal(view.url, "https://ssbu-shiratsuki-theory.net/matchup/ness.html");
  assert.equal(view.texts.linkGuide, "ネスの得意・苦手な相手は、シラツキ理論の相性表（スマメイトのオンライン対戦統計）で確認できます。");
  assert.equal(view.texts.linkButton, "ネスの相性表を開く（シラツキ理論）");
});

test("reference-display: iOS版に同梱するURLだけの参照（good/badなし）は、Webでもリンク案内になる", () => {
  const linkOnly = { sources: [MATCHUP_LINKS["ネス"]] };
  assert.equal(referenceView("ネス", linkOnly, { isNative: true }).mode, "link");
  assert.equal(referenceView("ネス", linkOnly, { isNative: false }).mode, "link");
  assert.equal(referenceView("ネス", linkOnly, { isNative: true, embedOnNative: true }).mode, "link");
});

test("reference-display: 許諾後にフラグをtrueにするとiOSでも同梱データ表示に戻る", () => {
  assert.equal(referenceView("ネス", ness, { isNative: true, embedOnNative: true }).mode, "embed");
  assert.equal(referenceView("ネス", ness, { isNative: false, embedOnNative: true }).mode, "embed");
});

test("reference-display: データが無い・出典URLが不正なら何も出さない", () => {
  assert.equal(referenceView("カスタムキャラ", undefined, { isNative: false }), null);
  assert.equal(referenceView("", ness, { isNative: true }), null);
  assert.equal(referenceView("ネス", { ...ness, sources: [] }, { isNative: true }), null);
  assert.equal(referenceView("ネス", { ...ness, sources: ["javascript:alert(1)"] }, { isNative: true }), null);
  assert.equal(referenceView("ネス", { ...ness, sources: ["http://example.com/"] }, { isNative: false }), null);
});

test("reference-display: 説明文は出典・期・非公式・無関係を明記し、期はデータのメタ情報から組み立てる", () => {
  assert.equal(
    referenceDescription({ period: 21, fetchedAt: "2026-09-23" }),
    "シラツキ理論（ssbu-shiratsuki-theory.net）がスマメイトのレート戦データ（第21期）から集計した相性表の抜粋です。非公式の目安で、腕前で変わります。スマメイト・シラツキ理論とは無関係のアプリです。あなた自身の対戦ログがあれば横に表示します。"
  );
  assert.ok(referenceDescription({ period: 22, fetchedAt: "2027-01-01" }).includes("（第22期）"));
  assert.ok(!/第\d+期/.test(referenceDescription(null)), "メタが無ければ期を書かない");
});

test("reference-display: 画面の期・取得日は同梱データのメタ情報と一致する", () => {
  const description = referenceDescription(meta);
  assert.deepEqual(description.match(/第(\d+)期/).slice(1), [String(meta.period)]);
  const about = aboutSourceView({ isNative: false, meta });
  assert.equal(about.heading, "相性データの出典");
  assert.ok(about.suffix.includes(`スマメイト第${meta.period}期の統計・${meta.fetchedAt}取得`));
  assert.ok(about.suffix.includes(UNRELATED_NOTICE));
  // 取得日はデータファイル見出しの取得日と同じ
  const header = readFileSync(new URL("../js/presets/matchup-reference.js", import.meta.url), "utf8").split("\n")[1];
  assert.ok(header.includes(`第${meta.period}期・取得日: ${meta.fetchedAt}`), header);
});

test("reference-display: iOS版の「このアプリについて」はリンク先として書き、期・取得日・データを持つ書き方をしない", () => {
  const about = aboutSourceView({ isNative: true, meta });
  assert.equal(about.heading, "相性の目安のリンク先");
  assert.equal(about.suffix, `（外部サイト・タップでSafariが開きます）。${UNRELATED_NOTICE}`);
  assert.ok(!/期|取得|統計|データ/.test(about.heading + about.suffix));
  assert.equal(aboutSourceView({ isNative: true, embedOnNative: true, meta }).heading, "相性データの出典");
});

test("external-links: エクスポートは出典サイトトップとASCIIだけのプライバシーポリシーURLの2つだけ", () => {
  assert.deepEqual(Object.keys(externalLinks).sort(), ["PRIVACY_POLICY_URL", "SHIRATSUKI_URL"]);
  assert.equal(SHIRATSUKI_URL, "https://ssbu-shiratsuki-theory.net/");
  assert.equal(PRIVACY_POLICY_URL, "https://github.com/Ryoseiimai/aishonote/blob/main/docs/privacy.md");
  assert.match(PRIVACY_POLICY_URL, /^[\x21-\x7e]+$/, "ASCIIだけ");
  assert.ok(existsSync(new URL("../docs/privacy.md", import.meta.url)), "リンク先のファイルがリポジトリにある");
});
