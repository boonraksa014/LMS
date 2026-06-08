---
target: LearnerDashboard
total_score: 20
p0_count: 0
p1_count: 3
timestamp: 2026-06-08T04-30-04Z
slug: src-app-components-learnerdashboard-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Progress bars visible; no loading/feedback state on click |
| 2 | Match System / Real World | 3 | Thai language throughout; mixed Thai/English in section heading |
| 3 | User Control and Freedom | 2 | No preview before entering course; no escape affordance |
| 4 | Consistency and Standards | 2 | 4 different button styles across sections; off-brand hover color |
| 5 | Error Prevention | 2 | No prerequisites shown; no course duration warning |
| 6 | Recognition Rather Than Recall | 3 | Status badges colored + labeled; section headings clear |
| 7 | Flexibility and Efficiency | 1 | No filtering, sorting, keyboard shortcuts, or search |
| 8 | Aesthetic and Minimalist Design | 2 | Stat cards = absolute-ban pattern; competing visual languages |
| 9 | Error Recovery | 1 | No error states; failed courses shown with no remediation path |
| 10 | Help and Documentation | 1 | No tooltips, empty states, or guidance for new users |
| **Total** | | **20/40** | **Acceptable** |

## Anti-Patterns Verdict

LLM: Hero-metric stat cards (P1), broken button vocabulary (P1), off-brand purple hover color (P1). Detector: 0 findings.

## Priority Issues

P1: Hero-metric stat cards — replace with progress summary bar
P1: Four-way broken button vocabulary — standardize to 2 styles
P1: Off-brand #C7D2FE hover border on course cards
P2: LinearProgress color="primary" renders near-black not green
P2: No empty state for new employees

## Persona Red Flags

New employee: 0/0/0/0 stats with no guidance. Sam: card divs not focusable as buttons. Alex: no filtering or keyboard shortcuts.
