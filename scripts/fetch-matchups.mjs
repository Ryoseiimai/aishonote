// Node 標準のみ。実行: node scripts/fetch-matchups.mjs
// 開発時だけ出典を取得し、ブラウザには生成済みのローカルデータを同梱する。
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";

const ORIGIN = "https://ssbu-shiratsuki-theory.net";
const INDEX_URL = `${ORIGIN}/chara_link.html`;
const OUTPUT = new URL("../js/presets/matchup-reference.js", import.meta.url);
// iOS版に同梱する「キャラ名→出典URL」だけの小さいファイル（得意・苦手の中身は入れない）。
const LINKS_OUTPUT = new URL("../js/presets/matchup-links.js", import.meta.url);
const USER_AGENT = "SmashNote-MatchupFetcher/1.0 (+https://github.com/Ryoseiimai/aishonote; offline reference data; serial requests; 3s interval)";
// 出典サイトへの負荷を抑えるため、1リクエストごとに3秒空ける。期の更新時に手動で実行するだけで、CI・定期実行には組み込まない。
export const REQUEST_INTERVAL_MS = 3000;

// chara_link.html のリンク・表記と各ページの見出しを照合した対応表。
// 出典は5組を統合: サムス、ピーチ、マルス/ルキナ、ピット、シモン/リヒター。
// 統合データを別キャラ固有の統計と誤認しないよう、noteにも対象を明記する。
export const SOURCE_FIGHTERS = {
  mario: ["マリオ"],
  donkey_kong: ["ドンキーコング"],
  link: ["リンク"],
  samus: ["サムス", "ダークサムス"],
  yoshi: ["ヨッシー"],
  kirby: ["カービィ"],
  fox: ["フォックス"],
  pikachu: ["ピカチュウ"],
  luigi: ["ルイージ"],
  ness: ["ネス"],
  captain_falcon: ["キャプテン・ファルコン"],
  jigglypuff: ["プリン"],
  peach: ["ピーチ", "デイジー"],
  bowser: ["クッパ"],
  ice_climber: ["アイスクライマー"],
  sheik: ["シーク"],
  zelda: ["ゼルダ"],
  dr_mario: ["ドクターマリオ"],
  pichu: ["ピチュー"],
  falco: ["ファルコ"],
  lucina: ["マルス", "ルキナ"],
  young_link: ["こどもリンク"],
  ganondorf: ["ガノンドロフ"],
  mewtwo: ["ミュウツー"],
  roy: ["ロイ"],
  chrom: ["クロム"],
  mr_game_and_watch: ["Mr.ゲーム&ウォッチ"],
  metaknight: ["メタナイト"],
  pit: ["ピット", "ブラックピット"],
  zero_suit_samus: ["ゼロスーツサムス"],
  wario: ["ワリオ"],
  snake: ["スネーク"],
  ike: ["アイク"],
  pokemon_trainer: ["ポケモントレーナー"],
  diddy_kong: ["ディディーコング"],
  lucas: ["リュカ"],
  sonic: ["ソニック"],
  king_dedede: ["デデデ"],
  olimar: ["ピクミン&オリマー"],
  lucario: ["ルカリオ"],
  rob: ["ロボット"],
  toon_link: ["トゥーンリンク"],
  wolf: ["ウルフ"],
  villager: ["むらびと"],
  megaman: ["ロックマン"],
  wii_fit_trainer: ["Wii Fitトレーナー"],
  rosalina_luma: ["ロゼッタ&チコ"],
  little_mac: ["リトル・マック"],
  greninja: ["ゲッコウガ"],
  mii_brawler: ["Miiファイター(格闘)"],
  mii_swordfighter: ["Miiファイター(剣術)"],
  mii_gunner: ["Miiファイター(射撃)"],
  palutena: ["パルテナ"],
  pacman: ["パックマン"],
  robin: ["ルフレ"],
  shulk: ["シュルク"],
  bowser_jr: ["クッパJr."],
  duck_hunt: ["ダックハント"],
  ryu: ["リュウ"],
  ken: ["ケン"],
  cloud: ["クラウド"],
  corrin: ["カムイ"],
  bayonetta: ["ベヨネッタ"],
  inkling: ["インクリング"],
  ridley: ["リドリー"],
  richter: ["シモン", "リヒター"],
  king_k_rool: ["キングクルール"],
  isabelle: ["しずえ"],
  incineroar: ["ガオガエン"],
  piranha_plant: ["パックンフラワー"],
  joker: ["ジョーカー"],
  hero: ["勇者"],
  banjo_and_kazooie: ["バンジョー&カズーイ"],
  terry: ["テリー"],
  byleth: ["ベレト/ベレス"],
  minmin: ["ミェンミェン"],
  steve: ["スティーブ/アレックス"],
  sephiroth: ["セフィロス"],
  pyra: ["ホムラ/ヒカリ"],
  kazuya: ["カズヤ"],
  sora: ["ソラ"],
};

