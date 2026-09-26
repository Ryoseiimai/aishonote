import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { QUESTIONS, sanitizeDiagnosis, isCompleteAnswers, DIAGNOSIS_VERSION } from "../js/diagnosis-questions.js";
import { diagnose, typeOf, userVector, charVector, closeness, missingProfiles, answerValues, matchReasons, starsOf, isBalanced, TYPES, AXES, ALL_ROUNDER } from "../js/diagnosis.js";
import { SSBU_FIGHTER_PROFILES, FIGHTER_RANK_SOURCES } from "../js/presets/ssbu-fighter-profiles.js";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";
import { SSBU_CHAR_CURRICULUM } from "../js/presets/ssbu-char-curriculum.js";
import { buildProfiles, renderProfilesModule, rankToLevel, ciAllowlist } from "../scripts/build-fighter-profiles.mjs";
import { validateImport, emptyState, DEFAULT_GAME_ID } from "../js/store.js";

const source = JSON.parse(readFileSync(new URL("../docs/fighter-profiles.json", import.meta.url), "utf8"));
const answersOf = (indexes) => Object.fromEntries(QUESTIONS.map((q, i) => [q.id, indexes[i]]));
const neutral = answersOf(QUESTIONS.map((q) => Math.floor((q.options.length - 1) / 2)));

// 乱数の種を固定した全回答パターンの抜き取り（毎回同じ）
function sampleAnswers(count) {
  let seed = 42;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, () => answersOf(QUESTIONS.map((q) => Math.floor(rnd() * q.options.length))));
}

test("特徴データ: 全86体に指標があり、欠けて診断候補から外れるキャラはいない", () => {
  assert.equal(SSBU_FIGHTERS.length, 86);
  assert.deepEqual(missingProfiles(), []);
  assert.deepEqual(Object.keys(SSBU_FIGHTER_PROFILES), SSBU_FIGHTERS);
  for (const [name, p] of Object.entries(SSBU_FIGHTER_PROFILES)) {
    for (const key of ["range", "recovery", "killPower", "combo", "airGame", "easy", "weight", "speed"]) {
      assert.ok(Number.isInteger(p[key]) && p[key] >= 1 && p[key] <= 5, `${name}.${key}`);
    }
    assert.ok(Number.isInteger(p.projectile) && p.projectile >= 0 && p.projectile <= 5, `${name}.projectile`);
    assert.ok(p.oneLine.length > 0, name);
    assert.ok(p.sources.length > 0 && p.sources.every((u) => new URL(u).protocol === "https:"), name);
  }
});

test("特徴データ: 生成済みJSは docs/fighter-profiles.json から作り直したものと一致する", () => {
  const profiles = buildProfiles(source);
  const expected = renderProfilesModule(profiles, source.rankSources);
  assert.equal(readFileSync(new URL("../js/presets/ssbu-fighter-profiles.js", import.meta.url), "utf8"), expected);
  assert.deepEqual(FIGHTER_RANK_SOURCES, source.rankSources);
});

test("特徴データ: 欠け・余分なキャラがあると生成スクリプトが止まる", () => {
  const drop = { ...source, features: source.features.filter((f) => f.name !== "マリオ") };
  assert.throws(() => buildProfiles(drop), /不足=\[マリオ\]/);
  const extra = { ...source, ranks: [...source.ranks, { name: "だれか", weightRank: 1, runSpeedRank: 1 }] };
  assert.throws(() => buildProfiles(extra), /順位だけ=\[だれか\]/);
});

test("順位→5段階: 1位=5、86位=1、同順位は同じ段階、範囲外は例外", () => {
  assert.equal(rankToLevel(1), 5);
  assert.equal(rankToLevel(18), 5);
  assert.equal(rankToLevel(19), 4);
  assert.equal(rankToLevel(86), 1);
  assert.equal(SSBU_FIGHTER_PROFILES["クッパ"].weight, 5);
  assert.equal(SSBU_FIGHTER_PROFILES["ピチュー"].weight, 1);
  assert.equal(SSBU_FIGHTER_PROFILES["ソニック"].speed, 5);
  assert.equal(SSBU_FIGHTER_PROFILES["ガオガエン"].speed, 1);
  assert.equal(SSBU_FIGHTER_PROFILES["ルキナ"].speed, SSBU_FIGHTER_PROFILES["マルス"].speed);
  assert.throws(() => rankToLevel(0));
  assert.throws(() => rankToLevel(87));
});

test("CI: 特徴データの出典URLがすべて ci.yml の外部URL許可リストに入っている", () => {
  const ci = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  const { count, lines } = ciAllowlist(buildProfiles(source), source.rankSources);
  assert.ok(count > 0);
  for (const line of lines) assert.ok(ci.includes(line), line);
});

