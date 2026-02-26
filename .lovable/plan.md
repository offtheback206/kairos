

# Kairos Engine Enhancement Plan

This plan adds three major capabilities: enhanced task data (notes + date scheduler), overtime tracking with split timer UX, and a performance analytics dashboard.

---

## 1. Data Schema and Input Updates

### Task Interface (`src/hooks/use-tasks.ts`)
- Add `notes: string | null` field to the `Task` interface
- Add `overtimeSeconds: number | null` field to track overtime duration separately
- Update `addTask` to accept a `notes` parameter
- Default `plannedDate` to today's date (`format(new Date(), "yyyy-MM-dd")`) when not specified

### Task Form (`src/components/TaskForm.tsx`)
- Add a collapsible `Textarea` labeled "Focus Notes" below the existing fields (optional, multi-line)
- Change the date picker default from "Optional" to today's date
- Pass `notes` through to `onAdd`

### Task List (`src/components/TaskList.tsx`)
- Show a small notes indicator icon on tasks that have notes
- Optionally show a truncated preview of notes on hover or expand

---

## 2. Overtime Logic and UX

### Timer State (`src/hooks/use-tasks.ts`)
- Add `overtimeSeconds: number` to `TimerState` (default 0)
- Modify countdown logic: when `remainingSeconds` hits 0, set `isComplete: true` but do NOT auto-complete the task
- When in overtime mode (`isComplete && taskId && !dismissed`), count UP each second by incrementing `overtimeSeconds`
- Add `completeTask(id: string)` callback that:
  - Calculates `actualMinutes = Math.round((totalSeconds + overtimeSeconds) / 60)`
  - Sets task status to "completed", stores `completedDate`, `actualMinutes`, and `overtimeSeconds`
  - Resets the timer
- Remove the current `useEffect` that auto-completes on `timer.isComplete`

### Timer Display (`src/components/TimerDisplay.tsx`)
- When `isComplete` (overtime mode):
  - Ring turns red, timer displays overtime counting UP (from `overtimeSeconds`)
  - Show label "OVERTIME" instead of remaining time
  - Replace Pause/Resume with two buttons: **"Complete Task"** (primary) and **"Keep Going"** (already implied by overtime running)
- When timer reaches 00:00 initially, show a brief prompt with "Complete Task" and "Enter Overtime" buttons
- Wire "Complete Task" to the new `completeTask` callback
- "Dismiss" remains available to cancel without completing

---

## 3. Performance Analytics Dashboard

### New Component: `src/components/Analytics.tsx`
- Three KPI cards at the top:
  - **Time Accuracy**: percentage of completed tasks where `actualMinutes <= durationMinutes`
  - **Total Focused Time**: sum of all `actualMinutes` across completed tasks
  - **Average Delta**: mean of `(actualMinutes - durationMinutes)` across completed tasks, shown as +/- minutes
- Bar chart (using `recharts` already installed) showing last 7 days of completed tasks:
  - X-axis: date
  - Stacked bars: Amber fill for planned time, Red fill for overtime portion
  - Uses the existing `ChartContainer` and chart components

### Page Integration (`src/pages/Index.tsx`)
- Add Tabs component (already available from shadcn) with two tabs: **"Tasks"** and **"Analytics"**
- Tasks tab contains the existing timer, form, and task list
- Analytics tab renders the new `Analytics` component
- Pass completed tasks data to Analytics

---

## Technical Summary

| File | Action |
|------|--------|
| `src/hooks/use-tasks.ts` | Add `notes`, `overtimeSeconds` to Task; add overtime counting logic; add `completeTask`; remove auto-complete effect |
| `src/components/TaskForm.tsx` | Add Textarea for notes; default date to today |
| `src/components/TaskList.tsx` | Show notes indicator; pass overtime data |
| `src/components/TimerDisplay.tsx` | Overtime count-up display; "Complete Task" / "Enter Overtime" buttons |
| `src/components/Analytics.tsx` | **New file** -- KPI cards + 7-day bar chart |
| `src/pages/Index.tsx` | Add Tabs for Tasks/Analytics views; wire `completeTask` |

No new dependencies needed -- `recharts`, `date-fns`, Textarea, Tabs, and Calendar are all already available.
