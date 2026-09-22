// 画面の外部リンク（rel="noopener noreferrer"・タップ時だけブラウザで開く）の宛先。
// fetch/script/style/font として読み込むことはない。ci.yml の外部URL検出はこの2つのURL（と相性表ページのURL）だけを許可している。
export const SHIRATSUKI_URL = "https://ssbu-shiratsuki-theory.net/";
// ASCIIだけのURL（App Store Connect のプライバシーポリシーURL欄にも同じものを入れる）。
export const PRIVACY_POLICY_URL = "https://github.com/Ryoseiimai/aishonote/blob/main/docs/privacy.md";
