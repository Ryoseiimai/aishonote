// 相性の目安（シラツキ理論の相性表）をどう見せるかを決める純粋関数。DOMに触れないので node:test で検証できる。

// 意図的簡略化: iOSアプリ版では出典の許諾が未取得のため同梱データを出さずリンク案内だけにする。
// false の間は scripts/sync-www.sh が matchup-reference.js を www/ から外し、iOS版にはURLだけの matchup-links.js が入る。
// シラツキ理論の運営者の許諾が取れたら true にして再提出（iOS版でも同梱データを読み込んで表示に戻る）。
export const EMBED_REFERENCE_ON_NATIVE = false;

/** 同梱データ一覧の説明文。期は生成スクリプトが書き出す MATCHUP_REFERENCE_META から組み立てる（手書きしない）。 */
export function referenceDescription(meta) {
  const period = meta && Number.isInteger(meta.period) ? `（第${meta.period}期）` : "";
  return (
    `シラツキ理論（ssbu-shiratsuki-theory.net）がスマメイトのレート戦データ${period}から集計した相性表の抜粋です。` +
    "非公式の目安で、腕前で変わります。スマメイト・シラツキ理論とは無関係のアプリです。" +
    "あなた自身の対戦ログがあれば横に表示します。"
  );
}

export const UNRELATED_NOTICE = "本アプリはスマメイト・シラツキ理論とは無関係です。";

/**
 * 「このアプリについて」の出典欄。iOS版は相性データを同梱しないので「リンク先」として書き、期・取得日は出さない。
 * @returns {{ heading: string, suffix: string }} suffix は「シラツキ理論」リンクの直後に続ける文
 */
export function aboutSourceView({ isNative = false, embedOnNative = EMBED_REFERENCE_ON_NATIVE, meta = null } = {}) {
  if (isNative && !embedOnNative) {
    return {
      heading: "相性の目安のリンク先",
      suffix: `（外部サイト・タップでSafariが開きます）。${UNRELATED_NOTICE}`,
    };
  }
  const stats =
    meta && Number.isInteger(meta.period) && typeof meta.fetchedAt === "string"
      ? `（スマメイト第${meta.period}期の統計・${meta.fetchedAt}取得）`
      : "（スマメイトの統計）";
  return { heading: "相性データの出典", suffix: `${stats}。${UNRELATED_NOTICE}` };
}

/** Capacitor のネイティブ（iOSアプリ内）で動いているか。ブラウザでは false。 */
export function isNativePlatform(win = globalThis) {
  const capacitor = win && win.Capacitor;
  if (!capacitor || typeof capacitor.isNativePlatform !== "function") return false;
  return capacitor.isNativePlatform() === true;
}

function isHttpsUrl(value) {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 相性の目安カードの表示内容を決める。
 * @returns {null | { mode: "embed" | "link", url: string, texts: object }}
 *   null=出さない / embed=同梱データの一覧 / link=出典ページへのリンク案内だけ
 */
export function referenceView(name, ref, { isNative = false, embedOnNative = EMBED_REFERENCE_ON_NATIVE, meta = null } = {}) {
  if (!name || !ref) return null;
  const url = Array.isArray(ref.sources) ? ref.sources[0] : null;
  if (!isHttpsUrl(url)) return null;
  // good/bad を持たない参照（iOS版の matchup-links.js 由来・Web版で同梱データの読み込み前）はリンク案内になる。
  const hasData = Array.isArray(ref.good) && Array.isArray(ref.bad);
  const mode = hasData && (!isNative || embedOnNative) ? "embed" : "link";
  return {
    mode,
    url,
    texts: {
      description: referenceDescription(meta),
      sourceLink: `${name}の相性表をすべて見る（シラツキ理論）`,
      linkGuide: `${name}の得意・苦手な相手は、シラツキ理論の相性表（スマメイトのオンライン対戦統計）で確認できます。`,
      linkButton: `${name}の相性表を開く（シラツキ理論）`,
    },
  };
}
