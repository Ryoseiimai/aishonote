// キャラ診断の特徴データを docs/fighter-profiles.json から js/presets/ssbu-fighter-profiles.js へ生成する。
// 使い方: node scripts/build-fighter-profiles.mjs            （JSを書き出す）
//         node scripts/build-fighter-profiles.mjs --ci-allowlist （ci.yml の外部URL許可行を標準出力へ）
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";

const root = new URL("../", import.meta.url);
const input = new URL("docs/fighter-profiles.json", root);
const output = new URL("js/presets/ssbu-fighter-profiles.js", root);

export const LEVEL_FIELDS = ["range", "projectile", "recovery", "killPower", "combo", "airGame", "easy"];
export const STYLES = ["攻め", "待ち", "万能", "投げ", "トリッキー"];

/** 順位(1=最重/最速)を5段階(5=最重/最速、1=最軽/最遅)へ。total体を5等分し、同順位は同じ段階になる。 */
export function rankToLevel(rank, total = SSBU_FIGHTERS.length) {
  if (!Number.isInteger(rank) || rank < 1 || rank > total) throw new Error(`順位が不正: ${rank}`);
  return 5 - Math.floor(((rank - 1) * 5) / total);
}

function assertHttps(url, name) {
  if (typeof url !== "string" || !url.startsWith("https://") || new URL(url).protocol !== "https:") {
    throw new Error(`出典URLはhttpsのみ: ${name}`);
  }
}

/** 特徴と順位を名前で結合し、SSBU_FIGHTERS の並びで返す。欠け・余分・範囲外は例外。 */
export function buildProfiles(source) {
  const ranks = new Map();
  for (const r of source.ranks) {
    if (ranks.has(r.name)) throw new Error(`順位が重複: ${r.name}`);
    ranks.set(r.name, r);
  }
  const profiles = Object.create(null);
  for (const f of source.features) {
    if (Object.hasOwn(profiles, f.name)) throw new Error(`特徴が重複: ${f.name}`);
    for (const key of LEVEL_FIELDS) {
      const min = key === "projectile" ? 0 : 1;
      if (!Number.isInteger(f[key]) || f[key] < min || f[key] > 5) throw new Error(`${key}が範囲外: ${f.name}`);
    }
    if (!STYLES.includes(f.style)) throw new Error(`styleが不正: ${f.name}`);
    if (typeof f.gimmick !== "string" || typeof f.oneLine !== "string" || !f.oneLine.trim()) {
      throw new Error(`文面が不正: ${f.name}`);
    }
    if (!Array.isArray(f.sources) || f.sources.length === 0) throw new Error(`出典がない: ${f.name}`);
    f.sources.forEach((url) => assertHttps(url, f.name));
    const rank = ranks.get(f.name);
    if (!rank) throw new Error(`順位がない: ${f.name}`);
    profiles[f.name] = {
      range: f.range,
      projectile: f.projectile,
      recovery: f.recovery,
      killPower: f.killPower,
      combo: f.combo,
      airGame: f.airGame,
      style: f.style,
      easy: f.easy,
      weight: rankToLevel(rank.weightRank),
      speed: rankToLevel(rank.runSpeedRank),
      gimmick: f.gimmick,
      oneLine: f.oneLine,
      confidence: f.confidence,
      sources: [...f.sources],
    };
  }
  const missing = SSBU_FIGHTERS.filter((name) => !Object.hasOwn(profiles, name));
  const extra = Object.keys(profiles).filter((name) => !SSBU_FIGHTERS.includes(name));
  const extraRanks = [...ranks.keys()].filter((name) => !SSBU_FIGHTERS.includes(name));
  if (missing.length || extra.length || extraRanks.length) {
    throw new Error(`SSBU_FIGHTERSと不一致: 不足=[${missing}] 余分=[${extra}] 順位だけ=[${extraRanks}]`);
  }
  source.rankSources.forEach((s) => assertHttps(s.url, s.title));
  return Object.fromEntries(SSBU_FIGHTERS.map((name) => [name, profiles[name]]));
}

export function renderProfilesModule(profiles, rankSources) {
  return "// 自動生成: node scripts/build-fighter-profiles.mjs\n" +
    "// 正本: docs/fighter-profiles.json。直接編集しない。weight/speed は重さ・走行速度の順位を5段階にした値（5=最重/最速）。\n" +
    `export const FIGHTER_RANK_SOURCES = ${JSON.stringify(rankSources, null, 2)};\n` +
    `export const SSBU_FIGHTER_PROFILES = ${JSON.stringify(profiles, null, 2)};\n`;
}

const escapeEre = (s) => s.replace(/[.()[\]{}+?*^$|\\]/g, "\\$&");

/** ci.yml の外部URL許可行（URL単位・ホストごと・1行12件まで）。 */
export function ciAllowlist(profiles, rankSources) {
  const urls = new Set(rankSources.map((s) => s.url));
  for (const p of Object.values(profiles)) p.sources.forEach((u) => urls.add(u));
  const byHost = new Map();
  for (const url of [...urls].sort()) {
    const m = url.match(/^https:\/\/([^/]+)\/(.*)$/);
    if (!byHost.has(m[1])) byHost.set(m[1], []);
    byHost.get(m[1]).push(m[2]);
  }
  const lines = [];
  for (const [host, paths] of byHost) {
    for (let i = 0; i < paths.length; i += 12) {
      const alt = paths.slice(i, i + 12).map(escapeEre).join("|");
      lines.push(`            | grep -vE '^js/presets/ssbu-fighter-profiles\\.js:[0-9]+:https://${escapeEre(host)}/(${alt})$' \\`);
    }
  }
  return { count: urls.size, lines };
}

async function main() {
  const source = JSON.parse(await readFile(input, "utf8"));
  const profiles = buildProfiles(source);
  if (process.argv.includes("--ci-allowlist")) {
    const { count, lines } = ciAllowlist(profiles, source.rankSources);
    console.error(`URL ${count}件`);
    console.log(lines.join("\n"));
    return;
  }
  await writeFile(output, renderProfilesModule(profiles, source.rankSources));
  console.log(`wrote ${fileURLToPath(output)} (${Object.keys(profiles).length}体)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
