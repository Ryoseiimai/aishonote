Hello App Review Team,

Thank you for your message. Please find the requested information below. The same information has also been added to the Notes field of the App Review Information section.

1. Screen recording
Attached (also added to the App Review Information attachments). Captured on a physical iPhone 16 running iOS 26.7, starting from launching the app from the Home Screen. The recording (about 78 seconds) shows:
- Launching "相性ノート" from the Home Screen. The ホーム (Home) screen appears with the guide character "むすびコーチ" (Musubi Coach), level Lv. 1, and the next practice step.
- 設定 (Settings): selecting マリオ (Mario) as "my character" under マイキャラ設定 (My characters).
- 記録 (Record): recording a match, マリオ (Mario) vs リンク (Link), result 勝ち (Win), and tapping 記録する (Save). The saved matches appear in the 対戦一覧 (Match list) below the form. The first tap was made before selecting the characters, so the standard iOS input check ("select an item in the list") appeared. The Save button was then tapped twice, so two identical entries are listed; this is not a duplicate-save bug. After saving, the app keeps the selected characters as defaults for the next entry, so each tap saves one match.
- 上達 (Improve): the recording goes directly from Record to Improve. The Musubi Coach card and level are also shown at the top of the Improve tab (the same card as on Home). The tab then shows 今日の練習 (Today's practice) with 10 / 30 / 60 minute options, the 上達ロードマップ (Improvement roadmap), the character menu for Mario with its reference links, the 用語辞典 (Glossary), and the list of reference sources.
- 相性 (Matchups): the "一般的な相性の目安" (General matchup reference) card with the button "マリオの相性表を開く（シラツキ理論）" (Open Mario's matchup table), and the matchup table for Mario. Tapping the button opens the public statistics website ssbu-shiratsuki-theory.net in the device's web browser.
- Stopping the recording from Control Center.
The app has no account registration or login, no user-generated content shared with other users, and no paid content or in-app purchases, so none of those flows exist in the app. No permission prompts (no tracking, location, camera, microphone, contacts, or notifications) are shown, and there is no account to delete.

2. Purpose and target audience
"相性ノート" (Matchup Note) is a free personal notebook app for players of competitive fighting games, especially beginners of Super Smash Bros. Ultimate. After each match, the player records their own character, the opponent's character, the result, and the reasons they lost. The app then shows which opponents they struggle with and suggests what to practice next based on their most frequent loss reasons. For beginners who do not know where to start, the 上達 (Improve) tab provides a step-by-step practice roadmap, a short beginner menu for each character, a practice timer, and a glossary. Players earn experience points and levels from completed checklist items and practice minutes. The problem it solves: players often keep losing to the same opponents without knowing why or what to practice; this app turns their own match records into concrete practice steps. The user interface is in Japanese.

3. How to use the main features
No login, credentials, or sample files are needed. All data is stored locally on the device.
- Launch the app. The ホーム (Home) screen shows the guide character "むすびコーチ" (Musubi Coach, an original pixel-art character), the current level, and the next practice step.
- Open the 設定 (Settings) tab and select one or more characters you play under "マイキャラ設定" (My characters). The active character is chosen in the selector at the top of the screen.
- Open the 記録 (Record) tab and enter a match: date, your character, the opponent, and win or loss. When you select 負け (Loss), a checklist of loss reasons (負けた理由, multiple choices allowed) appears. A short memo (一言メモ) is a separate, optional field. Tap 記録する (Save). The match appears in the 対戦一覧 (Match list).
- Return to ホーム (Home) to see the opponents you struggle with, win rates, and a weekly win-rate graph. The 今週の課題 (This week's focus) card with practice drills is built from the loss reasons of losses recorded in the last 30 days, so record at least one loss with a loss reason to see it. If only wins have been recorded (as in the screen recording), the card shows "直近30日の負けログがまだありません。" (No losses recorded in the last 30 days yet).
- Open the 上達 (Improve) tab. Choose 10, 30, or 60 minutes under 今日の練習 (Today's practice), tap スタート (Start), and tap 今日完了として記録 (Record as done today) to log the minutes. Check items in 上達ロードマップ (Improvement roadmap, 4 stages) and in the character menu to earn XP; a short level-up message appears when the level increases. This tab also includes a glossary, practice tips, and links to the reference sources.
- Open the 相性 (Matchups) tab to see the matchup table for your character, sorted from weakest, and tap an opponent to add a mark and a memo. The "一般的な相性の目安" (General matchup reference) card has a button that opens the matchup page of a public statistics website in the web browser.
- Settings also contains "このアプリについて" (About this app), which shows the unofficial fan tool disclaimer and a link to the privacy policy.
- Settings > データ (Data): the user can export their own data as a JSON file through the iOS share sheet (JSONエクスポート), import a JSON file they choose (JSONインポート), or delete all data (全データを消去). Nothing is sent automatically; export happens only when the user chooses it.
- Birthday screen: the app was originally made as a birthday gift, so it shows a birthday card with Musubi Coach. On October 15 (device date) it appears at every launch until the user closes it; after that it does not appear again that year. To see it, set the device date to October 15, force-quit the app, and launch it again. The name shown on the card can optionally be entered under "お祝いの名前" (Name for the celebration) in Settings.

4. External services
None. The app works fully offline and does not communicate with any server. It does not use any data providers, authentication services, payment processors, analytics, advertising, or AI services, and it does not collect or transmit any data. The user can export their own data as a JSON file from Settings > データ (Data) via the iOS share sheet; this happens only when the user chooses it, and nothing is sent automatically. It is built with Capacitor (an open-source framework that runs the bundled HTML/JavaScript locally on the device). The font is bundled in the app. The only outbound actions are plain links (the matchup statistics website, the privacy policy on GitHub, and the public guide pages listed as references in the Improve tab), which open in the device's web browser only when the user taps them.

5. Regional differences
None. The app functions identically in all regions. The user interface is in Japanese.

6. Regulated industry or protected third-party material
The app does not operate in a regulated industry. Regarding third-party material:
- The only third-party material used is text: game character names and the game title "大乱闘スマッシュブラザーズ SPECIAL" (Super Smash Bros. Ultimate), used as plain text only, for identification. The game title shown in the app header is plain text as well. The app does not bundle any licensed material, so there is no rights documentation to provide. The app contains no game images, logos, or sounds.
- The character images shown at the end of the screen recording belong to the external website (ssbu-shiratsuki-theory.net) opened in the web browser; they are not included in the app.
- The app is an unofficial fan tool and is not affiliated with, endorsed by, or sponsored by Nintendo or any other rights holder. This is stated in the App Store description and in Settings > "このアプリについて" (About this app).
- For general matchup references, the app only links to a public statistics website. The matchup data itself is not included in the app.
- The practice tips in the Improve tab are short texts written for this app in our own words; each character menu lists links to the public guide pages used as references.
- The heading font is DotGothic16, licensed under the SIL Open Font License 1.1 (the license file is bundled). All pixel art, including the guide character Musubi Coach, is original artwork created for this app.

Note: This resubmission uses build 1.0 (4). Compared with build 1.0 (3), it adds the 上達 (Improve) tab (practice roadmap, a beginner menu for each character, practice timer, glossary, and levels), the original pixel-art guide character Musubi Coach, and the birthday screen. Build 1.0 (4) has been tested on a physical iPhone 16 (iOS 26.7).

Best regards,
Ryosei Imai
