<!--
※動画添付前提：この返信は画面録画（項目1）を添付してから送る。撮影はこれから本人が iPhone 16 実機（最新iOS）で行う。
  - 撮る前に build 1.0 (4) を実機に入れ、アプリを一度削除して新規インストール状態から撮る（起動シーンから始めること）
  - 撮影の流れ（1〜2分）: 起動 → ホーム（むすびコーチ・Lv）→［設定］でマイキャラを1体選ぶ →［記録］で負けと負けた理由を1件入れる
    →［ホーム］の「今週の課題」と練習メニュー →［上達］で10分を選んでスタート→一時停止→「今日完了として記録」、ロードマップを1件チェック（XP・レベル）、キャラ専用メニュー
    →［相性］で相性表・印とメモ、「相性表を開く（シラツキ理論）」をタップしてSafariが開くところ →［設定］の「このアプリについて」
  - 誕生日画面は10月15日にしか出ないので、録画には入れなくてよい（下の3.で出し方を説明済み）
  - 実際の iOS バージョンが確定したら「the latest iOS」を「iOS 26.x」に置き換えてもよい
  - App Store Connect には下の「Hello App Review Team,」から最後の署名までを貼る
-->

Hello App Review Team,

Thank you for your message. Please find the requested information below. The same information has also been added to the Notes field of the App Review Information section.

1. Screen recording
Attached. Captured on a physical iPhone 16 running the latest iOS, starting from launching the app. The app has no account registration or login, no user-generated content shared with other users, and no paid content or in-app purchases, so none of those flows exist in the app.

2. Purpose and target audience
"相性ノート" (Matchup Note) is a free personal notebook app for players of competitive fighting games, especially beginners of Super Smash Bros. Ultimate. After each match, the player records their own character, the opponent's character, the result, and the reasons they lost. The app then shows which opponents they struggle with and suggests what to practice next based on their most frequent loss reasons. For beginners who do not know where to start, the 上達 (Improve) tab provides a step-by-step practice roadmap, a short beginner menu for each character, and a practice timer. Players earn experience points and levels from completed checklist items and practice minutes. The problem it solves: players often keep losing to the same opponents without knowing why or what to practice; this app turns their own match records into concrete practice steps. The user interface is in Japanese.

3. How to use the main features
No login, credentials, or sample files are needed. All data is stored locally on the device.
- Launch the app. The ホーム (Home) screen shows the guide character "むすびコーチ" (Musubi Coach, an original pixel-art character), the current level, and the next practice step.
- Open the 設定 (Settings) tab and select one or more characters you play under "マイキャラ設定" (My characters). Then choose the active character in the selector at the top of the screen.
- Open the 記録 (Record) tab and enter a match: date, your character, the opponent, win or loss, and loss reasons (optional short memo). Tap 記録する (Save).
- Return to ホーム (Home) to see this week's focus areas with practice drills, the opponents you struggle with, win rates, and a weekly win-rate graph.
- Open the 上達 (Improve) tab. Choose 10, 30, or 60 minutes under 今日の練習 (Today's practice), tap スタート (Start), and tap 今日完了として記録 (Record as done today) to log the minutes. Check items in 上達ロードマップ (Improvement roadmap, 4 stages) and in キャラ専用メニュー (Character menu) to earn XP; a short level-up message appears when the level increases. This tab also includes a glossary and practice tips.
- Open the 相性 (Matchups) tab to see the matchup table for your character, sorted from weakest, and tap an opponent to add a mark (good / even / bad) and a memo. The "一般的な相性の目安" (General matchup reference) card has a link button; tapping it opens the matchup page of a public statistics website in Safari.
- Settings also contains JSON export (via the iOS share sheet) and import, erase all data, an optional name for the birthday card, and "このアプリについて" (About this app), which shows the unofficial fan tool disclaimer and a link to the privacy policy.
- Birthday screen: the app was originally made as a birthday gift, so on October 15 (device date) it shows a one-time birthday card with Musubi Coach when the app is launched, until it is closed. To see it, set the device date to October 15 and relaunch the app. It appears on no other day.

4. External services
None. The app works fully offline and does not communicate with any server. It does not use any data providers, authentication services, payment processors, analytics, advertising, or AI services, and it does not collect or transmit any data. It is built with Capacitor (an open-source framework that runs the bundled HTML/JavaScript locally on the device). The font is bundled in the app. The only outbound actions are plain links (the matchup statistics website, the privacy policy on GitHub, and the public guide pages listed as references in the Improve tab), which open in Safari only when the user taps them.

5. Regional differences
None. The app functions identically in all regions. The user interface is in Japanese.

6. Regulated industry or protected third-party material
The app does not operate in a regulated industry. Regarding third-party material:
- Game character names are used as plain text only, to identify characters. The app contains no game images, logos, or sounds.
- The app is an unofficial fan tool and is not affiliated with, endorsed by, or sponsored by Nintendo or any other rights holder. This is stated in the App Store description and in Settings > "このアプリについて" (About this app).
- For general matchup references, the app only links to a public statistics website. The matchup data itself is not included in the app.
- The practice tips in the Improve tab are short texts written for this app in our own words; each character menu lists links to the public guide pages used as references.
- The heading font is DotGothic16, licensed under the SIL Open Font License 1.1 (the license file is bundled). All pixel art, including the guide character Musubi Coach, is original artwork created for this app.

Note: This submission uses build 1.0 (4). Compared with build 1.0 (3), it adds the 上達 (Improve) tab (practice roadmap, a beginner menu for each character, practice timer, and levels), the original pixel-art guide character Musubi Coach, and the birthday screen. Build 1.0 (4) has been tested on a physical iPhone 16 running the latest iOS.

Best regards,
Ryosei Imai