const fighterSet = new Set(SSBU_FIGHTERS);
const labels = ["不利", "微不利", "五分", "微有利", "有利"];

export function discoverSlugs(html) {
  return [...new Set([...html.matchAll(/href=["'](?:\.\/)?chara\/([a-z0-9_]+)\.html["']/g)].map((m) => m[1]))];
}

// この出典は個別の勝率・対戦数を公開していない。帯の中央値やnは生成しない。
// 最新期だけを使い、「不明」は除外。サイトの既存の試合数選別を利用する。
export function parseMatchupPage(html, warn = console.warn) {
  const headings = [...html.matchAll(/<h3\b[^>]*>\s*スマメイト(\d+)期相性表[^<]*<\/h3>/g)];
  if (!headings.length) throw new Error("期間見出しが見つかりません");
  const latest = headings.reduce((a, b) => Number(a[1]) > Number(b[1]) ? a : b);
  const afterHeading = html.slice(latest.index + latest[0].length);
  const section = afterHeading.split(/<h[23]\b/)[0];
  const intro = html.slice(0, headings[0].index);
  const bands = new Map([...intro.matchAll(/(不利|微不利|五分|微有利|有利)\s*[:：]\s*(\d+(?:\.\d+)?)\s*[～〜~]\s*(\d+(?:\.\d+)?)\s*[%％]/g)]
    .map((m) => [m[1], [Number(m[2]), Number(m[3])]]));
  let previousHigh = 0;
  for (const label of labels) {
    const band = bands.get(label);
    if (!band || band[0] !== previousHigh || band[0] >= band[1] || band[1] > 100) {
      throw new Error(`勝率帯の定義が不正です: ${label}`);
    }
    previousHigh = band[1];
  }
  if (previousHigh !== 100) throw new Error("勝率帯が100%までありません");

  const rows = [];
  const seenSlugs = new Set();
  const seenLabels = [];
  const groups = section.matchAll(/<div\b[^>]*class=["']fdi1["'][^>]*>\s*<div\b[^>]*>\s*([^<]+?)\s*<\/div>\s*<\/div>\s*<div\b[^>]*class=["']fdi2["'][^>]*>([\s\S]*?)<\/div>/g);
  for (const [, label, contents] of groups) {
    if (label !== "不明" && !bands.has(label)) throw new Error(`未知の勝率区分: ${label}`);
    seenLabels.push(label);
    for (const [, slug] of contents.matchAll(/href=["']\.\.\/chara\/([a-z0-9_]+)\.html["']/g)) {
      if (seenSlugs.has(slug)) throw new Error(`相手が重複しています: ${slug}`);
      seenSlugs.add(slug);
      if (!Object.hasOwn(SOURCE_FIGHTERS, slug)) {
        warn(`未対応の相手slug: ${slug}`);
        continue;
      }
      if (label !== "不明") rows.push({ slug, label, band: bands.get(label) });
    }
  }
  if (seenLabels.filter((label) => label !== "不明").join() !== labels.join()) {
    throw new Error("相性表の区分・順序が変更されています");
  }
  if (rows.length < 2) throw new Error("最新期の既知の相手が不足しています");
  return { period: Number(latest[1]), rows };
}

export function makeReference(my, slug, parsed) {
  const ownNames = SOURCE_FIGHTERS[slug];
  if (!ownNames?.includes(my)) throw new Error(`自キャラ対応がありません: ${my}`);
  // 出典の左→右は不利→有利。帯内の順序も保持する。
  // 同じ統合枠の相手も除き、別枠の同名・自己対戦が紛れないようにする。
  const ranked = parsed.rows.filter((row) => row.slug !== slug)
    .flatMap((row) => SOURCE_FIGHTERS[row.slug].map((name) => ({ ...row, name })));
  const count = Math.min(6, Math.floor(ranked.length / 2));
  if (!count) throw new Error(`得意・苦手の相手が不足しています: ${my}`);
  const toItem = (row) => {
    const shared = [];
    if (ownNames.length > 1) shared.push(`自キャラ: ${ownNames.join("／")}合算`);
    const opponents = SOURCE_FIGHTERS[row.slug];
    if (opponents.length > 1) shared.push(`相手: ${opponents.join("／")}合算`);
    return {
      name: row.name,
      // 期や統計の説明は画面の説明文に集約。noteは区分と合算注記だけ。
      note: shared.length ? `${row.label}（${shared.join("・")}）` : row.label,
    };
  };
  return {
    good: ranked.slice(-count).reverse().map(toItem),
    bad: ranked.slice(0, count).map(toItem),
    sources: [`${ORIGIN}/matchup/${slug}.html`],
  };
}

export function createFetcher(fetchImpl = fetch, wait = sleep) {
  return async (url) => {
    // リトライ・並列処理はしない。呼び出し側も必ずawaitする。
    await wait(REQUEST_INTERVAL_MS);
    const response = await fetchImpl(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(20000),
      redirect: "error",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  };
}

export async function collectReferences(fetchPage, warn = console.warn) {
  const discovered = new Set(discoverSlugs(await fetchPage(INDEX_URL)));
  if (!discovered.size) throw new Error("キャラ一覧のリンクが見つかりません");
  for (const slug of discovered) {
    if (!Object.hasOwn(SOURCE_FIGHTERS, slug)) warn(`未対応の一覧slug: ${slug}`);
  }
  const references = {};
  const failures = [];
  const periods = new Set();
  for (const [slug, names] of Object.entries(SOURCE_FIGHTERS)) {
    if (names.some((name) => !fighterSet.has(name))) throw new Error(`ssbu.jsにない対応名: ${slug}`);
    try {
      if (!discovered.has(slug)) throw new Error("キャラ一覧にリンクがありません");
      const parsed = parseMatchupPage(await fetchPage(`${ORIGIN}/matchup/${slug}.html`), warn);
      periods.add(parsed.period);
      for (const name of names) references[name] = makeReference(name, slug, parsed);
    } catch (error) {
      failures.push({ names, reason: error.message });
      warn(`取得不可: ${names.join("／")} (${error.message})`);
    }
  }
  const ordered = {};
  for (const name of SSBU_FIGHTERS) {
    if (references[name]) ordered[name] = references[name];
    else if (!failures.some((failure) => failure.names.includes(name))) {
      failures.push({ names: [name], reason: "slug未対応" });
      warn(`未対応のファイター: ${name}`);
    }
  }
  if (periods.size > 1) warn(`キャラによって最新期が違います: ${[...periods].sort().join("・")}`);
  const period = periods.size ? Math.max(...periods) : null;
  return { references: ordered, failures, period };
}

/** 取得日（日本時間の日付 YYYY-MM-DD）。UTC だと日本の早朝に前日の日付になるため JST で出す。 */
export function jstDate(date = new Date()) {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

/** js/presets/matchup-reference.js の中身（Web版だけが読み込む同梱データ）。 */
export function renderReferenceModule(references, meta) {
  const header = [
    "// 自動生成・scripts/fetch-matchups.mjs で再生成。手編集しないこと。",
    `// 出典: シラツキ理論 / スマメイトのオンラインレート戦（第${meta.period}期・取得日: ${meta.fetchedAt}）。`,
    "// 個別勝率・対戦数は非公開。出典が公開する調整済みの1先勝率帯をそのまま記載。",
    "// 最新掲載期の並び順（不利→有利）で両端から各6件。自己対戦・不明を除外。",
    "// 出典の一定試合数以上という掲載条件を使用。追加の少数試合フィルタは不可。",
    "// 出典の統合5組は共通データとして展開し、noteに合算対象を明記。",
    "// Web版だけが動的 import する。iOS版の www/ には scripts/sync-www.sh が同梱しない（matchup-links.js だけ入る）。",
  ].join("\n");
  return (
    `${header}\nexport const MATCHUP_REFERENCE_META = ${JSON.stringify(meta)};\n` +
    `export const MATCHUP_REFERENCE = ${JSON.stringify(references, null, 2)};\n`
  );
}

/** js/presets/matchup-links.js の中身（キャラ名→出典ページURLだけ。iOS版のリンク案内用）。 */
export function renderLinksModule(references) {
  const links = Object.fromEntries(Object.entries(references).map(([name, ref]) => [name, ref.sources[0]]));
  return [
    "// 自動生成・scripts/fetch-matchups.mjs で再生成。手編集しないこと。",
    "// キャラ名→シラツキ理論の相性表ページURLだけ。得意・苦手などの相性データは含めない（iOS版に同梱するのはこれだけ）。",
    `export const MATCHUP_LINKS = ${JSON.stringify(links, null, 2)};`,
    "",
  ].join("\n");
}

async function main() {
  console.warn("出典は勝率帯のみ公開。個別勝率・対戦数は取得不可。対戦数の追加フィルタは適用せず、出典の試合数選別と不明枠の除外を使用します。");
  const { references, failures, period } = await collectReferences(createFetcher());
  if (!Object.keys(references).length) throw new Error("取得0件のため既存ファイルを保持します");
  const meta = { period, fetchedAt: jstDate() };
  await writeFile(OUTPUT, renderReferenceModule(references, meta));
  await writeFile(LINKS_OUTPUT, renderLinksModule(references));
  console.log(`取得できたキャラ数: ${Object.keys(references).length}/${SSBU_FIGHTERS.length}`);
  console.log(`取れなかったキャラ: ${failures.length ? failures.flatMap((failure) => failure.names).join("、") : "なし"}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
