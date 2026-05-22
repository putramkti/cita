/**
 * Cita — Markdown → JSON Converter
 *
 * Parse batch markdown files (docs/content/drafts/*.md) menjadi JSON
 * intermediate format yang siap di-import ke DB.
 *
 * Spec: lihat docs/content/SCHEMA-OUTPUT.md
 *
 * Usage:
 *   node --experimental-strip-types scripts/content-to-json.ts <file_or_dir> [--out <dir>]
 *
 * Examples:
 *   node --experimental-strip-types scripts/content-to-json.ts docs/content/drafts/batch-001-twk-pancasila.md
 *   node --experimental-strip-types scripts/content-to-json.ts docs/content/drafts/ --out /tmp/cita-build/
 *
 * Status: Phase 2 prep. NO DB writes. Output JSON saja.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, basename, dirname, resolve } from "node:path";

// ============================================================================
// TYPES
// ============================================================================

type Category = "TWK" | "TIU" | "TKP";

interface Option {
  label: "A" | "B" | "C" | "D" | "E";
  text: string;
}

interface Question {
  id: string;
  category: Category;
  subcategory: string;
  topic: string;
  questionText: string;
  options: Option[];
  correctAnswer: string | null;
  optionWeights: Record<string, number> | null;
  difficulty: number;
  tags: string[];
  familyId: string | null;
  enemyGroupId: string | null;
  imagePrompt: string | null;
  explanation: string | null;
  explanationLong: string | null;
  source: string;
  // soft validation flags
  warnings: string[];
}

interface BatchOutput {
  batch_id: string;
  topic: string;
  source_file: string;
  generated_at: string;
  stats: {
    total_soal: number;
    by_difficulty: Record<string, number>;
    warnings_total: number;
  };
  questions: Question[];
}

// ============================================================================
// PARSING HELPERS
// ============================================================================

const DIFFICULTY_MAP: Record<string, number> = {
  "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5,
};

function parseDifficulty(line: string): number {
  for (const [glyph, n] of Object.entries(DIFFICULTY_MAP)) {
    if (line.includes(glyph)) return n;
  }
  // Fallback: parse "Difficulty: 3 medium" plain digit
  const m = line.match(/Difficulty:\s*\**\s*(\d)/);
  if (m) return parseInt(m[1]!, 10);
  return 2; // default medium
}

function parseCategoryLine(line: string): { category: Category; subcategory: string; topic: string } {
  // **Kategori:** TWK / Pancasila / Sila ke-1
  const m = line.match(/Kategori:\**\s*(.+?)$/i);
  if (!m) return { category: "TWK", subcategory: "", topic: "" };
  const parts = m[1]!.split(/\s*\/\s*/).map((s) => s.trim());
  const category = (parts[0] ?? "TWK").toUpperCase() as Category;
  return {
    category: ["TWK", "TIU", "TKP"].includes(category) ? category : "TWK",
    subcategory: parts[1] ?? "",
    topic: parts.slice(2).join(" / ") ?? "",
  };
}

