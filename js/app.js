import { SSBU_DRILLS } from "./presets/ssbu-drills.js";
import { GENERIC_DRILLS } from "./drills-generic.js";
import { MATCHUP_LINKS } from "./presets/matchup-links.js";
import { referenceView, isNativePlatform, aboutSourceView, EMBED_REFERENCE_ON_NATIVE } from "./reference-display.js";
import { showAlert, showConfirm } from "./dialog.js";
import { SHIRATSUKI_URL, PRIVACY_POLICY_URL } from "./external-links.js";
import { SSBU_CURRICULUM } from "./presets/ssbu-curriculum.js";
import { characterMenuView } from "./char-curriculum-display.js";
import { experience } from "./progression.js";
import { guideCard, pixelIcon, levelNotice } from "./pixel-view.js";
import {
  stageRate,
  overallRate,
  nextStep,
  roundRateToStep,
  practiceStreak,
  weeklyMinutes,
} from "./curriculum-stats.js";
import {
  LOSS_TAGS,
  loadState,
  saveState,
  validateImport,
  fightersOf,
  isValidFighterName,
  MAX_STRING_LEN,
  MAX_NAME_LEN,
  MAX_PRACTICE_MINUTES_PER_DAY,
  DEFAULT_GAME_ID,
} from "./store.js";
import {
  winRate,
  recentWinRate,
  currentStreak,
  topLossTags,
  weeklyWinRates,
  matchupStats,
  sortByWeakness,
  sortByDateDesc,
} from "./stats.js";
import { el, clear, svgEl } from "./dom.js";

const TABS = ["home", "log", "growth", "matchup", "settings"];
const TAB_LABELS = { home: "ホーム", log: "記録", growth: "上達", matchup: "相性", settings: "設定" };
const APP_VERSION = "1.0"; // ios/App の MARKETING_VERSION と合わせる

let state = loadState();
let currentTab = "home";
let logDraft = makeLogDraft();
let matchupSelected = null; // 相性タブで編集中の相手キャラ
let fighterFilter = "";
let newGameNameDraft = "";
let newFighterNameDraft = "";

// ---------- 上達タブ: 今日の練習タイマー(永続化しない画面内だけの状態) ----------
let growthDuration = null; // 10 | 30 | 60 | null
let growthRunning = false;
let growthRemainingSec = 0;
let growthTimerId = null;
let growthStepChecks = []; // ステップごとのチェック(表示用。記録は分数だけ)
let termQuery = ""; // 用語辞典の検索語
let openRoadmapStages = new Set();

const root = document.getElementById("app");
// 通常の再描画やタイマー更新で演出を繰り返さない、独立した通知領域。
const levelStatus = el("div", { className: "level-status", role: "status", "aria-live": "polite", "aria-atomic": "true" });
document.body.appendChild(levelStatus);
let levelNoticeTimer = null;

function clearLevelNotice() {
  clearTimeout(levelNoticeTimer);
  levelNoticeTimer = null;
  clear(levelStatus);
}

function celebrateLevel(level) {
  clearLevelNotice();
  levelStatus.appendChild(levelNotice(level));
  levelNoticeTimer = setTimeout(clearLevelNotice, 2400);
}

