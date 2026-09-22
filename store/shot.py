# 相性ノート App Store 用スクリーンショット撮影（6.9インチ 1290x2796）。
# 使い方: python3 store/shot.py  （リポジトリ直下を自前の一時HTTPサーバーで配信して撮る）
# iPhone相当の 430x932 CSS px を 3倍で撮る＝1290x2796。レンダラは iOS と同系の WebKit。
# ビューポート撮影（fullPage ではない）。固定の下タブがカードを中途半端に切らないよう各画面でスクロール位置を調整する。
import functools
import http.server
import os
import random
import threading
from datetime import date, timedelta

from playwright.sync_api import sync_playwright

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(BASE, "store", "screenshots")
os.makedirs(OUTDIR, exist_ok=True)

CSS_W, CSS_H, SCALE = 430, 932, 3
TARGET = (1290, 2796)

GAME = "ssbu"
MY_FIGHTERS = ["ネス", "マリオ"]
ACTIVE = "ネス"

MEMOS = [
    "PKファイヤーを置いてから掴みを通す",
    "復帰はPKサンダーの角度を散らす",
    "着地は空Nで暴れず横に逃げる",
    "崖端の飛び道具を反射されないよう待つ",
]

# (相手, 結果, 負け理由)。ネスの「一般的な相性の目安」に載る相手を中心に並べ、
# 相性カードの各キャラの横に「あなたは○勝○敗」が出るようにする。
PLAN = [
    ("フォックス", "win", []),
    ("フォックス", "win", []),
    ("フォックス", "lose", ["早期撃墜された"]),
    ("フォックス", "win", []),
    ("フォックス", "win", []),
    ("パックマン", "lose", ["復帰阻止された"]),
    ("パックマン", "lose", ["飛び道具に触れない"]),
    ("パックマン", "win", []),
    ("パックマン", "lose", ["復帰阻止された", "崖攻めが弱い"]),
    ("パックマン", "lose", ["着地を狩られた"]),
    ("勇者", "lose", ["飛び道具に触れない"]),
    ("勇者", "win", []),
    ("勇者", "lose", ["復帰阻止された"]),
    ("スネーク", "win", []),
    ("スネーク", "win", []),
    ("メタナイト", "win", []),
    ("メタナイト", "lose", ["着地を狩られた"]),
    ("ピーチ", "lose", ["コンボ火力負け"]),
    ("ピーチ", "lose", ["着地を狩られた"]),
    ("ピーチ", "win", []),
]