test("質問: 8〜10問・各問2〜5択・idが一意", () => {
  assert.ok(QUESTIONS.length >= 8 && QUESTIONS.length <= 10);
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (const q of QUESTIONS) {
    assert.ok(q.options.length >= 2 && q.options.length <= 5, q.id);
    for (const o of q.options) assert.ok(o.value >= 0 && o.value <= 1);
  }
});

test("回答: 未回答・範囲外・小数は未完了として扱い、計算しない", () => {
  assert.equal(isCompleteAnswers(neutral), true);
  const { attack, ...partial } = neutral;
  assert.equal(attack, 2);
  assert.equal(isCompleteAnswers(partial), false);
  assert.equal(isCompleteAnswers({ ...neutral, attack: 5 }), false);
  assert.equal(isCompleteAnswers({ ...neutral, attack: 1.5 }), false);
  assert.throws(() => answerValues(partial));
  assert.throws(() => diagnose({ ...neutral, level: 3 }));
});

test("タイプ判定: 16タイプすべてに名前と説明があり、4軸の左右で決まる", () => {
  assert.equal(Object.keys(TYPES).length, 16);
  assert.equal(new Set(Object.values(TYPES).map((t) => t.name)).size, 16);
  const vec = (a, d, p, t) => ({ attack: a, distance: d, power: p, trick: t });
  assert.equal(typeOf(vec(0, 0, 0, 0)).key, "ANSO");
  assert.equal(typeOf(vec(0, 0, 0, 0)).name, "突撃スピードスター");
  assert.equal(typeOf(vec(1, 1, 1, 1)).key, "WFPT");
  assert.equal(typeOf(vec(1, 0, 1, 0)).key, "WNPO");
  // キーの決め方は変えない（ちょうど真ん中は左の極）。表示は下の「バランス」のテストで固定する
  assert.equal(typeOf(vec(0.5, 0.5, 0.5, 0.5)).key, "ANSO");
  assert.equal(typeOf(vec(0.51, 0.5, 0.5, 0.5)).key, "WNSO");
  // 全組み合わせのキーが TYPES に存在する
  for (let bits = 0; bits < 16; bits += 1) {
    const t = typeOf(vec(bits & 8 ? 1 : 0, bits & 4 ? 1 : 0, bits & 2 ? 1 : 0, bits & 1 ? 1 : 0));
    assert.ok(TYPES[t.key], t.key);
    assert.equal(t.axes.length, AXES.length);
  }
});

test("タイプ判定: 0.4〜0.6の軸は「バランス」表示、4軸ともなら「オールラウンダー」で左の極を名乗らない", () => {
  const vec = (a, d, p, t) => ({ attack: a, distance: d, power: p, trick: t });
  assert.equal(isBalanced(0.4), true);
  assert.equal(isBalanced(0.6), true);
  assert.equal(isBalanced(0.39), false);
  assert.equal(isBalanced(0.61), false);

  // 全問「どちらでもない」: バッジは全部バランス、名前はオールラウンダー（突撃スピードスターと断定しない）
  const neutralType = diagnose(neutral).type;
  assert.equal(neutralType.allRounder, true);
  assert.equal(neutralType.name, ALL_ROUNDER.name);
  assert.notEqual(neutralType.name, TYPES.ANSO.name);
  assert.deepEqual(neutralType.axes.map((a) => a.balanced), [true, true, true, true]);
  assert.deepEqual(neutralType.axes.map((a) => a.side), ["攻めと待ちのバランス", "近距離と遠距離のバランス", "スピードとパワーのバランス", "正統派とトリッキーのバランス"]);
  for (const a of neutralType.axes) assert.ok(!["攻め", "近距離", "スピード", "正統派"].includes(a.side));

  // 一部だけバランス: その軸だけバランス表示で、名前は16タイプのまま
  const mixed = typeOf(vec(0.1, 0.55, 0.9, 0.45));
  assert.equal(mixed.allRounder, false);
  assert.equal(mixed.name, TYPES[mixed.key].name);
  assert.deepEqual(mixed.axes.map((a) => a.side), ["攻め", "近距離と遠距離のバランス", "パワー", "正統派とトリッキーのバランス"]);

  // 16タイプに賭博を連想させる語を使わない
  for (const t of Object.values(TYPES)) assert.ok(!/ギャンブ|賭/.test(t.name + t.desc), t.name);
  assert.equal(TYPES.ANPT.name, "一発逆転チャレンジャー");
});

test("タイプ判定: 回答から軸が計算される（攻め・近・スピード を選べばその側になる）", () => {
  const rush = answersOf([0, 0, 0, 0, 4, 2, 0, 4, 0, 2]);
  const r = diagnose(rush);
  assert.equal(r.type.key, "ANSO");
  const camp = answersOf([4, 4, 4, 4, 0, 2, 4, 0, 4, 2]);
  assert.equal(diagnose(camp).type.key, "WFPT");
  const u = userVector(rush);
  for (const key of ["attack", "distance", "power", "trick"]) assert.ok(u[key] >= 0 && u[key] <= 1);
});

