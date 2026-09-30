// 「解説動画」欄のDOM構築。Web版はカードを押した場でiframeに差し替えて再生し、
// ネイティブ(Capacitor iOS)版はiframeを作らず外部リンクで開く(WebView埋め込みはエラー153になりやすいため)。
import { el, clear } from "./dom.js";
import { videoSectionView } from "./video-display.js";

function videoCard(item, isNative) {
  const thumb = el("img", {
    src: item.thumbUrl,
    alt: item.title,
    loading: "lazy",
    width: "320",
    height: "180",
    className: "video-thumb",
  });
  const body = el("div", { className: "video-card-body" }, [
    el("p", { className: "video-title" }, item.title),
    item.channel ? el("p", { className: "video-channel" }, item.channel) : null,
  ]);
  const playerHost = el("div", { className: "video-player-host" });
  const card = el("button", { type: "button", className: "video-card" }, [thumb, body, playerHost]);

  card.addEventListener("click", () => {
    if (isNative) {
      window.open(item.watchUrl, "_blank", "noopener,noreferrer");
      return;
    }
    // 押すまでiframeを作らない。開いただけではYouTubeへ通信しない(サムネ画像の取得は別途発生する)。
    if (playerHost.firstChild) return;
    const frame = el("iframe", {
      src: item.embedUrl,
      title: item.title,
      allow: "accelerometer; encrypted-media; picture-in-picture; fullscreen",
      referrerpolicy: "strict-origin-when-cross-origin",
      className: "video-embed",
      frameborder: "0",
    });
    clear(playerHost);
    playerHost.appendChild(frame);
  });

  return el("div", { className: "video-card-wrap" }, [
    card,
    el("a", { href: item.watchUrl, target: "_blank", rel: "noopener noreferrer", className: "video-open-link" }, "YouTubeで開く"),
  ]);
}

/**
 * @param {string} name キャラ名
 * @param {object} videoLinks presets/video-links.js の VIDEO_LINKS
 * @param {boolean} isNative
 */
export function renderVideoSection(name, videoLinks, isNative) {
  const view = videoSectionView(name, videoLinks);
  if (view.mode === "search") {
    return el("div", { className: "video-section" }, [
      el("h3", {}, "解説動画"),
      el("a", { href: view.searchUrl, target: "_blank", rel: "noopener noreferrer", className: "video-search-link" }, view.searchLabel),
    ]);
  }
  return el("div", { className: "video-section" }, [
    el("h3", {}, "解説動画"),
    el("div", { className: "video-list" }, view.items.map((item) => videoCard(item, isNative))),
  ]);
}
