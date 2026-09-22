// window.alert / window.confirm の代わりのアプリ内ダイアログ（日本語のボタン）。
// iOSアプリ（Capacitor）では window.alert/confirm がネイティブのアラートになり、ボタンが英語の「Ok」「Cancel」で出るため使わない。
import { el } from "./dom.js";

function showDialog(message, { okLabel = "OK", cancelLabel = null, danger = false } = {}) {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    let overlay;
    const close = (result) => {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      }
    };
    const okBtn = el(
      "button",
      { type: "button", className: danger ? "danger-btn" : "primary-btn", onClick: () => close(true) },
      okLabel
    );
    const buttons = [
      cancelLabel ? el("button", { type: "button", className: "secondary-btn", onClick: () => close(false) }, cancelLabel) : null,
      okBtn,
    ];
    // 初期フォーカスはダイアログ本体（消去などの確定ボタンに最初から当てない）
    const box = el("div", { className: "dialog-box", role: "alertdialog", "aria-modal": "true", tabindex: "-1" }, [
      el("p", { className: "dialog-message" }, message),
      el("div", { className: "dialog-actions" }, buttons),
    ]);
    overlay = el("div", { className: "dialog-overlay" }, [box]);
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(overlay);
    box.focus();
  });
}

/** お知らせ（OKだけ）。閉じたら解決する。 */
export function showAlert(message) {
  return showDialog(message, { okLabel: "OK" }).then(() => undefined);
}

/** 確認（キャンセル／OK）。OKなら true。 */
export function showConfirm(message, { okLabel = "OK", danger = false } = {}) {
  return showDialog(message, { okLabel, cancelLabel: "キャンセル", danger });
}

