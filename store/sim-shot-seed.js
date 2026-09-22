// App Store 用スクショの撮影専用。store/sim_shot.py が __SEED__ を埋めて www/js/shot-seed.js に一時的に置く（出荷ビルドには入らない）。
// 起動のたびに次の画面を表示する: 0=ホーム / 1=記録 / 2=相性 / 3=設定 / 4=確認ダイアログ（確認用）。
const KEY = "aishonote.v1";
const STEP = "shot.step";
const SEED = __SEED__;
if (!localStorage.getItem("shot.seeded")) {
  localStorage.setItem(KEY, JSON.stringify(SEED));
  localStorage.setItem("shot.seeded", "1");
  localStorage.setItem(STEP, "0");
  location.reload();
} else {
  const step = Number(localStorage.getItem(STEP) || "0");
  localStorage.setItem(STEP, String(step + 1));
  const later = (ms) => new Promise((r) => setTimeout(r, ms));
  const tab = (label) => [...document.querySelectorAll("nav.bottom-nav button")].find((b) => b.textContent.trim() === label).click();
  const safeTop = () => parseFloat(getComputedStyle(document.body).paddingTop) || 0;
  (async () => {
    await later(400);
    if (step % 5 === 1) {
      tab("記録");
      await later(200);
      const sel = document.querySelectorAll(".log-form select")[1];
      sel.value = "パックマン";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelector("input[type=radio][value=lose]").click();
      await later(200);
      for (const t of ["復帰阻止された", "飛び道具に触れない"]) {
        [...document.querySelectorAll("label.tag-checkbox")].find((l) => l.textContent.includes(t)).querySelector("input").click();
      }
    } else if (step % 5 === 2) {
      tab("相性");
    }
    // 02・03 はヘッダー（ゲーム選択）が画面に入らない位置まで送る
    const toTop = (node, gap) => window.scrollTo(0, window.scrollY + node.getBoundingClientRect().top - safeTop() - gap);
    if (step % 5 === 1 || step % 5 === 2) {
      await later(200);
      window.scrollTo(0, 0);
      toTop(document.querySelector(".panel .card"), 12);
    } else if (step % 5 === 3 || step % 5 === 4) {
      tab("設定");
      await later(200);
      // 一番下まで送れないので、キャラ一覧の最後の行（カービィ）が欠けずに上端に来る位置にする
      const rows = [...document.querySelectorAll("label")].filter((l) => l.textContent.trim() === "カービィ");
      toTop(rows[rows.length - 1], 10);
      if (step % 5 === 4) {
        await later(200);
        document.querySelector(".danger-btn").click();
      }
    }
    if (step % 5 === 0) window.scrollTo(0, 0);
    document.documentElement.dataset.shotReady = String(step);
  })();
}