test("スコア: 同じベクトルは近さ1、復帰は重視するのに弱いときだけ減点", () => {
  const c = charVector(SSBU_FIGHTER_PROFILES["マリオ"]);
  assert.equal(closeness(c, c), 1);
  assert.ok(closeness({ ...c, recovery: 1 }, { ...c, recovery: 0 }) < 1);
  assert.equal(closeness({ ...c, recovery: 0 }, { ...c, recovery: 1 }), 1);
});

test("スコア: 初心者と答えると操作がかんたんなキャラ(easy)が加点される", () => {
  const base = QUESTIONS.map((q) => Math.floor((q.options.length - 1) / 2));
  const levelIndex = QUESTIONS.findIndex((q) => q.id === "level");
  const beginner = [...base];
  beginner[levelIndex] = 0;
  const veteran = [...base];
  veteran[levelIndex] = 2;
  const all = { n: SSBU_FIGHTERS.length };
  const scoreOf = (answers, name) => diagnose(answersOf(answers), all).picks.find((p) => p.name === name).score;
  // マリオ(easy5)は +0.15、ピーチ(easy1)は加点なし
  assert.ok(Math.abs(scoreOf(beginner, "マリオ") - scoreOf(veteran, "マリオ") - 0.15) < 1e-9);
  assert.equal(scoreOf(beginner, "ピーチ"), scoreOf(veteran, "ピーチ"));
});

test("おすすめ度: スコアを★1〜3に丸める（0.9以上=3・0.8以上=2・それ未満=1）", () => {
  assert.equal(starsOf(1), 3);
  assert.equal(starsOf(0.9), 3);
  assert.equal(starsOf(0.899), 2);
  assert.equal(starsOf(0.8), 2);
  assert.equal(starsOf(0.799), 1);
  assert.equal(starsOf(0), 1);
});

test("おすすめ: 上位3体・％は0〜99・★は1〜3・並びはスコア降順で毎回同じ", () => {
  for (const answers of sampleAnswers(300)) {
    const a = diagnose(answers);
    const b = diagnose(JSON.parse(JSON.stringify(answers)));
    assert.deepEqual(a.picks.map((p) => p.name), b.picks.map((p) => p.name));
    assert.equal(a.picks.length, 3);
    assert.equal(new Set(a.picks.map((p) => p.name)).size, 3);
    for (let i = 0; i < a.picks.length; i += 1) {
      const p = a.picks[i];
      assert.ok(SSBU_FIGHTERS.includes(p.name));
      assert.ok(Number.isInteger(p.percent) && p.percent >= 0 && p.percent <= 99);
      assert.equal(p.stars, starsOf(p.score));
      assert.ok(p.reasons.length >= 2 && p.reasons.length <= 3, `${p.name}: ${p.reasons}`);
      if (i > 0) assert.ok(a.picks[i - 1].score >= p.score);
    }
  }
});

test("おすすめ: 同点はキャラ一覧の並び順で決まり、データの並びに左右されない", () => {
  const same = SSBU_FIGHTER_PROFILES["マリオ"];
  const fighters = ["A", "B", "C", "D"];
  const profiles = { D: same, C: same, B: same, A: same };
  assert.deepEqual(diagnose(neutral, { fighters, profiles }).picks.map((p) => p.name), ["A", "B", "C"]);
});

test("おすすめ: 特徴データが欠けたキャラは候補から外れ、欠けとして明示される", () => {
  const fighters = ["A", "B", "C", "D"];
  const profiles = { A: SSBU_FIGHTER_PROFILES["マリオ"], B: SSBU_FIGHTER_PROFILES["リンク"], D: SSBU_FIGHTER_PROFILES["カービィ"] };
  assert.deepEqual(missingProfiles(fighters, profiles), ["C"]);
  const picks = diagnose(neutral, { fighters, profiles }).picks.map((p) => p.name);
  assert.equal(picks.length, 3);
  assert.ok(!picks.includes("C"));
});

test("おすすめ: 特徴データが1体も無ければ picks は空（画面は「準備中」を出す）", () => {
  const r = diagnose(neutral, { profiles: {} });
  assert.deepEqual(r.picks, []);
  assert.ok(r.type.name);
});

