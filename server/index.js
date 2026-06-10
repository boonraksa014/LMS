require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { Pool } = require('pg');

// ── DB connection ──────────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'lms_db',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
});

pool.connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => { console.error('PostgreSQL connection failed:', err.message); process.exit(1); });

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PORT       = Number(process.env.PORT) || 3000;

// ── Helpers ────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

function mapUser(row) {
  return {
    id:              String(row.id),
    fullnameThai:    row.fullname_thai,
    fullnameEng:     row.fullname_eng ?? undefined,
    email:           row.email,
    password:        row.password,
    role:            row.role,
    department:      row.department ?? '',
    employeeId:      row.employee_id ?? '',
    isActive:        row.is_active,
    phone:           row.phone ?? undefined,
    registrantType:  row.registrant_type ?? 1,
    shopId:          row.shop_id ?? undefined,
    positionText:    row.position_text ?? undefined,
  };
}

function mapCourse(row) {
  return {
    id:            row.id,
    title:         row.title,
    description:   row.description,
    image:         row.image,
    duration:      row.duration,
    category:      row.category,
    status:        row.status,
    allowedGroups: row.allowed_groups,
    modules:       row.modules,
    preTest:       row.pre_test,
    finalExam:     row.final_exam,
    createdAt:     row.created_at,
  };
}

function mapProgress(row) {
  return {
    courseId:           row.course_id,
    userId:             row.user_id,
    enrolledAt:         row.enrolled_at,
    lessonProgress:     row.lesson_progress,
    quizAttempts:       row.quiz_attempts,
    preTestAttempts:    row.pre_test_attempts,
    finalExamAttempts:  row.final_exam_attempts,
    completedAt:        row.completed_at ?? undefined,
  };
}

function mapCert(row) {
  return {
    id:            row.id,
    certificateNo: row.certificate_no,
    userId:        row.user_id,
    userName:      row.user_name,
    courseId:      row.course_id,
    courseTitle:   row.course_title,
    category:      row.category,
    issuedAt:      row.issued_at,
    score:         Number(row.score),
    expiresAt:     row.expires_at,
  };
}

function mapEnrollment(row) {
  return {
    id:         row.id,
    courseId:   row.course_id,
    userId:     row.user_id,
    enrolledBy: row.enrolled_by,
    enrolledAt: row.enrolled_at,
  };
}

