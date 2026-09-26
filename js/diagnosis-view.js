// キャラ診断の画面（質問・結果・入口カード）。計算は diagnosis.js、保存は app.js の setState が担う。
import { el } from "./dom.js";
import { QUESTIONS } from "./diagnosis-questions.js";
import { coachSay, pixelIcon } from "./pixel-view.js";
import { roundRateToStep } from "./curriculum-stats.js";
import { FIGHTER_RANK_SOURCES } from "./presets/ssbu-fighter-profiles.js";

const QUESTION_LEADS = [
  "まずは戦い方から。",
  "次は距離の好み。",
  "動きの好みは？",
  "空中戦について。",
  "飛び道具について。",
  "復帰について。",
  "ダメージの与え方は？",
  "キャラの個性について。",
  "操作のむずかしさは？",
  "最後の質問！",
];

/** 結果画面の上に常に出す注記（折りたたみの中だけに置かない）。 */
export const DIAGNOSIS_DISCLAIMER = "回答と攻略サイトの特徴データから出した目安です。実際に触って決めてください。";

/**
 * 「トレモ」の初出だけ「トレーニングモード（トレモ）」にする関数を返す（結果画面1枚につき1つ作る）。
 * 元のカリキュラム文（トレモ表記）は他の画面と共用なので書き換えず、表示時だけ置き換える。
 */
export function tremoExplainer() {
  let explained = false;
  return (text) => {
    if (explained || typeof text !== "string" || !text.includes("トレモ")) return text;
    explained = true;
    return text.replace("トレモ", "トレーニングモード（トレモ）");
  };
}

/** おすすめ度 ★1〜3 の表示（例: ★★☆）。 */
export function starLabel(stars) {
  return "★".repeat(stars) + "☆".repeat(3 - stars);
}

function externalLink(href, text) {
  return el("a", { href, target: "_blank", rel: "noopener noreferrer" }, text);
}

/** 入口カード。compact=true は設定の「いつでも再診断」用。 */
export function diagnosisEntryCard({ hasResult, compact = false, onStart, onShowResult }) {
  return el("div", { className: "card diag-entry" }, [
    el("h2", {}, compact ? "キャラ診断" : "まずはキャラ診断"),
    compact
      ? el("p", { className: "hint" }, "10問の質問から、あなたに合うキャラを3体えらびます。いつでもやり直せます。")
      : coachSay("どのキャラにするか迷ったら、10問の質問であなたに合うキャラを探そう！上達のしかたも教えるよ。", "idle"),
    el("div", { className: "diag-entry-actions" }, [
      el("button", { type: "button", className: compact ? "secondary-btn" : "primary-btn", onClick: onStart }, hasResult ? "もう一度診断する" : "キャラ診断をはじめる"),
      hasResult ? el("button", { type: "button", className: "secondary-btn", onClick: onShowResult }, "前回の結果を見る") : null,
    ]),
  ]);
}

/** 質問画面。session = { step, answers }。 */
export function diagnosisQuiz({ session, onAnswer, onBack, onQuit }) {
  const q = QUESTIONS[session.step];
  const total = QUESTIONS.length;
  const current = session.answers[q.id];
  return el("section", { className: "panel diagnosis" }, [
    el("div", { className: "card" }, [
      el("div", { className: "diag-head" }, [
        el("h2", {}, "あなたに合うキャラ診断"),
        el("span", { className: "diag-count" }, `${session.step + 1} / ${total}`),
      ]),
      el("div", { className: `progress-bar progress-w-${roundRateToStep(session.step / total)}` }, [el("div", { className: "progress-fill" })]),
      coachSay(`${QUESTION_LEADS[session.step] || ""}${q.text}`, "idle"),
      el("div", { className: "diag-options", role: "group", "aria-label": q.text },
        q.options.map((opt, i) =>
          el("button", {
            type: "button",
            className: `diag-option${current === i ? " selected" : ""}`,
            "aria-pressed": current === i ? "true" : "false",
            onClick: () => onAnswer(q.id, i),
          }, opt.label)
        )),
      el("div", { className: "diag-nav" }, [
        session.step > 0 ? el("button", { type: "button", className: "secondary-btn", onClick: onBack }, "ひとつ戻る") : null,
        el("button", { type: "button", className: "secondary-btn", onClick: onQuit }, "やめる"),
      ]),
    ]),
  ]);
}

