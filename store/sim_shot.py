# 相性ノート App Store 用スクリーンショット（6.9インチ 1320x2868）を iOS シミュレータの実機描画で撮る。
# 使い方: python3 store/sim_shot.py
# 1. www/ を同期して撮影用の store/sim-shot-seed.js（store/shot.py と同じシードデータ入り）を差し込む
# 2. シミュレータ向けにビルド・インストールし、ステータスバーを 9:41 に揃える
# 3. 起動するたびに次の画面を出す仕組みで、終了→起動→撮影を4回繰り返す
# 4. 最後に www/ と ios/App/App/public を撮影用の差し込みなしに戻す（出荷ビルドに入らないように）
import json
import os
import subprocess
import sys
import time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE, "store"))
from shot import build_state  # noqa: E402

OUTDIR = os.path.join(BASE, "store", "screenshots")
DEVICE = os.environ.get("SIM_DEVICE", "iPhone 17 Pro Max")
BUNDLE = "jp.co.ryoseiworld.aishonote"
TARGET = (1320, 2868)
SHOTS = ["01_home.png", "02_log.png", "03_matchup.png", "04_settings.png"]


def run(*cmd, **kw):
    return subprocess.run(cmd, cwd=BASE, check=True, **kw)


def device_id():
    out = subprocess.run(["xcrun", "simctl", "list", "devices", "available", "-j"], check=True, capture_output=True, text=True).stdout
    for devices in json.loads(out)["devices"].values():
        for d in devices:
            if d["name"] == DEVICE:
                return d["udid"]
    raise SystemExit(f"simulator not found: {DEVICE}")


def sync_clean():
    run("bash", "scripts/sync-www.sh")
    run("npx", "cap", "copy", "ios")


def main():
    udid = device_id()
    run("bash", "scripts/sync-www.sh")
    seed = open(os.path.join(BASE, "store", "sim-shot-seed.js"), encoding="utf-8").read()
    seed = seed.replace("__SEED__", json.dumps(build_state(), ensure_ascii=False))
    with open(os.path.join(BASE, "www", "js", "shot-seed.js"), "w", encoding="utf-8") as f:
        f.write(seed)
    index = os.path.join(BASE, "www", "index.html")
    html = open(index, encoding="utf-8").read()
    tag = '<script type="module" src="./js/app.js"></script>'
    with open(index, "w", encoding="utf-8") as f:
        f.write(html.replace(tag, tag + '\n<script type="module" src="./js/shot-seed.js"></script>'))
    try:
        run("npx", "cap", "copy", "ios")
        run("xcodebuild", "-project", "ios/App/App.xcodeproj", "-scheme", "App", "-configuration", "Debug",
            "-destination", f"platform=iOS Simulator,id={udid}", "-derivedDataPath", "build/sim", "build", "-quiet")
        app = os.path.join(BASE, "build/sim/Build/Products/Debug-iphonesimulator/App.app")
        subprocess.run(["xcrun", "simctl", "boot", udid], capture_output=True)
        run("xcrun", "simctl", "bootstatus", udid, "-b", capture_output=True)
        run("xcrun", "simctl", "status_bar", udid, "override", "--time", "9:41", "--batteryState", "discharging",
            "--batteryLevel", "100", "--cellularMode", "active", "--cellularBars", "4", "--wifiBars", "3", "--dataNetwork", "wifi")
        subprocess.run(["xcrun", "simctl", "uninstall", udid, BUNDLE], capture_output=True)  # localStorage を空にしてシードから始める
        run("xcrun", "simctl", "install", udid, app)
        for name in SHOTS:
            subprocess.run(["xcrun", "simctl", "terminate", udid, BUNDLE], capture_output=True)
            time.sleep(1)
            run("xcrun", "simctl", "launch", udid, BUNDLE, capture_output=True)
            time.sleep(5 if name == SHOTS[0] else 3.5)  # 初回はシード投入の再読み込みがある
            run("xcrun", "simctl", "io", udid, "screenshot", os.path.join(OUTDIR, name), capture_output=True)
    finally:
        sync_clean()

    from PIL import Image

    for name in SHOTS:
        path = os.path.join(OUTDIR, name)
        size = Image.open(path).size
        assert size == TARGET, f"{path}: {size} != {TARGET}"
        print(path, size)


if __name__ == "__main__":
    main()
