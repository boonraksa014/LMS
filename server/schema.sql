-- =============================================================================
-- LMS Database Schema v3
-- =============================================================================
-- Setup:
--   psql -U postgres -c "CREATE DATABASE lms_db;"
--   psql -U postgres -d lms_db -f schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- MASTER TABLES
-- =============================================================================

-- ── divisions (ฝ่าย) ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS divisions (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(60)   NOT NULL UNIQUE,
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── departments (แผนก) ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id               SERIAL        PRIMARY KEY,
  division_id      INT           NOT NULL REFERENCES divisions(id),
  name             VARCHAR(60)   NOT NULL,
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── shops (ร้านค้า / บุคคลภายนอก) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(150)  NOT NULL UNIQUE,
  contact_person   VARCHAR(150),
  phone            VARCHAR(20),
  address          TEXT,
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── positions (ตำแหน่ง) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS positions (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(100)  NOT NULL UNIQUE,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── categories (หมวดหมู่คอร์ส) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(60)   NOT NULL UNIQUE,
  description      TEXT,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── roles (บทบาท) ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(60)   NOT NULL UNIQUE,
  is_system        BOOLEAN       NOT NULL DEFAULT false,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── menus (เมนูระบบ) ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menus (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(100)  NOT NULL,
  code             VARCHAR(60)   NOT NULL UNIQUE,
  url              VARCHAR(255),
  icon             VARCHAR(100),
  tier             INT           NOT NULL DEFAULT 1,
  sort             INT           NOT NULL DEFAULT 0,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── role_menu_permissions (สิทธิ์ role × menu) ────────────────────────────────
CREATE TABLE IF NOT EXISTS role_menu_permissions (
  id               SERIAL        PRIMARY KEY,
  role_id          INT           NOT NULL REFERENCES roles(id),
  menu_id          INT           NOT NULL REFERENCES menus(id),
  can_view         BOOLEAN       NOT NULL DEFAULT false,
  can_create       BOOLEAN       NOT NULL DEFAULT false,
  can_edit         BOOLEAN       NOT NULL DEFAULT false,
  can_delete       BOOLEAN       NOT NULL DEFAULT false,
  can_export       BOOLEAN       NOT NULL DEFAULT false,
  can_import       BOOLEAN       NOT NULL DEFAULT false,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (role_id, menu_id)
);

-- =============================================================================
-- USERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id               SERIAL        PRIMARY KEY,
  department_id    INT           NOT NULL REFERENCES departments(id),
  role_id          INT           NOT NULL REFERENCES roles(id),
  position_id      INT           REFERENCES positions(id),
  fullname_thai    VARCHAR(150)  NOT NULL,
  fullname_eng     VARCHAR(150),
  email            VARCHAR(150)  NOT NULL UNIQUE,
  password         TEXT          NOT NULL,
  employee_id      VARCHAR(50),
  position_text    VARCHAR(60),                                                             -- ตำแหน่งสำหรับบุคคลภายนอก
  registrant_type  INT           NOT NULL DEFAULT 1 CHECK (registrant_type IN (1, 2, 3)), -- 1=พนักงานบริษัท, 2=บุคคลภายนอก, 3=ผู้ตรวจสอบ
  shop_id          INT           REFERENCES shops(id),
  phone            VARCHAR(20),
  avatar_url       TEXT,
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- =============================================================================
-- COURSES
-- =============================================================================

-- ── quizzes สร้างก่อน courses เพราะ courses อ้างอิง pre_test_id / final_exam_id ──
CREATE TABLE IF NOT EXISTS quizzes (
  id               SERIAL        PRIMARY KEY,
  title            VARCHAR(255)  NOT NULL,
  passing_score    INT           NOT NULL DEFAULT 70,
  max_attempts     INT           NOT NULL DEFAULT 3,
  question_count   INT,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── courses ────────────────────────────────────────────────────────────────────
-- status_type: 1=draft, 2=published, 3=archived
CREATE TABLE IF NOT EXISTS courses (
  id               SERIAL        PRIMARY KEY,
  category_id      INT           NOT NULL REFERENCES categories(id),
  pre_test_id      INT           REFERENCES quizzes(id),
  final_exam_id    INT           REFERENCES quizzes(id),
  title            VARCHAR(255)  NOT NULL,
  description      TEXT,
  image            TEXT,
  duration         VARCHAR(50),
  status_type      INT           NOT NULL DEFAULT 1
                     CHECK (status_type IN (1, 2, 3)),
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── course_allowed_divisions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_allowed_divisions (
  id               SERIAL        PRIMARY KEY,
  course_id        INT           NOT NULL REFERENCES courses(id),
  division_id      INT           NOT NULL REFERENCES divisions(id),
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (course_id, division_id)
);

-- ── course_allowed_departments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_allowed_departments (
  id               SERIAL        PRIMARY KEY,
  course_id        INT           NOT NULL REFERENCES courses(id),
  department_id    INT           NOT NULL REFERENCES departments(id),
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (course_id, department_id)
);

-- ── modules ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id               SERIAL        PRIMARY KEY,
  course_id        INT           NOT NULL REFERENCES courses(id),
  title            VARCHAR(255)  NOT NULL,
  description      TEXT,
  sort             INT           NOT NULL DEFAULT 0,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── lessons ────────────────────────────────────────────────────────────────────
-- type: 1=text, 2=video, 3=pdf, 4=link
CREATE TABLE IF NOT EXISTS lessons (
  id               SERIAL        PRIMARY KEY,
  module_id        INT           NOT NULL REFERENCES modules(id),
  quiz_id          INT           REFERENCES quizzes(id),
  title            VARCHAR(255)  NOT NULL,
  type             INT           NOT NULL
                     CHECK (type IN (1, 2, 3, 4)),
  duration         VARCHAR(50),
  content          TEXT,
  video_url        TEXT,
  external_url     TEXT,
  sort             INT           NOT NULL DEFAULT 0,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── questions ──────────────────────────────────────────────────────────────────
-- type: 1=multiple_choice, 2=true_false, 3=short_answer
CREATE TABLE IF NOT EXISTS questions (
  id               SERIAL        PRIMARY KEY,
  quiz_id          INT           NOT NULL REFERENCES quizzes(id),
  type             INT           NOT NULL
                     CHECK (type IN (1, 2, 3)),
  question         TEXT          NOT NULL,
  options          JSONB,
  correct_index    INT,
  correct_answer   TEXT,
  sort             INT           NOT NULL DEFAULT 0,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── in_video_questions ─────────────────────────────────────────────────────────
-- type: 1=multiple_choice, 2=true_false
CREATE TABLE IF NOT EXISTS in_video_questions (
  id               SERIAL        PRIMARY KEY,
  lesson_id        INT           NOT NULL REFERENCES lessons(id),
  at_second        INT           NOT NULL DEFAULT 0,
  question         TEXT          NOT NULL,
  type             INT           NOT NULL
                     CHECK (type IN (1, 2)),
  options          JSONB,
  correct_index    INT           NOT NULL,
  must_correct     BOOLEAN       NOT NULL DEFAULT false,
  sort             INT           NOT NULL DEFAULT 0,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- =============================================================================
-- PROGRESS
-- =============================================================================

-- ── enrollments ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id               SERIAL        PRIMARY KEY,
  course_id        INT           NOT NULL REFERENCES courses(id),
  user_id          INT           NOT NULL REFERENCES users(id),
  enrolled_by_id   INT           NOT NULL REFERENCES users(id),
  enrolled_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (course_id, user_id)
);

-- ── course_progress ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_progress (
  id               SERIAL        PRIMARY KEY,
  course_id        INT           NOT NULL REFERENCES courses(id),
  user_id          INT           NOT NULL REFERENCES users(id),
  enrolled_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (course_id, user_id)
);

-- ── lesson_progress ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id                  SERIAL        PRIMARY KEY,
  course_progress_id  INT           NOT NULL REFERENCES course_progress(id),
  lesson_id           INT           NOT NULL REFERENCES lessons(id),
  is_completed        BOOLEAN       NOT NULL DEFAULT false,
  completed_at        TIMESTAMPTZ,
  created_by_id       INT,
  updated_by_id       INT,
  deleted_by_id       INT,
  created_by_name     VARCHAR(100),
  updated_by_name     VARCHAR(100),
  deleted_by_name     VARCHAR(100),
  created_at          TIMESTAMPTZ   DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  UNIQUE (course_progress_id, lesson_id)
);

-- ── in_video_answers ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS in_video_answers (
  id                    SERIAL        PRIMARY KEY,
  lesson_progress_id    INT           NOT NULL REFERENCES lesson_progress(id),
  question_id           INT           NOT NULL REFERENCES in_video_questions(id),
  selected_index        INT           NOT NULL,
  is_correct            BOOLEAN       NOT NULL DEFAULT false,
  answered_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by_id         INT,
  updated_by_id         INT,
  deleted_by_id         INT,
  created_by_name       VARCHAR(100),
  updated_by_name       VARCHAR(100),
  deleted_by_name       VARCHAR(100),
  created_at            TIMESTAMPTZ   DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

-- ── quiz_attempts ──────────────────────────────────────────────────────────────
-- quiz_role: 1=lesson, 2=pre_test, 3=final_exam
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id                  SERIAL        PRIMARY KEY,
  course_progress_id  INT           NOT NULL REFERENCES course_progress(id),
  quiz_id             INT           NOT NULL REFERENCES quizzes(id),
  quiz_role           INT           NOT NULL
                        CHECK (quiz_role IN (1, 2, 3)),
  score               NUMERIC(5,2)  NOT NULL DEFAULT 0,
  is_passed           BOOLEAN       NOT NULL DEFAULT false,
  attempted_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  answers             JSONB         NOT NULL DEFAULT '[]',
  created_by_id       INT,
  updated_by_id       INT,
  deleted_by_id       INT,
  created_by_name     VARCHAR(100),
  updated_by_name     VARCHAR(100),
  deleted_by_name     VARCHAR(100),
  created_at          TIMESTAMPTZ   DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

-- =============================================================================
-- CERTIFICATES
-- =============================================================================

-- ── certificate_templates ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificate_templates (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(150)  NOT NULL,
  is_default       BOOLEAN       NOT NULL DEFAULT false,
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  org_name         VARCHAR(150),
  signer_name      VARCHAR(150),
  signer_title     VARCHAR(150),
  design_config    JSONB         NOT NULL DEFAULT '{}',
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── cert_template_courses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cert_template_courses (
  id               SERIAL        PRIMARY KEY,
  template_id      INT           NOT NULL REFERENCES certificate_templates(id),
  course_id        INT           NOT NULL REFERENCES courses(id),
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (template_id, course_id)
);

-- ── certificates ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id               SERIAL        PRIMARY KEY,
  user_id          INT           NOT NULL REFERENCES users(id),
  course_id        INT           NOT NULL REFERENCES courses(id),
  template_id      INT           REFERENCES certificate_templates(id),
  quiz_attempt_id  INT           REFERENCES quiz_attempts(id),
  certificate_no   VARCHAR(100)  NOT NULL UNIQUE,
  user_name        VARCHAR(150)  NOT NULL,
  course_title     VARCHAR(255)  NOT NULL,
  category         VARCHAR(100),
  score            NUMERIC(5,2)  NOT NULL DEFAULT 0,
  issued_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ,
  is_revoked       BOOLEAN       NOT NULL DEFAULT false,
  revoked_at       TIMESTAMPTZ,
  revoked_reason   TEXT,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

-- type: 1=cert_earned, 2=quiz_passed, 3=quiz_failed, 4=course_assigned, 5=reminder
CREATE TABLE IF NOT EXISTS notifications (
  id               SERIAL        PRIMARY KEY,
  user_id          INT           NOT NULL REFERENCES users(id),
  type             INT           NOT NULL
                     CHECK (type IN (1, 2, 3, 4, 5)),
  title            VARCHAR(255)  NOT NULL,
  message          TEXT,
  reference_type   VARCHAR(50),
  reference_id     INT,
  metadata         JSONB,
  read_at          TIMESTAMPTZ,
  expired_at       TIMESTAMPTZ,
  created_by_id    INT,
  updated_by_id    INT,
  deleted_by_id    INT,
  created_by_name  VARCHAR(100),
  updated_by_name  VARCHAR(100),
  deleted_by_name  VARCHAR(100),
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_departments_division     ON departments(division_id);
CREATE INDEX IF NOT EXISTS idx_users_department         ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_position           ON users(position_id);
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);
CREATE INDEX IF NOT EXISTS idx_role_menu_role           ON role_menu_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_menu           ON role_menu_permissions(menu_id);
CREATE INDEX IF NOT EXISTS idx_courses_category         ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status           ON courses(status_type);
CREATE INDEX IF NOT EXISTS idx_modules_course           ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module           ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz           ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_invideo_lesson           ON in_video_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user         ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course       ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user     ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course   ON course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_cp       ON lesson_progress(course_progress_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_cp         ON quiz_attempts(course_progress_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user        ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course      ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user       ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read       ON notifications(user_id, read_at);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- divisions
INSERT INTO divisions (name, created_by_name, created_at) VALUES
  ('Management',  'SYSTEM', NOW()),
  ('Operations',  'SYSTEM', NOW()),
  ('Sales',       'SYSTEM', NOW()),
  ('Support',     'SYSTEM', NOW())
ON CONFLICT (name) DO NOTHING;

-- departments
INSERT INTO departments (division_id, name, created_by_name, created_at) VALUES
  (1, 'Executive',   'SYSTEM', NOW()),
  (2, 'HR',          'SYSTEM', NOW()),
  (3, 'Sales',       'SYSTEM', NOW()),
  (3, 'Telesales',   'SYSTEM', NOW()),
  (3, 'PC/BA',       'SYSTEM', NOW()),
  (4, 'IT Support',  'SYSTEM', NOW())
ON CONFLICT DO NOTHING;

-- positions
INSERT INTO positions (name, created_by_name, created_at) VALUES
  ('ผู้จัดการ',      'SYSTEM', NOW()),
  ('หัวหน้าทีม',     'SYSTEM', NOW()),
  ('พนักงาน',        'SYSTEM', NOW()),
  ('ผู้ฝึกอบรม',     'SYSTEM', NOW())
ON CONFLICT (name) DO NOTHING;

-- categories
INSERT INTO categories (name, description, created_by_name, created_at) VALUES
  ('Product Knowledge', 'ความรู้เกี่ยวกับผลิตภัณฑ์',  'SYSTEM', NOW()),
  ('Safety',            'ความปลอดภัยในการทำงาน',        'SYSTEM', NOW()),
  ('Soft Skills',       'ทักษะการทำงาน',                'SYSTEM', NOW()),
  ('Compliance',        'กฎระเบียบและข้อบังคับ',         'SYSTEM', NOW())
ON CONFLICT (name) DO NOTHING;

-- roles
INSERT INTO roles (name, is_system, created_by_name, created_at) VALUES
  ('super_admin',    true,  'SYSTEM', NOW()),
  ('training_admin', true,  'SYSTEM', NOW()),
  ('manager',        true,  'SYSTEM', NOW()),
  ('learner',        true,  'SYSTEM', NOW())
ON CONFLICT (name) DO NOTHING;

-- default super_admin user  (password = "admin1234")
INSERT INTO users (
  department_id, role_id, position_id,
  name, email, password, employee_id, is_active,
  created_by_name, created_at
) VALUES (
  1, 1, 1,
  'Admin หลัก', 'admin@pklearning.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'EMP-001', true,
  'SYSTEM', NOW()
)
ON CONFLICT (email) DO NOTHING;