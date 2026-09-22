// 相性の目安（シラツキ理論の相性表）をどう見せるかを決める純粋関数。DOMに触れないので node:test で検証できる。

// 意図的簡略化: iOSアプリ版では出典の許諾が未取得のため同梱データを出さずリンク案内だけにする。
// シラツキ理論の運営者の許諾が取れたら true にして再提出（iOS版で同梱データ表示に戻る）。
export const EMBED_REFERENCE_ON_NATIVE = false;

export const REFERENCE_DESCRIPTION =
  "シラツキ理論（ssbu-shiratsuki-theory.net）がスマメイトのレート戦データ（第21期）から集計した相性表の抜粋です。" +
  "非公式の目安で、腕前で変わります。スマメイト・シラツキ理論とは無関係のアプリです。" +
  "あなた自身の対戦ログがあれば横に表示します。";

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
export function referenceView(name, ref, { isNative = false, embedOnNative = EMBED_REFERENCE_ON_NATIVE } = {}) {
  if (!name || !ref) return null;
  const url = Array.isArray(ref.sources) ? ref.sources[0] : null;
  if (!isHttpsUrl(url)) return null;
  const mode = isNative && !embedOnNative ? "link" : "embed";
  return {
    mode,
    url,
    texts: {
      description: REFERENCE_DESCRIPTION,
      sourceLink: `${name}の相性表をすべて見る（シラツキ理論）`,
      linkGuide: `${name}の得意・苦手な相手は、シラツキ理論の相性表（スマメイトのオンライン対戦統計）で確認できます。`,
      linkButton: `${name}の相性表を開く（シラツキ理論）`,
    },
  };
}
