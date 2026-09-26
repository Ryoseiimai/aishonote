// キャラ診断の質問と、保存する回答のスキーマ検証。DOM・プリセットに依存しない（store.js から読むため軽く保つ）。

export const DIAGNOSIS_VERSION = 1;

/** 5段階の選択肢。value は 0（最初の選択肢）〜1（最後の選択肢）。 */
function likert(labels) {
  return labels.map((label, i) => ({ label, value: i / (labels.length - 1) }));
}

export const QUESTIONS = Object.freeze([
  {
    id: "attack",
    text: "対戦では、自分から攻めたい？ それとも相手を待ちたい？",
    options: likert(["自分からどんどん攻めたい", "どちらかといえば攻めたい", "どちらでもない", "どちらかといえば待ちたい", "相手の動きをじっくり待ちたい"]),
  },
  {
    id: "distance",
    text: "戦う距離は、どっちが好き？",
    options: likert(["近くで殴り合いたい", "やや近めがいい", "どちらでもない", "やや遠めがいい", "離れたところから戦いたい"]),
  },
  {
    id: "speed",
    text: "キャラの動きは、どっちがいい？",
    options: likert(["素早く動き回りたい", "どちらかといえば素早いほう", "どちらでもない", "どちらかといえば力強いほう", "重くて力強いのがいい"]),
  },
  {
    id: "air",
    text: "ジャンプして空中で戦うのは好き？",
    options: likert(["空中戦が大好き", "わりと好き", "どちらでもない", "あまり得意じゃない", "地上でしっかり戦いたい"]),
  },
  {
    id: "projectile",
    text: "飛び道具（弾・矢・爆弾など）を使いたい？",
    options: likert(["たくさん使いたい", "少しは使いたい", "どちらでもない", "あまり使わなくていい", "使わずに体で戦いたい"]),
  },
  {
    id: "recovery",
    text: "場外に飛ばされたとき、ステージへの戻りやすさ（復帰）は大事？",
    options: likert(["とても大事", "わりと大事", "どちらでもない", "あまり気にしない", "まったく気にしない"]),
  },
  {
    id: "damage",
    text: "ダメージの与え方は、どっちが好き？",
    options: likert(["コンボでコツコツ稼ぎたい", "どちらかといえばコンボ", "どちらでもない", "どちらかといえば一撃", "一撃でドカンと決めたい"]),
  },
  {
    id: "gimmick",
    text: "そのキャラだけの変わった仕掛け（ゲージ・設置・変身など）は好き？",
    options: likert(["大好き！", "わりと好き", "どちらでもない", "あまり要らない", "素直な技だけがいい"]),
  },
  {
    id: "easy",
    text: "操作は、かんたんなほうがいい？",
    options: likert(["かんたんがいい", "わりとかんたんがいい", "どちらでもない", "少し難しくてもいい", "難しいほど燃える"]),
  },
  {
    id: "level",
    text: "スマブラの経験はどれくらい？",
    options: [
      { label: "はじめたばかり", value: 0 },
      { label: "少し遊んだことがある", value: 0.5 },
      { label: "けっこう遊んでいる", value: 1 },
    ],
  },
]);

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 全問が回答済み（各問の選択肢番号が範囲内の整数）か。 */
export function isCompleteAnswers(answers) {
  if (!isPlainObject(answers)) return false;
  return QUESTIONS.every((q) => Object.hasOwn(answers, q.id) &&
    Number.isInteger(answers[q.id]) && answers[q.id] >= 0 && answers[q.id] < q.options.length);
}

/**
 * 保存・インポートされた診断結果を検証する。不正・未回答が1つでもあれば null（他の記録は失わない）。
 * 質問id以外のキーは捨てる。結果（おすすめ）は回答から毎回計算するので保存しない。
 */
export function sanitizeDiagnosis(raw) {
  if (!isPlainObject(raw) || raw.version !== DIAGNOSIS_VERSION) return null;
  if (typeof raw.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) return null;
  if (!isCompleteAnswers(raw.answers)) return null;
  const answers = {};
  for (const q of QUESTIONS) answers[q.id] = raw.answers[q.id];
  return { version: DIAGNOSIS_VERSION, answers, date: raw.date };
}
