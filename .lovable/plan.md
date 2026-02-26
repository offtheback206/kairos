# Time-Boxed Day Planner

A minimalist productivity app that helps you stay focused by time-boxing your tasks with countdown timers.

## Pages & Layout

- **Single-page app** with a dark mode default, clean professional design
- Centered content area with max-width container for readability

## Features

### 1. Task Input Form

- Simple form at the top with a text input for task name and a duration picker (minutes/hours)
- "Add Task" button to append to the list
- Input validation to ensure both fields are filled

### 2. Task List

- Vertical list of tasks showing name and allocated duration
- Each task has a "Start" button and a "Delete" button
- Tasks can be reordered or removed
- Visual distinction between completed, active, and pending tasks

### 3. Active Countdown Timer

- When "Start" is clicked, a prominent countdown timer appears at the top of the page
- Circular progress ring that visually depletes as time runs out
- Only one timer can run at a time — starting a new one stops the current one
- Pause/Resume functionality on the active timer

### 4. Alert System

- When the timer reaches zero:
  - UI accent color shifts from blue to red (make these subtle colors)
  - The task is marked as completed
  - A toast notification appears prompting the user to move on

### 5. Local Storage Persistence

- All tasks (name, duration, completion status) are saved to localStorage
- Tasks survive browser refresh
- Active timer state is persisted

## Design Style

- Dark mode by default using Shadcn's dark theme tokens
- Minimalist layout with generous whitespace
- Lucide icons for all actions (Play, Pause, Trash, Plus, Clock)
- Progress ring as the central visual element during active timing
- Smooth color transitions for the alert state