test("理由: 合成軸の向きではなく元の指標で出す（プリンに「足が速い」、しずえに「重い」を付けない）", () => {
  const P = SSBU_FIGHTER_PROFILES;
  const fast = "足が速く素早く動ける";
  const heavy = "重くて一撃が強い";
  const combo = "コンボでダメージを稼げる";
  const kill = "一撃の撃墜力が高い";
  const gimmick = "このキャラだけの仕掛けがある";
  // どの回答（スピード寄り・パワー寄りの両極を含む）でも、元の指標に合わない言葉は出ない
  const users = [
    ...sampleAnswers(200).map(userVector),
    ...[0, 1].flatMap((p) => [0, 1].map((d) => ({ attack: 0.5, distance: 0.5, power: p, trick: 0.5, air: 0.5, projectile: 0.5, damage: d, recovery: 0.5 }))),
  ];
  for (const name of SSBU_FIGHTERS) {
    const p = P[name];
    const c = charVector(p);
    for (const u of users) {
      for (const beginner of [false, true]) {
        const reasons = matchReasons(u, c, p, { beginner });
        assert.ok(reasons.length >= 2 && reasons.length <= 3, name);
        if (reasons.includes(fast)) assert.ok(p.speed >= 4, `${name}: speed=${p.speed}`);
        if (reasons.includes(heavy)) assert.ok(p.weight >= 4 && p.killPower >= 4, `${name}: weight=${p.weight} kill=${p.killPower}`);
        if (reasons.includes(combo)) assert.ok(p.combo >= 4, `${name}: combo=${p.combo}`);
        if (reasons.includes(kill)) assert.ok(p.killPower >= 4, `${name}: kill=${p.killPower}`);
        if (reasons.includes(gimmick)) assert.ok(p.gimmick.trim(), name);
      }
    }
  }
  // 回帰: レビューで見つかった具体例
  const speedFan = { ...userVector(neutral), power: 0 };
  const powerFan = { ...userVector(neutral), power: 1, damage: 1 };
  for (const name of ["プリン", "ピーチ", "デイジー", "ファルコ", "ソラ"]) {
    assert.ok(P[name].speed <= 2, name);
    assert.ok(!matchReasons(speedFan, charVector(P[name]), P[name]).includes(fast), name);
  }
  assert.ok(!matchReasons(powerFan, charVector(P["しずえ"]), P["しずえ"]).includes(heavy));
  // 正しく当てはまるキャラには出る（ソニック=最速、クッパ=重くて撃墜力が高い）
  assert.ok(matchReasons(speedFan, charVector(P["ソニック"]), P["ソニック"]).includes(fast));
  assert.ok(P["クッパ"].weight >= 4 && P["クッパ"].killPower >= 4);
  assert.ok(matchReasons(powerFan, charVector(P["クッパ"]), P["クッパ"]).includes(heavy));
});

test("おすすめ: 回答しだいで全86体のどのキャラも候補に上がりうる", () => {
  const seen = new Set();
  for (const answers of sampleAnswers(3000)) diagnose(answers).picks.forEach((p) => seen.add(p.name));
  assert.deepEqual(SSBU_FIGHTERS.filter((name) => !seen.has(name)), []);
});

test("上達: おすすめされたキャラには全員キャラ専用メニューの最初の一歩(2項目)がある", () => {
  for (const name of SSBU_FIGHTERS) assert.ok(SSBU_CHAR_CURRICULUM[name].items.length >= 2, name);
});

test("保存: 診断の回答を検証して保持し、不正なら他の記録を失わず null に戻す", () => {
  const good = { version: DIAGNOSIS_VERSION, answers: neutral, date: "2026-09-27" };
  assert.deepEqual(sanitizeDiagnosis({ ...good, extra: 1, answers: { ...neutral, junk: 3 } }), good);
  for (const bad of [
    null, [], "x",
    { ...good, version: 99 },
    { ...good, date: "昨日" },
    { ...good, answers: { ...neutral, attack: 9 } },
    { ...good, answers: { attack: 0 } },
  ]) assert.equal(sanitizeDiagnosis(bad), null);

  assert.equal(emptyState().diagnosis, null);
  const base = {
    ...emptyState(),
    myFightersByGame: { [DEFAULT_GAME_ID]: ["マリオ"] },
    activeFighterByGame: { [DEFAULT_GAME_ID]: "マリオ" },
    matches: [{ id: "m1", gameId: DEFAULT_GAME_ID, date: "2026-09-01", my: "マリオ", opponent: "リンク", result: "win", tags: [], memo: "", createdAt: 1 }],
  };
  const kept = validateImport({ ...base, diagnosis: good });
  assert.equal(kept.ok, true);
  assert.deepEqual(kept.data.diagnosis, good);
  const dropped = validateImport({ ...base, diagnosis: { ...good, answers: { attack: 0 } } });
  assert.equal(dropped.ok, true);
  assert.equal(dropped.data.diagnosis, null);
  assert.equal(dropped.data.matches.length, 1);
  const legacy = { ...base };
  delete legacy.diagnosis;
  assert.equal(validateImport(legacy).data.diagnosis, null);
});
