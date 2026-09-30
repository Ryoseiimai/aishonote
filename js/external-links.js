// 画面の外部リンク（rel="noopener noreferrer"・タップ時だけブラウザで開く）の宛先。
// fetch/script/style/font として読み込むことはない。ci.yml の外部URL検出はこの2つのURL（と相性表ページのURL）だけを許可している。
export const SHIRATSUKI_URL = "https://ssbu-shiratsuki-theory.net/";
// ASCIIだけのURL（App Store Connect のプライバシーポリシーURL欄にも同じものを入れる）。
export const PRIVACY_POLICY_URL = "https://github.com/Ryoseiimai/aishonote/blob/main/docs/privacy.md";

// 解説動画欄で使う YouTube のURL断片。videoId は presets/video-links.js に持たせ、ここでは組み立てない
// （動画IDそのものは外部URLではないためCIの検出対象外。base文字列だけをここに集約する）。
// サムネ画像。<img src> として CSP の img-src で読み込む(オリジンはCSP設定を参照)。
export const YOUTUBE_THUMB_BASE = "https://i.ytimg.com/vi/";
// Web版の埋め込み再生(youtube-nocookie)。CSP の frame-src で iframe を作る(オリジンはCSP設定を参照)。
// 押すまで iframe は作らない(押していなければ通信は発生しない。サムネ画像の取得は別途発生する)。
export const YOUTUBE_EMBED_BASE = "https://www.youtube-nocookie.com/embed/";
// 動画を開く外部リンク先(ネイティブ版・Web版の「YouTubeで開く」)。
export const YOUTUBE_WATCH_BASE = "https://www.youtube.com/watch?v=";
// 動画が0本のキャラの代替リンク(YouTube検索結果ページ)。
export const YOUTUBE_SEARCH_BASE = "https://www.youtube.com/results?search_query=";
