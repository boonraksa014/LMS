---
name: PK Learning LMS
description: ระบบจัดการการเรียนรู้สำหรับองค์กร — มืออาชีพ ทันสมัย ชัดเจน
colors:
  growth-green: "#1E7A34"
  deep-forest: "#0F3D1A"
  achievement-emerald: "#10B981"
  progress-amber: "#F59E0B"
  deep-ink: "#030213"
  clean-canvas: "#ffffff"
  quiet-gray: "#ececf0"
  input-surface: "#f3f3f5"
  secondary-prose: "#717182"
  alert-red: "#d4183d"
  border-subtle: "rgba(0,0,0,0.1)"
typography:
  display:
    fontFamily: "Inter, Sarabun, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, Sarabun, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.5
  title:
    fontFamily: "Inter, Sarabun, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Inter, Sarabun, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Sarabun, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  "2xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.deep-ink}"
    textColor: "{colors.clean-canvas}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "#1a1a3a"
    textColor: "{colors.clean-canvas}"
  button-secondary:
    backgroundColor: "{colors.quiet-gray}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-green:
    backgroundColor: "{colors.growth-green}"
    textColor: "{colors.clean-canvas}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card-default:
    backgroundColor: "{colors.clean-canvas}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  input-default:
    backgroundColor: "{colors.input-surface}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
---

# Design System: PK Learning LMS

## 1. Overview

**Creative North Star: "The Quiet Expert"**

PK Learning LMS คือระบบที่น่าเชื่อถือเหมือนผู้เชี่ยวชาญที่พูดน้อยแต่รู้มาก — ไม่โชว์ตัว ไม่รบกวน แต่พร้อมให้ข้อมูลทุกอย่างที่ต้องการอยู่เสมอ UI เงียบพอให้ focus ที่การเรียนรู้ แต่ไม่เงียบจนไม่รู้ว่าอยู่ที่ไหน

สีเขียวเข้มของระบบสื่อถึงการเติบโต — ไม่ใช่การฉลอง แต่เป็นการยืนยันว่าพนักงานกำลังพัฒนาตัวเองอย่างมีทิศทาง ทุก progress indicator ทุก stat card ทุกป้ายสถานะถูกออกแบบให้เห็นชัดโดยไม่ต้องตะโกน

ระบบนี้ปฏิเสธ: generic SaaS cream/purple gradient, ภาษาเด็กๆ, layout หนาแน่นแบบ Moodle, และ visual noise ที่ขโมยความสนใจจากเนื้อหา

**Key Characteristics:**
- Progress hierarchy: สถานะการเรียนต้องเห็นได้ทันทีโดยไม่ต้องอ่าน
- Tonal depth: ใช้ความเข้มของสีเขียวเป็น scale ของ importance (เข้ม = มีนัยสำคัญ)
- Thai-first typography: Sarabun + Inter pair ที่ให้อ่านได้สบายในทั้งสองภาษา
- Flat structure: shadow ใช้เฉพาะ stat card ที่ต้องการ visual lift, ส่วนที่เหลือ border-based
- Warm professionalism: ไม่เย็นชาแบบ enterprise, ไม่สนุกแบบ edtech consumer

## 2. Colors: The Growth Palette

สีเขียวเป็นหัวใจของ identity — ไม่ใช่ accent ที่ใช้ประปราย แต่คือสีที่บอกว่า "คุณกำลังพัฒนา"

### Primary
- **Growth Green** (`#1E7A34`): สีหลักของ brand — ใช้ใน hero banner, stat card, status badges, primary action buttons ในบริบทการเรียน
- **Deep Forest** (`#0F3D1A`): green เข้มสุด — ใช้เป็น gradient start ของ hero header และ backgrounds ที่ต้องการ depth

### Secondary
- **Achievement Emerald** (`#10B981`): สีของการสำเร็จ — ใช้เมื่อ status = "passed" หรือ "สอบผ่าน"
- **Progress Amber** (`#F59E0B`): สีของงานที่กำลังดำเนินการ — ใช้เมื่อ status = "in_progress"

