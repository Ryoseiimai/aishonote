import { SSBU_DRILLS } from "./presets/ssbu-drills.js";
import { GENERIC_DRILLS } from "./drills-generic.js";
import { MATCHUP_REFERENCE } from "./presets/matchup-reference.js";
import {
  LOSS_TAGS,
  loadState,
  saveState,
  validateImport,
  fightersOf,
  isValidFighterName,
  MAX_STRING_LEN,
  MAX_NAME_LEN,
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

const TABS = ["home", "log", "matchup", "settings"];
const TAB_LABELS = { home: "ホーム", log: "記録", matchup: "相性", settings: "設定" };

let state = loadState();
let currentTab = "home";
let logDraft = makeLogDraft();
let matchupSelected = null; // 相性タブで編集中の相手キャラ
let fighterFilter = "";
let newGameNameDraft = "";
let newFighterNameDraft = "";

const root = document.getElementById("app");

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
    window.alert("データサイズが上限(4MB)を超えたため保存できませんでした。");
  }
}

function setState(patch) {
  state = { ...state, ...patch };
  persist();
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
          onClick: () => switchTab(tab),
        },
        TAB_LABELS[tab]
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
      el("p", {}, "まず「設定」タブでマイキャラを選び、自キャラを切り替えてください。"),
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
  const refNoteSection = refData
    ? el("div", { className: "card" }, [
        el("h2", {}, "一般的な相性の目安"),
        el(
          "p",
          { className: "hint" },
          `${my}は得意${refData.good.length}キャラ・苦手${refData.bad.length}キャラの目安データがあります。「相性」タブで詳しく見られます。`
        ),
      ])
    : null;

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

  return el("section", { className: "panel" }, [homeworkSection, weakSection, refNoteSection, summarySection, graphSection]);
}

function summaryBox(label, value) {
  return el("div", { className: "summary-box" }, [
    el("div", { className: "summary-value" }, value),
    el("div", { className: "summary-label" }, label),
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
    window.alert("自キャラと相手キャラを選んでください。");
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
        onClick: () => {
          if (window.confirm("この対戦記録を削除しますか？")) {
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
  return MATCHUP_REFERENCE[my] || null;
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

function renderReferenceCard(my, myMatches) {
  const ref = referenceDataFor(my);
  if (!ref) return null;
  const myFighterStats = matchupStats(myMatches, my);
  return el("div", { className: "card" }, [
    el("h2", {}, "一般的な相性の目安"),
    el(
      "p",
      { className: "hint" },
      "スマメイト(オンライン対戦)の統計に基づく目安です。腕前で変わります。あなた自身の対戦ログがあれば横に表示します。"
    ),
    el("div", { className: "ref-matchup-columns" }, [
      renderReferenceColumn("得意な相手", "good", ref.good, myFighterStats),
      renderReferenceColumn("苦手な相手", "bad", ref.bad, myFighterStats),
    ]),
    el(
      "p",
      { className: "ref-matchup-sources" },
      [
        "出典: ",
        ...ref.sources.flatMap((url, i) => [
          i > 0 ? "、" : null,
          el("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, url),
        ]),
      ].filter((x) => x !== null)
    ),
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
  return el("section", { className: "panel" }, [renderGameSection(), renderFighterSection(), renderDataSection()]);
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
    window.alert("ゲーム名は1〜50字で入力してください。");
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
      placeholder: "カスタムキャラ名を追加（50字まで）",
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
    window.alert("キャラ名は1〜50字で入力してください。");
    return;
  }
  const gameId = state.activeGameId;
  const game = state.games[gameId];
  if (fightersOf(game).includes(name)) {
    window.alert("同じ名前のキャラが既にあります。");
    return;
  }
  const updatedGame = { ...game, customFighters: [...game.customFighters, name] };
  const games = { ...state.games, [gameId]: updatedGame };
  newFighterNameDraft = "";
  setState({ games });
}

function onDeleteFighter(name) {
  if (!window.confirm(`「${name}」を削除しますか？過去の対戦記録は残ります。`)) return;
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
    el(
      "button",
      { type: "button", className: "secondary-btn", onClick: onExport },
      "JSONエクスポート"
    ),
    el("label", { className: "file-label" }, [
      "JSONインポート",
      el("input", { type: "file", accept: "application/json", onChange: onImportFile }),
    ]),
    el(
      "button",
      { type: "button", className: "danger-btn", onClick: onEraseAll },
      "全データを消去"
    ),
  ]);
}

function onExport() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: `aishonote-${todayStr()}.json` }, "download");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function onImportFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(String(reader.result));
    } catch {
      window.alert("JSONとして読み込めませんでした。");
      e.target.value = "";
      return;
    }
    const result = validateImport(parsed);
    if (!result.ok) {
      window.alert(`インポートに失敗しました:\n${result.errors.join("\n")}`);
      e.target.value = "";
      return;
    }
    if (!window.confirm("現在のデータを上書きしてインポートします。よろしいですか？")) {
      e.target.value = "";
      return;
    }
    state = result.data;
    persist();
    matchupSelected = null;
    logDraft = makeLogDraft();
    renderApp();
    e.target.value = "";
  };
  reader.readAsText(file);
}

function onEraseAll() {
  if (!window.confirm("本当に全データを消去しますか？")) return;
  if (!window.confirm("この操作は取り消せません。もう一度確認します。本当に消去しますか？")) return;
  state = {
    version: 2,
    games: { [DEFAULT_GAME_ID]: { id: DEFAULT_GAME_ID, name: "大乱闘スマッシュブラザーズ SPECIAL", isPreset: true, customFighters: [] } },
    activeGameId: DEFAULT_GAME_ID,
    myFightersByGame: { [DEFAULT_GAME_ID]: [] },
    activeFighterByGame: { [DEFAULT_GAME_ID]: null },
    matches: [],
    matchups: {},
  };
  persist();
  matchupSelected = null;
  logDraft = makeLogDraft();
  renderApp();
}

// ---------- ルート描画 ----------
function renderApp() {
  clear(root);
  const panel =
    currentTab === "home"
      ? renderHome()
      : currentTab === "log"
      ? renderLog()
      : currentTab === "matchup"
      ? renderMatchup()
      : renderSettings();

  root.appendChild(renderHeader());
  root.appendChild(panel);
  root.appendChild(renderBottomNav());
}

renderApp();
