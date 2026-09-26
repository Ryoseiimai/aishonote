import { el } from "./dom.js";
import { GUIDE_FRAMES } from "./pixel-art.js";
import { pixelSprite } from "./pixel-view.js";
import { birthdayHeading, birthdaySummary } from "./birthday.js";

export function birthdayCard(state, now, onClose) {
  const summary = birthdaySummary(state, now);
  return el("div", { className: "birthday-card" }, [
    el("div", { className: "birthday-confetti", "aria-hidden": "true" },
      Array.from({ length: 12 }, () => el("i"))),
    el("p", { className: "birthday-date", "aria-hidden": "true" }, "HAPPY BIRTHDAY"),
    el("div", { className: "guide-sprite joy birthday-coach", role: "img", "aria-label": "両手を上げて喜ぶむすびコーチ" },
      GUIDE_FRAMES.joy.map((frame, i) => pixelSprite(frame, `pixel-frame frame-${i}`))),
    el("p", { className: "guide-name" }, "むすびコーチより"),
    el("h1", { id: "birthday-title" }, birthdayHeading(state.birthdayName)),
    el("p", { id: "birthday-message", className: "birthday-message" }, "今年も一緒に強くなろう！"),
    summary ? el("p", { className: "birthday-summary" }, summary) : null,
    el("button", { type: "button", className: "primary-btn birthday-close", onClick: onClose }, "閉じる"),
  ]);
}

/** ルートの再描画から独立。標準dialogで背面操作を防ぎ、フォーカスを閉じ込める。 */
export function showBirthday(state, now, onDismiss) {
  const dialog = el("dialog", {
    className: "birthday-dialog", "aria-labelledby": "birthday-title", "aria-describedby": "birthday-message",
  });
  const close = () => dialog.close();
  dialog.appendChild(birthdayCard(state, now, close));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("close", () => {
    dialog.remove();
    document.body.classList.remove("birthday-open");
    onDismiss();
    document.querySelector(".nav-btn.active")?.focus();
  }, { once: true });
  document.body.appendChild(dialog);
  document.body.classList.add("birthday-open");
  dialog.showModal();
}