function axisRow(axis) {
  const pos = roundRateToStep(axis.value);
  // 0.4〜0.6（balanced）はどちらの極も太字にしない。マーカーが真ん中なのに片側を強調すると食い違うため。
  const strongLeft = !axis.balanced && axis.value <= 0.5;
  const strongRight = !axis.balanced && axis.value > 0.5;
  const aria = axis.balanced ? `${axis.left}と${axis.right}のちょうど中間あたり` : `${axis.left}と${axis.right}のうち${axis.side}寄り`;
  return el("div", { className: "axis-row" }, [
    el("span", { className: `axis-label${strongLeft ? " strong" : ""}` }, axis.left),
    el("div", { className: "axis-track", role: "img", "aria-label": aria }, [
      el("span", { className: `axis-marker axis-pos-${pos}` }),
    ]),
    el("span", { className: `axis-label right${strongRight ? " strong" : ""}` }, axis.right),
  ]);
}

function typeMessage(type) {
  return type.allRounder
    ? `あなたの傾向は「${type.name}」。${type.desc}`
    : `傾向としては「${type.name}」タイプ寄り！${type.desc}`;
}

function pickCard(pick, rank, { isMine, onMakeMine, onOpenMenu }) {
  return el("li", { className: "pick-card" }, [
    el("div", { className: "pick-head" }, [
      el("span", { className: "pick-rank" }, `${rank}位`),
      el("h3", { className: "pick-name" }, pick.name),
      el("span", { className: "pick-stars", "aria-label": `おすすめ度 3段階中${pick.stars}` }, [
        el("span", { className: "pick-stars-label" }, "おすすめ度"),
        el("span", { className: "pick-stars-value", "aria-hidden": "true" }, starLabel(pick.stars)),
      ]),
    ]),
    el("p", { className: "pick-oneline" }, pick.oneLine),
    el("p", { className: "pick-why" }, "ここが合う"),
    el("ul", { className: "pick-reasons" }, pick.reasons.map((r) => el("li", {}, r))),
    pick.profile.gimmick ? el("p", { className: "hint" }, `このキャラだけの仕掛け: ${pick.profile.gimmick}`) : null,
    el("div", { className: "pick-actions" }, [
      el("button", { type: "button", className: isMine ? "secondary-btn" : "primary-btn", disabled: isMine, onClick: () => onMakeMine(pick.name) }, isMine ? "マイキャラ設定中" : "マイキャラにする"),
      el("button", { type: "button", className: "secondary-btn", onClick: () => onOpenMenu(pick.name) }, "このキャラの上達メニューを見る"),
    ]),
  ]);
}

/**
 * 結果画面。
 * @param {object} p
 * @param {{ type, picks }} p.result - diagnose() の戻り値
 * @param {string} p.focus - 「どうやって上達するか」を出すキャラ
 * @param {{ items: object[] } | null} p.focusMenu - そのキャラのキャラ専用メニュー（characterMenuView）
 * @param {{ stageTitle: string, item: object } | null} p.roadmapStep - 共通ロードマップの次の一歩
 */
