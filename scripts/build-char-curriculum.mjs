import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SSBU_FIGHTERS } from "../js/presets/ssbu.js";
import { SSBU_CURRICULUM } from "../js/presets/ssbu-curriculum.js";

const root = new URL("../", import.meta.url);
const output = new URL("js/presets/ssbu-char-curriculum.js", root);

/** 調査済みの文面・順序を保持して結合し、共有progressで衝突しないことを検証する。 */
export function mergeCharCurriculum(batches) {
  const merged = Object.create(null);
  const ids = new Set(SSBU_CURRICULUM.roadmap.flatMap((stage) => stage.items.map((item) => item.id)));
  for (const batch of batches) {
    for (const [fighter, menu] of Object.entries(batch)) {
      if (Object.hasOwn(merged, fighter)) throw new Error(`キャラが重複: ${fighter}`);
      if (!Array.isArray(menu.items) || menu.items.length === 0) {
        throw new Error(`itemsが空または不正: ${fighter}`);
      }
      for (const item of menu.items) {
        for (const key of ["id", "title", "desc", "check"]) {
          if (typeof item[key] !== "string" || !item[key].trim()) {
            throw new Error(`項目の${key}が不正: ${fighter}`);
          }
        }
        if (item.id.length > 100) throw new Error(`progressのid長上限を超過: ${item.id}`);
        if (ids.has(item.id)) throw new Error(`idが重複: ${item.id}`);
        ids.add(item.id);
      }
      if (!Array.isArray(menu.sources) || menu.sources.length === 0) {
        throw new Error(`sourcesが空または不正: ${fighter}`);
      }
      for (const source of menu.sources) {
        if (typeof source.title !== "string" || !source.title.trim()) {
          throw new Error(`出典titleが不正: ${fighter}`);
        }
        if (typeof source.url !== "string" || !source.url.startsWith("https://") ||
            new URL(source.url).protocol !== "https:") {
          throw new Error(`出典URLはhttpsのみ: ${fighter}`);
        }
      }
      merged[fighter] = menu;
    }
  }
  const missing = SSBU_FIGHTERS.filter((fighter) => !Object.hasOwn(merged, fighter));
  const extra = Object.keys(merged).filter((fighter) => !SSBU_FIGHTERS.includes(fighter));
  if (missing.length || extra.length) {
    throw new Error(`SSBU_FIGHTERSと不一致: 不足=[${missing.join(", ")}] 余分=[${extra.join(", ")}]`);
  }
  return Object.fromEntries(SSBU_FIGHTERS.map((fighter) => [fighter, merged[fighter]]));
}

export function renderCharCurriculumModule(curriculum) {
  return "// 自動生成: node scripts/build-char-curriculum.mjs\n" +
    "// 正本: docs/char-curriculum/batch-1.json 〜 batch-6.json。直接編集しない。\n" +
    `export const SSBU_CHAR_CURRICULUM = ${JSON.stringify(curriculum, null, 2)};\n`;
}

async function main() {
  const batches = await Promise.all(Array.from({ length: 6 }, async (_, i) =>
    JSON.parse(await readFile(new URL(`docs/char-curriculum/batch-${i + 1}.json`, root), "utf8"))
  ));
  const curriculum = mergeCharCurriculum(batches);
  await writeFile(output, renderCharCurriculumModule(curriculum));
  const count = Object.values(curriculum).reduce((total, menu) => total + menu.items.length, 0);
  console.log(`生成: ${fileURLToPath(output)} (${Object.keys(curriculum).length}キャラ / ${count}項目)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
