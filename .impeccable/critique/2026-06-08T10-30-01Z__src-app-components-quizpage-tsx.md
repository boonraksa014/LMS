---
target: QuizPage
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-08T10-30-01Z
slug: src-app-components-quizpage-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Progress bar + question counter + answered-dot states all clear |
| 2 | Match System / Real World | 2 | FINAL EXAM / PRE-TEST / QUIZ / Multiple Choice / True or False — all English in Thai UI |
| 3 | User Control and Freedom | 2 | No exit button during quiz; once started, must submit to leave |
| 4 | Consistency and Standards | 3 | Option card selected state consistent; English labels break Thai register |
| 5 | Error Prevention | 3 | Next gated on answer; submit gated on allAnswered |
| 6 | Recognition Rather Than Recall | 4 | Question dots show answered state; full answer review in result |
| 7 | Flexibility and Efficiency of Use | 1 | No keyboard shortcuts (number keys for options, Enter to advance) |
| 8 | Aesthetic and Minimalist Design | 3 | Clean question card; emoji icons in intro grid and emoji in heading feel informal |
| 9 | Error Recovery | 3 | Result shows all wrong answers with correct answers; clear pass/fail signal |
| 10 | Help and Documentation | 2 | Stats grid explains rules; no hint system; no "what happens if I fail" text |
| **Total** | | **27/40** | **Good quiz flow — English labels and exit escape are the key gaps** |

## Anti-Patterns Verdict

**LLM assessment**: The 3-state flow (intro → taking → result) is well-structured. No gradient text, no glassmorphism, no side-stripe borders. Two tells: emoji icons in the 2×2 stats grid (📝🎯🔄⏳) substituting for Lucide icons, and English type labels in a Thai-language UI. Both suggest unreviewed scaffolding.

**Deterministic scan**: Exit 0 — no anti-patterns detected.

## Priority Issues

**[P1] English labels throughout a Thai UI**
- Line 81: `'FINAL EXAM'`, `'PRE-TEST'`, `'QUIZ'` badge text.
- Line 189: `'Multiple Choice'`, `'True / False'` question-type badge.
- These are the only English strings visible to learners in an otherwise fully Thai interface. Jarring on first exposure and inaccessible to non-English speakers.
- Fix:
  ```tsx
  // Line 81
  {isFinalExam ? 'ข้อสอบปลายภาค' : isPreTest ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบ'}
  // Line 189
  {question.type === 'multiple_choice' ? 'เลือกตอบ' : 'ถูก / ผิด'}
  ```

**[P1] #10B981 contrast fails in result screen**
- Line 263: Score number `color: '#10B981'` on `#F0FDF4` ≈2.0:1. Fails WCAG 3:1 for large text (3.5rem).
- Line 289: "เฉลย:" caption `color: '#10B981'` on pale green answer box ≈2.0:1. Fails 4.5:1 for small text.
- Fix: both → `#059669`.

**[P2] Emoji icons in intro stats grid**
- Lines 91-94: `'📝', '🎯', '🔄', '⏳'` render inconsistently across platforms, cannot be styled to match the Lucide icon system, and look informal in a corporate insurance context.
- Fix: Replace with Lucide:
  ```tsx
  { icon: <FileText size={18} color="#1E7A34" />, ... }   // จำนวนข้อ
  { icon: <Target size={18} color="#1E7A34" />, ... }      // เกณฑ์ผ่าน
  { icon: <RefreshCw size={18} color="#1E7A34" />, ... }   // จำนวนครั้ง
  { icon: <Clock size={18} color="#1E7A34" />, ... }       // ครั้งที่เหลือ
  ```
  Add `Target, Clock` to lucide imports.

**[P2] No exit option during quiz**
- In `quizState === 'taking'`, there is no back button or cancel control. Users who clicked Start by accident cannot leave without submitting.
- Fix: Add a small outlined "ออก" button in the taking-state action bar. On click: confirm with a browser-level `window.confirm` or inline inline inline state, then reset to `quizState = 'intro'` and clear answers.

**[P3] Emoji in passing result heading**
- Line 258: `'ยินดีด้วย! สอบผ่าน 🎉'` — emoji in a heading for a corporate insurance LMS. Minor but inconsistent with the professional tone of the product.
- Fix: `'ยินดีด้วย! สอบผ่านแล้ว'` — the CheckCircle icon already communicates success.

## Persona Red Flags

**Pranee (45, insurance agent)**: English "FINAL EXAM" badge with no Thai equivalent; emoji icons render as tofu squares on some older mobile browsers.

**Keyboard user**: No number-key shortcuts for options; Enter doesn't advance to next question; no keyboard shortcut for Submit.

**Accessibility**: `FormControlLabel` wraps `Radio` + label — good for screen readers. But question dot `role="button"` elements with `aria-current="true"` should use `aria-current="step"` or `aria-pressed` instead of the boolean value `'true'`.

## Minor Observations

- `quizState === 'result' && lastAttempt` guard at line 244 — if `lastAttempt` is null but `quizState === 'result'`, component returns `null` silently. Add a fallback or ensure lastAttempt is always set before transitioning.
- The `remainingAttempts` can be `Infinity` when `maxAttempts === 0`. The "ลองใหม่ (∞ ครั้ง)" label (L332) renders fine but ∞ is an unusual character in Thai UI copy; consider "ลองใหม่ (ไม่จำกัด)" for clarity.
- Option hover background `#F1F8F2` (L215) is a custom tint not in the design token set. Use `#F0FDF4` to stay on the existing palette.
- `aria-current={idx === currentQuestion ? 'true' : undefined}` on question dots — the string `'true'` should be boolean `true` in JSX.

## Questions to Consider

- Should pre-test results gate course entry, or are they informational only?
- Is a "review all before submit" screen planned, or does dot-navigation suffice?
- Should failed pre-tests immediately suggest a specific lesson to review?