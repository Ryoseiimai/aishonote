// キャラ診断の計算（純粋関数）。DOM・localStorage に触れないので node:test で検証する。
// 4軸はどれも 0=左の極（攻め/近/スピード/正統派）〜1=右の極（待ち/遠/パワー/トリッキー）。
// 意図的簡略化: 軸の重みと言葉は調査データ（5段階の指標）からの目安で、統計的な検証はしていない。
//   精度を上げるときの入口は AXIS_WEIGHTS・charVector・userVector の3か所。

import { QUESTIONS, isCompleteAnswers } from "./diagnosis-questions.js";
import { SSBU_FIGHTER_PROFILES } from "./presets/ssbu-fighter-profiles.js";
import { SSBU_FIGHTERS } from "./presets/ssbu.js";

export const AXES = Object.freeze([
  { id: "attack", left: "攻め", right: "待ち", letters: ["A", "W"] },
  { id: "distance", left: "近距離", right: "遠距離", letters: ["N", "F"] },
  { id: "power", left: "スピード", right: "パワー", letters: ["S", "P"] },
  { id: "trick", left: "正統派", right: "トリッキー", letters: ["O", "T"] },
]);

/** 16タイプ。キーは4軸の左右（A/W・N/F・S/P・O/T）を並べた4文字。 */
export const TYPES = Object.freeze({
  ANSO: { name: "突撃スピードスター", desc: "素早く懐に飛び込み、手数で押し切るタイプ。迷ったらまず前へ出られるのが強み。" },
  ANST: { name: "変幻ニンジャ", desc: "速さと小技で相手をかく乱するタイプ。読まれにくい動きで主導権を握る。" },
  ANPO: { name: "真っ向ブレイカー", desc: "正面から殴り合い、重い一撃で決めるタイプ。シンプルな力比べが得意。" },
  ANPT: { name: "一発逆転チャレンジャー", desc: "力技とクセのある技で試合をひっくり返すタイプ。劣勢でも諦めない。" },
  AFSO: { name: "速攻ガンナー", desc: "撃ちながら走り込んで先手を取るタイプ。距離を詰めるきっかけ作りがうまい。" },
  AFST: { name: "翻弄マジシャン", desc: "飛び道具と仕掛けで相手を振り回しながら攻めるタイプ。" },
  AFPO: { name: "間合いの剣豪", desc: "長いリーチで押し込み、先端で仕留めるタイプ。間合い管理が武器。" },
  AFPT: { name: "重砲コマンダー", desc: "大技と設置物で前線を押し上げるタイプ。場を自分の色に染める。" },
  WNSO: { name: "迎撃ファイター", desc: "相手の隙を待ち、素早く差し返すタイプ。守りから一気に攻めへ転じる。" },
  WNST: { name: "潜伏カメレオン", desc: "近くで様子を見て、クセのある技で不意を突くタイプ。" },
  WNPO: { name: "鉄壁ガーディアン", desc: "どっしり構えて、向かってきた相手を一撃で返すタイプ。" },
  WNPT: { name: "奇襲レスラー", desc: "待ってつかみ、投げや一撃で逆転を狙うタイプ。" },
  WFSO: { name: "精密シューター", desc: "距離を保ち、正確な攻撃でコツコツ削るタイプ。" },
  WFST: { name: "仕掛け職人", desc: "設置物と飛び道具で陣地を作り、相手を思いどおりに動かすタイプ。" },
  WFPO: { name: "要塞スナイパー", desc: "遠くから重い攻撃を置き、相手を寄せつけないタイプ。" },
  WFPT: { name: "魔導ストラテジスト", desc: "多彩な道具と大技で盤面を支配するタイプ。考えるのが好きな人向け。" },
});

/** 4軸ともほぼ真ん中（BALANCE_MARGIN 以内）のときに、16タイプの名前の代わりに出す名前。 */
export const ALL_ROUNDER = Object.freeze({
  name: "オールラウンダー",
  desc: "どの戦い方にも大きな偏りがないタイプ。いろいろなキャラを触りながら、しっくりくる動きを探せるのが強み。",
});

/** 0.5 からこの幅以内（0.4〜0.6）の軸は「どちらでもない＝バランス」として表示する。タイプの決め方（キー）は変えない。 */
export const BALANCE_MARGIN = 0.1;

/** おすすめ度（★1〜3）のしきい値。スコアの見かけの細かさ（1%刻み）を出さないため3段階に丸める。 */
const STAR_THRESHOLDS = Object.freeze([0.9, 0.8]);

// 軸以外に直接くらべる指標（重み）。軸は各1。
const AXIS_WEIGHTS = Object.freeze({ attack: 1, distance: 1, power: 1, trick: 1, air: 0.6, projectile: 0.6, damage: 0.6, recovery: 0.6 });
const BEGINNER_EASY_BONUS = 0.15; // 「はじめたばかり」のとき easy(1〜5) に比例して加点
const CASUAL_EASY_BONUS = 0.05; // 「少し遊んだことがある」のとき
const STYLE_ATTACK = Object.freeze({ 攻め: 0.1, 投げ: 0.35, 万能: 0.5, トリッキー: 0.55, 待ち: 0.9 });

