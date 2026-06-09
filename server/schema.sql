-- LMS Database Schema
-- Run once: psql -U postgres -c "CREATE DATABASE lms_db;"
-- Then:     psql -U postgres -d lms_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY DEFAULT 'u_' || gen_random_uuid(),
  name         TEXT        NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT        NOT NULL,  -- bcrypt hash
  role         TEXT        NOT NULL DEFAULT 'learner'
                 CHECK (role IN ('super_admin','training_admin','manager','learner')),
  "group"      TEXT        NOT NULL DEFAULT '',
  employee_id  TEXT        NOT NULL DEFAULT '',
  active       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Courses ────────────────────────────────────────────────────────────────
-- modules, allowedGroups, preTest, finalExam stored as JSONB
-- because they are deeply nested and queried as a unit, not individually
CREATE TABLE IF NOT EXISTS courses (
  id             TEXT PRIMARY KEY DEFAULT 'c_' || gen_random_uuid(),
  title          TEXT        NOT NULL,
  description    TEXT        NOT NULL DEFAULT '',
  image          TEXT        NOT NULL DEFAULT '',
  duration       TEXT        NOT NULL DEFAULT '',
  category       TEXT        NOT NULL DEFAULT '',
  status         TEXT        NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','published','archived')),
  allowed_groups JSONB       NOT NULL DEFAULT '[]',
  modules        JSONB       NOT NULL DEFAULT '[]',
  pre_test       JSONB,
  final_exam     JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Course Progress ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_progress (
  course_id           TEXT        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id             TEXT        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lesson_progress     JSONB       NOT NULL DEFAULT '[]',
  quiz_attempts       JSONB       NOT NULL DEFAULT '[]',
  pre_test_attempts   JSONB       NOT NULL DEFAULT '[]',
  final_exam_attempts JSONB       NOT NULL DEFAULT '[]',
  completed_at        TIMESTAMPTZ,
  PRIMARY KEY (course_id, user_id)
);

-- ── Certificates ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id              TEXT        PRIMARY KEY DEFAULT 'cert_' || gen_random_uuid(),
  certificate_no  TEXT UNIQUE NOT NULL,
  user_id         TEXT        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  user_name       TEXT        NOT NULL,
  course_id       TEXT        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_title    TEXT        NOT NULL,
  category        TEXT        NOT NULL DEFAULT '',
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score           NUMERIC     NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ NOT NULL
);

-- ── Manual Enrollments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id          TEXT        PRIMARY KEY DEFAULT 'enroll_' || gen_random_uuid(),
  course_id   TEXT        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id     TEXT        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  enrolled_by TEXT        NOT NULL REFERENCES users(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, user_id)
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_status    ON courses(status);
CREATE INDEX IF NOT EXISTS idx_progress_user     ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_certs_user        ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certs_course      ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user  ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- ── Seed: default super_admin ──────────────────────────────────────────────
-- password = "admin1234"  (bcrypt hash generated with saltRounds=10)
INSERT INTO users (id, name, email, password, role, "group", employee_id, active)
VALUES (
  'user_admin_001',
  'Admin หลัก',
  'admin@pklearning.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'super_admin',
  'Management',
  'EMP-001',
  true
)
ON CONFLICT (id) DO NOTHING;