// 相性の目安の同梱データ（シラツキ理論の相性表の抜粋）は Web 版だけが読み込む。
// iOS版は www/ にこのファイル自体が入らず（scripts/sync-www.sh）、MATCHUP_LINKS の出典URLでリンク案内だけ出す。
const IS_NATIVE = isNativePlatform();
let referenceModule = null; // { MATCHUP_REFERENCE, MATCHUP_REFERENCE_META }
if (!IS_NATIVE || EMBED_REFERENCE_ON_NATIVE) {
  import("./presets/matchup-reference.js")
    .then((mod) => {
      referenceModule = mod;
      renderApp();
    })
    .catch(() => {
      // 読み込めなければリンク案内のまま（MATCHUP_LINKS）で動かす。
    });
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function makeLogDraft() {
  const gameId = state.activeGameId;
  return {
    date: todayStr(),
    my: (state.activeFighterByGame && state.activeFighterByGame[gameId]) || "",
    opponent: "",
    result: "win",
    tags: [],
    memo: "",
  };
}

function activeGame() {
  return state.games[state.activeGameId];
}

function activeGameDrills() {
  const game = activeGame();
  if (game && game.isPreset && game.id === "ssbu") return SSBU_DRILLS;
  return GENERIC_DRILLS;
}

function persist() {
  const ok = saveState(state);
  if (!ok) {
    showAlert("データサイズが上限(4MB)を超えたため保存できませんでした。");
  }
}

function setState(patch) {
  const previousLevel = experience(state).level;
  state = { ...state, ...patch };
  persist();
  const nextLevel = experience(state).level;
  if (nextLevel > previousLevel) celebrateLevel(nextLevel);
  else if (nextLevel < previousLevel) clearLevelNotice();
  renderApp();
}

function switchTab(tab) {
  currentTab = tab;
  renderApp();
}

// ---------- ヘッダー ----------
function renderHeader() {
  const gameIds = Object.keys(state.games);
  const gameSelect = el(
    "select",
    {
      className: "game-select",
      "aria-label": "ゲーム切替",
      onChange: (e) => {
        matchupSelected = null;
        setState({ activeGameId: e.target.value });
        logDraft = makeLogDraft();
      },
    },
    gameIds.map((id) => el("option", { value: id, selected: id === state.activeGameId }, state.games[id].name))
  );

  const myFighters = state.myFightersByGame[state.activeGameId] || [];
  const fighterSelect = el(
    "select",
    {
      className: "active-fighter-select",
      "aria-label": "自キャラ切替",
      onChange: (e) => {
        const activeFighterByGame = { ...state.activeFighterByGame, [state.activeGameId]: e.target.value || null };
        setState({ activeFighterByGame });
      },
    },
    [
      el("option", { value: "" }, "自キャラ未選択"),
      ...myFighters.map((f) =>
        el("option", { value: f, selected: f === state.activeFighterByGame[state.activeGameId] }, f)
      ),
    ]
  );

  return el("header", { className: "app-header" }, [
    el("h1", {}, "相性ノート"),
    el("div", { className: "header-selects" }, [
      gameSelect,
      myFighters.length > 0 ? fighterSelect : el("span", { className: "hint" }, "設定でマイキャラを選んでください"),
    ]),
  ]);
}

// ---------- ボトムタブ ----------
function renderBottomNav() {
  return el(
    "nav",
    { className: "bottom-nav" },
    TABS.map((tab) =>
      el(
        "button",
        {
          type: "button",
          className: tab === currentTab ? "nav-btn active" : "nav-btn",
          "aria-current": tab === currentTab ? "page" : null,
          onClick: () => switchTab(tab),
        },
        [pixelIcon(tab), el("span", {}, TAB_LABELS[tab])]
      )
    )
  );
}

// ---------- ホーム ----------
function renderHome() {
  const gameId = state.activeGameId;
  const my = state.activeFighterByGame[gameId];
  if (!my) {
    return el("section", { className: "panel" }, [
      renderNextStepCard(),
      renderPracticeStatusCard(),
      el("div", { className: "card" }, [
        el("p", {}, "まず「設定」タブでマイキャラを選び、自キャラを切り替えてください。"),
      ]),
    ]);
  }
  const myMatches = state.matches.filter((m) => m.gameId === gameId && m.my === my);
  const drills = activeGameDrills();

  const loss3 = topLossTags(myMatches, { days: 30, topN: 3 });
  const homeworkSection = el("div", { className: "card" }, [
    el("h2", {}, "今週の課題"),
    loss3.length === 0
      ? el("p", { className: "hint" }, "直近30日の負けログがまだありません。")
      : el(
          "div",
          {},
          loss3.map(({ tag, count }) =>
            el("div", { className: "homework-item" }, [
              el("h3", {}, `${tag}（${count}回）`),
              el(
                "ul",
                {},
                (drills[tag] || []).map((d) => el("li", {}, d))
              ),
            ])
          )
        ),
  ]);

  const mStats = sortByWeakness(matchupStats(myMatches, my)).slice(0, 3);
  const weakSection = el("div", { className: "card" }, [
    el("h2", {}, "次に潰す相性"),
    mStats.length === 0
      ? el("p", { className: "hint" }, "対戦ログがまだありません。")
      : el(
          "ul",
          { className: "weak-list" },
          mStats.map((s) =>
            el("li", {}, [
              el("span", { className: "weak-name" }, s.opponent),
              el(
                "span",
                { className: "weak-rate" },
                s.provisional ? `${s.total}戦・様子見` : `勝率${Math.round(s.rate * 100)}%（${s.total}戦）`
              ),
            ])
          )
        ),
  ]);

  const refData = referenceDataFor(my);
  const refView = referenceView(my, refData, referenceOptions());
  const refNoteSection = !refView
    ? null
    : refView.mode === "link"
    ? el("div", { className: "card" }, [
        el("h2", {}, "一般的な相性の目安"),
        el("p", { className: "hint" }, refView.texts.linkGuide),
        externalLink(refView.url, refView.texts.linkButton, "ref-link-btn"),
      ])
    : el("div", { className: "card" }, [
        el("h2", {}, "一般的な相性の目安"),
        el(
          "p",
          { className: "hint" },
          `${my}は得意${refData.good.length}キャラ・苦手${refData.bad.length}キャラの目安データ（シラツキ理論の相性表の抜粋）があります。「相性」タブで詳しく見られます。`
        ),
        el("p", { className: "ref-matchup-sources" }, [externalLink(refView.url, refView.texts.sourceLink)]),
      ]);

  const recent10 = recentWinRate(myMatches, 10);
  const overall = winRate(myMatches);
  const streak = currentStreak(myMatches);
  const streakText =
    streak.count === 0
      ? "記録なし"
      : `${streak.type === "win" ? "連勝" : "連敗"} ${streak.count}`;

  const summarySection = el("div", { className: "card summary-grid" }, [
    summaryBox("直近10戦勝率", recent10.total ? `${Math.round(recent10.rate * 100)}%` : "-"),
    summaryBox("通算勝率", overall.total ? `${Math.round(overall.rate * 100)}%` : "-"),
    summaryBox("連勝/連敗", streakText),
    summaryBox("通算対戦数", `${overall.total}戦`),
  ]);

  const weekly = weeklyWinRates(myMatches);
  const graphSection = el("div", { className: "card" }, [
    el("h2", {}, "上達グラフ（週ごとの勝率）"),
    renderWeeklyGraph(weekly),
  ]);

  return el("section", { className: "panel" }, [
    renderNextStepCard(),
    renderPracticeStatusCard(),
    homeworkSection,
    weakSection,
    refNoteSection,
    summarySection,
    graphSection,
  ]);
}

// ---------- ホームの小カード(上達ロードマップの次の一歩・今日の練習状況) ----------
function renderNextStepCard() {
  const step = nextStep(SSBU_CURRICULUM.roadmap, new Set(state.progress));
  return guideCard({
    stats: experience(state), step,
    streak: practiceStreak(state.practiceLog, todayStr()),
    levelUp: levelNoticeTimer !== null,
    onNext: currentTab === "home" ? () => switchTab("growth") : null,
  });
}

function renderPracticeStatusCard() {
  const today = todayStr();
  const todayMinutes = state.practiceLog[today] || 0;
  return el("div", { className: "card summary-grid" }, [
    summaryBox("今日の練習", `${todayMinutes}分`),
    summaryBox("連続日数", `${practiceStreak(state.practiceLog, today)}日`),
  ]);
}

function summaryBox(label, value) {
  return el("div", { className: "summary-box" }, [
    el("div", { className: "summary-value" }, value),
    el("div", { className: "summary-label" }, label === "連続日数" ? [pixelIcon("flame"), label] : label),
  ]);
}

function renderWeeklyGraph(weekly) {
  const width = 320;
  const height = 140;
  const padding = 24;
  if (weekly.length === 0) {
    return el("p", { className: "hint" }, "データがたまるとここにグラフが出ます。");
  }
  const points = weekly.map((w, i) => {
    const x =
      weekly.length === 1
        ? width / 2
        : padding + (i * (width - padding * 2)) / (weekly.length - 1);
    const rate = w.rate === null ? 0 : w.rate;
    const y = padding + (1 - rate) * (height - padding * 2);
    return { x, y, w };
  });
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const svg = svgEl(
    "svg",
    { viewBox: `0 0 ${width} ${height}`, class: "weekly-graph", role: "img", "aria-label": "週ごとの勝率グラフ" },
    [
      svgEl("line", { x1: padding, y1: padding, x2: padding, y2: height - padding, class: "graph-axis" }),
      svgEl("line", { x1: padding, y1: height - padding, x2: width - padding, y2: height - padding, class: "graph-axis" }),
      svgEl("polyline", { points: polylinePoints, class: "graph-line", fill: "none" }),
      ...points.map((p) => svgEl("circle", { cx: p.x, cy: p.y, r: 3, class: "graph-dot" })),
    ]
  );
  return svg;
}

// ---------- 上達 ----------
function routineFor(minutes) {
  return SSBU_CURRICULUM.routines.find((r) => r.minutes === minutes) || null;
}

function stopGrowthTimer() {
  if (growthTimerId !== null) {
    clearInterval(growthTimerId);
    growthTimerId = null;
  }
  growthRunning = false;
}

function selectGrowthDuration(minutes) {
  stopGrowthTimer();
  growthDuration = minutes;
  const routine = routineFor(minutes);
  growthStepChecks = routine ? routine.steps.map(() => false) : [];
  growthRemainingSec = minutes * 60;
  renderApp();
}

function startGrowthTimer() {
  if (!growthDuration || growthRunning) return;
  if (growthRemainingSec <= 0) growthRemainingSec = growthDuration * 60;
  growthRunning = true;
  growthTimerId = setInterval(() => {
    growthRemainingSec -= 1;
    if (growthRemainingSec <= 0) {
      growthRemainingSec = 0;
      completeGrowthSession();
      return;
    }
    renderApp();
  }, 1000);
  renderApp();
}

function pauseGrowthTimer() {
  stopGrowthTimer();
  renderApp();
}

/** 今日の練習を完了として記録する(タイマーが0になったとき、または手動で完了ボタンを押したとき)。 */
function completeGrowthSession() {
  stopGrowthTimer();
  if (!growthDuration) return;
  const today = todayStr();
  const practiceLog = { ...state.practiceLog, [today]: Math.min(MAX_PRACTICE_MINUTES_PER_DAY, (state.practiceLog[today] || 0) + growthDuration) };
  growthDuration = null;
  growthRemainingSec = 0;
  growthStepChecks = [];
  setState({ practiceLog });
}

function formatMMSS(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function renderTodayPractice() {
  const routine = growthDuration ? routineFor(growthDuration) : null;

  const durationButtons = el(
    "div",
    { className: "duration-buttons" },
    SSBU_CURRICULUM.routines.map((r) =>
      el(
        "button",
        {
          type: "button",
          className: `secondary-btn${growthDuration === r.minutes ? " selected" : ""}`,
          onClick: () => selectGrowthDuration(r.minutes),
        },
        `${r.minutes}分`
      )
    )
  );

  const stepsList = routine
    ? el(
        "ul",
        { className: "practice-steps" },
        routine.steps.map((step, i) =>
          el("li", { className: "practice-step" }, [
            el("label", { className: "roadmap-item-label" }, [
              el("input", {
                type: "checkbox",
                checked: growthStepChecks[i] || false,
                onChange: () => {
                  growthStepChecks = growthStepChecks.map((c, idx) => (idx === i ? !c : c));
                  renderApp();
                },
              }),
              el("span", {}, `${step.title}（${step.minutes}分）`),
            ]),
            el("p", { className: "hint" }, step.how),
          ])
        )
      )
    : null;

  const controls = growthDuration
    ? el("div", { className: "practice-controls" }, [
        el("div", { className: "practice-timer" }, formatMMSS(growthRemainingSec)),
        growthRunning
          ? el("button", { type: "button", className: "secondary-btn", onClick: pauseGrowthTimer }, "一時停止")
          : el("button", { type: "button", className: "primary-btn", onClick: startGrowthTimer }, "スタート"),
        el(
          "button",
          { type: "button", className: "secondary-btn", onClick: completeGrowthSession },
          "今日完了として記録"
        ),
      ])
    : null;

  const today = todayStr();
  return el("div", { className: "card" }, [
    el("h2", {}, "今日の練習"),
    el("p", { className: "hint" }, "時間を選んでステップを確認しながら練習し、終わったら記録しましょう。"),
    durationButtons,
    stepsList,
    controls,
    el("div", { className: "summary-grid" }, [
      summaryBox("連続日数", `${practiceStreak(state.practiceLog, today)}日`),
      summaryBox("今週の合計", `${weeklyMinutes(state.practiceLog, today)}分`),
    ]),
  ]);
}

function renderRoadmapItem(item, progressSet) {
  const checked = progressSet.has(item.id);
  return el("li", { className: "roadmap-item" }, [
    el("label", { className: "roadmap-item-label" }, [
      el("input", { type: "checkbox", checked, onChange: () => toggleProgress(item.id) }),
      checked ? pixelIcon("check") : null,
      el("span", { className: "roadmap-item-title" }, item.title),
    ]),
    el("p", { className: "hint" }, item.desc),
    el("p", { className: "hint" }, `合格の目安: ${item.check}`),
  ]);
}

function toggleProgress(id) {
  const set = new Set(state.progress);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  setState({ progress: [...set] });
}

function renderRoadmapStage(stage, progressSet, index) {
  const rate = stageRate(stage, progressSet);
  return el("details", { className: "roadmap-stage", dataset: { stage: stage.stage }, open: openRoadmapStages.has(stage.stage) }, [
    el("summary", {}, [pixelIcon(`stage${index + 1}`), `${stage.title}（${Math.round(rate * 100)}%）`]),
    el("p", { className: "hint" }, stage.goal),
    el("div", { className: `progress-bar progress-w-${roundRateToStep(rate)}` }, [
      el("div", { className: "progress-fill" }),
    ]),
    el(
      "ul",
      { className: "roadmap-items" },
      stage.items.map((item) => renderRoadmapItem(item, progressSet))
    ),
  ]);
}

function renderRoadmap() {
  const progressSet = new Set(state.progress);
  const overall = overallRate(SSBU_CURRICULUM.roadmap, progressSet);
  return el("div", { className: "card" }, [
    el("h2", {}, "上達ロードマップ"),
    el("div", { className: `progress-bar progress-w-${roundRateToStep(overall)}` }, [
      el("div", { className: "progress-fill" }),
    ]),
    el("p", { className: "hint" }, `全体の達成率 ${Math.round(overall * 100)}%`),
    ...SSBU_CURRICULUM.roadmap.map((stage, index) => renderRoadmapStage(stage, progressSet, index)),
  ]);
}

function renderCharacterMenu() {
  const my = state.activeFighterByGame[state.activeGameId];
  const progressSet = new Set(state.progress);
  const menu = characterMenuView(state.activeGameId, my, progressSet);
  const body = menu
    ? [
        el("div", { className: `progress-bar progress-w-${roundRateToStep(menu.rate)}` }, [
          el("div", { className: "progress-fill" }),
        ]),
        el("p", { className: "hint" }, `キャラ専用メニューの達成率 ${Math.round(menu.rate * 100)}%`),
        el(
          "ul",
          { className: "roadmap-items" },
          menu.items.map((item) => renderRoadmapItem(item, progressSet))
        ),
        el("div", { className: "character-menu-sources" }, [
          el("p", { className: "hint" }, "このキャラの出典"),
          el("ul", { className: "sources-list" }, menu.sources.map((source) =>
            el("li", {}, [externalLink(source.url, source.title)])
          )),
        ]),
      ]
    : [el("p", { className: "hint" }, "このキャラ専用メニューは準備中です。")];
  return el("div", { className: "card character-menu" }, [
    el("h2", {}, `キャラ専用メニュー${my ? `（${my}）` : ""}`),
    ...body,
  ]);
}

function renderGlossary() {
  const q = termQuery.trim();
  const filtered = SSBU_CURRICULUM.glossary.filter((g) => !q || g.term.includes(q) || g.desc.includes(q));
  return el("div", { className: "card" }, [
    el("h2", {}, "用語辞典"),
    el("input", {
      type: "search",
      placeholder: "用語で検索",
      value: termQuery,
      onInput: (e) => {
        termQuery = e.target.value;
        renderApp();
      },
    }),
    el(
      "ul",
      { className: "glossary-list" },
      filtered.map((g) =>
        el("li", { className: "glossary-item" }, [
          el("span", { className: "glossary-term" }, g.term),
          el("span", { className: "glossary-desc" }, g.desc),
        ])
      )
    ),
    filtered.length === 0 ? el("p", { className: "hint" }, "該当する用語がありません。") : null,
  ]);
}

function renderReviewAndMental() {
  return el("details", { className: "card" }, [
    el("summary", {}, "振り返り・メンタル"),
    el(
      "ul",
      { className: "review-list" },
      SSBU_CURRICULUM.review.map((r) => el("li", {}, [el("h3", {}, r.title), el("p", { className: "hint" }, r.desc)]))
    ),
  ]);
}

function renderRecommendedSettings() {
  return el("details", { className: "card" }, [
    el("summary", {}, "おすすめ設定"),
    el(
      "ul",
      { className: "review-list" },
      SSBU_CURRICULUM.settings.map((s) =>
        el("li", {}, [
          el("h3", {}, s.title),
          el("p", { className: "hint" }, s.desc),
          externalLink(s.source, "出典を見る", "settings-tip-source"),
        ])
      )
    ),
  ]);
}

function renderCurriculumSources() {
  return el("div", { className: "card sources-card" }, [
    el("h2", {}, "出典"),
    el(
      "ul",
      { className: "sources-list" },
      SSBU_CURRICULUM.sources.map((s) => el("li", {}, [externalLink(s.url, s.title)]))
    ),
  ]);
}

function renderGrowth() {
  return el("section", { className: "panel" }, [
    renderNextStepCard(),
    renderTodayPractice(),
    renderRoadmap(),
    renderCharacterMenu(),
    renderGlossary(),
    renderReviewAndMental(),
    renderRecommendedSettings(),
    renderCurriculumSources(),
  ]);
}

// ---------- 記録 ----------
function renderLog() {
  const gameId = state.activeGameId;
  const fighters = fightersOf(state.games[gameId]);

  const form = el("form", { className: "log-form", onSubmit: onSubmitLog }, [
    el("label", {}, [
      "日付",
      el("input", {
        type: "date",
        value: logDraft.date,
        required: true,
        onInput: (e) => (logDraft.date = e.target.value),
      }),
    ]),
    fighterSelectField("自キャラ", fighters, logDraft.my, (v) => (logDraft.my = v)),
    fighterSelectField("相手キャラ", fighters, logDraft.opponent, (v) => (logDraft.opponent = v)),
    el("fieldset", {}, [
      el("legend", {}, "勝敗"),
      resultRadio("win", "勝ち"),
      resultRadio("lose", "負け"),
    ]),
    logDraft.result === "lose"
      ? el("fieldset", { className: "tag-list" }, [
          el("legend", {}, "負けた理由（複数可）"),
          ...LOSS_TAGS.map((tag) =>
            el("label", { className: "tag-checkbox" }, [
              el("input", {
                type: "checkbox",
                checked: logDraft.tags.includes(tag),
                onChange: (e) => {
                  if (e.target.checked) logDraft.tags = [...logDraft.tags, tag];
                  else logDraft.tags = logDraft.tags.filter((t) => t !== tag);
                },
              }),
              tag,
            ])
          ),
        ])
      : null,
    el("label", {}, [
      "一言メモ（任意・500字まで）",
      el("textarea", {
        maxlength: MAX_STRING_LEN,
        value: logDraft.memo,
        onInput: (e) => (logDraft.memo = e.target.value),
      }),
    ]),
    el("button", { type: "submit", className: "primary-btn" }, "記録する"),
  ]);

  const gameMatches = state.matches.filter((m) => m.gameId === gameId);
  const list = el("ul", { className: "match-list" }, sortByDateDesc(gameMatches).map((m) => renderMatchItem(m)));

  return el("section", { className: "panel" }, [
    el("div", { className: "card" }, [el("h2", {}, "対戦を記録"), fighters.length === 0 ? el("p", { className: "hint" }, "設定でキャラを追加してください。") : form]),
    el("div", { className: "card" }, [el("h2", {}, "対戦一覧"), gameMatches.length === 0 ? el("p", { className: "hint" }, "まだ記録がありません。") : list]),
  ]);
}

function resultRadio(value, label) {
  return el("label", { className: "radio-label" }, [
    el("input", {
      type: "radio",
      name: "result",
      value,
      checked: logDraft.result === value,
      onChange: () => {
        logDraft.result = value;
        renderApp();
      },
    }),
    label,
  ]);
}

function fighterSelectField(label, fighters, value, onChange) {
  return el("label", {}, [
    label,
    el(
      "select",
      {
        required: true,
        onChange: (e) => onChange(e.target.value),
      },
      [
        el("option", { value: "" }, "選択してください"),
        ...fighters.map((f) => el("option", { value: f, selected: f === value }, f)),
      ]
    ),
  ]);
}

function onSubmitLog(e) {
  e.preventDefault();
  if (!logDraft.my || !logDraft.opponent) {
    showAlert("自キャラと相手キャラを選んでください。");
    return;
  }
  const match = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    gameId: state.activeGameId,
    date: logDraft.date || todayStr(),
    my: logDraft.my,
    opponent: logDraft.opponent,
    result: logDraft.result,
    tags: logDraft.result === "lose" ? logDraft.tags : [],
    memo: logDraft.memo.slice(0, MAX_STRING_LEN),
    createdAt: Date.now(),
  };
  const nextMatches = [...state.matches, match];
  // 直近の自キャラ・相手キャラを次回初期値にする
  logDraft = {
    date: todayStr(),
    my: match.my,
    opponent: match.opponent,
    result: "win",
    tags: [],
    memo: "",
  };
  setState({ matches: nextMatches });
}

function renderMatchItem(m) {
  return el("li", { className: `match-item ${m.result}` }, [
    el("div", { className: "match-line1" }, [
      el("span", { className: "match-date" }, m.date),
      el("span", { className: "match-result" }, m.result === "win" ? "勝ち" : "負け"),
    ]),
    el("div", { className: "match-line2" }, `${m.my} vs ${m.opponent}`),
    m.tags.length > 0 ? el("div", { className: "match-tags" }, m.tags.join(" / ")) : null,
    m.memo ? el("div", { className: "match-memo" }, m.memo) : null,
    el(
      "button",
      {
        type: "button",
        className: "delete-btn",
        onClick: async () => {
          if (await showConfirm("この対戦記録を削除しますか？", { okLabel: "削除", danger: true })) {
            setState({ matches: state.matches.filter((x) => x.id !== m.id) });
          }
        },
      },
      "削除"
    ),
  ]);
}

// ---------- 相性の目安(スマメイトの統計。対戦ログが無くても出す) ----------
function referenceDataFor(my) {
  if (referenceModule) return referenceModule.MATCHUP_REFERENCE[my] || null;
  // good/bad を持たない＝referenceView がリンク案内にする
  return MATCHUP_LINKS[my] ? { sources: [MATCHUP_LINKS[my]] } : null;
}

function referenceOptions() {
  return { isNative: IS_NATIVE, meta: referenceModule ? referenceModule.MATCHUP_REFERENCE_META : null };
}

function myStatsText(myFighterStats, opponentName) {
  const stats = myFighterStats.find((s) => s.opponent === opponentName);
  if (!stats || stats.total === 0) return null;
  if (stats.provisional) return `あなたは${stats.total}戦・様子見`;
  return `あなたは ${stats.wins}勝${stats.total - stats.wins}敗（勝率${Math.round(stats.rate * 100)}%）`;
}

function renderReferenceColumn(title, className, list, myFighterStats) {
  return el("div", { className: `ref-matchup-col ${className}` }, [
    el("h3", {}, title),
    ...list.map((item) => {
      const mine = myStatsText(myFighterStats, item.name);
      return el("div", { className: "ref-matchup-item" }, [
        el("span", { className: "ref-matchup-name" }, item.name),
        el("span", { className: "ref-matchup-note" }, item.note),
        mine ? el("span", { className: "ref-matchup-mine" }, mine) : null,
      ]);
    }),
  ]);
}

/** 外部リンク。タップしたときだけブラウザ（iOSアプリでは Safari）で開く。 */
function externalLink(href, text, className) {
  return el("a", { href, target: "_blank", rel: "noopener noreferrer", className }, text);
}

function renderReferenceCard(my, myMatches) {
  const ref = referenceDataFor(my);
  const view = referenceView(my, ref, referenceOptions());
  if (!view) return null;
  if (view.mode === "link") {
    return el("div", { className: "card" }, [
      el("h2", {}, "一般的な相性の目安"),
      el("p", {}, view.texts.linkGuide),
      externalLink(view.url, view.texts.linkButton, "ref-link-btn"),
    ]);
  }
  const myFighterStats = matchupStats(myMatches, my);
  return el("div", { className: "card" }, [
    el("h2", {}, "一般的な相性の目安"),
    el("p", { className: "hint" }, view.texts.description),
    el("div", { className: "ref-matchup-columns" }, [
      renderReferenceColumn("得意な相手", "good", ref.good, myFighterStats),
      renderReferenceColumn("苦手な相手", "bad", ref.bad, myFighterStats),
    ]),
    el("p", { className: "ref-matchup-sources" }, [externalLink(view.url, view.texts.sourceLink)]),
  ]);
}

// ---------- 相性 ----------
function renderMatchup() {
  const gameId = state.activeGameId;
  const my = state.activeFighterByGame[gameId];
  if (!my) {
    return el("section", { className: "panel" }, [el("p", {}, "設定でマイキャラと自キャラを選んでください。")]);
  }
  const fighters = fightersOf(state.games[gameId]);
  const myMatches = state.matches.filter((m) => m.gameId === gameId && m.my === my);
  const referenceCard = renderReferenceCard(my, myMatches);
  const computed = matchupStats(myMatches, my);
  const computedMap = new Map(computed.map((c) => [c.opponent, c]));

  const rows = fighters
    .filter((f) => f !== my)
    .map((opponent) => {
      const key = `${gameId}__${my}__${opponent}`;
      const manual = state.matchups[key] || { mark: null, memo: "" };
      const stats = computedMap.get(opponent) || { total: 0, wins: 0, rate: null, provisional: true };
      return { opponent, manual, stats, key };
    });

  const sorted = sortByWeakness(
    rows.map((r) => ({
      ...r.stats,
      opponent: r.opponent,
      rate: r.stats.rate === null ? 0 : r.stats.rate,
      __row: r,
    }))
  );

  const list = el(
    "ul",
    { className: "matchup-list" },
    sorted.map(({ __row: r }) =>
      el(
        "li",
        {
          className: "matchup-item",
          onClick: () => {
            matchupSelected = r.opponent;
            renderApp();
          },
        },
        [
          el("span", { className: "matchup-name" }, r.opponent),
          el(
            "span",
            { className: "matchup-rate" },
            r.stats.total < 5
              ? `${r.stats.total}戦・様子見`
              : `勝率${Math.round(r.stats.rate * 100)}%（${r.stats.total}戦）`
          ),
          r.manual.mark ? el("span", { className: `mark mark-${r.manual.mark}` }, markLabel(r.manual.mark)) : null,
        ]
      )
    )
  );

  const editor = matchupSelected ? renderMatchupEditor(gameId, my, matchupSelected) : null;

  return el("section", { className: "panel" }, [
    referenceCard,
    el("div", { className: "card" }, [el("h2", {}, `相性表（${my}）`), el("p", { className: "hint" }, "苦手順に並んでいます。タップすると印とメモを編集できます。"), list]),
    editor,
  ]);
}

function markLabel(mark) {
  return { good: "得意", normal: "普通", bad: "苦手" }[mark] || "";
}

function renderMatchupEditor(gameId, my, opponent) {
  const key = `${gameId}__${my}__${opponent}`;
  const current = state.matchups[key] || { mark: null, memo: "" };
  let draftMark = current.mark;
  let draftMemo = current.memo;

  const memoInput = el("textarea", {
    maxlength: MAX_STRING_LEN,
    value: draftMemo,
    onInput: (e) => (draftMemo = e.target.value),
  });

  const markButtons = el(
    "div",
    { className: "mark-buttons" },
    ["good", "normal", "bad"].map((mark) =>
      el(
        "button",
        {
          type: "button",
          className: `mark-btn mark-${mark}${draftMark === mark ? " selected" : ""}`,
          onClick: () => {
            draftMark = draftMark === mark ? null : mark;
            renderApp();
          },
        },
        markLabel(mark)
      )
    )
  );

  return el("div", { className: "card" }, [
    el("h2", {}, `${opponent} との相性メモ`),
    markButtons,
    el("label", {}, ["メモ（500字まで）", memoInput]),
    el("div", { className: "editor-actions" }, [
      el(
        "button",
        {
          type: "button",
          className: "primary-btn",
          onClick: () => {
            const matchups = { ...state.matchups, [key]: { mark: draftMark, memo: draftMemo.slice(0, MAX_STRING_LEN) } };
            matchupSelected = null;
            setState({ matchups });
          },
        },
        "保存"
      ),
      el(
        "button",
        {
          type: "button",
          className: "secondary-btn",
          onClick: () => {
            matchupSelected = null;
            renderApp();
          },
        },
        "閉じる"
      ),
    ]),
  ]);
}

// ---------- 設定 ----------
function renderSettings() {
  return el("section", { className: "panel" }, [
    renderGameSection(),
    renderFighterSection(),
    renderDataSection(),
    renderAboutSection(),
  ]);
}

function renderGameSection() {
  const gameList = el(
    "ul",
    { className: "game-list" },
    Object.values(state.games).map((g) =>
      el("li", { className: "game-item" }, [
        el("span", {}, g.name),
        g.isPreset ? el("span", { className: "badge" }, "プリセット") : el("span", { className: "badge" }, "カスタム"),
      ])
    )
  );

  const addGameForm = el("form", { className: "inline-form", onSubmit: onAddGame }, [
    el("input", {
      type: "text",
      placeholder: "新しいゲーム名（50字まで）",
      maxlength: MAX_NAME_LEN,
      value: newGameNameDraft,
      onInput: (e) => (newGameNameDraft = e.target.value),
    }),
    el("button", { type: "submit", className: "secondary-btn" }, "ゲームを追加"),
  ]);

  return el("div", { className: "card" }, [el("h2", {}, "ゲーム"), gameList, addGameForm]);
}

function onAddGame(e) {
  e.preventDefault();
  const name = newGameNameDraft.trim();
  if (!isValidFighterName(name)) {
    showAlert("ゲーム名は1〜50字で入力してください。");
    return;
  }
  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const games = { ...state.games, [id]: { id, name, isPreset: false, customFighters: [] } };
  const myFightersByGame = { ...state.myFightersByGame, [id]: [] };
  const activeFighterByGame = { ...state.activeFighterByGame, [id]: null };
  newGameNameDraft = "";
  setState({ games, myFightersByGame, activeFighterByGame, activeGameId: id });
  logDraft = makeLogDraft();
}

function renderFighterSection() {
  const gameId = state.activeGameId;
  const game = state.games[gameId];
  const fighters = fightersOf(game);
  const filtered = fighters.filter((f) => f.includes(fighterFilter));
  const myFighters = state.myFightersByGame[gameId] || [];

  const customSet = new Set(game.customFighters);

  const fighterCheckboxes = el(
    "div",
    { className: "fighter-checklist" },
    filtered.map((f) =>
      el("div", { className: "fighter-checkbox" }, [
        el("label", { className: "fighter-checkbox-label" }, [
          el("input", {
            type: "checkbox",
            checked: myFighters.includes(f),
            onChange: (e) => {
              let updated;
              if (e.target.checked) updated = [...myFighters, f];
              else updated = myFighters.filter((x) => x !== f);
              const myFightersByGame = { ...state.myFightersByGame, [gameId]: updated };
              const currentActive = state.activeFighterByGame[gameId];
              const activeFighterByGame = {
                ...state.activeFighterByGame,
                [gameId]: updated.includes(currentActive) ? currentActive : updated[0] || null,
              };
              setState({ myFightersByGame, activeFighterByGame });
            },
          }),
          f,
        ]),
        customSet.has(f)
          ? el(
              "button",
              {
                type: "button",
                className: "delete-fighter-btn",
                "aria-label": `${f}を削除`,
                onClick: () => onDeleteFighter(f),
              },
              "削除"
            )
          : null,
      ])
    )
  );

  const addFighterForm = el("form", { className: "inline-form", onSubmit: onAddFighter }, [
    el("input", {
      type: "text",
      placeholder: "キャラ名を追加（50字まで）",
      maxlength: MAX_NAME_LEN,
      value: newFighterNameDraft,
      onInput: (e) => (newFighterNameDraft = e.target.value),
    }),
    el("button", { type: "submit", className: "secondary-btn" }, "キャラを追加"),
  ]);

  return el("div", { className: "card" }, [
    el("h2", {}, `マイキャラ設定（${game.name}・${myFighters.length}体選択中）`),
    el("input", {
      type: "search",
      placeholder: "キャラ名で絞り込み",
      value: fighterFilter,
      onInput: (e) => {
        fighterFilter = e.target.value;
        renderApp();
      },
    }),
    fighterCheckboxes,
    addFighterForm,
  ]);
}

function onAddFighter(e) {
  e.preventDefault();
  const name = newFighterNameDraft.trim();
  if (!isValidFighterName(name)) {
    showAlert("キャラ名は1〜50字で入力してください。");
    return;
  }
  const gameId = state.activeGameId;
  const game = state.games[gameId];
  if (fightersOf(game).includes(name)) {
    showAlert("同じ名前のキャラが既にあります。");
    return;
  }
  const updatedGame = { ...game, customFighters: [...game.customFighters, name] };
  const games = { ...state.games, [gameId]: updatedGame };
  newFighterNameDraft = "";
  setState({ games });
}

async function onDeleteFighter(name) {
  if (!(await showConfirm(`「${name}」を削除しますか？過去の対戦記録は残ります。`, { okLabel: "削除", danger: true }))) return;
  const gameId = state.activeGameId;
  const game = state.games[gameId];
  const updatedGame = { ...game, customFighters: game.customFighters.filter((f) => f !== name) };
  const games = { ...state.games, [gameId]: updatedGame };
  const myFightersByGame = {
    ...state.myFightersByGame,
    [gameId]: (state.myFightersByGame[gameId] || []).filter((f) => f !== name),
  };
  const activeFighterByGame = {
    ...state.activeFighterByGame,
    [gameId]: state.activeFighterByGame[gameId] === name ? null : state.activeFighterByGame[gameId],
  };
  setState({ games, myFightersByGame, activeFighterByGame });
}

function renderDataSection() {
  return el("div", { className: "card" }, [
    el("h2", {}, "データ"),
    canExport()
      ? el("button", { type: "button", className: "secondary-btn", onClick: onExport }, "JSONエクスポート")
      : null,
    el("label", { className: "file-label" }, [
      "JSONインポート（ファイルを選ぶ）",
      el("input", { type: "file", accept: "application/json", onChange: onImportFile }),
    ]),
    el(
      "button",
      { type: "button", className: "danger-btn", onClick: onEraseAll },
      "全データを消去"
    ),
  ]);
}

function renderAboutSection() {
  const about = aboutSourceView(referenceOptions());
  return el("div", { className: "card about-card" }, [
    el("h2", {}, "このアプリについて"),
    el(
      "p",
      {},
      "本アプリは個人が制作した非公式のファンツールで、任天堂株式会社および各キャラクターの権利者とは一切関係がなく、承認・提携を受けたものではありません。ゲームの画像・ロゴ・音声は使用していません。記載の名称は各社の商標または登録商標です。"
    ),
    el("h3", {}, about.heading),
    el("p", {}, [externalLink(SHIRATSUKI_URL, "シラツキ理論"), about.suffix]),
    el("h3", {}, "プライバシー"),
    el("p", {}, [
      "記録はこの端末の中だけに保存され、外部に送信されません。",
      externalLink(PRIVACY_POLICY_URL, "プライバシーポリシー"),
    ]),
    el("p", { className: "hint" }, `バージョン ${APP_VERSION}`),
  ]);
}

function exportFile() {
  const json = JSON.stringify(state, null, 2);
  return new File([json], `aishonote-${todayStr()}.json`, { type: "application/json" });
}

// iOSアプリ（WKWebView）は <a download> の blob: ダウンロードを扱えないため、共有シート（Web Share API）で書き出す。
// 共有シートでファイルを渡せない環境ではボタン自体を出さない。
function canExport() {
  if (!IS_NATIVE) return true;
  try {
    const probe = new File(["{}"], "aishonote.json", { type: "application/json" });
    return typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

async function onExport() {
  const file = exportFile();
  if (IS_NATIVE) {
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      if (!err || err.name !== "AbortError") showAlert("書き出せませんでした。");
    }
    return;
  }
  const url = URL.createObjectURL(file);
  const a = el("a", { href: url, download: file.name }, "download");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function onImportFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    let parsed;
    try {
      parsed = JSON.parse(String(reader.result));
    } catch {
      showAlert("JSONとして読み込めませんでした。");
      e.target.value = "";
      return;
    }
    const result = validateImport(parsed);
    if (!result.ok) {
      showAlert(`インポートに失敗しました:\n${result.errors.join("\n")}`);
      e.target.value = "";
      return;
    }
    if (!(await showConfirm("現在のデータを上書きしてインポートします。よろしいですか？", { okLabel: "インポート" }))) {
      e.target.value = "";
      return;
    }
    clearLevelNotice();
    state = result.data;
    persist();
    matchupSelected = null;
    logDraft = makeLogDraft();
    renderApp();
    e.target.value = "";
  };
  reader.readAsText(file);
}

async function onEraseAll() {
  if (!(await showConfirm("本当に全データを消去しますか？", { okLabel: "消去", danger: true }))) return;
  if (!(await showConfirm("この操作は取り消せません。もう一度確認します。本当に消去しますか？", { okLabel: "消去する", danger: true }))) return;
  clearLevelNotice();
  state = {
    version: 2,
    games: { [DEFAULT_GAME_ID]: { id: DEFAULT_GAME_ID, name: "大乱闘スマッシュブラザーズ SPECIAL", isPreset: true, customFighters: [] } },
    activeGameId: DEFAULT_GAME_ID,
    myFightersByGame: { [DEFAULT_GAME_ID]: [] },
    activeFighterByGame: { [DEFAULT_GAME_ID]: null },
    matches: [],
    matchups: {},
    progress: [],
    practiceLog: {},
  };
  persist();
  matchupSelected = null;
  logDraft = makeLogDraft();
  renderApp();
}

// ---------- ルート描画 ----------
function renderApp() {
  // チェックしてXPを更新しても、開いていた段階を閉じない。
  const stages = root.querySelectorAll(".roadmap-stage");
  if (stages.length) openRoadmapStages = new Set([...stages].filter((node) => node.open).map((node) => node.dataset.stage));
  clear(root);
  const panel =
    currentTab === "home"
      ? renderHome()
      : currentTab === "log"
      ? renderLog()
      : currentTab === "growth"
      ? renderGrowth()
      : currentTab === "matchup"
      ? renderMatchup()
      : renderSettings();

  root.appendChild(renderHeader());
  root.appendChild(panel);
  root.appendChild(renderBottomNav());
}

renderApp();