const level5 = (v) => (v - 1) / 4; // 1〜5 → 0〜1
const round3 = (v) => Math.round(v * 1000) / 1000;

/** 回答（選択肢番号）を 0〜1 の値へ。未回答・範囲外は例外。 */
export function answerValues(answers) {
  if (!isCompleteAnswers(answers)) throw new Error("未回答の質問があります");
  const values = {};
  for (const q of QUESTIONS) values[q.id] = q.options[answers[q.id]].value;
  return values;
}

/** キャラの指標を4軸＋直接比較の指標（0〜1）にする。 */
export function charVector(p) {
  const speed = level5(p.speed);
  const weight = level5(p.weight);
  const kill = level5(p.killPower);
  const combo = level5(p.combo);
  const projectile = p.projectile / 5;
  const gimmick = p.gimmick.trim() ? 1 : 0;
  const trickStyle = p.style === "トリッキー" ? 1 : p.style === "投げ" ? 0.4 : 0;
  return {
    attack: round3(0.7 * STYLE_ATTACK[p.style] + 0.3 * projectile),
    distance: round3(0.6 * level5(p.range) + 0.4 * projectile),
    power: round3(0.35 * (1 - speed) + 0.25 * weight + 0.25 * kill + 0.15 * (1 - combo)),
    trick: round3(0.4 * gimmick + 0.35 * trickStyle + 0.25 * (1 - level5(p.easy))),
    air: level5(p.airGame),
    projectile,
    damage: round3((kill + (1 - combo)) / 2),
    recovery: level5(p.recovery),
  };
}

/** 回答を同じ物差し（0〜1）にする。recovery は「復帰をどれだけ重視するか」。 */
export function userVector(answers) {
  const v = answerValues(answers);
  return {
    attack: v.attack,
    distance: round3(0.6 * v.distance + 0.4 * (1 - v.projectile)),
    power: round3(0.6 * v.speed + 0.4 * v.damage),
    trick: round3(0.6 * (1 - v.gimmick) + 0.4 * v.easy),
    air: 1 - v.air,
    projectile: 1 - v.projectile,
    damage: v.damage,
    recovery: 1 - v.recovery,
  };
}

/** 0.5 前後（0.4〜0.6）か。浮動小数の誤差で端が外れないよう少しだけ余裕をもたせる。 */
export function isBalanced(value) {
  return Math.abs(value - 0.5) <= BALANCE_MARGIN + 1e-9;
}

/**
 * 4軸の値からタイプを決める。キーはちょうど0.5（どちらでもない）を左の極に寄せて決めるが、
 * 0.4〜0.6 の軸は表示上「バランス」とし（side = `${left}と${right}のバランス`・balanced=true）、
 * 4軸ともバランスなら名前と説明を ALL_ROUNDER にする（allRounder=true）。
 */
export function typeOf(vector) {
  const key = AXES.map((axis) => axis.letters[vector[axis.id] > 0.5 ? 1 : 0]).join("");
  const axes = AXES.map((axis) => {
    const value = vector[axis.id];
    const balanced = isBalanced(value);
    const side = balanced ? `${axis.left}と${axis.right}のバランス` : value > 0.5 ? axis.right : axis.left;
    return { ...axis, value, balanced, side };
  });
  const allRounder = axes.every((a) => a.balanced);
  return { key, ...(allRounder ? ALL_ROUNDER : TYPES[key]), allRounder, axes };
}

/** スコア（0〜1）→ おすすめ度 ★1〜3。 */
export function starsOf(score) {
  return score >= STAR_THRESHOLDS[0] ? 3 : score >= STAR_THRESHOLDS[1] ? 2 : 1;
}

/** 1体との近さ（0〜1）。復帰は「重視するのに弱い」ときだけ減点する。 */
export function closeness(user, char) {
  let total = 0;
  let weightSum = 0;
  for (const [key, w] of Object.entries(AXIS_WEIGHTS)) {
    const diff = key === "recovery" ? Math.max(0, user.recovery - char.recovery) : Math.abs(user[key] - char[key]);
    total += w * diff;
    weightSum += w;
  }
  return 1 - total / weightSum;
}

function easyBonus(levelValue, easy) {
  const rate = levelValue === 0 ? BEGINNER_EASY_BONUS : levelValue === 0.5 ? CASUAL_EASY_BONUS : 0;
  return rate * level5(easy);
}

