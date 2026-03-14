# Dashboard Design System — Matrix Theme

> **Author:** Mouse (UI/UX Designer)
> **Issue:** #111
> **Status:** Active specification
> **Consumer:** Trinity (Full-Stack Implementation)

---

## 1. Color Palette

All colors follow the established Syntax Sorcery Matrix aesthetic, extending the landing page palette into dashboard-specific semantics.

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `--bg-primary` | `#0a0a0a` | Page background (deep black) |
| `--bg-card` | `rgba(0, 255, 65, 0.05)` | Card/widget background |
| `--border-card` | `rgba(0, 255, 65, 0.2)` | Card border |
| `--text-primary` | `#00ff41` | Primary text, headings (Matrix green) |
| `--text-secondary` | `#00cc33` | Secondary text, labels (darker green) |
| `--text-body` | `#e0e0e0` | Body text, descriptions |
| `--text-muted` | `#666666` | Timestamps, helper text |
| `--accent` | `#00e5ff` | Highlights, links, interactive elements (cyan) |
| `--status-success` | `#00ff41` | Healthy / complete |
| `--status-warning` | `#ffd700` | In-progress / needs attention (amber) |
| `--status-error` | `#ff4444` | Failed / blocked (red) |
| `--status-idle` | `#666666` | Inactive / waiting |
| `--glass-bg` | `rgba(17, 17, 17, 0.8)` | Glass effect overlay |
| `--glass-border` | `rgba(255, 255, 255, 0.06)` | Glass effect border |
| `--glass-blur` | `blur(10px)` | Backdrop blur for glass effect |

### Glass Effect Recipe

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
}
```

---

## 2. Typography

| Element | Font | Weight | Size | Notes |
|---------|------|--------|------|-------|
| Page title | `'JetBrains Mono', 'Fira Code', monospace` | 700 | 28px | Terminal feel, text-glow applied |
| Section heading | `'JetBrains Mono', 'Fira Code', monospace` | 600 | 20px | Monospace for dashboard identity |
| KPI number | `'JetBrains Mono', 'Fira Code', monospace` | 700 | 48px | Large bold with glow effect |
| KPI label | `system-ui, -apple-system, sans-serif` | 400 | 14px | Clean readable body font |
| Body text | `system-ui, -apple-system, sans-serif` | 400 | 15px | Standard body copy |
| Timestamps | `'JetBrains Mono', monospace` | 400 | 12px | Monospace for alignment |
| Badge / pill text | `system-ui, sans-serif` | 600 | 12px | Compact, uppercase |

### KPI Glow Effect

```css
.kpi-number {
  font-family: var(--font-mono);
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow:
    0 0 10px rgba(0, 255, 65, 0.6),
    0 0 30px rgba(0, 255, 65, 0.3),
    0 0 60px rgba(0, 255, 65, 0.1);
}
```

---

## 3. Animation Guidelines

All animations must respect `prefers-reduced-motion: reduce`. When reduced motion is preferred, disable all animations and transitions.

### 3.1 Pulse — Active Repo Glow

Active/healthy repos get a subtle breathing glow to indicate liveness.

```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(0, 255, 65, 0.15); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 65, 0.35); }
}