### Neutral
- **Deep Ink** (`#030213`): near-black สำหรับ primary buttons, headings, foreground text
- **Clean Canvas** (`#ffffff`): พื้นหลังหลัก — ขาวสะอาด ไม่ warm-tinted
- **Quiet Gray** (`#ececf0`): muted surfaces — chip backgrounds, disabled states, secondary areas
- **Input Surface** (`#f3f3f5`): พื้น input field — เบากว่า Quiet Gray เล็กน้อย
- **Secondary Prose** (`#717182`): muted text — captions, subtitles, metadata
- **Alert Red** (`#d4183d`): destructive actions, error states, fail status only

### Named Rules
**The Growth-First Rule.** Growth Green (`#1E7A34`) เป็น brand identity — สามารถครอง 30-60% ของ hero surfaces ได้ แต่ในหน้าที่เน้นอ่าน (lesson, quiz) ให้ลดลงเหลือเพียง accent

**The No Warm Tint Rule.** Clean Canvas ต้องเป็น `#ffffff` จริงๆ ห้ามใช้ cream หรือ warm-tinted background ใดๆ ทั้งสิ้น

## 3. Typography: The Bilingual Professional

**Display/Body Font:** Inter (Latin), Sarabun (Thai) — load ด้วยกัน, use ด้วยกัน
**No secondary display font needed.** ระบบใช้ weight contrast (400 → 500 → 700) แทนการเพิ่ม typeface

**Character:** Inter กับ Sarabun เป็น pair ที่เข้ากันได้ดีเพราะทั้งคู่เป็น humanist sans — อ่านง่าย, เป็นกลาง, ไม่แย่งความสนใจจากเนื้อหา ความแตกต่างอยู่ที่ Sarabun มี x-height สูงกว่าในภาษาไทย ต้องให้ line-height ≥ 1.5 เสมอ

### Hierarchy
- **Display** (700, 1.5rem, lh 1.3, ls -0.01em): ชื่อผู้ใช้ใน hero, page titles สำคัญ
- **Headline** (500, 1.5rem, lh 1.5): section headings, card titles ระดับ h1
- **Title** (500, 1.25rem, lh 1.5): subsection headings, h2-level
- **Body** (400, 1rem, lh 1.5): เนื้อหาหลัก, คำอธิบาย — ใช้ Sarabun สำหรับย่อหน้าภาษาไทย
- **Label** (500, 0.875rem, lh 1.5): buttons, chips, badge text, metadata fields

### Named Rules
**The Thai Line-Height Rule.** ภาษาไทยต้องการ line-height ≥ 1.5 เสมอ — ห้าม 1.2 หรือ 1.3 สำหรับ Sarabun ไม่ว่าขนาดไหน

**The Weight-Before-Size Rule.** ใช้ font-weight เพื่อสร้าง hierarchy ก่อน — อย่าเพิ่มขนาดตัวอักษรถ้า weight 700 ยังไม่ได้ใช้

## 4. Elevation

ระบบนี้ใช้ **tonal layering เป็นหลัก, shadow เฉพาะ highlighted elements**

โดยทั่วไป: card ใช้ `border: 1px solid rgba(0,0,0,0.1)` แทน shadow — ทำให้ layout ดูสะอาดและไม่หนัก Shadows ปรากฏเฉพาะ stat cards และ elements ที่ต้องการ "float" บน background

### Shadow Vocabulary
- **Stat Shadow** (`0 8px 24px rgba(color, 0.35)`): ใช้กับ gradient stat cards เท่านั้น — แต่ละ card ใช้ shadow tone ของสีตัวเอง (green shadow สำหรับ green card, amber shadow สำหรับ amber card)
- **Hover Lift** (`0 4px 16px rgba(0,0,0,0.12)`): ใช้กับ course cards เมื่อ hover — subtle elevation เพื่อ feedback

### Named Rules
**The Flat-First Rule.** Surfaces เริ่มต้น flat เสมอ Shadow เป็น state response (hover, featured) ไม่ใช่ decoration

## 5. Components

### Buttons
- **Shape:** Gently curved edges (8px radius / `rounded.md`)
- **Primary (Dark):** Deep Ink bg, white text, padding 8px 16px — ใช้สำหรับ generic actions (ยืนยัน, บันทึก)
- **Primary (Green):** Growth Green bg, white text — ใช้สำหรับ learning actions (เข้าเรียน, เริ่มทำแบบทดสอบ)
- **Hover:** opacity 90% หรือ darken 10% — ไม่เปลี่ยน radius หรือ size
- **Focus:** `ring-[3px]` ที่ `ring/50` opacity — ชัดเจนสำหรับ keyboard navigation
- **Secondary:** Quiet Gray bg, Deep Ink text — ใช้สำหรับ secondary actions
- **Ghost:** transparent bg, Deep Ink text — ใช้ใน nav และ tertiary actions