// 「なぜ合うか」の言葉。side=0 は左/小さい側、1 は右/大きい側。
const REASONS = Object.freeze({
  attack: ["自分から攻めていけるスタイル", "相手を待って迎え撃つのが得意"],
  distance: ["近い距離での戦いが得意", "リーチや飛び道具で離れて戦える"],
  power: ["足が速く素早く動ける", "重くて一撃が強い"],
  trick: ["素直な技が多く基本を覚えやすい", "このキャラだけの仕掛けがある"],
  air: ["地上戦がしっかり強い", "空中戦が得意"],
  projectile: ["飛び道具にたよらず体で戦う", "飛び道具が豊富"],
  damage: ["コンボでダメージを稼げる", "一撃の撃墜力が高い"],
  recovery: [null, "復帰が強く場外から戻りやすい"],
});

// 合成した軸は向きだけだと元の指標と食い違う（例: 最遅のプリンに「足が速い」）ので、
// この表にある言葉は元の5段階の指標が当てはまるときだけ理由にする。null はその向きに条件なし。
const REASON_FACTS = Object.freeze({
  power: [(p) => p.speed >= 4, (p) => p.weight >= 4 && p.killPower >= 4],
  damage: [(p) => p.combo >= 4, (p) => p.killPower >= 4],
  trick: [null, (p) => p.gimmick.trim() !== ""],
});

function factHolds(key, side, profile) {
  const fact = REASON_FACTS[key]?.[side];
  return !fact || fact(profile);
}

/** 理由に使う向き。合成値の向きが元の指標と合わなければ、逆向きの条件が明確に当てはまるときだけそちらを使う。 */
function reasonSide(key, c, profile) {
  const preferred = c > 0.5 ? 1 : 0;
  if (factHolds(key, preferred, profile)) return preferred;
  const other = 1 - preferred;
  return REASON_FACTS[key]?.[other] && REASON_FACTS[key][other](profile) ? other : null;
}

/** 一致した指標を言葉で2〜3個。ユーザーがはっきり答えた軸ほど優先する。 */
export function matchReasons(user, char, profile, { beginner = false } = {}) {
  const candidates = [];
  for (const key of Object.keys(REASONS)) {
    const u = user[key];
    const c = char[key];
    if (c === 0.5) continue; // ちょうど真ん中の指標は「どちらかが得意」と言えないので理由にしない
    const side = reasonSide(key, c, profile);
    if (side === null) continue;
    const text = REASONS[key][side];
    if (!text) continue;
    const agree = u !== 0.5 && (u > 0.5) === (side === 1);
    const strength = Math.abs(u - 0.5) * 2;
    const fit = 1 - Math.abs(u - c);
    candidates.push({ key, text, agree, score: strength * fit, fit });
  }
  const agreed = candidates.filter((c) => c.agree).sort((a, b) => b.score - a.score || keyOrder(a) - keyOrder(b));
  const reasons = [];
  if (beginner && profile.easy >= 4) reasons.push("操作がかんたんで、はじめたばかりでも扱いやすい");
  for (const c of agreed) {
    if (reasons.length >= 3) break;
    reasons.push(c.text);
  }
  if (reasons.length < 2) {
    const rest = candidates.filter((c) => !reasons.includes(c.text)).sort((a, b) => b.fit - a.fit || keyOrder(a) - keyOrder(b));
    for (const c of rest) {
      if (reasons.length >= 2) break;
      reasons.push(c.text);
    }
  }
  if (reasons.length < 2) reasons.push("クセが少なく、いろいろな戦い方を試せる");
  return reasons;
}

const KEY_ORDER = Object.keys(REASONS);
function keyOrder(c) {
  return KEY_ORDER.indexOf(c.key);
}

/** 診断候補から外れるキャラ（特徴データの欠け）。全86体そろっていれば空配列。 */
export function missingProfiles(fighters = SSBU_FIGHTERS, profiles = SSBU_FIGHTER_PROFILES) {
  return fighters.filter((name) => !Object.hasOwn(profiles, name));
}

/**
 * おすすめ上位 n 体。スコア降順、同点は SSBU_FIGHTERS の並び順（結果が毎回同じになる）。
 * 特徴データが1体もなければ picks は空配列（画面側で「準備中」を出す）。
 * @returns {{ type, user, picks: Array<{ name, percent, stars, score, oneLine, reasons, profile }> }}
 */
export function diagnose(answers, { n = 3, fighters = SSBU_FIGHTERS, profiles = SSBU_FIGHTER_PROFILES } = {}) {
  const values = answerValues(answers);
  const user = userVector(answers);
  const beginner = values.level === 0;
  const scored = [];
  fighters.forEach((name, index) => {
    if (!Object.hasOwn(profiles, name)) return; // 欠けたキャラは候補から外す
    const profile = profiles[name];
    const char = charVector(profile);
    const score = Math.min(1, closeness(user, char) + easyBonus(values.level, profile.easy));
    scored.push({ name, index, score, char, profile });
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  const picks = scored.slice(0, n).map(({ name, score, char, profile }) => ({
    name,
    score,
    percent: Math.min(99, Math.round(score * 100)),
    stars: starsOf(score),
    oneLine: profile.oneLine,
    reasons: matchReasons(user, char, profile, { beginner }),
    profile,
  }));
  return { type: typeOf(user), user, picks };
}
