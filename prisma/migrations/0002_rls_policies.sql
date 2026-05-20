-- Cita — RLS Policies for runtime app (anon + authenticated users)
-- Apply via Supabase SQL Editor: https://supabase.com/dashboard/project/gwplxqfmnreqabwxyfxq/sql/new

-- 1. Public read on questions (any visitor can fetch tryout questions)
DROP POLICY IF EXISTS "public read questions" ON questions;
CREATE POLICY "public read questions" ON questions FOR SELECT USING (true);

-- 2. Users — permissive for MVP (we manage userId in app layer)
DROP POLICY IF EXISTS "users select" ON users;
CREATE POLICY "users select" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "users insert" ON users;
CREATE POLICY "users insert" ON users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "users update" ON users;
CREATE POLICY "users update" ON users FOR UPDATE USING (true);

-- 3. Attempts — permissive: anonymous tryout flow allowed
DROP POLICY IF EXISTS "attempts select" ON attempts;
CREATE POLICY "attempts select" ON attempts FOR SELECT USING (true);
DROP POLICY IF EXISTS "attempts insert" ON attempts;
CREATE POLICY "attempts insert" ON attempts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "attempts update" ON attempts;
CREATE POLICY "attempts update" ON attempts FOR UPDATE USING (true);

-- 4. Attempt items — same permissive policy
DROP POLICY IF EXISTS "attempt_items select" ON attempt_items;
CREATE POLICY "attempt_items select" ON attempt_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "attempt_items insert" ON attempt_items;
CREATE POLICY "attempt_items insert" ON attempt_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "attempt_items update" ON attempt_items;
CREATE POLICY "attempt_items update" ON attempt_items FOR UPDATE USING (true);

-- Verify
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
