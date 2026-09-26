// 自動生成: node scripts/build-fighter-profiles.mjs
// 正本: docs/fighter-profiles.json。直接編集しない。weight/speed は重さ・走行速度の順位を5段階にした値（5=最重/最速）。
export const FIGHTER_RANK_SOURCES = [
  {
    "title": "SmashWiki: Weight（SP の重さ表）",
    "url": "https://www.ssbwiki.com/Weight"
  },
  {
    "title": "SmashWiki: Dash（SP の走行速度表）",
    "url": "https://www.ssbwiki.com/Dash"
  }
];
export const SSBU_FIGHTER_PROFILES = {
  "マリオ": {
    "range": 2,
    "projectile": 1,
    "recovery": 2,
    "killPower": 3,
    "combo": 5,
    "airGame": 4,
    "style": "万能",
    "easy": 5,
    "weight": 4,
    "speed": 3,
    "gimmick": "",
    "oneLine": "出の速い技で細かく攻める基本型。まずこの人で基礎を学べる",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/マリオ_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/mario-feature",
      "https://smashlog.games/4265"
    ]
  },
  "ドンキーコング": {
    "range": 4,
    "projectile": 0,
    "recovery": 1,
    "killPower": 5,
    "combo": 3,
    "airGame": 3,
    "style": "攻め",
    "easy": 4,
    "weight": 5,
    "speed": 4,
    "gimmick": "つかんだ相手をかついで運べる（リフティング）",
    "oneLine": "重くて力持ち。相手をかついで場外へ運び、豪快に吹っ飛ばす",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ドンキーコング_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/donkeykong-feature",
      "https://smashlog.games/4265"
    ]
  },
  "リンク": {
    "range": 5,
    "projectile": 4,
    "recovery": 1,
    "killPower": 4,
    "combo": 3,
    "airGame": 3,
    "style": "待ち",
    "easy": 2,
    "weight": 4,
    "speed": 2,
    "gimmick": "好きなタイミングで起爆できるリモコンバクダン／盾で飛び道具を防ぐ",
    "oneLine": "弓・ブーメラン・爆弾で遠くから削り、剣で仕留める万能剣士",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/リンク_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/link-feature",
      "https://smashlog.games/4265"
    ]
  },
  "サムス": {
    "range": 4,
    "projectile": 4,
    "recovery": 4,
    "killPower": 4,
    "combo": 2,
    "airGame": 3,
    "style": "待ち",
    "easy": 2,
    "weight": 5,
    "speed": 3,
    "gimmick": "チャージショットを溜めたまま保持できる",
    "oneLine": "溜めたチャージショットとミサイルで距離を取って戦う射撃型",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/サムス_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/samus-feature",
      "https://smashlog.games/4265"
    ]
  },
  "ダークサムス": {
    "range": 4,
    "projectile": 4,
    "recovery": 4,
    "killPower": 4,
    "combo": 2,
    "airGame": 3,
    "style": "待ち",
    "easy": 2,
    "weight": 5,
    "speed": 3,
    "gimmick": "チャージショットを溜めたまま保持できる（性能はサムスと同じ）",
    "oneLine": "サムスと同性能の射撃型。ゆらりと浮くような動きが特徴",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ダークサムス",
      "https://smashwiki.info/サムス_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/samus-feature",
      "https://smashlog.games/4265"
    ]
  },
  "ヨッシー": {
    "range": 2,
    "projectile": 2,
    "recovery": 3,
    "killPower": 3,
    "combo": 3,
    "airGame": 5,
    "style": "万能",
    "easy": 4,
    "weight": 4,
    "speed": 5,
    "gimmick": "空中ジャンプ中は怯まない（アーマー）／縮まない卵のシールド",
    "oneLine": "空中ジャンプ中はある程度の攻撃では怯まない。空中の横移動は全キャラ最速",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ヨッシー_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/yoshi-feature",
      "https://smashlog.games/4265"
    ]
  },
  "カービィ": {
    "range": 1,
    "projectile": 1,
    "recovery": 4,
    "killPower": 3,
    "combo": 4,
    "airGame": 3,
    "style": "攻め",
    "easy": 5,
    "weight": 1,
    "speed": 3,
    "gimmick": "すいこみで相手の必殺ワザをコピーできる",
    "oneLine": "5回ジャンプで落ちにくい。吸い込んで相手の技もコピーできる",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/カービィ_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/kirby-feature",
      "https://smashlog.games/6235"
    ]
  },
  "フォックス": {
    "range": 2,
    "projectile": 1,
    "recovery": 3,
    "killPower": 4,
    "combo": 5,
    "airGame": 4,
    "style": "攻め",
    "easy": 2,
    "weight": 1,
    "speed": 5,
    "gimmick": "",
    "oneLine": "最速クラスの足で詰め寄り、速い連撃で押し切る上級スピード型",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/フォックス_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/fox-feature",
      "https://smashlog.games/4265"
    ]
  },
  "ピカチュウ": {
    "range": 2,
    "projectile": 2,
    "recovery": 5,
    "killPower": 2,
    "combo": 5,
    "airGame": 4,
    "style": "攻め",
    "easy": 3,
    "weight": 1,
    "speed": 5,
    "gimmick": "でんこうせっかは途中で1回向きを変えられる",
    "oneLine": "小さく素早い体で翻弄し、電撃と連係で削る。復帰も自在",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ピカチュウ_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/pikachu-feature"
    ]
  },
  "ルイージ": {
    "range": 2,
    "projectile": 2,
    "recovery": 2,
    "killPower": 4,
    "combo": 5,
    "airGame": 2,
    "style": "投げ",
    "easy": 2,
    "weight": 4,
    "speed": 3,
    "gimmick": "遠くまで届くワイヤーつかみ／ふわふわ滑る独特の操作感",
    "oneLine": "一度つかめば投げからの連係で一気に撃墜まで持っていく一発屋",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ルイージ_(SP)",
      "https://forechan.co.jp/smashbros/luigi/",
      "https://smashlog.games/4265"
    ]
  },
  "ネス": {
    "range": 2,
    "projectile": 3,
    "recovery": 2,
    "killPower": 5,
    "combo": 3,
    "airGame": 4,
    "style": "トリッキー",
    "easy": 3,
    "weight": 3,
    "speed": 2,
    "gimmick": "PKサンダーを自分に当てて体当たりで復帰する",
    "oneLine": "PK技と強力な投げで押し込む超能力少年。復帰の操作に癖あり",
    "confidence": "medium",
    "sources": [
      "https://smashwiki.info/ネス_(SP)",
      "https://smashlog.games/4265"
    ]
  },
  "キャプテン・ファルコン": {
    "range": 2,
    "projectile": 0,
    "recovery": 2,
    "killPower": 4,
    "combo": 5,
    "airGame": 4,
    "style": "攻め",
    "easy": 3,
    "weight": 4,
    "speed": 5,
    "gimmick": "",
    "oneLine": "爆速ダッシュで飛び込み、膝やパンチで豪快に撃墜する突撃型",
    "confidence": "medium",
    "sources": [
      "https://smashwiki.info/キャプテン・ファルコン_(SP)",
      "https://smashlog.games/4265"
    ]
  },
  "プリン": {
    "range": 1,
    "projectile": 0,
    "recovery": 4,
    "killPower": 2,
    "combo": 3,
    "airGame": 5,
    "style": "トリッキー",
    "easy": 2,
    "weight": 1,
    "speed": 1,
    "gimmick": "密着で当てると超強力な『ねむる』／シールドが割れると即撃墜",
    "oneLine": "空中を漂いながら叩き場外で仕留める。『ねむる』が一発逆転技",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/プリン_(SP)",
      "https://forechan.co.jp/smashbros/purin/"
    ]
  },
  "ピーチ": {
    "range": 2,
    "projectile": 1,
    "recovery": 4,
    "killPower": 2,
    "combo": 5,
    "airGame": 5,
    "style": "トリッキー",
    "easy": 1,
    "weight": 2,
    "speed": 2,
    "gimmick": "空中浮遊（空中に止まったまま移動・攻撃できる）",
    "oneLine": "空中にふわっと浮いたまま攻撃できる。技をつなぐ連係が得意",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ピーチ_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/peach-feature",
      "https://smashlog.games/4265"
    ]
  },
  "デイジー": {
    "range": 2,
    "projectile": 1,
    "recovery": 4,
    "killPower": 2,
    "combo": 5,
    "airGame": 5,
    "style": "トリッキー",
    "easy": 1,
    "weight": 2,
    "speed": 2,
    "gimmick": "空中浮遊（ピーチとほぼ同じ性能）",
    "oneLine": "ピーチとほぼ同性能。浮遊しながら技をつなぐ連係上手な姫",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/デイジー",
      "https://smashwiki.info/ピーチ_(SP)",
      "https://www.nitolog.com/entry/smash-bros-sp/peach-feature",
      "https://smashlog.games/4265"
    ]
  },
  "クッパ": {
    "range": 4,
    "projectile": 1,
    "recovery": 2,
    "killPower": 5,
    "combo": 2,
    "airGame": 2,
    "style": "攻め",
    "easy": 4,
    "weight": 5,
    "speed": 4,
    "gimmick": "強攻撃とスマッシュに怯まないアーマーがつく",
    "oneLine": "一番重い大魔王。怯まない大技で強引に押し切るパワー型",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223449",
      "https://wikiwiki.jp/ssbswitch/ファイター/クッパ",
      "https://smashlog.games/4265"
    ]
  },
  "アイスクライマー": {
    "range": 2,
    "projectile": 1,
    "recovery": 2,
    "killPower": 3,
    "combo": 5,
    "airGame": 2,
    "style": "投げ",
    "easy": 1,
    "weight": 3,
    "speed": 1,
    "gimmick": "2人1組で戦う。相方ナナが倒れると火力も復帰も大きく落ちる",
    "oneLine": "2人1組で戦い、掴みからの連携で大ダメージを奪う上級者向け",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223450",
      "https://wikiwiki.jp/ssbswitch/ファイター/アイスクライマー",
      "https://smashlog.games/4265"
    ]
  },
  "シーク": {
    "range": 2,
    "projectile": 2,
    "recovery": 5,
    "killPower": 1,
    "combo": 5,
    "airGame": 4,
    "style": "攻め",
    "easy": 2,
    "weight": 1,
    "speed": 5,
    "gimmick": "",
    "oneLine": "最速クラスの足と手数で押し込み、崖外の追撃で倒す忍者",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223451",
      "https://wikiwiki.jp/ssbswitch/ファイター/シーク",
      "https://smashlog.games/4265"
    ]
  },
  "ゼルダ": {
    "range": 3,
    "projectile": 2,
    "recovery": 4,
    "killPower": 4,
    "combo": 2,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 1,
    "speed": 1,
    "gimmick": "下Bのファントムを出して時間差で攻撃・崖攻めに使える",
    "oneLine": "動きはゆったり、魔法とファントムで待ち構えて重い一撃",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/223452",
      "https://wikiwiki.jp/ssbswitch/ファイター/ゼルダ"
    ]
  },
  "ドクターマリオ": {
    "range": 2,
    "projectile": 2,
    "recovery": 1,
    "killPower": 4,
    "combo": 3,
    "airGame": 3,
    "style": "攻め",
    "easy": 3,
    "weight": 4,
    "speed": 1,
    "gimmick": "",
    "oneLine": "足は遅いが一発が重い。カプセルで寄って近距離で倒す",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223453",
      "https://wikiwiki.jp/ssbswitch/ファイター/ドクターマリオ",
      "https://smashlog.games/4265"
    ]
  },
  "ピチュー": {
    "range": 1,
    "projectile": 2,
    "recovery": 5,
    "killPower": 2,
    "combo": 5,
    "airGame": 4,
    "style": "攻め",
    "easy": 1,
    "weight": 1,
    "speed": 4,
    "gimmick": "電撃ワザを使うと自分も少しダメージを受ける",
    "oneLine": "一番軽い小さな体で素早く連打し、コンボで一気に稼ぐ",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223454",
      "https://wikiwiki.jp/ssbswitch/ファイター/ピチュー"
    ]
  },
  "ファルコ": {
    "range": 3,
    "projectile": 2,
    "recovery": 2,
    "killPower": 3,
    "combo": 5,
    "airGame": 5,
    "style": "攻め",
    "easy": 3,
    "weight": 1,
    "speed": 2,
    "gimmick": "",
    "oneLine": "全キャラ屈指のジャンプ力で空中コンボを繋げて倒す",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223455",
      "https://wikiwiki.jp/ssbswitch/ファイター/ファルコ"
    ]
  },
  "マルス": {
    "range": 5,
    "projectile": 0,
    "recovery": 3,
    "killPower": 4,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 2,
    "weight": 2,
    "speed": 4,
    "gimmick": "剣の先端で当てると威力とふっとばしが大きく上がる",
    "oneLine": "長い剣の先端を当てる間合い勝負。決まれば早く飛ばせる",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223456",
      "https://wikiwiki.jp/ssbswitch/ファイター/マルス"
    ]
  },
  "ルキナ": {
    "range": 5,
    "projectile": 0,
    "recovery": 3,
    "killPower": 3,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 4,
    "weight": 2,
    "speed": 4,
    "gimmick": "剣のどこで当てても威力が一定",
    "oneLine": "マルスの素直版。剣のどこで当てても同じ威力で扱いやすい",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223458",
      "https://smashwiki.info/ルキナ_(SP)",
      "https://smashlog.games/4265"
    ]
  },
  "こどもリンク": {
    "range": 3,
    "projectile": 3,
    "recovery": 2,
    "killPower": 2,
    "combo": 3,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 2,
    "speed": 3,
    "gimmick": "",
    "oneLine": "弓矢やブーメランで距離を取り、身軽な足で翻弄する剣士",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223459",
      "https://smashwiki.info/こどもリンク_(SP)"
    ]
  },
  "ガノンドロフ": {
    "range": 4,
    "projectile": 0,
    "recovery": 1,
    "killPower": 5,
    "combo": 1,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 5,
    "speed": 1,
    "gimmick": "",
    "oneLine": "動きは重いが一撃必殺。読み勝った瞬間に大きく飛ばす",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/223460",
      "https://smashwiki.info/ガノンドロフ_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/ガノンドロフ"
    ]
  },
  "ミュウツー": {
    "range": 4,
    "projectile": 2,
    "recovery": 4,
    "killPower": 4,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 3,
    "weight": 1,
    "speed": 5,
    "gimmick": "",
    "oneLine": "軽くて的は大きいが、どの距離からでも撃墜を狙える",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/223461",
      "https://smashwiki.info/ミュウツー_(SP)"
    ]
  },
  "ロイ": {
    "range": 3,
    "projectile": 0,
    "recovery": 2,
    "killPower": 4,
    "combo": 4,
    "airGame": 3,
    "style": "攻め",
    "easy": 4,
    "weight": 3,
    "speed": 5,
    "gimmick": "剣の根元ほど威力が高い（マルスの逆）",
    "oneLine": "速い足で懐へ飛び込み、剣の根元で強く叩く突撃型",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223462",
      "https://smashwiki.info/ロイ_(SP)",
      "https://smashlog.games/4265"
    ]
  },
  "クロム": {
    "range": 4,
    "projectile": 0,
    "recovery": 1,
    "killPower": 4,
    "combo": 3,
    "airGame": 2,
    "style": "攻め",
    "easy": 3,
    "weight": 3,
    "speed": 5,
    "gimmick": "剣のどこで当てても威力が一定",
    "oneLine": "速い足と剣で地上を押し切る。ただし崖外は大の苦手",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/231580",
      "https://smashwiki.info/クロム_(SP)",
      "https://smashlog.games/4265"
    ]
  },
  "Mr.ゲーム&ウォッチ": {
    "range": 2,
    "projectile": 1,
    "recovery": 5,
    "killPower": 3,
    "combo": 3,
    "airGame": 4,
    "style": "トリッキー",
    "easy": 2,
    "weight": 1,
    "speed": 3,
    "gimmick": "横Bジャッジは出る数字がランダムで、9なら一撃級",
    "oneLine": "平面の体で軽快に跳ね回る。運任せのジャッジも持つ奇策型",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223463",
      "https://smashwiki.info/Mr.ゲーム&ウォッチ_(SP)"
    ]
  },
  "メタナイト": {
    "range": 2,
    "projectile": 0,
    "recovery": 5,
    "killPower": 2,
    "combo": 5,
    "airGame": 5,
    "style": "攻め",
    "easy": 3,
    "weight": 1,
    "speed": 5,
    "gimmick": "",
    "oneLine": "素早い剣さばきと5段ジャンプで空中を舞い、手数で押す軽量剣士",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-metanight/",
      "https://www.nitolog.com/entry/smash-bros-sp/metaknight-combo"
    ]
  },
  "ピット": {
    "range": 3,
    "projectile": 2,
    "recovery": 5,
    "killPower": 3,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 5,
    "weight": 3,
    "speed": 4,
    "gimmick": "",
    "oneLine": "弓矢・剣・高い復帰がそろった、基本を学びやすい万能型の天使",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-pit/",
      "https://www.nitolog.com/entry/smash-bros-sp/pit-combo"
    ]
  },
  "ブラックピット": {
    "range": 3,
    "projectile": 1,
    "recovery": 5,
    "killPower": 3,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 5,
    "weight": 3,
    "speed": 4,
    "gimmick": "",
    "oneLine": "ピットとほぼ同じ性能で、横必殺ワザの撃墜力が高い黒い天使",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-blackpit/",
      "https://www.nitolog.com/entry/smash-bros-sp/blackpit-combo"
    ]
  },
  "ゼロスーツサムス": {
    "range": 3,
    "projectile": 1,
    "recovery": 5,
    "killPower": 4,
    "combo": 5,
    "airGame": 5,
    "style": "攻め",
    "easy": 2,
    "weight": 1,
    "speed": 5,
    "gimmick": "",
    "oneLine": "速い足と空中コンボで相手を運び、少ないダメージでも撃墜を狙う",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-zerosamu/",
      "https://www.nitolog.com/entry/smash-bros-sp/zerosuitsamus-combo"
    ]
  },
  "ワリオ": {
    "range": 2,
    "projectile": 0,
    "recovery": 4,
    "killPower": 4,
    "combo": 3,
    "airGame": 4,
    "style": "トリッキー",
    "easy": 3,
    "weight": 5,
    "speed": 3,
    "gimmick": "時間で溜まる一発逆転技「ワリオっぺ」と、乗り捨ても使えるバイク",
    "oneLine": "空中を自在に動き、溜めたワリオっぺで一発逆転を狙うクセ者",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-wario/",
      "https://www.nitolog.com/entry/smash-bros-sp/wario-combo"
    ]
  },
  "スネーク": {
    "range": 3,
    "projectile": 3,
    "recovery": 3,
    "killPower": 5,
    "combo": 2,
    "airGame": 2,
    "style": "待ち",
    "easy": 2,
    "weight": 5,
    "speed": 2,
    "gimmick": "手榴弾やC4爆弾を設置して罠を張る（C4は自爆して復帰にも使える）",
    "oneLine": "爆弾で罠を張って陣地を固め、重い近接ワザで早めに撃墜する兵士",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-snake/",
      "https://www.nitolog.com/entry/smash-bros-sp/snake-combo"
    ]
  },
  "アイク": {
    "range": 5,
    "projectile": 0,
    "recovery": 2,
    "killPower": 5,
    "combo": 3,
    "airGame": 3,
    "style": "攻め",
    "easy": 4,
    "weight": 5,
    "speed": 1,
    "gimmick": "",
    "oneLine": "大剣の広いリーチと重い一撃で押し込む、分かりやすいパワー剣士",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-ike/",
      "https://www.nitolog.com/entry/smash-bros-sp/ike-combo"
    ]
  },
  "ポケモントレーナー": {
    "range": 3,
    "projectile": 1,
    "recovery": 3,
    "killPower": 4,
    "combo": 4,
    "airGame": 3,
    "style": "万能",
    "easy": 2,
    "weight": 3,
    "speed": 4,
    "gimmick": "ゼニガメ（軽量）・フシギソウ（中量）・リザードン（重量）の3体を入れ替えて戦う",
    "oneLine": "軽・中・重の3体のポケモンを場面ごとに交代して戦う切り替え型",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-pokemontrainer/",
      "https://www.nitolog.com/entry/smash-bros-sp/pokemontrainer-feature"
    ]
  },
  "ディディーコング": {
    "range": 2,
    "projectile": 2,
    "recovery": 3,
    "killPower": 2,
    "combo": 4,
    "airGame": 4,
    "style": "トリッキー",
    "easy": 2,
    "weight": 2,
    "speed": 4,
    "gimmick": "バナナのかわを置いたり投げたりして相手を転ばせ、そこから攻撃をつなぐ",
    "oneLine": "バナナで相手を転ばせ、素早い動きで畳みかけるテクニカルな猿",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-didikong/",
      "https://www.nitolog.com/entry/smash-bros-sp/diddykong-combo"
    ]
  },
  "リュカ": {
    "range": 2,
    "projectile": 2,
    "recovery": 3,
    "killPower": 4,
    "combo": 4,
    "airGame": 4,
    "style": "万能",
    "easy": 2,
    "weight": 3,
    "speed": 3,
    "gimmick": "PKサンダーを自分にぶつけて飛ぶ、操作にクセのある復帰",
    "oneLine": "PSIの飛び道具と体術コンボを混ぜて戦う、クセのある超能力少年",
    "confidence": "medium",
    "sources": [
      "https://kinkoma.com/sumabura-ryuka/",
      "https://www.nitolog.com/entry/smash-bros-sp/lucas-combo"
    ]
  },
  "ソニック": {
    "range": 1,
    "projectile": 0,
    "recovery": 5,
    "killPower": 2,
    "combo": 4,
    "airGame": 4,
    "style": "攻め",
    "easy": 3,
    "weight": 2,
    "speed": 5,
    "gimmick": "",
    "oneLine": "全キャラ最速の足で近づいては離れ、手数で削るスピードスター",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-sonic/",
      "https://www.nitolog.com/entry/smash-bros-sp/sonic-combo"
    ]
  },
  "デデデ": {
    "range": 4,
    "projectile": 2,
    "recovery": 4,
    "killPower": 5,
    "combo": 2,
    "airGame": 2,
    "style": "待ち",
    "easy": 4,
    "weight": 5,
    "speed": 1,
    "gimmick": "ゴルドーを投げ分け、打ち返されたものや吸い込みで再利用できる",
    "oneLine": "ゴルドーで牽制しつつ、ハンマーの重い一撃で吹っ飛ばす大王",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-dedede/",
      "https://www.nitolog.com/entry/smash-bros-sp/dedede-combo"
    ]
  },
  "ピクミン&オリマー": {
    "range": 4,
    "projectile": 3,
    "recovery": 2,
    "killPower": 4,
    "combo": 3,
    "airGame": 2,
    "style": "待ち",
    "easy": 1,
    "weight": 1,
    "speed": 2,
    "gimmick": "5色のピクミンを引っこ抜いて連れ歩き、色ごとの性質（威力・リーチ・投げ等）を使い分ける",
    "oneLine": "ピクミンを投げて攻め、色ごとの違いを使い分ける管理型キャラ",
    "confidence": "medium",
    "sources": [
      "https://kinkoma.com/sumabura-pikuori/",
      "https://www.nitolog.com/entry/smash-bros-sp/pikminandolimar-combo"
    ]
  },
  "ルカリオ": {
    "range": 3,
    "projectile": 2,
    "recovery": 4,
    "killPower": 4,
    "combo": 4,
    "airGame": 3,
    "style": "万能",
    "easy": 2,
    "weight": 3,
    "speed": 3,
    "gimmick": "波動の力: 自分の蓄積ダメージが増えるほど攻撃力・ふっとばし力と復帰距離が伸びる",
    "oneLine": "ダメージを受けるほど強くなる、逆転が持ち味の波動使い",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-rukario/",
      "https://www.nitolog.com/entry/smash-bros-sp/lucario-combo"
    ]
  },
  "ロボット": {
    "range": 3,
    "projectile": 3,
    "recovery": 5,
    "killPower": 3,
    "combo": 3,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 5,
    "speed": 3,
    "gimmick": "回して溜めたジャイロを床に残し、拾って投げ直せる（ビームは時間経過で自動充填され、充填前に撃つと弱いビームになる）",
    "oneLine": "ジャイロとビームで間合いを管理し、屈指の復帰力と強い判定で粘り強く戦うロボ",
    "confidence": "high",
    "sources": [
      "https://kinkoma.com/sumabura-robo/",
      "https://www.nitolog.com/entry/smash-bros-sp/robot-combo"
    ]
  },
  "トゥーンリンク": {
    "range": 3,
    "projectile": 4,
    "recovery": 2,
    "killPower": 3,
    "combo": 4,
    "airGame": 4,
    "style": "万能",
    "easy": 3,
    "weight": 2,
    "speed": 4,
    "gimmick": "爆弾を取り出して持ち歩き・投げてコンボの起点にできる",
    "oneLine": "爆弾・弓・ブーメランを投げつつ素早く出入りする小さな剣士",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223478",
      "https://www.ssbwiki.com/Toon_Link_(SSBU)"
    ]
  },
  "ウルフ": {
    "range": 3,
    "projectile": 2,
    "recovery": 2,
    "killPower": 4,
    "combo": 4,
    "airGame": 4,
    "style": "攻め",
    "easy": 3,
    "weight": 3,
    "speed": 2,
    "gimmick": "",
    "oneLine": "ブラスターで相手を動かし、近づいて速く重い技で攻め立てる",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223479",
      "https://www.ssbwiki.com/Wolf_(SSBU)"
    ]
  },
  "むらびと": {
    "range": 3,
    "projectile": 3,
    "recovery": 4,
    "killPower": 2,
    "combo": 2,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 3,
    "speed": 1,
    "gimmick": "「しまう」で相手の飛び道具を収納して撃ち返せる／種から木を育てて設置できる",
    "oneLine": "物を投げ、飛び道具をしまい、木を育ててじっくり戦う",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/223480",
      "https://www.ssbwiki.com/Villager_(SSBU)"
    ]
  },
  "ロックマン": {
    "range": 3,
    "projectile": 5,
    "recovery": 4,
    "killPower": 3,
    "combo": 3,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 4,
    "speed": 2,
    "gimmick": "メタルブレードは地面に落ちるとアイテムとして拾って再利用できる",
    "oneLine": "弱攻撃まで弾になる飛び道具の弾幕で近寄らせない射撃型",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223481",
      "https://www.ssbwiki.com/Mega_Man_(SSBU)"
    ]
  },
  "Wii Fitトレーナー": {
    "range": 2,
    "projectile": 2,
    "recovery": 3,
    "killPower": 3,
    "combo": 3,
    "airGame": 3,
    "style": "トリッキー",
    "easy": 2,
    "weight": 3,
    "speed": 4,
    "gimmick": "腹式呼吸（下B）をタイミング良く決めると一定時間攻撃力などが上がる",
    "oneLine": "ヨガのポーズ技と飛び道具、深呼吸の強化で戦う個性派",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/223482",
      "https://www.ssbwiki.com/Wii_Fit_Trainer_(SSBU)"
    ]
  },
  "ロゼッタ&チコ": {
    "range": 5,
    "projectile": 2,
    "recovery": 5,
    "killPower": 3,
    "combo": 3,
    "airGame": 4,
    "style": "トリッキー",
    "easy": 2,
    "weight": 1,
    "speed": 4,
    "gimmick": "相棒チコと2体で戦う。チコを離して置けるが、倒されるとしばらく大幅に弱くなる",
    "oneLine": "相棒チコと2人がかりで、広い範囲から相手を寄せ付けない",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223483",
      "https://www.ssbwiki.com/Rosalina_%26_Luma_(SSBU)"
    ]
  },
  "リトル・マック": {
    "range": 1,
    "projectile": 0,
    "recovery": 1,
    "killPower": 5,
    "combo": 3,
    "airGame": 1,
    "style": "攻め",
    "easy": 3,
    "weight": 2,
    "speed": 5,
    "gimmick": "スマッシュ攻撃の出始めにアーマーが付く（ジョルトブロー溜め中も軽いアーマー）。KOゲージが溜まると一撃必殺級のKOアッパーカットが使える",
    "oneLine": "地上の殴り合いは最強クラス、空中と復帰は極端に苦手なボクサー",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223484",
      "https://www.ssbwiki.com/Little_Mac_(SSBU)"
    ]
  },
  "ゲッコウガ": {
    "range": 3,
    "projectile": 2,
    "recovery": 3,
    "killPower": 3,
    "combo": 4,
    "airGame": 4,
    "style": "攻め",
    "easy": 2,
    "weight": 2,
    "speed": 5,
    "gimmick": "",
    "oneLine": "素早い足と手裏剣で揺さぶり、コンボでダメージを稼ぐ忍者",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223485",
      "https://www.ssbwiki.com/Greninja_(SSBU)"
    ]
  },
  "Miiファイター(格闘)": {
    "range": 1,
    "projectile": 1,
    "recovery": 2,
    "killPower": 3,
    "combo": 4,
    "airGame": 4,
    "style": "攻め",
    "easy": 3,
    "weight": 3,
    "speed": 4,
    "gimmick": "必殺技を各方向3種類から選んで組み合わせられる",
    "oneLine": "リーチは短いが出が速く、張り付いてコンボを叩き込む格闘家",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/223748",
      "https://www.ssbwiki.com/Mii_Brawler_(SSBU)"
    ]
  },
  "Miiファイター(剣術)": {
    "range": 3,
    "projectile": 2,
    "recovery": 3,
    "killPower": 3,
    "combo": 3,
    "airGame": 3,
    "style": "万能",
    "easy": 3,
    "weight": 4,
    "speed": 2,
    "gimmick": "必殺技を各方向3種類から選べる。反射技やカウンターも選択可能",
    "oneLine": "剣と飛び道具を選んで組み合わせる、中間距離の剣士",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/224350",
      "https://www.ssbwiki.com/Mii_Swordfighter_(SSBU)"
    ]
  },
  "Miiファイター(射撃)": {
    "range": 4,
    "projectile": 5,
    "recovery": 2,
    "killPower": 4,
    "combo": 2,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 4,
    "speed": 1,
    "gimmick": "必殺技を各方向3種類から選べ、飛び道具の組み合わせを変えられる",
    "oneLine": "遠くから多彩な弾を撃ち分けて壁を作る、足の遅い砲撃手",
    "confidence": "medium",
    "sources": [
      "https://game8.jp/smashbros-special/224349",
      "https://www.ssbwiki.com/Mii_Gunner_(SSBU)"
    ]
  },
  "パルテナ": {
    "range": 4,
    "projectile": 2,
    "recovery": 4,
    "killPower": 2,
    "combo": 4,
    "airGame": 5,
    "style": "万能",
    "easy": 3,
    "weight": 2,
    "speed": 5,
    "gimmick": "",
    "oneLine": "機動力と隙の少ない空中技で動き回り、空Nからコンボする女神",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223486",
      "https://www.ssbwiki.com/Palutena_(SSBU)"
    ]
  },
  "パックマン": {
    "range": 2,
    "projectile": 3,
    "recovery": 5,
    "killPower": 2,
    "combo": 3,
    "airGame": 3,
    "style": "トリッキー",
    "easy": 2,
    "weight": 3,
    "speed": 3,
    "gimmick": "フルーツターゲットで出す物を切り替えられる（ベルで相手をしびれさせる等）。消火栓を設置でき、出した物は相手にも使われうる",
    "oneLine": "フルーツや消火栓を並べて相手の動きを縛る仕掛け上手",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223487",
      "https://www.ssbwiki.com/Pac-Man_(SSBU)"
    ]
  },
  "ルフレ": {
    "range": 3,
    "projectile": 3,
    "recovery": 3,
    "killPower": 4,
    "combo": 3,
    "airGame": 4,
    "style": "待ち",
    "easy": 2,
    "weight": 3,
    "speed": 1,
    "gimmick": "サンダーソードと魔道書に使用回数があり、使い切ると一定時間使えない",
    "oneLine": "魔法で遠くから削り、サンダーソードで撃墜を狙う軍師",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223488",
      "https://www.ssbwiki.com/Robin_(SSBU)"
    ]
  },
  "シュルク": {
    "range": 5,
    "projectile": 0,
    "recovery": 3,
    "killPower": 4,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 1,
    "weight": 4,
    "speed": 3,
    "gimmick": "モナドアーツ5種（翔・疾・盾・斬・撃）を切り替えて、ジャンプ力や速さ・攻撃力などを変える",
    "oneLine": "長いモナドで間合いを制し、アーツで能力を切り替える剣士",
    "confidence": "high",
    "sources": [
      "https://game8.jp/smashbros-special/223489",
      "https://www.ssbwiki.com/Shulk_(SSBU)"
    ]
  },
  "クッパJr.": {
    "range": 3,
    "projectile": 2,
    "recovery": 4,
    "killPower": 3,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 2,
    "weight": 5,
    "speed": 2,
    "gimmick": "クラウンに乗って戦い、本体に当たると受けるダメージが増える",
    "oneLine": "乗り物から大砲やメカで牽制し、空中の持続技で押す万能型",
    "confidence": "high",
    "sources": [
      "https://hard-mode.net/archives/3481",
      "https://wikiwiki.jp/ssbswitch/ファイター/クッパJr.",
      "https://smashwiki.info/クッパJr._(SP)"
    ]
  },
  "ダックハント": {
    "range": 3,
    "projectile": 5,
    "recovery": 2,
    "killPower": 2,
    "combo": 4,
    "airGame": 3,
    "style": "待ち",
    "easy": 2,
    "weight": 2,
    "speed": 3,
    "gimmick": "缶・クレー・ガンマンの3種の設置飛び道具。缶は本体と同時に動かせる",
    "oneLine": "缶や銃撃を置いて相手を動かし、隙に空中技を当てる罠使い",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ダックハント_(SP)",
      "https://game8.jp/smashbros-special/223491",
      "https://wikiwiki.jp/ssbswitch/ファイター/ダックハント"
    ]
  },
  "リュウ": {
    "range": 2,
    "projectile": 2,
    "recovery": 2,
    "killPower": 5,
    "combo": 5,
    "airGame": 2,
    "style": "攻め",
    "easy": 1,
    "weight": 4,
    "speed": 2,
    "gimmick": "コマンド入力で必殺ワザ強化・ワザキャンセル・1on1で自動振り向き",
    "oneLine": "格ゲー流の接近戦で大ダメージ、昇龍拳で一気に倒す拳法家",
    "confidence": "high",
    "sources": [
      "https://wikiwiki.jp/ssbswitch/ファイター/リュウ",
      "https://smashwiki.info/リュウ_(SP)"
    ]
  },
  "ケン": {
    "range": 2,
    "projectile": 1,
    "recovery": 2,
    "killPower": 5,
    "combo": 5,
    "airGame": 2,
    "style": "攻め",
    "easy": 1,
    "weight": 4,
    "speed": 3,
    "gimmick": "コマンド入力で必殺ワザ強化・ワザキャンセル・1on1で自動振り向き",
    "oneLine": "波動拳は弱めの超接近型、コンボから昇龍拳で倒しきる",
    "confidence": "high",
    "sources": [
      "https://wikiwiki.jp/ssbswitch/ファイター/ケン",
      "https://smashwiki.info/ケン_(SP)"
    ]
  },
  "クラウド": {
    "range": 5,
    "projectile": 2,
    "recovery": 1,
    "killPower": 3,
    "combo": 3,
    "airGame": 5,
    "style": "攻め",
    "easy": 4,
    "weight": 4,
    "speed": 5,
    "gimmick": "リミットゲージ。溜めると15秒間、必殺ワザと動きが強化される",
    "oneLine": "大剣の長いリーチで空中から着地を狩る、素直な剣士",
    "confidence": "high",
    "sources": [
      "https://wikiwiki.jp/ssbswitch/ファイター/クラウド",
      "https://smashwiki.info/クラウド_(SP)"
    ]
  },
  "カムイ": {
    "range": 5,
    "projectile": 1,
    "recovery": 2,
    "killPower": 3,
    "combo": 3,
    "airGame": 4,
    "style": "万能",
    "easy": 3,
    "weight": 4,
    "speed": 2,
    "gimmick": "横必殺で槍を壁や地面に刺し、そこから蹴りなど派生できる",
    "oneLine": "竜に変身する体の一部で遠くまで届き、浮かせて追い込む",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/カムイ_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/カムイ"
    ]
  },
  "ベヨネッタ": {
    "range": 2,
    "projectile": 1,
    "recovery": 5,
    "killPower": 2,
    "combo": 5,
    "airGame": 5,
    "style": "攻め",
    "easy": 1,
    "weight": 1,
    "speed": 3,
    "gimmick": "ウィッチタイム（受けると相手をスローに）とバレットアーツ（長押しで追撃弾）",
    "oneLine": "空中コンボで場外まで運び続ける、操作難度の高い魔女",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ベヨネッタ_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/ベヨネッタ"
    ]
  },
  "インクリング": {
    "range": 2,
    "projectile": 2,
    "recovery": 4,
    "killPower": 2,
    "combo": 4,
    "airGame": 4,
    "style": "攻め",
    "easy": 4,
    "weight": 3,
    "speed": 4,
    "gimmick": "インクゲージ管理。インクで塗った相手は受けるダメージが最大1.5倍",
    "oneLine": "素早く動きインクで塗って火力アップ、手数で攻める",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/インクリング_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/インクリング"
    ]
  },
  "リドリー": {
    "range": 4,
    "projectile": 2,
    "recovery": 3,
    "killPower": 4,
    "combo": 4,
    "airGame": 4,
    "style": "攻め",
    "easy": 2,
    "weight": 5,
    "speed": 5,
    "gimmick": "多段ジャンプ。横必殺で相手をつかんで地面や崖際を引きずる",
    "oneLine": "巨体の長い尻尾と翼で押し込む、速くて重い一撃のドラゴン",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/リドリー_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/リドリー"
    ]
  },
  "シモン": {
    "range": 5,
    "projectile": 4,
    "recovery": 1,
    "killPower": 3,
    "combo": 2,
    "airGame": 2,
    "style": "待ち",
    "easy": 3,
    "weight": 5,
    "speed": 1,
    "gimmick": "鞭でワイヤー復帰、空中攻撃の方向を打ち分けられる",
    "oneLine": "長い鞭と斧・クロス・聖水で相手を寄せ付けない遠距離型",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/シモン_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/シモン"
    ]
  },
  "リヒター": {
    "range": 5,
    "projectile": 4,
    "recovery": 1,
    "killPower": 3,
    "combo": 2,
    "airGame": 2,
    "style": "待ち",
    "easy": 3,
    "weight": 5,
    "speed": 1,
    "gimmick": "シモンとほぼ同性能。聖水だけが違い、炎ではなく青い炎のオーラ属性",
    "oneLine": "シモンと同じく鞭と飛び道具で距離を取り、先端で倒す",
    "confidence": "medium",
    "sources": [
      "https://smashwiki.info/リヒター_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/リヒター"
    ]
  },
  "キングクルール": {
    "range": 4,
    "projectile": 4,
    "recovery": 3,
    "killPower": 5,
    "combo": 2,
    "airGame": 2,
    "style": "投げ",
    "easy": 3,
    "weight": 5,
    "speed": 1,
    "gimmick": "おなかにアーマーがあり、一部のワザ中は攻撃を受けても止まらない",
    "oneLine": "超重量でアーマーを盾に殴り合い、長いつかみと投げで倒す",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/キングクルール_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/キングクルール"
    ]
  },
  "しずえ": {
    "range": 3,
    "projectile": 3,
    "recovery": 5,
    "killPower": 2,
    "combo": 3,
    "airGame": 3,
    "style": "待ち",
    "easy": 3,
    "weight": 2,
    "speed": 1,
    "gimmick": "飛び道具やアイテムをしまう・つりざおでつかむ・ハニワくん設置",
    "oneLine": "パチンコと設置物で遠くから削り、崖外で粘り強く戦う",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/しずえ_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/しずえ"
    ]
  },
  "ガオガエン": {
    "range": 2,
    "projectile": 0,
    "recovery": 1,
    "killPower": 5,
    "combo": 3,
    "airGame": 2,
    "style": "投げ",
    "easy": 3,
    "weight": 5,
    "speed": 1,
    "gimmick": "リベンジ。攻撃を受け止めると次の攻撃が大きく強化される",
    "oneLine": "足は遅いが投げと豪快な一撃で早めに倒すプロレスラー",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ガオガエン_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/ガオガエン"
    ]
  },
  "パックンフラワー": {
    "range": 3,
    "projectile": 2,
    "recovery": 3,
    "killPower": 4,
    "combo": 2,
    "airGame": 2,
    "style": "トリッキー",
    "easy": 3,
    "weight": 5,
    "speed": 3,
    "gimmick": "しゃがみ中に踏まれると自動で反撃。トゲ玉や毒ガスなどクセのある必殺ワザ",
    "oneLine": "トゲ玉や毒で待ち構え、上方向と崖際で仕留めるクセ者",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/パックンフラワー_(SP)",
      "https://wikiwiki.jp/ssbswitch/ファイター/パックンフラワー"
    ]
  },
  "ジョーカー": {
    "range": 2,
    "projectile": 2,
    "recovery": 4,
    "killPower": 3,
    "combo": 4,
    "airGame": 4,
    "style": "攻め",
    "easy": 2,
    "weight": 3,
    "speed": 5,
    "gimmick": "反逆ゲージが溜まるとアルセーヌを召喚し、通常技・必殺技が大幅強化される",
    "oneLine": "素早く動いて手数で削り、ゲージが溜まると化ける高速キャラ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ジョーカー_(SP)",
      "https://sumabura.last-dragon.work/sumabura/zyoka.html"
    ]
  },
  "勇者": {
    "range": 4,
    "projectile": 3,
    "recovery": 3,
    "killPower": 5,
    "combo": 2,
    "airGame": 2,
    "style": "トリッキー",
    "easy": 2,
    "weight": 4,
    "speed": 4,
    "gimmick": "必殺技はMPを消費する呪文。下必殺でランダムに出る4つのコマンドから選ぶ。スマッシュは確率で会心の一撃",
    "oneLine": "呪文と剣で戦う一撃型。コマンド選びとMP管理がカギ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/勇者_(SP)",
      "https://sumabura.last-dragon.work/sumabura/yuusha.html"
    ]
  },
  "バンジョー&カズーイ": {
    "range": 3,
    "projectile": 3,
    "recovery": 3,
    "killPower": 3,
    "combo": 2,
    "airGame": 2,
    "style": "待ち",
    "easy": 2,
    "weight": 5,
    "speed": 5,
    "gimmick": "無敵付き突進ワンダーウイングは1ストックにつき5回まで",
    "oneLine": "卵の弾と無敵の突進で戦う、距離の取り方が大事なキャラ",
    "confidence": "medium",
    "sources": [
      "https://smashwiki.info/バンジョー%26カズーイ_(SP)",
      "https://sumabura.last-dragon.work/sumabura/bannzyo.html"
    ]
  },
  "テリー": {
    "range": 2,
    "projectile": 2,
    "recovery": 2,
    "killPower": 4,
    "combo": 5,
    "airGame": 2,
    "style": "攻め",
    "easy": 2,
    "weight": 5,
    "speed": 3,
    "gimmick": "1対1では常に相手の方を向く。コマンド入力で必殺技が強化され、蓄積100%以上で超必殺技が使える",
    "oneLine": "近づいて殴り、コンボで大ダメージを奪う格闘ゲーム系キャラ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/テリー_(SP)",
      "https://sumabura.last-dragon.work/sumabura/teri.html"
    ]
  },
  "ベレト/ベレス": {
    "range": 5,
    "projectile": 3,
    "recovery": 2,
    "killPower": 5,
    "combo": 2,
    "airGame": 3,
    "style": "待ち",
    "easy": 2,
    "weight": 4,
    "speed": 1,
    "gimmick": "スティック方向で剣・槍・斧・弓の4つの武器を使い分ける",
    "oneLine": "4つの武器を使い分け、長いリーチで遠めから刺す重火力キャラ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ベレト_(SP)",
      "https://sumabura.last-dragon.work/sumabura/beresu.html"
    ]
  },
  "ミェンミェン": {
    "range": 5,
    "projectile": 2,
    "recovery": 1,
    "killPower": 4,
    "combo": 2,
    "airGame": 1,
    "style": "待ち",
    "easy": 2,
    "weight": 4,
    "speed": 2,
    "gimmick": "伸びる左右の腕を別々に操作し、腕の種類（アーム）を切り替えて戦う。腕攻撃は飛び道具並みの射程だが反射されない",
    "oneLine": "伸びる腕で遠くから殴り続ける、近寄らせたくない射程特化キャラ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ミェンミェン_(SP)",
      "https://sumabura.last-dragon.work/sumabura/mienmien.html"
    ]
  },
  "スティーブ/アレックス": {
    "range": 2,
    "projectile": 1,
    "recovery": 5,
    "killPower": 4,
    "combo": 4,
    "airGame": 2,
    "style": "トリッキー",
    "easy": 1,
    "weight": 3,
    "speed": 1,
    "gimmick": "地面を掘って素材を集め、道具をクラフト・ブロックを設置する。道具は使うと壊れ、素材切れで弱体化",
    "oneLine": "素材を集めて道具を作り、ブロックで戦場を変える職人キャラ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/index.php?title=スティーブ_(SP)",
      "https://sumabura.last-dragon.work/sumabura/sutexibu.html"
    ]
  },
  "セフィロス": {
    "range": 5,
    "projectile": 3,
    "recovery": 2,
    "killPower": 4,
    "combo": 2,
    "airGame": 4,
    "style": "待ち",
    "easy": 2,
    "weight": 1,
    "speed": 4,
    "gimmick": "ダメージが溜まると片翼状態になり、攻撃力・機動力・空中ジャンプ回数が上がりスマッシュにアーマーが付く",
    "oneLine": "長い刀で遠くから斬り、ピンチになると翼が生えて強くなる",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/セフィロス_(SP)",
      "https://sumabura.last-dragon.work/sumabura/sephiroth.html"
    ]
  },
  "ホムラ/ヒカリ": {
    "range": 4,
    "projectile": 1,
    "recovery": 2,
    "killPower": 4,
    "combo": 3,
    "airGame": 3,
    "style": "万能",
    "easy": 4,
    "weight": 3,
    "speed": 4,
    "gimmick": "下必殺で撃墜向きのホムラと速さのヒカリをクールタイムなしで入れ替えられる",
    "oneLine": "力のホムラと速さのヒカリを、いつでも入れ替えて戦う",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ホムラ_(SP)",
      "https://smashwiki.info/ホムラ",
      "https://sumabura.last-dragon.work/sumabura/homurahikari.html"
    ]
  },
  "カズヤ": {
    "range": 2,
    "projectile": 2,
    "recovery": 3,
    "killPower": 5,
    "combo": 5,
    "airGame": 1,
    "style": "攻め",
    "easy": 2,
    "weight": 5,
    "speed": 2,
    "gimmick": "コマンド入力技が非常に多く、地上技の多くに無敵やアーマー。100%以上でレイジ状態になりレイジドライブが使える",
    "oneLine": "近づけば連続技と重い一撃で一気に持っていく格闘キャラ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/カズヤ_(SP)",
      "https://sumabura.last-dragon.work/sumabura/kazuya.html"
    ]
  },
  "ソラ": {
    "range": 3,
    "projectile": 2,
    "recovery": 5,
    "killPower": 3,
    "combo": 4,
    "airGame": 5,
    "style": "万能",
    "easy": 4,
    "weight": 1,
    "speed": 2,
    "gimmick": "通常必殺の魔法が撃つたびにファイガ→サンダガ→ブリザガの順で切り替わる（狙った魔法は空撃ちで回す）",
    "oneLine": "高く跳んで空中を自由に動き、粘り強く戦う万能キャラ",
    "confidence": "high",
    "sources": [
      "https://smashwiki.info/ソラ_(SP)",
      "https://game8.jp/smashbros-special/404217",
      "https://sumabura.last-dragon.work/sumabura/sora.html"
    ]
  }
};
