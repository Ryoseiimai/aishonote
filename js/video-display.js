// 解説動画欄の表示内容を決める純粋関数。DOMに触れないので node:test で検証できる。
import {
  YOUTUBE_THUMB_BASE,
  YOUTUBE_EMBED_BASE,
  YOUTUBE_WATCH_BASE,
  YOUTUBE_SEARCH_BASE,
} from "./external-links.js";

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const MAX_VIDEOS = 8;

function isValidEntry(entry) {
  return Boolean(entry) && typeof entry.id === "string" && VIDEO_ID_RE.test(entry.id) && typeof entry.title === "string";
}

/**
 * @param {string} name キャラ名
 * @param {object} videoLinks VIDEO_LINKS（キャラ名→動画配列）
 * @returns {{ mode: "videos", items: Array } | { mode: "search", searchUrl: string }}
 */
export function videoSectionView(name, videoLinks) {
  const raw = videoLinks && Array.isArray(videoLinks[name]) ? videoLinks[name] : [];
  const items = raw.filter(isValidEntry).slice(0, MAX_VIDEOS).map((v) => ({
    id: v.id,
    title: v.title,
    channel: typeof v.channel === "string" ? v.channel : "",
    pinned: v.pinned === true,
    thumbUrl: `${YOUTUBE_THUMB_BASE}${v.id}/mqdefault.jpg`,
    watchUrl: `${YOUTUBE_WATCH_BASE}${v.id}`,
    embedUrl: `${YOUTUBE_EMBED_BASE}${v.id}`,
  }));
  if (!items.length) {
    return {
      mode: "search",
      searchUrl: `${YOUTUBE_SEARCH_BASE}${encodeURIComponent(`スマブラSP ${name} 解説`)}`,
      searchLabel: `YouTubeで「スマブラSP ${name} 解説」を探す`,
    };
  }
  return { mode: "videos", items };
}
