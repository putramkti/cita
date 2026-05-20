-- Cita — Explainer chat messages (Cita Tutor feature)
-- Apply via Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gwplxqfmnreqabwxyfxq/sql/new

-- Table to store every chat message between user and Cita Tutor (AI).
-- Scoped per (attemptId, questionId) — each question gets its own thread.
CREATE TABLE IF NOT EXISTS "explainer_messages" (
  "id" TEXT PRIMARY KEY,
  "attemptId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "role" TEXT NOT NULL CHECK ("role" IN ('user', 'assistant')),
  "content" TEXT NOT NULL,
  "tokens" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS "explainer_messages_attempt_question_idx"
  ON "explainer_messages" ("attemptId", "questionId", "createdAt");

CREATE INDEX IF NOT EXISTS "explainer_messages_attempt_idx"
  ON "explainer_messages" ("attemptId");

-- Foreign keys (cascade delete when attempt or question is removed)
ALTER TABLE "explainer_messages"
  ADD CONSTRAINT "explainer_messages_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "attempts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "explainer_messages"
  ADD CONSTRAINT "explainer_messages_questionId_fkey"
  FOREIGN KEY ("questionId") REFERENCES "questions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: lock by default
ALTER TABLE "explainer_messages" ENABLE ROW LEVEL SECURITY;

-- Permissive policies (auth handled at app layer via cookie + attemptId ownership check)
DROP POLICY IF EXISTS "explainer_messages select" ON "explainer_messages";
CREATE POLICY "explainer_messages select" ON "explainer_messages"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "explainer_messages insert" ON "explainer_messages";
CREATE POLICY "explainer_messages insert" ON "explainer_messages"
  FOR INSERT WITH CHECK (true);

-- Verify
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'explainer_messages';