export function diagnosisResult({ result, focus, focusMenu, roadmapStep, activeFighter, status, date, onFocus, onMakeMine, onOpenMenu, onRetry, onClose }) {
  const { type, picks } = result;
  if (!picks.length) return diagnosisUnavailable({ onClose });
  const focusPick = picks.find((p) => p.name === focus) || picks[0];
  const firstSteps = focusMenu ? focusMenu.items.slice(0, 2) : [];
  const explain = tremoExplainer();
  return el("section", { className: "panel diagnosis" }, [
    el("div", { className: "card" }, [
      el("div", { className: "diag-head" }, [
        el("h2", {}, "診断結果"),
        date ? el("span", { className: "diag-count" }, date) : null,
      ]),
      coachSay(typeMessage(type), "joy"),
      el("p", { className: "diag-disclaimer" }, DIAGNOSIS_DISCLAIMER),
      el("div", { className: "type-badges" }, type.axes.map((a) => el("span", { className: `badge${a.balanced ? " balanced" : ""}` }, a.side))),
      el("div", { className: "axis-list" }, type.axes.map(axisRow)),
    ]),
    el("div", { className: "card" }, [
      el("h2", {}, "あなたに合うキャラ"),
      el("p", { className: "hint" }, "おすすめ度（★3段階）は、回答とキャラの特徴の近さの目安です。"),
      el("ol", { className: "pick-list" }, picks.map((pick, i) =>
        pickCard(pick, i + 1, { isMine: pick.name === activeFighter, onMakeMine, onOpenMenu }))),
      el("p", { className: "diag-status", role: "status" }, status || ""),
    ]),
    el("div", { className: "card" }, [
      el("h2", {}, "どうやって上達するか"),
      el("div", { className: "diag-chips", role: "group", "aria-label": "上達のしかたを見るキャラ" },
        picks.map((p) => el("button", {
          type: "button",
          className: `diag-chip${p.name === focusPick.name ? " selected" : ""}`,
          "aria-pressed": p.name === focusPick.name ? "true" : "false",
          onClick: () => onFocus(p.name),
        }, p.name))),
      el("h3", { className: "diag-sub" }, [pixelIcon("check"), `${focusPick.name}の最初の一歩`]),
      firstSteps.length
        ? el("ol", { className: "first-steps" }, firstSteps.map((item) => el("li", {}, [
            el("p", { className: "first-step-title" }, explain(item.title)),
            el("p", { className: "hint" }, explain(item.desc)),
            el("p", { className: "hint" }, `合格の目安: ${explain(item.check)}`),
          ])))
        : el("p", { className: "hint" }, "このキャラ専用メニューは準備中です。"),
      el("h3", { className: "diag-sub" }, [pixelIcon("stage1"), "みんな共通の次の一歩"]),
      roadmapStep
        ? el("div", {}, [
            el("p", { className: "first-step-title" }, explain(roadmapStep.item.title)),
            el("p", { className: "hint" }, `段階: ${roadmapStep.stageTitle}`),
            el("p", { className: "hint" }, explain(roadmapStep.item.desc)),
          ])
        : el("p", { className: "hint" }, "共通ロードマップは全部達成済み！キャラ専用メニューで仕上げよう。"),
      el("button", { type: "button", className: "secondary-btn wide-btn", onClick: () => onOpenMenu(focusPick.name) }, `${focusPick.name}の上達メニューをすべて見る`),
    ]),
    el("details", { className: "card diag-about" }, [
      el("summary", {}, "この診断のしくみと出典"),
      el("p", { className: "hint" }, "攻略サイトの解説をもとに、各キャラの特徴（リーチ・飛び道具・復帰・撃墜力・コンボ・空中戦・操作のしやすさ）を5段階にし、重さと走る速さの順位を合わせて、あなたの回答との近さを計算しています。"),
      ...picks.flatMap((p) => [
        el("h3", { className: "diag-source-name" }, `${p.name}の特徴データの出典`),
        el("ul", { className: "sources-list" }, p.profile.sources.map((url) => el("li", {}, [externalLink(url, decodeURIForLabel(url))]))),
      ]),
      el("h3", { className: "diag-source-name" }, "重さ・走る速さの順位の出典"),
      el("ul", { className: "sources-list" }, FIGHTER_RANK_SOURCES.map((s) => el("li", {}, [externalLink(s.url, s.title)]))),
    ]),
    el("div", { className: "diag-nav" }, [
      el("button", { type: "button", className: "secondary-btn", onClick: onRetry }, "もう一度診断する"),
      el("button", { type: "button", className: "secondary-btn", onClick: onClose }, "閉じる"),
    ]),
  ]);
}

/** 特徴データが1体分も無く、おすすめを出せないときの画面。 */
export function diagnosisUnavailable({ onClose }) {
  return el("section", { className: "panel diagnosis" }, [
    el("div", { className: "card" }, [
      el("h2", {}, "診断結果"),
      coachSay("診断データを準備中です。もう少し待っていてね。", "idle"),
      el("button", { type: "button", className: "secondary-btn wide-btn", onClick: onClose }, "閉じる"),
    ]),
  ]);
}

function decodeURIForLabel(url) {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
}
