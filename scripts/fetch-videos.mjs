// Node 標準のみ。実行: YOUTUBE_API_KEY=xxx node scripts/fetch-videos.mjs
// YouTube Data API v3 でキャラごとの解説動画を検索し、js/presets/video-links.js を生成する。
// 鍵は環境変数からだけ読む（コミットしない・ログに出さない）。
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = new URL("../js/presets/video-links.js", import.meta.url);
const CHANNELS_FILE = new URL("./video-channels.json", import.meta.url);
const CACHE_DIR = resolve(__dirname, ".cache/videos");
const API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_PER_FIGHTER = 5;
const MAX_PINNED_PER_CHANNEL = 3;

// 別表記(検索クエリ・タイトル優先判定に使う)。無い場合は SSBU_FIGHTERS の名前だけを使う。
const ALIASES = {
  "Mr.ゲーム&ウォッチ": ["ゲームウォッチ", "Mr.ゲームアンドウォッチ"],
  "ポケモントレーナー": ["ゼニガメ", "フシギソウ", "リザードン"],
  "こどもリンク": ["子供リンク", "こどリン"],
  "キャプテン・ファルコン": ["ファルコン", "キャプファル"],
  "Wii Fitトレーナー": ["ウィーフィット", "Wii Fit"],
  "ピクミン&オリマー": ["オリマー"],
  "Miiファイター(格闘)": ["Mii格闘", "Miiファイター"],
  "Miiファイター(剣術)": ["Mii剣術", "Miiファイター"],
  "Miiファイター(射撃)": ["Mii射撃", "Miiファイター"],
  "クッパJr.": ["クッパジュニア"],
  "スティーブ/アレックス": ["スティーブ", "アレックス"],
  "ホムラ/ヒカリ": ["ホムラ", "ヒカリ"],
  "ベレト/ベレス": ["ベレト", "ベレス"],
};

