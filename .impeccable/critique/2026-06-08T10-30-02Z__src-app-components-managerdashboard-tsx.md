---
target: ManagerDashboard
total_score: 21
p0_count: 0
p1_count: 2
timestamp: 2026-06-08T10-30-02Z
slug: src-app-components-managerdashboard-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Stats strip and charts visible; no loading state for chart data |
| 2 | Match System / Real World | 2 | "Team Completion" and "Export CSV" in English; radial gauge unfamiliar to Thai insurance managers |
| 3 | User Control and Freedom | 2 | Export CSV works; no sort, no filter, no date range — read-only dashboard |
| 4 | Consistency and Standards | 2 | in_progress chips render as MUI default blue; all other in-progress indicators in the app are green |
| 5 | Error Prevention | 2 | Empty team state handled; CSV download has no error handling |
| 6 | Recognition Rather Than Recall | 3 | Status labels in Thai in table; course titles truncated in KPI card with no tooltip |
| 7 | Flexibility and Efficiency of Use | 1 | No sort, no filter, no search, no per-member drill-down |
| 8 | Aesthetic and Minimalist Design | 3 | Clean layout; 4-stat summary strip works well; radial chart adds complexity without insight |
| 9 | Error Recovery | 2 | Empty team state shown; no feedback if CSV download fails |
| 10 | Help and Documentation | 1 | No metric definitions; no tooltip on chart bars; "อัตราผ่านโดยรวม" threshold not explained |
| **Total** | | **21/40** | **Functional but trust-deficit — brand mismatch and missing interactivity undermine manager confidence** |

## Anti-Patterns Verdict

**LLM assessment**: The BarChart + RadialBarChart pairing for a single KPI is a data-viz cliché — two charts doing the job of one number. The 4-stat summary strip approaches the hero-metric ban but stays on the right side (functional strip vs. decorative splash). The main tells are the blue "primary" Chips (default MUI palette leaked through), "Team Completion" English label, and the radial gauge as visual filler.

**Deterministic scan**: Exit 0 — no anti-patterns detected.

## Priority Issues

**[P1] `statusChipColor.in_progress = 'primary'` renders as MUI default blue**
- Lines 54-60: `statusChipColor` maps `in_progress` to `'primary'`. MUI v7 default primary color is #1976D2 (blue). Every other in-progress indicator in this app uses #1E7A34 (Growth Green).
- A manager scanning the table sees blue "กำลังเรียน" chips next to green passed indicators — inconsistent system, erodes trust.
- Fix: Replace `color={statusChipColor[status]}` with custom `sx` per status:
  ```tsx
  const statusChipSx: Record<string, object> = {
    not_started: { backgroundColor: '#F1F5F9', color: '#475569' },
    in_progress: { backgroundColor: '#E8F5E9', color: '#155225' },
    completed: { backgroundColor: '#FEF9C3', color: '#854D0E' },
    passed: { backgroundColor: '#ECFDF5', color: '#065F46' },
    failed: { backgroundColor: '#FEF2F2', color: '#991B1B' },
  };
  // Usage:
  <Chip label={statusTh[status]} size="small" sx={{ fontSize: '0.65rem', height: 20, mb: 0.5, ...statusChipSx[status] }} />
  ```

**[P1] #10B981 and #F59E0B contrast failures**
- Line 89: summaryItems CheckCircle icon `color: '#10B981'` on white ≈2.0:1. Fails WCAG 3:1 for non-decorative graphical elements (this icon indicates "passed" meaning).
- Line 271: Per-course percentage label `color: rate >= 70 ? '#10B981' : '#F59E0B'` on white. #10B981 ≈2.0:1, #F59E0B ≈2.4:1. Both fail 4.5:1 for small text (caption size).
- Fix: `#10B981` → `#059669`, `#F59E0B` → `#B45309`.

**[P2] "Team Completion" and "Export CSV" — English in Thai dashboard**
- Line 154: button label `Export CSV`. Line 257: radial chart caption `Team Completion`.
- Fix: `'ส่งออก CSV'` and `'อัตราผ่านโดยรวม'`.

**[P2] Course titles truncated in KPI card with no tooltip**
- Line 268: `overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120` — course title cut to 120px. With 3+ courses, a manager looking at the KPI progress-bar list cannot read the full course names.
- Fix: Wrap the Typography in a MUI `Tooltip` with `title={course.title}`.

**[P3] RadialBarChart adds complexity without clarity**
- Lines 244-258: A semicircle radial gauge shows one number (overallCompletion%). A single large `<Typography>` with a colored number (same one at line 254) would be clearer. The RadialBarChart is decorative complexity.
- Recommendation: Consider replacing with a donut segment or plain large number + label inside a clean card. If chart must stay, remove the duplicate number in the KPI progress-bar section below it — it creates information repetition.

## Persona Red Flags

**Pimchanok (Branch Manager, tablet)**: Blue chips for in-progress are confusing when green is the brand signal throughout; "Export CSV" in English won't be found intuitively.

**Power-user manager**: No sort by completion rate, no filter by status, no click-through to individual member history — every insight requires manual scanning.

**Low-data environment**: ResponsiveContainer with recharts downloads a non-trivial JS bundle. If data hasn't loaded, charts render empty with no shimmer/skeleton.

## Minor Observations

- `overallCompletion` formula (line 83) uses `totalPassed / (teamMembers.length × publishedCourses.length)` — this counts "passed how many individual courses" not "passed all assigned courses". For a team of 3 with 2 courses, passing 2/6 possible slots = 33% even if 2 members completed everything. Confirm this matches the business definition.
- `barData` course shortTitle (L101): `course.title.slice(0, 12) + '…'` — no tooltip on XAxis ticks. Managers won't know which bar maps to which course.
- CSV BOM prefix `'﻿'` (line 125): correct for Windows Excel; note that the BOM is a Unicode code point (﻿), not a visible character.
- `Card` component from MUI uses `elevation=1` by default adding a box-shadow. The rest of the dashboard uses explicit `border: '1px solid #E2E8F0'` flat cards. Use `<Card variant="outlined">` or add `elevation={0}` for consistency.

## Questions to Consider

- Should managers be able to drill into a member's full course history? Currently no route exists.
- Is there a planned date-range filter (this month / this quarter)?
- Should the CSV export include IVQ answer logs for compliance purposes?