### Cards
- **Corner Style:** Softly rounded (14px / `rounded.xl`)
- **Background:** Clean Canvas white
- **Shadow Strategy:** Border-only by default (`border: 1px solid rgba(0,0,0,0.1)`) — ดู Elevation section
- **Internal Padding:** 24px (spacing.lg) ทุกด้าน
- **Stat Cards:** ใช้ gradient bg + colored shadow — เป็นข้อยกเว้นของ border-only rule

### Status Badges
- **Shape:** Pill shape (`rounded.full`)
- **Passed (สอบผ่าน):** Achievement Emerald text on `#ECFDF5` bg
- **In Progress (กำลังเรียน):** Growth Green text on `#E8F5E9` bg
- **Failed (สอบไม่ผ่าน):** Alert Red text on `#FEF2F2` bg
- **Not Started (ยังไม่เริ่ม):** Secondary Prose text on Quiet Gray bg
- **Completed (เรียนครบ):** Progress Amber text on `#FFFBEB` bg

### Inputs / Fields
- **Style:** Input Surface bg (`#f3f3f5`), transparent border at rest, `rounded.md`
- **Focus:** border shifts to Ring color, `ring-[3px]` at `ring/50` — consistent กับ buttons
- **Height:** 36px standard
- **Placeholder:** Secondary Prose color (`#717182`) — ต้อง pass 4.5:1 contrast check

### Navigation / Sidebar
- **Background:** `oklch(0.985 0 0)` ≈ `#f9f9f9` — slightly off-white ให้แยกจาก content area
- **Active item:** Growth Green text/indicator
- **Hover:** Quiet Gray bg
- **Typography:** Label weight (500, 0.875rem)

### Progress Indicators
- **Linear Progress:** Growth Green fill บน Quiet Gray track — ใช้ MUI LinearProgress
- **Percentage text:** Label weight, Growth Green color เมื่อ > 0%

## 6. Do's and Don'ts

### Do:
- **Do** ใช้ Growth Green (`#1E7A34`) เป็น primary brand color สำหรับ learning actions และ hero surfaces
- **Do** ให้ line-height ≥ 1.5 กับ Sarabun ทุกขนาด
- **Do** ใช้ tonal/color badges สำหรับ status — ต้องเห็น status ได้โดยไม่ต้องอ่านข้อความ
- **Do** ใช้ `border: 1px solid rgba(0,0,0,0.1)` สำหรับ standard cards ก่อนใช้ shadow
- **Do** test contrast บน muted text (`#717182`) — minimum 4.5:1 บน white bg (ค่านี้ผ่าน AA)
- **Do** ใช้ weight contrast (400 → 500 → 700) เพื่อสร้าง hierarchy ก่อนเพิ่มขนาด
- **Do** ให้ spacing พอใจระหว่าง Thai text lines — อย่า compress

### Don't:
- **Don't** ใช้ cream, sand, beige, หรือ warm-tinted background (`#faf7f2`, `#fffef9`, `#f5f0e8` ฯลฯ) — เป็น generic AI design reflex ที่ต้องหลีกเลี่ยง
- **Don't** ใช้ purple/indigo gradient แบบ generic SaaS — `--primary: #030213` เป็น near-black ไม่ใช่ navy
- **Don't** ทำ UI ให้ดู childish — ไม่มี cartoon icon, bouncy animation, หรือ overly colorful palette
- **Don't** ใช้ Moodle-style dense layout — อย่า stack ทุกอย่างในหน้าเดียว ใช้ progressive disclosure
- **Don't** ใส่ shadow กับทุก card — shadow เป็นของ highlighted stat cards เท่านั้น
- **Don't** ใช้ border-left หรือ border-right หนากว่า 1px เป็น colored accent — ใช้ full border หรือ bg tint แทน
- **Don't** ใช้ gradient text (`background-clip: text`) — ใช้ solid color เท่านั้น
- **Don't** ใช้ Sarabun กับ line-height ต่ำกว่า 1.5 ไม่ว่ากรณีใด