def build_state():
    random.seed(7)
    today = date.today()
    matches = []
    for i, (opp, result, tags) in enumerate(PLAN):
        d = today - timedelta(days=(len(PLAN) - i) * 2 // 3)
        matches.append(
            {
                "id": f"m_seed_{i}",
                "gameId": GAME,
                "date": d.isoformat(),
                "my": ACTIVE,
                "opponent": opp,
                "result": result,
                "tags": tags,
                "memo": random.choice(MEMOS) if result == "lose" and random.random() < 0.6 else "",
                "createdAt": 1790000000000 + i,
            }
        )
    matchups = {
        f"{GAME}__{ACTIVE}__パックマン": {"mark": "bad", "memo": "消火栓の処理を先に考える"},
        f"{GAME}__{ACTIVE}__フォックス": {"mark": "good", "memo": ""},
        f"{GAME}__{ACTIVE}__勇者": {"mark": "bad", "memo": ""},
    }
    return {
        "version": 2,
        "games": {
            GAME: {
                "id": GAME,
                "name": "大乱闘スマッシュブラザーズ SPECIAL",
                "isPreset": True,
                "customFighters": [],
            }
        },
        "activeGameId": GAME,
        "myFightersByGame": {GAME: MY_FIGHTERS},
        "activeFighterByGame": {GAME: ACTIVE},
        "matches": matches,
        "matchups": matchups,
    }


def start_server():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    handler = functools.partial(Quiet, directory=BASE)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/index.html"


def click_tab(page, label):
    page.click(f"nav.bottom-nav >> text={label}")
    page.wait_for_timeout(250)
    page.evaluate("window.scrollTo(0, 0)")


def scroll_card_to_top(page, heading):
    """見出し heading で始まるカードの上端が画面上部に来るようスクロールする。"""
    page.evaluate(
        """(t) => {
          const h = [...document.querySelectorAll('.card h2')].find(x => x.textContent.startsWith(t));
          if (!h) return;
          // ページ末尾でスクロールが止まらないよう、撮影時だけ本文の下に空白を足す（画面下部は元々空白なので見た目は同じ）
          if (!document.getElementById('shot-spacer')) {
            const sp = document.createElement('div');
            sp.id = 'shot-spacer';
            sp.style.height = window.innerHeight + 'px';
            document.getElementById('app').appendChild(sp);
          }
          const card = h.closest('.card');
          const prev = card.previousElementSibling;
          // 前のカードの下端が1pxも見えない位置（=カード間の余白から始まる位置）まで送る
          const y = prev ? prev.getBoundingClientRect().bottom + 1 : card.getBoundingClientRect().top - 12;
          window.scrollTo(0, window.scrollY + y);
        }""",
        heading,
    )


def shot(page, name):
    page.wait_for_timeout(200)
    path = os.path.join(OUTDIR, name)
    page.screenshot(path=path)  # ビューポート撮影
    return path


def main():
    srv, url = start_server()
    out = []
    try:
        with sync_playwright() as p:
            browser = p.webkit.launch()
            ctx = browser.new_context(
                viewport={"width": CSS_W, "height": CSS_H},
                device_scale_factor=SCALE,
                color_scheme="light",
                locale="ja-JP",
            )
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(url)
            page.evaluate(
                "(s) => window.localStorage.setItem('aishonote.v1', JSON.stringify(s))", build_state()
            )
            page.reload()
            page.wait_for_selector("nav.bottom-nav")
            page.wait_for_timeout(300)

            # 01 ホーム（次に潰す相性・相性の目安・勝率サマリー・上達グラフを1画面に）
            scroll_card_to_top(page, "次に潰す相性")
            out.append(shot(page, "01_home.png"))

            # 02 記録（負け理由のタグが見える状態）
            click_tab(page, "記録")
            page.locator(".log-form select").nth(1).select_option("パックマン")
            page.check("input[type=radio][value=lose]")
            page.wait_for_timeout(200)
            page.check("label.tag-checkbox:has-text('復帰阻止された') input")
            page.check("label.tag-checkbox:has-text('飛び道具に触れない') input")
            page.wait_for_timeout(200)
            out.append(shot(page, "02_log.png"))

            # 03 相性（一般的な相性の目安カードを最上部に大きく）
            click_tab(page, "相性")
            page.wait_for_selector(".card:has(h2:text('一般的な相性の目安'))")
            out.append(shot(page, "03_matchup.png"))

            # 04 設定（マイキャラ設定を画面上部に）
            click_tab(page, "設定")
            scroll_card_to_top(page, "マイキャラ設定")
            # キャラ一覧（内側スクロール）をネスが見える位置へ
            page.evaluate(
                """() => {
                  const list = document.querySelector('.fighter-checklist');
                  const row = [...list.querySelectorAll('.fighter-checkbox')].find(r => r.textContent.trim() === 'ネス');
                  if (row) list.scrollTop = row.offsetTop - list.offsetTop - 4 * row.offsetHeight;
                }"""
            )
            out.append(shot(page, "04_settings.png"))

            browser.close()
            if errors:
                raise SystemExit(f"page errors: {errors}")
    finally:
        srv.shutdown()

    from PIL import Image

    for pth in out:
        size = Image.open(pth).size
        assert size == TARGET, f"{pth}: {size} != {TARGET}"
        print(pth, size)


if __name__ == "__main__":
    main()
