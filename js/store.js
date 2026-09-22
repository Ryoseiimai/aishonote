// localStorage を扱う唯一のモジュール。キーは "aishonote.v1" 固定。
// DOM に依存しないため node:test でスキーマ検証だけ単体テストできる。
// データモデルはゲーム非依存: state.games に複数ゲームを持ち、対戦ログ・相性表は gameId で分ける。

import { SSBU_FIGHTERS } from "./presets/ssbu.js";

export const STORAGE_KEY = "aishonote.v1";
export const MAX_BYTES = 4 * 1024 * 1024; // 4MB
export const MAX_ARRAY_LEN = 10000;
export const MAX_STRING_LEN = 500;
export const MAX_NAME_LEN = 50;
export const DEFAULT_GAME_ID = "ssbu";

// プロトタイプ汚染対策: インポートJSON由来のキーでブラケット代入する際に必ず通すガード。
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const GAME_ID_RE = /^[a-z0-9_-]{1,32}$/;

/** ブラケット代入に使ってよいキーか(危険キーを拒否)。gameIdはさらに許可文字だけに制限する */
function isSafeKey(key) {
  return typeof key === "string" && key.length > 0 && !UNSAFE_KEYS.has(key);
}

function isValidGameId(id) {
  return typeof id === "string" && GAME_ID_RE.test(id) && !UNSAFE_KEYS.has(id);
}

// プリセット固定ファイター一覧(gameId -> string[])。プリセット以外は空配列(カスタムキャラのみ)。
const PRESET_FIGHTERS = {
  ssbu: SSBU_FIGHTERS,
};

export const LOSS_TAGS = [
  "復帰阻止された",
  "着地を狩られた",
  "ガードが硬い/崩せない",
  "掴みが多い",
  "飛び道具に触れない",
  "撃墜%まで運べない",
  "早期撃墜された",
  "焦って突っ込んだ",
  "崖攻めが弱い",
  "コンボ火力負け",
  "ステージ不利",
  "その他",
];

export function emptyState() {
  return {
    version: 2,
    games: {
      [DEFAULT_GAME_ID]: {
        id: DEFAULT_GAME_ID,
        name: "大乱闘スマッシュブラザーズ SPECIAL",
        isPreset: true,
        customFighters: [],
      },
    },
    activeGameId: DEFAULT_GAME_ID,
    myFightersByGame: { [DEFAULT_GAME_ID]: [] },
    activeFighterByGame: { [DEFAULT_GAME_ID]: null },
    matches: [],
    matchups: {},
  };
}

/** ゲームで選べるファイター一覧(プリセット固定分 + カスタムキャラ)を返す */
export function fightersOf(game) {
  if (!game) return [];
  const preset = game.isPreset ? PRESET_FIGHTERS[game.id] || [] : [];
  return [...preset, ...(game.customFighters || [])];
}

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isValidString(v, maxLen = MAX_STRING_LEN) {
  return typeof v === "string" && v.length > 0 && v.length <= maxLen;
}

