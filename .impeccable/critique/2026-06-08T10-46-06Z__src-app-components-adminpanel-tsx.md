---
timestamp: 2026-06-08T10-46-06Z
slug: src-app-components-adminpanel-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Success alerts and 3-step import wizard states visible; no loading spinner for async actions |
| 2 | Match System / Real World | 2 | "Export CSV", "Import", "Duplicate Course", "Draft/Published/Archived", "Final Exam" — English in Thai UI |
| 3 | User Control and Freedom | 3 | Cancel/X on every dialog; delete confirmation warns about affected member count |
| 4 | Consistency and Standards | 2 | statusChipColor.in_progress='primary' = MUI blue; roleColor.super_admin='secondary' = MUI purple |
| 5 | Error Prevention | 3 | Import validates email/role/duplicates; forms inline-validate required fields; group delete warns |
| 6 | Recognition Rather Than Recall | 2 | Course titles truncated without tooltip in 3 separate tables; no search on any table |
| 7 | Flexibility and Efficiency of Use | 2 | No sort, no search, no bulk actions; admins must scroll long tables manually |
| 8 | Aesthetic and Minimalist Design | 3 | Clean 6-tab structure; summary strip functional; mixed language adds visual friction |
| 9 | Error Recovery | 3 | Import shows per-row failure reasons; inline form errors preserve input; delete confirm warns |
| 10 | Help and Documentation | 1 | No metric tooltips; "Final Exam" unexplained in Thai text; no column definitions anywhere |
| **Total** | | **24/40** | **Solid admin shell — palette leakage, English strings, and recognition gaps are the key blockers** |

## Anti-Patterns Verdict

**LLM assessment**: AdminPanel is the most complete component in this codebase — 6 tabs, 8 dialogs, import/export, content editing, group management. The structural decisions are sound: progressive disclosure through tabs, wizard-style import flow, inline validation. The tells are inherited: the statusChipColor and roleColor pattern leaks MUI's default blue/purple palette into a brand that uses a single green axis, and #10B981 appears four more times. No gradient text, no glassmorphism, no side-stripe borders found.

**Deterministic scan**: Exit 0 — no anti-patterns detected.

## Priority Issues

**[P1] statusChipColor MUI palette leak — same root cause as ManagerDashboard, unfixed here**
- Lines 101–107: statusChipColor maps in_progress → 'primary' (MUI blue #1976D2). Used at line 758 (Reports table) and line 1454 (Learner Detail dialog).
- Admin reading the reports table sees blue "กำลังเรียน" chips next to green progress indicators — inconsistent signal in an interface where trust in data accuracy matters.
- Fix: Same statusChipSx pattern applied to ManagerDashboard.

**[P1] #10B981 contrast failures — four locations**
- Line 437: Summary strip "สอบผ่าน" CheckCircle icon: color: '#10B981' on white ~2.0:1. Fails WCAG 3:1.
- Line 505: Progress bar fill passRate >= 70 ? '#10B981' : '#D97706'. Graphical element 3:1 needed.
- Line 1046: Create-course dialog icon box backgroundColor: '#10B981' — white Plus icon inside at ~2.0:1. Fails 3:1.
- Line 1467: Learner detail progress bar status === 'passed' ? '#10B981'.
- Also line 507: Award color="#F59E0B" ~2.4:1 fails 3:1.
- Fix: #10B981 → #059669 everywhere; #D97706/#F59E0B → #B45309.

**[P2] 6+ English strings in a Thai UI**
- Line 694: Export CSV (Reports tab) → 'ส่งออก CSV'
- Line 791: Export CSV (Certificates tab) → 'ส่งออก CSV'
- Line 529: Import button → 'นำเข้า'
- Line 673: Tooltip "Duplicate Course" → "ทำสำเนาคอร์ส"
- Line 1181: Dialog title Duplicate Course → 'ทำสำเนาคอร์ส'
- Line 1190: Button Duplicate → 'สร้างสำเนา'
- Line 800: "สอบ Final Exam ผ่าน" → "สอบปลายภาคผ่าน"

**[P2] roleColor using MUI palette names — super_admin renders purple**
- Lines 86–91: roleColor.super_admin = 'secondary'. MUI default secondary is #9C27B0 (purple). Used in user table (line 573) and group member dialog (line 1578).
- Fix: Custom roleChipSx map with explicit brand-appropriate colors.

**[P2] Course titles truncated without tooltip — 3 locations**
- Line 650 (Courses tab), 747 (Reports table), 827 (Certificates table).
- Fix: Wrap each Typography in Tooltip with full title.

## Persona Red Flags

**Alex (Power-User Admin)**: No search on the user table. On a real deployment with 100+ users, finding one requires scrolling. No sort on any column. Cannot quickly identify which users haven't started any course.

**Sam (Accessibility-Dependent)**: #10B981 icon color fails 3:1 for the "สอบผ่าน" CheckCircle indicator. roleColor.super_admin = 'secondary' purple chip: color coding of role hierarchy is purely MUI default with no semantic intent.

**Riley (Stress Tester)**: Group delete allows deletion without reassigning orphaned users. Import preview success list truncated to first 30 of 300 rows.

## Minor Observations

- Line 448: "Dashboard" in English inside Thai UI header. Consider 'แผงควบคุม'.
- Line 109: courseStatusThai uses English: Draft, Published, Archived → 'ฉบับร่าง', 'เผยแพร่แล้ว', 'เก็บถาวร'.
- Line 1379: Import preview super_admin shown with color="error" (red) — semantically wrong for highest privilege.
- Line 1458: 📜 มีใบประกาศ emoji in learner detail. Replace with Award Lucide icon.
- courseStatusColors.published = 'success' renders MUI green, close to brand but not exact.

## Questions to Consider

- Should admins be able to reassign users to a new group when deleting the current one?
- Is search/filter on the user table planned, or is deployment scale expected to stay small?
- Should "Import ใหม่" clear the result and restart, or navigate away?
