---
target: LessonPlayer
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-08T10-30-00Z
slug: src-app-components-lessonplayer-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Progress bar + lesson counter + video-watched strip all precise |
| 2 | Match System / Real World | 4 | Thai throughout; "ดูวิดีโอให้จบก่อน" is clear causal language |
| 3 | User Control and Freedom | 2 | No keyboard shortcuts; no playback speed; no transcript; prev/next only linear |
| 4 | Consistency and Standards | 3 | Button palette consistent; "เสร็จสิ้นแล้ว" uses #10B981 (not brand #059669) |
| 5 | Error Prevention | 3 | Video-gated completion and IVQ mustCorrect guard against premature advance |
| 6 | Recognition Rather Than Recall | 3 | Breadcrumb chips show course+module context; lesson number shown |
| 7 | Flexibility and Efficiency of Use | 1 | No keyboard shortcuts; no speed control; no way to skip already-watched video |
| 8 | Aesthetic and Minimalist Design | 3 | Clean hierarchy; one gradient on a non-functional control bar violates Flat-First Rule |
| 9 | Error Recovery | 2 | Broken or missing videoUrl shows blank container — no error message or retry |
| 10 | Help and Documentation | 2 | Video completion instruction is clear; IVQ popup has no accessible dialog role |
| **Total** | | **27/40** | **Solid foundation — two a11y P1s must ship before release** |

## Anti-Patterns Verdict

**LLM assessment**: Does not read as AI-generated. Lesson header with breadcrumb chips plus IVQ overlay is product-specific structure, not a template. One tell: decorative circles in the video poster (`position: absolute, borderRadius: '50%', background: 'rgba(30,122,52,0.12)'`) — they add noise without meaning and should be removed.

**Deterministic scan**: Exit 0 — no anti-patterns detected.

## Priority Issues

**[P1] "เสร็จสิ้นแล้ว" action bar uses #10B981 — contrast fail**
- Lines 660, 663: `CheckCircle` color and Typography color both `#10B981` on `#FAFAFA` background. Computed contrast ≈2.0:1. Fails WCAG AA 4.5:1 for small text. Same failure fixed in LearnerDashboard; missed here.
- Fix: both → `#059669`.

**[P1] IVQ overlay missing dialog semantics**
- Lines 413-556: the full-screen overlay has no `role="dialog"`, `aria-modal="true"`, or `aria-label`. Screen readers don't announce that a dialog appeared; focus is not trapped inside.
- Fix: Add `role="dialog" aria-modal="true" aria-label="คำถามระหว่างเรียน"` to the outer overlay `<Box>`. Add a `useEffect` that focuses the first interactive element when `activeIVQ` becomes non-null.

**[P2] LinearProgress missing ARIA attributes**
- Lines 267-276: `<LinearProgress variant="determinate" value={progressPercent}>` — no `aria-label`, so screen readers announce only a generic progressbar with no context.
- Fix: Add `aria-label={\`ความคืบหน้าคอร์ส ${progressPercent}%\`}` to the component.

**[P2] Gradient on decorative video control bar — Flat-First Rule**
- Line 386: `background: 'linear-gradient(0deg,rgba(0,0,0,0.6),transparent)'` on a fake progress bar in the HTML5 video poster. The controls are non-functional (Volume2, Maximize2 are visual dummies). The gradient is UI chrome over a flat dark-green background.
- Fix: Remove the entire bottom-bar `<Box>` (lines 386-392). The poster is already dark green; fake controls add visual weight with zero utility.

**[P3] No error state for broken videoUrl**
- When `lesson.videoUrl` is a 404 or invalid path, the `<video>` element renders blank with no feedback.
- Fix: Add `onError={() => setVideoError(true)}` to the `<video>` element and render a "ไม่สามารถโหลดวิดีโอได้" Alert in that state.

## Persona Red Flags

**Pranee (45, insurance agent, keyboard user)**: No keyboard shortcut to mark complete or navigate; tab order skips the "click to play" poster on first reach if focus starts elsewhere.

**Screen reader user**: IVQ popup appears without announcement; progress bar announces as unnamed progressbar; "เสร็จสิ้นแล้ว" text fails contrast.

**Low-bandwidth user**: No `poster` image on `<video>` means the browser makes a cold-start request before showing anything; no buffering indicator.

## Minor Observations

- Decorative circles in lesson header (L291) and video poster (L363-364) — remove.
- `transition: 'transform 0.2s'` on the play button circle is fine (transform, not layout); reduced-motion guard already present ✓.
- `useEffect` on YouTube message listener has no deps array (line 148) — runs on every render. Add `[lesson, lessonId, activeIVQ, allAnsweredIVQIds]` as deps.
- `videoRef.current?.play().catch(() => {})` in `resumeVideo` (L201) silently swallows autoplay errors. Log with `console.warn` at minimum.

## Questions to Consider

- Should watched-state persist across page reloads (localStorage)? Currently resets on refresh for non-completed lessons.
- Is transcript/subtitle support planned? Would eliminate the flexibility score gap.
- Should the IVQ overlay focus-trap be generic (reuse ErrorBoundary pattern) or inline?