// JWT middleware — used on protected routes (optional for now, all routes open)
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Auth ───────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    if (!user.is_active) return res.status(401).json({ error: 'บัญชีนี้ถูกระงับการใช้งาน' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ user: mapUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (_req, res) => res.json({ ok: true }));

// ── Users ──────────────────────────────────────────────────────────────────
app.get('/api/users', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at');
    res.json(rows.map(mapUser));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(mapUser(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', async (req, res) => {
  try {
    const {
      fullnameThai, fullnameEng, email, password,
      role = 'learner', department = '', employeeId = '',
      isActive = true, phone, registrantType = 1, positionText,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users
         (fullname_thai, fullname_eng, email, password, role,
          department, employee_id, is_active, phone, registrant_type, position_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [fullnameThai, fullnameEng || null, email, hash, role,
       department, employeeId, isActive, phone || null,
       registrantType, positionText || null]
    );
    res.status(201).json(mapUser(rows[0]));
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const {
      fullnameThai, fullnameEng, email, password,
      role, department, employeeId, isActive, phone,
      registrantType, positionText,
    } = req.body;
    const sets = [];
    const vals = [];
    let i = 1;
    if (fullnameThai   !== undefined) { sets.push(`fullname_thai=$${i++}`);   vals.push(fullnameThai); }
    if (fullnameEng    !== undefined) { sets.push(`fullname_eng=$${i++}`);    vals.push(fullnameEng); }
    if (email          !== undefined) { sets.push(`email=$${i++}`);           vals.push(email); }
    if (password       !== undefined) { sets.push(`password=$${i++}`);        vals.push(await bcrypt.hash(password, 10)); }
    if (role           !== undefined) { sets.push(`role=$${i++}`);            vals.push(role); }
    if (department     !== undefined) { sets.push(`department=$${i++}`);      vals.push(department); }
    if (employeeId     !== undefined) { sets.push(`employee_id=$${i++}`);     vals.push(employeeId); }
    if (isActive       !== undefined) { sets.push(`is_active=$${i++}`);       vals.push(isActive); }
    if (phone          !== undefined) { sets.push(`phone=$${i++}`);           vals.push(phone); }
    if (registrantType !== undefined) { sets.push(`registrant_type=$${i++}`); vals.push(registrantType); }
    if (positionText   !== undefined) { sets.push(`position_text=$${i++}`);   vals.push(positionText); }
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
    sets.push(`updated_at=NOW()`);
    vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(mapUser(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Courses ────────────────────────────────────────────────────────────────
app.get('/api/courses', async (req, res) => {
  try {
    const { status } = req.query;
    const q = status
      ? 'SELECT * FROM courses WHERE status=$1 ORDER BY created_at'
      : 'SELECT * FROM courses ORDER BY created_at';
    const { rows } = await pool.query(q, status ? [status] : []);
    res.json(rows.map(mapCourse));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM courses WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    res.json(mapCourse(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { title, description='', image='', duration='', category='', status='draft',
            allowedGroups=[], modules=[], preTest=null, finalExam=null, createdAt } = req.body;
    const id = `course_${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO courses (id,title,description,image,duration,category,status,
                            allowed_groups,modules,pre_test,final_exam,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, title, description, image, duration, category, status,
       JSON.stringify(allowedGroups), JSON.stringify(modules),
       preTest ? JSON.stringify(preTest) : null,
       finalExam ? JSON.stringify(finalExam) : null,
       createdAt || new Date().toISOString()]
    );
    res.status(201).json(mapCourse(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/courses/:id', async (req, res) => {
  try {
    const fields = {
      title: 'title', description: 'description', image: 'image',
      duration: 'duration', category: 'category', status: 'status',
    };
    const jsonFields = {
      allowedGroups: 'allowed_groups', modules: 'modules',
      preTest: 'pre_test', finalExam: 'final_exam',
    };
    const sets = [];
    const vals = [];
    let i = 1;
    for (const [key, col] of Object.entries(fields)) {
      if (req.body[key] !== undefined) { sets.push(`${col}=$${i++}`); vals.push(req.body[key]); }
    }
    for (const [key, col] of Object.entries(jsonFields)) {
      if (req.body[key] !== undefined) { sets.push(`${col}=$${i++}`); vals.push(JSON.stringify(req.body[key])); }
    }
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE courses SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals
    );
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    res.json(mapCourse(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Progress ───────────────────────────────────────────────────────────────
app.get('/api/progress', async (req, res) => {
  try {
    const { userId } = req.query;
    const q = userId
      ? 'SELECT * FROM course_progress WHERE user_id=$1'
      : 'SELECT * FROM course_progress';
    const { rows } = await pool.query(q, userId ? [userId] : []);
    res.json(rows.map(mapProgress));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/progress/:courseId/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM course_progress WHERE course_id=$1 AND user_id=$2',
      [req.params.courseId, req.params.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Progress not found' });
    res.json(mapProgress(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/progress/:courseId/:userId', async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const { enrolledAt, lessonProgress=[], quizAttempts=[], preTestAttempts=[],
            finalExamAttempts=[], completedAt } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO course_progress
         (course_id, user_id, enrolled_at, lesson_progress, quiz_attempts,
          pre_test_attempts, final_exam_attempts, completed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (course_id, user_id) DO UPDATE SET
         lesson_progress     = EXCLUDED.lesson_progress,
         quiz_attempts       = EXCLUDED.quiz_attempts,
         pre_test_attempts   = EXCLUDED.pre_test_attempts,
         final_exam_attempts = EXCLUDED.final_exam_attempts,
         completed_at        = EXCLUDED.completed_at
       RETURNING *`,
      [courseId, userId, enrolledAt || new Date().toISOString(),
       JSON.stringify(lessonProgress), JSON.stringify(quizAttempts),
       JSON.stringify(preTestAttempts), JSON.stringify(finalExamAttempts),
       completedAt || null]
    );
    res.json(mapProgress(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Certificates ───────────────────────────────────────────────────────────
app.get('/api/certificates', async (req, res) => {
  try {
    const { userId } = req.query;
    const q = userId
      ? 'SELECT * FROM certificates WHERE user_id=$1 ORDER BY issued_at DESC'
      : 'SELECT * FROM certificates ORDER BY issued_at DESC';
    const { rows } = await pool.query(q, userId ? [userId] : []);
    res.json(rows.map(mapCert));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/certificates/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM certificates WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Certificate not found' });
    res.json(mapCert(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/certificates', async (req, res) => {
  try {
    const { certificateNo, userId, userName, courseId, courseTitle,
            category='', issuedAt, score=0, expiresAt } = req.body;
    const id = `cert_${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO certificates
         (id,certificate_no,user_id,user_name,course_id,course_title,
          category,issued_at,score,expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, certificateNo, userId, userName, courseId, courseTitle,
       category, issuedAt || new Date().toISOString(), score, expiresAt]
    );
    res.status(201).json(mapCert(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/certificates/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM certificates WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Enrollments ────────────────────────────────────────────────────────────
app.get('/api/enrollments', async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    let q = 'SELECT * FROM enrollments';
    const vals = [];
    if (userId)   { q += ' WHERE user_id=$1';   vals.push(userId); }
    if (courseId) { q += ' WHERE course_id=$1'; vals.push(courseId); }
    const { rows } = await pool.query(q, vals);
    res.json(rows.map(mapEnrollment));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/enrollments', async (req, res) => {
  try {
    const { courseId, userId, enrolledBy } = req.body;
    const id = `enroll_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const { rows } = await pool.query(
      `INSERT INTO enrollments (id,course_id,user_id,enrolled_by)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (course_id,user_id) DO UPDATE SET enrolled_by=EXCLUDED.enrolled_by
       RETURNING *`,
      [id, courseId, userId, enrolledBy]
    );
    res.status(201).json(mapEnrollment(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/enrollments/:courseId/:userId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM enrollments WHERE course_id=$1 AND user_id=$2',
      [req.params.courseId, req.params.userId]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`LMS API running at http://localhost:${PORT}/api`));