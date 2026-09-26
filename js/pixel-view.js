import { el, svgEl } from "./dom.js";
import { PIXEL_PALETTE, GUIDE_FRAMES, PIXEL_ICONS } from "./pixel-art.js";
import { guideMessage } from "./progression.js";

/** パレットはCSSクラス。1文字=1個のrect、整数座標で拡大しても輪郭を保つ。 */
export function pixelSprite(rows, className = "pixel-icon") {
  const svg = svgEl("svg", {
    viewBox: `0 0 ${rows[0].length} ${rows.length}`,
    width: rows[0].length, height: rows.length,
    class: className, "aria-hidden": "true", focusable: "false",
    "shape-rendering": "crispEdges",
  });
  rows.forEach((row, y) => [...row].forEach((dot, x) => {
    if (dot !== ".") svg.appendChild(svgEl("rect", { x, y, width: 1, height: 1, class: PIXEL_PALETTE[dot] }));
  }));
  return svg;
}

export function pixelIcon(name) {
  return pixelSprite(PIXEL_ICONS[name]);
}

export function xpBar(stats) {
  const filled = stats.maxed ? 24 : Math.floor(stats.ratio * 24);
  return svgEl("svg", {
    viewBox: "0 0 288 12", width: 288, height: 12, class: "pixel-xp", preserveAspectRatio: "none",
    role: "progressbar", "aria-label": "次のレベルまでの経験値",
    "aria-valuemin": 0, "aria-valuemax": stats.maxed ? 1 : stats.required,
    "aria-valuenow": stats.maxed ? 1 : stats.earned,
    "aria-valuetext": stats.maxed ? "最高レベルに到達" : `${stats.earned} / ${stats.required} XP、あと${stats.remaining} XP`,
    "shape-rendering": "crispEdges", focusable: "false",
  }, Array.from({ length: 24 }, (_, i) => svgEl("rect", {
    x: i * 12 + 1, y: 2, width: 10, height: 8, class: i < filled ? "xp-dot filled" : "xp-dot",
  })));
}

export function guideCard({ stats, step, streak, levelUp = false, onNext = null }) {
  const mood = levelUp || streak > 0 || !step ? "joy" : "idle";
  return el("div", { className: "card guide-card" }, [
    el("div", { className: "guide-heading" }, [
      el("h2", {}, "きょうも、一歩ずつ。"),
      el("span", { className: "guide-level" }, [pixelIcon("trophy"), `Lv.${stats.level}`]),
    ]),
    el("div", { className: "guide-conversation" }, [
      el("div", { className: "guide-portrait" }, [
        el("div", { className: `guide-sprite ${mood}`, role: "img", "aria-label": "むすびコーチ（おにぎり型のオリジナルキャラ）：白い三角の体に赤い鉢巻き、下半分に黒いのり。点目とにっこり口で、小さな手をガッツポーズ" },
          GUIDE_FRAMES[mood].map((frame, i) => pixelSprite(frame, `pixel-frame frame-${i}`))),
        el("span", { className: "guide-name" }, "むすびコーチ"),
      ]),
      el("p", { className: "guide-bubble" }, guideMessage({ hasNext: Boolean(step), streak, levelUp })),
    ]),
    xpBar(stats),
    el("p", { className: "xp-caption" }, stats.maxed ? `Lv.99 達成 · 累計 ${stats.xp} XP` : `次のLvまで ${stats.remaining} XP · 累計 ${stats.xp} XP`),
    el("details", { className: "xp-help" }, [
      el("summary", {}, "XPのため方"),
      el("p", {}, "ロードマップ・キャラ専用のチェック1件で25 XP、練習1分で2 XP。全キャラ共通です。チェックを外すとXPも戻ります。"),
    ]),
    el("div", { className: "guide-next" }, [
      el("h3", {}, [pixelIcon(step ? "check" : "trophy"), "次の一歩"]),
      el("p", { className: "next-step-title" }, step ? step.item.title : "ロードマップの全項目を達成！"),
      step ? el("p", { className: "hint" }, `段階: ${step.stageTitle}`) : null,
      onNext ? el("button", { type: "button", className: "secondary-btn", onClick: onNext }, "上達タブで練習する") : null,
    ]),
  ]);
}

export function levelNotice(level) {
  return el("div", { className: "level-notice" }, [
    el("span", { className: "level-particles", "aria-hidden": "true" }, [el("i"), el("i"), el("i")]),
    pixelIcon("trophy"),
    el("span", {}, `Lv.${level} にレベルアップ！`),
  ]);
}