function isValidDate(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** カスタムキャラ名を検証する(1〜50字) */
export function isValidFighterName(name) {
  return typeof name === "string" && name.trim().length > 0 && name.length <= MAX_NAME_LEN;
}

/**
 * 1試合分のログをスキーマ検証し、許可キーのみ残した新オブジェクトを返す。
 * 不正なら null を返す。
 * @param {object} m
 * @param {Map<string, Set<string>>} fighterSetByGame - gameId -> そのゲームで選択可能なファイター名の集合
 */
export function sanitizeMatch(m, fighterSetByGame) {
  if (!isPlainObject(m)) return null;
  if (!isValidString(m.id, 100)) return null;
  if (!isValidString(m.gameId, 100) || !fighterSetByGame.has(m.gameId)) return null;
  if (!isValidDate(m.date)) return null;
  const fighterSet = fighterSetByGame.get(m.gameId);
  if (!isValidString(m.my, MAX_STRING_LEN) || !fighterSet.has(m.my)) return null;
  if (!isValidString(m.opponent, MAX_STRING_LEN) || !fighterSet.has(m.opponent)) return null;
  if (m.result !== "win" && m.result !== "lose") return null;
  if (!Array.isArray(m.tags) || m.tags.length > LOSS_TAGS.length) return null;
  const tagSet = new Set(LOSS_TAGS);
  for (const t of m.tags) {
    if (typeof t !== "string" || !tagSet.has(t)) return null;
  }
  const memo = typeof m.memo === "string" ? m.memo.slice(0, MAX_STRING_LEN) : "";
  const createdAt = typeof m.createdAt === "number" && Number.isFinite(m.createdAt) ? m.createdAt : Date.now();
  return {
    id: m.id,
    gameId: m.gameId,
    date: m.date,
    my: m.my,
    opponent: m.opponent,
    result: m.result,
    tags: [...m.tags],
    memo,
    createdAt,
  };
}

function sanitizeGames(rawGames, errors) {
  if (!isPlainObject(rawGames)) {
    errors.push("games はオブジェクトである必要があります");
    return null;
  }
  const games = Object.create(null);
  for (const [gameId, g] of Object.entries(rawGames)) {
    if (!isValidGameId(gameId) || gameId !== (g && g.id)) {
      errors.push("games のキーと id が不正、または一致しないゲームがあります");
      return null;
    }
    if (!isPlainObject(g) || !isValidGameId(g.id) || !isValidString(g.name, MAX_NAME_LEN)) {
      errors.push("不正なゲーム定義が含まれています");
      return null;
    }
    const isPreset = g.isPreset === true;
    if (isPreset && !PRESET_FIGHTERS[g.id]) {
      errors.push(`未知のプリセットゲームIDです: ${g.id}`);
      return null;
    }
    let customFighters = [];
    if (g.customFighters !== undefined) {
      if (!Array.isArray(g.customFighters) || g.customFighters.length > MAX_ARRAY_LEN) {
        errors.push("customFighters は配列である必要があります");
        return null;
      }
      for (const f of g.customFighters) {
        if (!isValidFighterName(f)) {
          errors.push("不正なカスタムキャラ名が含まれています");
          return null;
        }
      }
      customFighters = [...g.customFighters];
    }
    games[gameId] = { id: g.id, name: g.name, isPreset, customFighters };
  }
  if (Object.keys(games).length === 0) {
    errors.push("games は最低1件必要です");
    return null;
  }
  return games;
}

/**
 * インポートJSONをスキーマ検証する。
 * 戻り値: { ok: boolean, errors: string[], data?: object }
 * 失敗時は data を返さない(呼び出し側で何も上書きしない)。
 */
export function validateImport(raw) {
  const errors = [];

  if (!isPlainObject(raw)) {
    return { ok: false, errors: ["ルートはオブジェクトである必要があります"] };
  }
  if (raw.version !== 2) {
    errors.push("version は 2 である必要があります");
  }

  const games = sanitizeGames(raw.games, errors);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  const fighterSetByGame = new Map(
    Object.entries(games).map(([gameId, g]) => [gameId, new Set(fightersOf(g))])
  );

  const activeGameId =
    typeof raw.activeGameId === "string" && games[raw.activeGameId] ? raw.activeGameId : Object.keys(games)[0];

  const myFightersByGame = Object.create(null);
  if (isPlainObject(raw.myFightersByGame)) {
    for (const [gameId, list] of Object.entries(raw.myFightersByGame)) {
      if (!isSafeKey(gameId) || !games[gameId] || !Array.isArray(list)) continue;
      const fighterSet = fighterSetByGame.get(gameId);
      myFightersByGame[gameId] = list.filter((f) => typeof f === "string" && fighterSet.has(f));
    }
  }
  for (const gameId of Object.keys(games)) {
    if (!myFightersByGame[gameId]) myFightersByGame[gameId] = [];
  }

  const activeFighterByGame = Object.create(null);
  if (isPlainObject(raw.activeFighterByGame)) {
    for (const [gameId, f] of Object.entries(raw.activeFighterByGame)) {
      if (!isSafeKey(gameId) || !games[gameId]) continue;
      const fighterSet = fighterSetByGame.get(gameId);
      activeFighterByGame[gameId] = typeof f === "string" && fighterSet.has(f) ? f : null;
    }
  }
  for (const gameId of Object.keys(games)) {
    if (!(gameId in activeFighterByGame)) activeFighterByGame[gameId] = null;
  }

  if (!Array.isArray(raw.matches)) {
    errors.push("matches は配列である必要があります");
  } else if (raw.matches.length > MAX_ARRAY_LEN) {
    errors.push(`matches は${MAX_ARRAY_LEN}件までです`);
  }

  const matches = [];
  if (Array.isArray(raw.matches) && raw.matches.length <= MAX_ARRAY_LEN) {
    for (const m of raw.matches) {
      const sanitized = sanitizeMatch(m, fighterSetByGame);
      if (sanitized === null) {
        errors.push("不正な対戦ログが含まれています");
        break;
      }
      matches.push(sanitized);
    }
  }

  const matchups = Object.create(null);
  if (isPlainObject(raw.matchups)) {
    for (const [key, val] of Object.entries(raw.matchups)) {
      if (!isSafeKey(key) || !isValidString(key, 300)) continue;
      if (!isPlainObject(val)) continue;
      const mark = ["good", "normal", "bad", null].includes(val.mark) ? val.mark : null;
      const memo = typeof val.memo === "string" ? val.memo.slice(0, MAX_STRING_LEN) : "";
      matchups[key] = { mark, memo };
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const data = { version: 2, games, activeGameId, myFightersByGame, activeFighterByGame, matches, matchups };
  const size = new TextEncoder().encode(JSON.stringify(data)).length;
  if (size > MAX_BYTES) {
    return { ok: false, errors: [`データサイズが上限(4MB)を超えています`] };
  }

  return { ok: true, errors: [], data };
}

/** state を localStorage に保存する。サイズ上限を超える場合は保存せず false を返す */
export function saveState(state) {
  const json = JSON.stringify(state);
  const size = new TextEncoder().encode(json).length;
  if (size > MAX_BYTES) return false;
  window.localStorage.setItem(STORAGE_KEY, json);
  return true;
}

/** localStorage から state を読み込む。無ければ初期状態を返す */
export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    const result = validateImport(parsed);
    if (!result.ok) return emptyState();
    return result.data;
  } catch {
    return emptyState();
  }
}
