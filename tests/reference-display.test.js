import test from "node:test";
import assert from "node:assert/strict";
import {
  EMBED_REFERENCE_ON_NATIVE,
  REFERENCE_DESCRIPTION,
  isNativePlatform,
  referenceView,
} from "../js/reference-display.js";
import { SHIRATSUKI_URL, PRIVACY_POLICY_URL } from "../js/external-links.js";
import { MATCHUP_REFERENCE } from "../js/presets/matchup-reference.js";

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
  const view = referenceView("ネス", ness, { isNative: false });
  assert.equal(view.mode, "embed");
  assert.equal(view.url, ness.sources[0]);
  assert.equal(view.texts.description, REFERENCE_DESCRIPTION);
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

test("reference-display: 説明文は出典・期・非公式・無関係を明記する", () => {
  assert.equal(
    REFERENCE_DESCRIPTION,
    "シラツキ理論（ssbu-shiratsuki-theory.net）がスマメイトのレート戦データ（第21期）から集計した相性表の抜粋です。非公式の目安で、腕前で変わります。スマメイト・シラツキ理論とは無関係のアプリです。あなた自身の対戦ログがあれば横に表示します。"
  );
});

test("external-links: 画面の外部リンクはhttpsで、出典サイトとGitHubのプライバシー節だけ", () => {
  assert.equal(new URL(SHIRATSUKI_URL).origin, "https://ssbu-shiratsuki-theory.net");
  const privacy = new URL(PRIVACY_POLICY_URL);
  assert.equal(privacy.origin, "https://github.com");
  assert.equal(privacy.pathname, "/Ryoseiimai/aishonote");
  assert.equal(decodeURIComponent(privacy.hash), "#プライバシーポリシー");
});