.repo-active {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### 3.2 Data Refresh — Fade-In Transition

New data values fade in smoothly when refreshed.

```css
.data-value {
  transition: opacity 0.3s ease, color 0.3s ease;
}

.data-value.updating {
  opacity: 0;
}
```

### 3.3 Pipeline Flow — Left-to-Right

Items moving through pipeline stages animate from left to right.

```css
@keyframes flow-right {
  from { transform: translateX(-8px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.pipeline-item-enter {
  animation: flow-right 0.4s ease-out;
}
```

### 3.4 Status Transitions

Status changes (success → warning → error) use smooth color transitions.

```css
.status-indicator {
  transition: background-color 0.5s ease, box-shadow 0.5s ease;
}
```

### 3.5 Matrix Rain Background (Optional)

CSS-only decorative background effect. Use sparingly — only on the main dashboard background, never inside content areas.

```css
@keyframes matrix-rain {
  0% { transform: translateY(-100%); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

.matrix-rain-column {
  position: fixed;
  top: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: rgba(0, 255, 65, 0.15);
  writing-mode: vertical-rl;
  animation: matrix-rain 8s linear infinite;
  pointer-events: none;
  z-index: 0;
}
```

### 3.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. Component Specs

### 4.1 Repo Card

The primary unit for displaying repository status.

| Property | Value |
|----------|-------|
| Dimensions | 240 × 160px (min-width, flexible) |
| Background | Glass card (`--bg-card` + `--glass-blur`) |
| Border | 1px solid `--border-card` |
| Border radius | 12px |
| Padding | 20px |
| Status dot | 8px circle, top-right (12px inset), color = status color |
| Content | Repo name (mono, 16px bold) → last activity (muted, 12px) → mini-stats row |
| Hover | translateY(-2px), border brightens to `rgba(0, 255, 65, 0.4)`, subtle glow |
| Active state | `pulse-glow` animation |

**Layout:**

```
┌──────────────────────────── 240px ─┐
│                              ● (status dot)
│  repo-name                         │
│  Last activity: 2m ago             │
│                                    │
│  ⭐ 12   🔀 3   ✅ 47 tests       │
└────────────────────────────────────┘
```

### 4.2 KPI Widget

Large metric display for key performance indicators.

| Property | Value |
|----------|-------|
| Layout | Vertical stack: number → label → trend |
| Number | 48px, mono, bold, `--text-primary` with glow |
| Label | 14px, system-ui, `--text-secondary` |
| Trend arrow | ↑ (green), ↓ (red), → (muted), 16px |
| Background | Glass card |
| Padding | 24px |
| Min-width | 180px |

**Layout:**

```
┌─────────────────────┐
│        247           │  ← KPI number (glowing)
│    Tests Passing     │  ← label
│        ↑ +12         │  ← trend (green)
└─────────────────────┘
```

### 4.3 Pipeline Stage

Visual representation of work items flowing through stages.

| Property | Value |
|----------|-------|
| Shape | Rounded pill (border-radius: 20px) |
| Padding | 8px 16px |
| Background | Status color at 15% opacity |
| Border | 1px solid status color at 40% opacity |
| Count badge | 20px circle, solid status color, white text, top-right overlap |
| Connecting arrows | `→` between stages, `--text-muted` color |
| Font | 13px, system-ui, semi-bold |

**Layout:**

```
 ┌──────────┐     ┌──────────┐     ┌──────────┐
 │ Backlog ③│ ──→ │ Active ②│ ──→ │  Done ⑫ │
 └──────────┘     └──────────┘     └──────────┘
   (muted)         (amber)          (green)
```

### 4.4 Activity Feed Item

Real-time activity stream entries.

| Property | Value |
|----------|-------|
| Layout | Single row: timestamp + emoji + description |
| Timestamp | Mono, 12px, `--text-muted`, fixed 60px width |
| Emoji | 16px, inline |
| Description | 14px, system-ui, `--text-body` |
| Separator | 1px solid `rgba(255, 255, 255, 0.04)` |
| Entry animation | `fade-in` 0.3s on new items |
| Padding | 12px 16px |
| Max visible | 10 items, scrollable overflow |

**Layout:**

```
  14:32  🚀  PR #87 merged: Add achievement system
  14:28  ✅  All 247 tests passing
  14:15  🔀  Branch squad/75-gameplay created
  14:02  ⚠️  Pipeline stage blocked: code review
```

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Grid | Notes |
|-----------|-------|------|-------|
| Desktop | > 1024px | 3-column grid | Full dashboard, all widgets visible |
| Tablet | 768 – 1024px | 2-column grid | KPIs stack to 2-wide, cards wrap |
| Mobile | < 768px | Single column | Everything stacks vertically, full-width cards |

### Grid System

```css
.dashboard-grid {
  display: grid;
  gap: 20px;
  padding: 20px;
}

/* Desktop */
@media (min-width: 1025px) {
  .dashboard-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile */
@media (max-width: 767px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}
```

---

## 6. Accessibility

- **Contrast:** All text meets WCAG AA minimum (4.5:1 for body, 3:1 for large text). `#00ff41` on `#0a0a0a` = 10.5:1 ✅
- **Reduced motion:** All animations disabled via `prefers-reduced-motion`
- **Focus states:** Visible focus ring using `--accent` color (2px solid, 2px offset)
- **Status indicators:** Never rely on color alone — pair with icons or text labels (●, ⚠, ✗)
- **Screen reader:** KPI widgets include `aria-label` with full context (e.g., "247 tests passing, up 12")

---

## 7. Design Tokens Reference

The CSS custom properties implementing this system live in:

```
site/src/styles/design-tokens.css
```

Import this file before `global.css` to ensure tokens are available throughout the application.

---

## 8. Relationship to Existing Styles

This design system extends the existing `global.css` landing page theme. Shared foundations:
- Same `#0a0a0a` background, `#00ff41` primary green, glass utility
- Same font stack (`JetBrains Mono` + system fonts)
- Same animation patterns (`fade-in`, `glow-pulse`)

**New additions** specific to the dashboard:
- KPI glow effect (stronger text-shadow for large numbers)
- Pipeline flow animation (left-to-right)
- Status color system (success/warning/error/idle)
- Responsive grid breakpoints
- Activity feed fade-in pattern
- Data refresh transitions