function parseTags(line: string): string[] {
  // **Tag:** `twk`, `pancasila`, `sila-1`
  const m = line.match(/Tag:\**\s*(.+?)$/i);
  if (!m) return [];
  return m[1]!
    .split(/\s*,\s*/)
    .map((t) => t.replace(/[`*]/g, "").trim())
    .filter(Boolean);
}

function parseField(line: string, fieldName: string): string | null {
  const re = new RegExp(`${fieldName}:\\**\\s*(.+?)$`, "i");
  const m = line.match(re);
  if (!m) return null;
  const value = m[1]!.replace(/[*]/g, "").trim();
  if (value === "-" || value === "—" || value === "") return null;
  return value;
}

interface OptionParse {
  options: Option[];
  correctAnswer: string | null;
  optionWeights: Record<string, number> | null;
  warnings: string[];
}

function parseOptions(optionsBlock: string): OptionParse {
  const lines = optionsBlock.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("-"));
  const options: Option[] = [];
  let correctAnswer: string | null = null;
  const optionWeights: Record<string, number> = {};
  const warnings: string[] = [];

  for (const raw of lines) {
    // Format: "- A. text ✅" atau "- A. **text** ✅ *(skor 5)*"
    const m = raw.match(/^-\s*\**([A-E])[.):]\s*(.+)$/);
    if (!m) continue;
    const label = m[1] as Option["label"];
    let text = m[2]!.trim();

    // Detect correct marker (TWK/TIU)
    const isCorrect = /✅/.test(text);
    if (isCorrect) correctAnswer = label;

    // Detect score weight (TKP)
    const scoreMatch = text.match(/\*\(skor\s*(\d)\)\*/i);
    if (scoreMatch) {
      optionWeights[label] = parseInt(scoreMatch[1]!, 10);
    }

    // Clean text: remove markdown bold, ✅, score annotation
    text = text
      .replace(/\*\(skor\s*\d\)\*/gi, "")
      .replace(/✅/g, "")
      .replace(/^\*\*|\*\*$/g, "")
      .replace(/\*\*/g, "")
      .trim();

    options.push({ label, text });
  }

  // Validation
  if (options.length !== 5) {
    warnings.push(`expected 5 options, got ${options.length}`);
  }
  const labels = options.map((o) => o.label).sort().join("");
  if (labels !== "ABCDE") {
    warnings.push(`option labels not A-E: got ${labels}`);
  }

  // Check for duplicate option text
  const seen = new Map<string, string>();
  for (const opt of options) {
    const norm = opt.text.toLowerCase().trim();
    if (seen.has(norm)) {
      warnings.push(`duplicate option text: ${seen.get(norm)} and ${opt.label} both say "${opt.text}"`);
    }
    seen.set(norm, opt.label);
  }

  const hasWeights = Object.keys(optionWeights).length > 0;
  if (hasWeights) {
    // TKP — validate weights
    if (Object.keys(optionWeights).length !== 5) {
      warnings.push(`TKP expects 5 weighted options, got ${Object.keys(optionWeights).length}`);
    }
    const weights = Object.values(optionWeights);
    // Range check: every weight must be 1..5
    for (const w of weights) {
      if (w < 1 || w > 5) {
        warnings.push(`TKP weight out of range 1-5: got ${w}`);
      }
    }
    // Strictness check: SKD CPNS standard expects 1,2,3,4,5 unique (sum=15)
    // We emit as INFO (not warning) because Cita allows looser distribution at draft stage.
    const uniqueWeights = new Set(weights);
    const sum = weights.reduce((a, b) => a + b, 0);
    const isStrictSKD = uniqueWeights.size === 5 && sum === 15;
    if (!isStrictSKD) {
      // Note for review — not a blocker
      warnings.push(`[INFO] TKP non-strict-SKD distribution: ${weights.join(",")} (sum=${sum}). Consider rebalancing to 1-5 unique for production.`);
    }
    return { options, correctAnswer: null, optionWeights, warnings };
  } else {
    if (!correctAnswer) {
      warnings.push(`TWK/TIU expects a ✅ marker, none found`);
    }
    return { options, correctAnswer, optionWeights: null, warnings };
  }
}

function extractBlock(soalText: string, startMarker: string, endMarker?: string): string | null {
  const start = soalText.indexOf(startMarker);
  if (start === -1) return null;
  const contentStart = start + startMarker.length;
  const end = endMarker ? soalText.indexOf(endMarker, contentStart) : -1;
  const block = end === -1 ? soalText.slice(contentStart) : soalText.slice(contentStart, end);
  return block.trim();
}

function extractImagePrompt(soalText: string): string | null {
  // ```image_prompt
  // ...
  // ```
  const m = soalText.match(/```image_prompt\n([\s\S]+?)\n```/);
  return m ? m[1]!.trim() : null;
}

function buildId(args: {
  enemyGroupId: string | null;
  familyId: string | null;
  category: Category;
  subcategory: string;
  batchId: string;
  soalNum: number;
  totalInBatch: number;
}): string {
  const { enemyGroupId, category, subcategory, batchId, soalNum } = args;
  // Pakai enemy group kalau ada (most specific)
  if (enemyGroupId) {
    // enemy_group sudah human-readable, tinggal append seq
    return `${enemyGroupId}_${String(soalNum).padStart(3, "0")}`;
  }
  // Fallback: <CATEGORY>_<SUBCATEGORY>_<BATCH>_<SOAL>
  const subClean = subcategory.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "");
  const batchNum = batchId.replace(/\D/g, "").padStart(3, "0");
  return `${category}_${subClean}_${batchNum}_${String(soalNum).padStart(3, "0")}`;
}

// ============================================================================
// MAIN PARSER
// ============================================================================

function parseSoal(soalText: string, soalNum: number, ctx: { batchId: string }): Question {
  const warnings: string[] = [];
  const lines = soalText.split("\n");

  // Parse metadata header (the lines after "## Soal N")
  let category: Category = "TWK";
  let subcategory = "";
  let topic = "";
  let difficulty = 2;
  let tags: string[] = [];
  let familyId: string | null = null;
  let enemyGroupId: string | null = null;

  for (const line of lines) {
    if (/Kategori:/i.test(line)) {
      ({ category, subcategory, topic } = parseCategoryLine(line));
    } else if (/Difficulty:/i.test(line)) {
      difficulty = parseDifficulty(line);
    } else if (/^[*\-\s]*\*?\*?Tag:/i.test(line)) {
      tags = parseTags(line);
    } else if (/^[*\-\s]*\*?\*?Family:/i.test(line)) {
      familyId = parseField(line, "Family");
    } else if (/^[*\-\s]*\*?\*?Enemy group/i.test(line)) {
      enemyGroupId = parseField(line, "Enemy group candidate");
    }
  }

  // Question text — between "### Stem" and "### Opsi"
  const questionText = (extractBlock(soalText, "### Stem", "### Opsi") ?? "").trim();

  // Options block
  const optionsBlock = extractBlock(soalText, "### Opsi", "### Penjelasan") ?? "";
  const optionParse = parseOptions(optionsBlock);
  warnings.push(...optionParse.warnings);

  // Explanations
  const explanation = extractBlock(soalText, "### Penjelasan singkat", "### Penjelasan panjang");
  const explanationLong = extractBlock(soalText, "### Penjelasan panjang", "### Sumber");
  const source = extractBlock(soalText, "### Sumber", "### Reviewer note") ?? "";

  // Image prompt (TIU Figural only)
  const imagePrompt = extractImagePrompt(soalText);

  const id = buildId({
    enemyGroupId,
    familyId,
    category,
    subcategory,
    batchId: ctx.batchId,
    soalNum,
    totalInBatch: 0,
  });

  if (!questionText) warnings.push("empty stem");
  if (!explanation && !explanationLong) warnings.push("no explanation found");

  return {
    id,
    category,
    subcategory,
    topic,
    questionText,
    options: optionParse.options,
    correctAnswer: optionParse.correctAnswer,
    optionWeights: optionParse.optionWeights,
    difficulty,
    tags,
    familyId,
    enemyGroupId,
    imagePrompt,
    explanation,
    explanationLong,
    source,
    warnings,
  };
}

function parseBatch(filePath: string): BatchOutput {
  const content = readFileSync(filePath, "utf-8");
  const fileName = basename(filePath, ".md");
  // Extract batch_id like "batch-001"
  const batchMatch = fileName.match(/^(batch-\d+)/);
  const batchId = batchMatch ? batchMatch[1]! : fileName;

  // Extract H1 topic
  const h1 = content.match(/^#\s+(.+?)$/m);
  const topic = h1 ? h1[1]!.replace(/\(.+?\)/g, "").trim() : fileName;

  // Split per soal — "## Soal N" headers
  const soalRegex = /^##\s+Soal\s+(\d+)\s*$/gm;
  const soalSplits: { num: number; start: number; end: number }[] = [];
  const matches = Array.from(content.matchAll(soalRegex));

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const num = parseInt(m[1]!, 10);
    const start = m.index!;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : content.length;
    soalSplits.push({ num, start, end });
  }

  const questions: Question[] = soalSplits.map((s) =>
    parseSoal(content.slice(s.start, s.end), s.num, { batchId })
  );

  // Stats
  const byDiff: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const q of questions) {
    const k = String(q.difficulty);
    byDiff[k] = (byDiff[k] ?? 0) + 1;
  }
  const warningsTotal = questions.reduce((a, q) => a + q.warnings.length, 0);

  return {
    batch_id: batchId,
    topic,
    source_file: filePath,
    generated_at: new Date().toISOString(),
    stats: {
      total_soal: questions.length,
      by_difficulty: byDiff,
      warnings_total: warningsTotal,
    },
    questions,
  };
}

// ============================================================================
// CLI
// ============================================================================

function findBatchFiles(input: string): string[] {
  const stat = statSync(input);
  if (stat.isFile()) return [input];
  if (stat.isDirectory()) {
    return readdirSync(input)
      .filter((f) => f.startsWith("batch-") && f.endsWith(".md"))
      .map((f) => join(input, f))
      .sort();
  }
  return [];
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: content-to-json.ts <file_or_dir> [--out <dir>]");
    process.exit(1);
  }
  const input = args[0]!;
  const outIdx = args.indexOf("--out");
  const outDir = outIdx !== -1 ? args[outIdx + 1] : null;

  const files = findBatchFiles(input);
  if (files.length === 0) {
    console.error(`No batch files found at: ${input}`);
    process.exit(1);
  }

  const allBatches: BatchOutput[] = [];
  let totalWarnings = 0;

  for (const file of files) {
    const batch = parseBatch(file);
    totalWarnings += batch.stats.warnings_total;
    allBatches.push(batch);

    if (outDir) {
      mkdirSync(resolve(outDir), { recursive: true });
      const outPath = join(resolve(outDir), `${batch.batch_id}.json`);
      writeFileSync(outPath, JSON.stringify(batch, null, 2));
      console.log(`✓ ${batch.batch_id}: ${batch.stats.total_soal} soal → ${outPath} (${batch.stats.warnings_total} warnings)`);
    } else {
      console.log(JSON.stringify(batch, null, 2));
    }
  }

  // Summary
  if (outDir || files.length > 1) {
    const total = allBatches.reduce((a, b) => a + b.stats.total_soal, 0);
    console.error(`\n=== SUMMARY ===`);
    console.error(`Files processed: ${allBatches.length}`);
    console.error(`Total soal: ${total}`);
    console.error(`Total warnings: ${totalWarnings}`);
    if (totalWarnings > 0) {
      console.error(`\nWarnings detail:`);
      for (const batch of allBatches) {
        for (const q of batch.questions) {
          if (q.warnings.length > 0) {
            console.error(`  ${batch.batch_id} > ${q.id}: ${q.warnings.join("; ")}`);
          }
        }
      }
    }
  }
}

main();
