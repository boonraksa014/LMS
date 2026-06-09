---
target: LearnerDashboard
total_score: 23
p0_count: 0
p1_count: 2
timestamp: 2026-06-08T09-57-52Z
slug: src-app-components-learnerdashboard-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Progress bar and status badges clear; no loading/error states |
| 2 | Match System / Real World | 3 | Thai copy natural; "เรียนครบ" vs "สอบผ่าน" distinction may confuse |
| 3 | User Control and Freedom | 2 | No filtering, sorting, or course-level back navigation |
| 4 | Consistency and Standards | 3 | Award icon only on "passed" heading; status colors inconsistent with progress bar |
| 5 | Error Prevention | 2 | No deadline/urgency signals; no network error state |
| 6 | Recognition Rather Than Recall | 3 | Status text visible; no "last viewed" or "recommended first" cue |
| 7 | Flexibility and Efficiency of Use | 1 | No keyboard shortcuts, no filtering, no power-user path |
| 8 | Aesthetic and Minimalist Design | 3 | Three distinct card types good; gradient thumbnail overlay and badge contrast failures add noise |
| 9 | Error Recovery | 2 | No rendered error state; empty state handles 0-courses only |
| 10 | Help and Documentation | 1 | No contextual help, no tooltips, no "what to do next" guidance |
| **Total** | | **23/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment**: Not immediately AI-generated. Three distinct card layouts resist the identical-grid trap. The stacked progress bar replacing hero-metric widgets is deliberate. Two tells remain: the decorative image gradient overlay on not-started thumbnails (no text sits on it) and the section-heading inconsistency (Award icon on "คอร์สที่ผ่านแล้ว" only).

**Deterministic scan**: 2 findings, both `layout-transition` warnings:
- Line 176: `transition: 'width'` on passed-% segment
- Line 185: `transition: 'width'` on in-progress-% segment

Not false positives.

## Priority Issues

**[P1] Badge text contrast failures in statusConfig**
- `completed` (#F59E0B on #FFFBEB) ≈2.17:1 FAIL. `failed` (#EF4444 on #FEF2F2) ≈3.88:1 FAIL. Passed-section caption (#10B981 on #F0FDF4) ≈2.97:1 FAIL.
- Fix: completed → #B45309, failed → #B91C1C, passed section → #059669.

**[P1] No priority or deadline signal on not-started courses**
- All 8+ not-started courses render as equivalent. No urgency, no sequence, no recommendation.
- Fix: Add priority/dueDate field; surface required-first badges or deadline chips.

**[P2] `transition: 'width'` on stacked progress bar segments (L176, L185)**
- Layout-thrash on every animation frame. Use `transform: scaleX()` + `transformOrigin: left`.

**[P2] Gradient overlay on course thumbnails (L422) — no functional purpose**
- `linear-gradient(to top, rgba(0,0,0,0.35)...)` with nothing rendered on top. Remove.

**[P2] In-progress card aria-label omits progress context (L251)**
- Screen reader hears only title, not lesson count or progress %.
- Fix: include completed/total/progress in aria-label.

## Persona Red Flags

**Pranee (45-year-old insurance agent, desktop)**: Zero urgency signal; category chips not filterable; 0.7rem text at default zoom.

**Jordan (New hire)**: No onboarding; tabbing skips hidden "เริ่มเรียน" button; "ดูผลการเรียน" vs "ดูใบรับรอง" ambiguous.

**Alex (Power user)**: No keyboard shortcut for resume; no filter/sort; no last-lesson label; no way to collapse passed section.

## Minor Observations

- Award icon only on "คอร์สที่ผ่านแล้ว" heading — remove or add icons to all three sections.
- `statusConfig.passed` is dead code — passed courses never render through it.
- Avatar `rgba(255,255,255,0.2)` background is too faint — bump to 0.3.
- Not-started hover lift (-4px) vs in-progress (-3px) are not from a system.

## Questions to Consider

- Is deadline/required-by data available from the backend?
- Should the passed section collapse after N courses?
- What if the in-progress primary action were hero-width with last lesson visible?
