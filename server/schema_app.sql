-- =============================================================================
-- LMS API Working Schema
-- Applied to the database that server/index.js connects to.
-- Uses new column names (fullname_thai, is_active, etc.) but keeps JSONB for
-- complex nested objects (courses, progress) to match the frontend data model.
--
-- Apply:
--   psql -U postgres -d lms_db -f server/schema_app.sql
-- =============================================================================

-- Drop in reverse dependency order so CASCADE handles FKs cleanly
DROP TABLE IF EXISTS enrollments      CASCADE;
DROP TABLE IF EXISTS certificates     CASCADE;
DROP TABLE IF EXISTS course_progress  CASCADE;
DROP TABLE IF EXISTS courses          CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id              SERIAL          PRIMARY KEY,
  fullname_thai   VARCHAR(150)    NOT NULL,
  fullname_eng    VARCHAR(150),
  email           VARCHAR(150)    NOT NULL UNIQUE,
  password        TEXT            NOT NULL,
  role            VARCHAR(50)     NOT NULL DEFAULT 'learner',
  department      VARCHAR(150)    NOT NULL DEFAULT '',
  employee_id     VARCHAR(50)     NOT NULL DEFAULT '',
  is_active       BOOLEAN         NOT NULL DEFAULT true,
  phone           VARCHAR(20),
  registrant_type INT             NOT NULL DEFAULT 1,
  position_text   VARCHAR(60),
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ     DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     DEFAULT NOW()
);

-- ── courses ───────────────────────────────────────────────────────────────────
CREATE TABLE courses (
  id              TEXT            PRIMARY KEY,
  title           VARCHAR(255)    NOT NULL,
  description     TEXT            NOT NULL DEFAULT '',
  image           TEXT            NOT NULL DEFAULT '',
  duration        VARCHAR(50)     NOT NULL DEFAULT '',
  category        VARCHAR(100)    NOT NULL DEFAULT '',
  status          VARCHAR(20)     NOT NULL DEFAULT 'draft',
  allowed_groups  JSONB           NOT NULL DEFAULT '[]',
  modules         JSONB           NOT NULL DEFAULT '[]',
  pre_test        JSONB,
  final_exam      JSONB,
  created_at      TIMESTAMPTZ     DEFAULT NOW()
);

-- ── course_progress ───────────────────────────────────────────────────────────
CREATE TABLE course_progress (
  course_id           TEXT        NOT NULL,
  user_id             TEXT        NOT NULL,
  enrolled_at         TIMESTAMPTZ DEFAULT NOW(),
  lesson_progress     JSONB       NOT NULL DEFAULT '[]',
  quiz_attempts       JSONB       NOT NULL DEFAULT '[]',
  pre_test_attempts   JSONB       NOT NULL DEFAULT '[]',
  final_exam_attempts JSONB       NOT NULL DEFAULT '[]',
  completed_at        TIMESTAMPTZ,
  PRIMARY KEY (course_id, user_id)
);

-- ── certificates ──────────────────────────────────────────────────────────────
CREATE TABLE certificates (
  id              TEXT            PRIMARY KEY,
  certificate_no  VARCHAR(100)    NOT NULL UNIQUE,
  user_id         TEXT            NOT NULL,
  user_name       VARCHAR(150)    NOT NULL,
  course_id       TEXT            NOT NULL,
  course_title    VARCHAR(255)    NOT NULL,
  category        VARCHAR(100)    NOT NULL DEFAULT '',
  issued_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  score           NUMERIC(5,2)    NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ
);

-- ── enrollments ───────────────────────────────────────────────────────────────
CREATE TABLE enrollments (
  id          TEXT            PRIMARY KEY,
  course_id   TEXT            NOT NULL,
  user_id     TEXT            NOT NULL,
  enrolled_by TEXT,
  enrolled_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, user_id)
);

-- ── indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_dept       ON users(department);
CREATE INDEX idx_cp_user          ON course_progress(user_id);
CREATE INDEX idx_cp_course        ON course_progress(course_id);
CREATE INDEX idx_certs_user       ON certificates(user_id);
CREATE INDEX idx_certs_course     ON certificates(course_id);
CREATE INDEX idx_enroll_user      ON enrollments(user_id);
CREATE INDEX idx_enroll_course    ON enrollments(course_id);

-- ── seed: super admin (password = admin1234) ──────────────────────────────────
INSERT INTO users (fullname_thai, fullname_eng, email, password, role, department, employee_id, is_active)
VALUES (
  'ระบบ Super Admin', 'System Super Admin',
  'admin@pklearning.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'super_admin', 'IT', 'SA001', true
) ON CONFLICT (email) DO NOTHING;
