-- 006_grant_trial_existing_users.sql
-- Grants a 3-day free trial to existing users who have plan = 'none'
-- and never had a trial assigned. This is a one-time migration to fix
-- users who signed up before the automatic trial grant was implemented
-- in auth.config.ts (JWT callback on new user creation).
--
-- Run this in Supabase SQL Editor after confirming the migration.
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this SQL
--   3. Click "Run"
--
-- To preview affected users first, run:
--   SELECT id, email, plan, trial_ends_at, created_at
--   FROM users
--   WHERE plan = 'none' AND trial_ends_at IS NULL;

UPDATE users
SET
  plan = 'starter',
  trial_ends_at = NOW() + INTERVAL '3 days'
WHERE
  plan = 'none'
  AND trial_ends_at IS NULL;
