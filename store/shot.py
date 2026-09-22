# 相性ノートの画面確認用スクリーンショット（Playwright WebKit・1290x2796）。
# App Store に出す画像は store/sim_shot.py（iOSシミュレータの実機描画・ステータスバー付き）で撮る。これはその下見と
# Web版の確認用で、出力は build/web-shots/（コミットしない）。シードデータ build_state() は sim_shot.py も使う。
# 使い方: python3 store/shot.py  （リポジトリ直下を自前の一時HTTPサーバーで配信して撮る）
# iPhone相当の 430x932 CSS px を 3倍で撮る＝1290x2796。レンダラは iOS と同系の WebKit。
# ビューポート撮影（fullPage ではない）。固定の下タブがカードを中途半端に切らないよう各画面でスクロール位置を調整する。
# App Store 用は iOS アプリの見た目で撮るため window.Capacitor.isNativePlatform() を true にする（相性の目安はリンク案内になる）。
# python3 store/shot.py --web-matchup OUT.png で、Web版（同梱データ表示）の相性タブを1枚だけ別に撮れる。
import argparse
import functools
import http.server
import os
import random
import threading
from datetime import date, timedelta

from playwright.sync_api import sync_playwright

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(BASE, "build", "web-shots")

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


NATIVE_INIT = "window.Capacitor = { isNativePlatform: () => true };"


def scroll_bottom_to(page, selector, gap=16):
    """selector の要素の下端が下タブの上端から gap px 上に来るようスクロールする。"""
    page.evaluate(
        """([sel, gap]) => {
          const node = document.querySelector(sel);
          const navTop = document.querySelector('nav.bottom-nav').getBoundingClientRect().top;
          window.scrollTo(0, window.scrollY + node.getBoundingClientRect().bottom - (navTop - gap));
        }""",
        [selector, gap],
    )


def open_app(browser, url, native):
    ctx = browser.new_context(
        viewport={"width": CSS_W, "height": CSS_H},
        device_scale_factor=SCALE,
        color_scheme="light",
        locale="ja-JP",
    )
    if native:
        ctx.add_init_script(NATIVE_INIT)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(url)
    page.evaluate("(s) => window.localStorage.setItem('aishonote.v1', JSON.stringify(s))", build_state())
    page.reload()
    page.wait_for_selector("nav.bottom-nav")
    page.wait_for_timeout(300)
    return page, errors


def shot(page, name):
    os.makedirs(OUTDIR, exist_ok=True)
    page.wait_for_timeout(200)
    path = os.path.join(OUTDIR, name)
    page.screenshot(path=path)  # ビューポート撮影
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--web-matchup", help="Web版（注入なし）の相性タブだけをこのパスに撮る")
    args = ap.parse_args()

    srv, url = start_server()
    out = []
    try:
        with sync_playwright() as p:
            browser = p.webkit.launch()
            if args.web_matchup:
                page, errors = open_app(browser, url, native=False)
                click_tab(page, "相性")
                page.wait_for_selector(".ref-matchup-columns")
                page.wait_for_timeout(200)
                page.screenshot(path=args.web_matchup)
                out.append(args.web_matchup)
            else:
                page, errors = open_app(browser, url, native=True)

                # 01 ホーム（ヘッダーから見える一番上の位置）
                page.evaluate("window.scrollTo(0, 0)")
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

                # 03 相性（出典へのリンク案内カード＋自分の相性表）
                click_tab(page, "相性")
                page.wait_for_selector("a.ref-link-btn")
                assert page.locator(".ref-matchup-columns").count() == 0, "iOS表示で同梱データが出ている"
                out.append(shot(page, "03_matchup.png"))

                # 04 設定（データカード＋「このアプリについて」カード。about の下端を下タブの少し上に揃える）
                click_tab(page, "設定")
                scroll_bottom_to(page, ".about-card")
                assert page.evaluate(
                    "() => getComputedStyle(document.querySelector('.file-label input')).opacity"
                ) == "0", "英語の Choose File が見えている"
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