function slugify(name) {
  return name.replace(/[^\p{L}\p{N}]/gu, "_");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiGet(path, params, apiKey) {
  const url = new URL(`${API_BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey);
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const body = await res.json();
  if (!res.ok) {
    const reason = body?.error?.errors?.[0]?.reason || body?.error?.status || res.status;
    const err = new Error(`YouTube API error: ${reason}`);
    err.reason = reason;
    throw err;
  }
  return body;
}

function sanitizeText(s, maxLen) {
  return String(s || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLen);
}

function isValidVideoId(id) {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

function nameMatchesTitle(name, aliases, title) {
  const candidates = [name, ...(aliases || [])];
  return candidates.some((c) => c && title.includes(c));
}

async function readCache(slug) {
  try {
    return JSON.parse(await readFile(resolve(CACHE_DIR, `${slug}.json`), "utf8"));
  } catch {
    return null;
  }
}

async function writeCache(slug, data) {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(resolve(CACHE_DIR, `${slug}.json`), JSON.stringify(data, null, 2));
}

async function searchVideosForFighter(name, aliases, apiKey) {
  const body = await apiGet("search", {
    part: "snippet",
    q: `スマブラSP ${name} 解説`,
    type: "video",
    regionCode: "JP",
    relevanceLanguage: "ja",
    videoEmbeddable: "true",
    safeSearch: "strict",
    maxResults: "8",
  }, apiKey);
  const items = (body.items || [])
    .map((it) => ({
      id: it.id?.videoId,
      title: sanitizeText(it.snippet?.title, 120),
      channel: sanitizeText(it.snippet?.channelTitle, 80),
      published: (it.snippet?.publishedAt || "").slice(0, 10),
    }))
    .filter((v) => v.id && isValidVideoId(v.id));
  // タイトルにキャラ名(別表記含む)を含むものを優先。
  const matched = items.filter((v) => nameMatchesTitle(name, aliases, v.title));
  const rest = items.filter((v) => !matched.includes(v));
  return [...matched, ...rest].slice(0, MAX_PER_FIGHTER).map((v) => ({ ...v, pinned: false }));
}

async function searchVideosInChannel(name, channelId, apiKey) {
  const body = await apiGet("search", {
    part: "snippet",
    q: `${name} 解説`,
    type: "video",
    channelId,
    regionCode: "JP",
    relevanceLanguage: "ja",
    maxResults: "5",
  }, apiKey);
  return (body.items || [])
    .map((it) => ({
      id: it.id?.videoId,
      title: sanitizeText(it.snippet?.title, 120),
      channel: sanitizeText(it.snippet?.channelTitle, 80),
      published: (it.snippet?.publishedAt || "").slice(0, 10),
      pinned: true,
    }))
    .filter((v) => v.id && isValidVideoId(v.id))
    .slice(0, MAX_PINNED_PER_CHANNEL);
}

export function renderVideoLinksModule(videoLinks, fetchedAt) {
  const header = [
    "// 自動生成・scripts/fetch-videos.mjs で再生成。手編集しないこと。",
    "// YouTube Data API で取得したキャラ別解説動画。URLは持たず videoId のみ(CIの外部URL検査を増やさないため)。",
    `// 取得日(JST): ${fetchedAt}`,
  ].join("\n");
  return (
    `${header}\nexport const VIDEO_LINKS = ${JSON.stringify(videoLinks, null, 2)};\n` +
    `export const VIDEO_LINKS_FETCHED = ${JSON.stringify(fetchedAt)};\n`
  );
}

export function jstDate(date = new Date()) {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("環境変数 YOUTUBE_API_KEY が未設定です");

  const onlyList = (process.env.ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
  const targets = onlyList.length ? SSBU_FIGHTERS.filter((n) => onlyList.includes(n)) : SSBU_FIGHTERS;
  const channels = JSON.parse(await readFile(CHANNELS_FILE, "utf8"));

  const videoLinks = {};
  let quotaHit = false;
  let processed = 0;
  for (const name of targets) {
    const slug = slugify(name);
    const cached = await readCache(slug);
    if (cached) {
      videoLinks[name] = cached;
      processed += 1;
      continue;
    }
    try {
      let pinned = [];
      const pinnedChannels = channels[name] || [];
      for (const { channelId } of pinnedChannels) {
        pinned = pinned.concat(await searchVideosInChannel(name, channelId, apiKey));
        await sleep(200);
      }
      const searched = await searchVideosForFighter(name, ALIASES[name], apiKey);
      const seen = new Set();
      const combined = [...pinned, ...searched].filter((v) => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      }).slice(0, MAX_PER_FIGHTER + MAX_PINNED_PER_CHANNEL);
      videoLinks[name] = combined;
      await writeCache(slug, combined);
      processed += 1;
      await sleep(200);
    } catch (error) {
      if (error.reason === "quotaExceeded") {
        console.error(`quotaExceeded: ${processed}/${targets.length} 件処理済み、残り ${targets.length - processed} キャラ`);
        quotaHit = true;
        break;
      }
      console.warn(`取得失敗: ${name} (${error.message})`);
      videoLinks[name] = [];
      processed += 1;
    }
  }

  // 既存出力とマージ(ONLY指定や枠切れ再開時に他キャラを消さない)。
  let existing = {};
  try {
    const mod = await import(pathToFileURL(fileURLToPath(OUTPUT)).href);
    existing = mod.VIDEO_LINKS || {};
  } catch {
    // 初回生成時はファイルが無い。
  }
  const merged = { ...existing, ...videoLinks };
  const ordered = {};
  for (const name of SSBU_FIGHTERS) if (merged[name]) ordered[name] = merged[name];

  const fetchedAt = jstDate();
  await writeFile(OUTPUT, renderVideoLinksModule(ordered, fetchedAt));

  const withVideos = Object.values(ordered).filter((v) => v.length > 0).length;
  console.log(`取得済みキャラ数: ${Object.keys(ordered).length}/${SSBU_FIGHTERS.length}（動画あり: ${withVideos}）`);
  if (quotaHit) {
    console.log("枠切れのため途中終了。再実行すればキャッシュ済み分をスキップして続きから取得します。");
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
