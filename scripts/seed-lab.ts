/* eslint-disable no-console */
/**
 * Seed cita-lab DB from JSON files in src/data/lab/*.json.
 *
 * Idempotent: uses upsert by id. Re-run anytime to refresh content
 * after re-running content-to-json.ts.
 *
 * Run: pnpm tsx scripts/seed-lab.ts
 *      or: ./scripts/lab-prisma.sh tsx scripts/seed-lab.ts (no, this is just node)
 *
 * Reads .env.local for DATABASE_URL — must point to cita-lab project,
 * NOT prod. Aborts if URL doesn't contain `pprhhjosjemsebxcmjkq`.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { PrismaClient, type Category } from "@prisma/client";

type LabQuestion = {
  id: string;
  category: "TWK" | "TIU" | "TKP";
  subcategory: string;
  topic: string;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  optionWeights: Record<string, number> | null;
  difficulty: number;
  tags: string[];
  familyId: string | null;
  enemyGroupId: string | null;
  imagePrompt: string | null;
  explanation: string;
  explanationLong: string;
  source: string;
};

type LabBatch = {
  batch_id: string;
  topic: string;
  questions: LabQuestion[];
};

async function loadEnv() {
  const raw = await fs.readFile(".env.local", "utf-8");
  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function main() {
  const env = await loadEnv();
  if (!env.DATABASE_URL?.includes("pprhhjosjemsebxcmjkq")) {
    throw new Error(
      "❌ DATABASE_URL doesn't point to cita-lab — abort. Refusing to seed.",
    );
  }
  process.env.DATABASE_URL = env.DATABASE_URL;
  process.env.DIRECT_URL = env.DIRECT_URL;

  const prisma = new PrismaClient();

  const dataDir = path.join(process.cwd(), "src/data/lab");
  const files = (await fs.readdir(dataDir))
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(`Found ${files.length} batch files in ${dataDir}`);

  const allBatches: LabBatch[] = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(dataDir, f), "utf-8");
    allBatches.push(JSON.parse(raw) as LabBatch);
  }

  // Step 1: Collect unique families & enemy groups across all batches
  const families = new Map<string, { category: Category; topic: string }>();
  const enemyGroups = new Map<string, { category: Category; topic: string }>();

  for (const batch of allBatches) {
    for (const q of batch.questions) {
      if (q.familyId && !families.has(q.familyId)) {
        families.set(q.familyId, {
          category: q.category as Category,
          topic: `${q.subcategory} / ${q.topic}`,
        });
      }
      if (q.enemyGroupId && !enemyGroups.has(q.enemyGroupId)) {
        enemyGroups.set(q.enemyGroupId, {
          category: q.category as Category,
          topic: `${q.subcategory} / ${q.topic}`,
        });
      }
    }
  }

  console.log(
    `Upserting ${families.size} families, ${enemyGroups.size} enemy groups...`,
  );

  // Step 2: Upsert families
  for (const [id, data] of families) {
    await prisma.itemFamily.upsert({
      where: { id },
      create: { id, ...data },
      update: { ...data },
    });
  }

  // Step 3: Upsert enemy groups
  for (const [id, data] of enemyGroups) {
    await prisma.enemyGroup.upsert({
      where: { id },
      create: { id, ...data },
      update: { ...data },
    });
  }

  // Step 4: Upsert questions (batch by batch for sane logs)
  let totalSoal = 0;
  for (const batch of allBatches) {
    let count = 0;
    for (const q of batch.questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          category: q.category as Category,
          subcategory: q.subcategory,
          topic: q.topic,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer || null,
          optionWeights: q.optionWeights ?? undefined,
          difficulty: q.difficulty,
          tags: q.tags,
          imagePrompt: q.imagePrompt,
          explanation: q.explanation,
          explanationLong: q.explanationLong,
          source: q.source || "cita-original",
          status: "REVIEWED",
          familyId: q.familyId,
          enemyGroupId: q.enemyGroupId,
        },
        update: {
          category: q.category as Category,
          subcategory: q.subcategory,
          topic: q.topic,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer || null,
          optionWeights: q.optionWeights ?? undefined,
          difficulty: q.difficulty,
          tags: q.tags,
          imagePrompt: q.imagePrompt,
          explanation: q.explanation,
          explanationLong: q.explanationLong,
          familyId: q.familyId,
          enemyGroupId: q.enemyGroupId,
        },
      });
      count++;
    }
    totalSoal += count;
    console.log(`  ${batch.batch_id} → ${count} soal`);
  }

  // Step 5: Verify counts
  const dbQuestions = await prisma.question.count();
  const dbFamilies = await prisma.itemFamily.count();
  const dbEnemy = await prisma.enemyGroup.count();
  const byCategory = await prisma.question.groupBy({
    by: ["category"],
    _count: true,
  });

  console.log("\n=== Seed complete ===");
  console.log(`  questions: ${dbQuestions}`);
  console.log(`  item_families: ${dbFamilies}`);
  console.log(`  enemy_groups: ${dbEnemy}`);
  console.log(
    `  by category: ${byCategory
      .map((b) => `${b.category}=${b._count}`)
      .join(", ")}`,
  );
  console.log(`  rows seeded this run: ${totalSoal}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
