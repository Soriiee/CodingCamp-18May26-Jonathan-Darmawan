---
inclusion: always
---

# Feature Reference

## 1. Greeting & Clock
- Shows current time and date, updates every second via `setInterval`
- Greeting changes based on hour:
  - 05:00–11:59 → "Good morning!"
  - 12:00–16:59 → "Good afternoon!"
  - 17:00–20:59 → "Good evening!"
  - 21:00–04:59 → "Good night!"

## 2. Focus Timer
- Default session: 25 minutes
- **Challenge: Custom Pomodoro duration** — user can set 1–120 min via number input + Apply button
- Controls: Start, Stop, Reset
- Plays a Web Audio API beep when timer reaches 00:00
- Duration preference saved to `localStorage` key `timerDuration`

## 3. To-Do List
- Add tasks via text input (Enter key or Add button)
- Inline edit (click Edit → type → Save or press Enter, Escape to cancel)
- Mark done via checkbox (strikethrough style)
- Delete individual tasks
- **Challenge: Sort tasks** — dropdown with 4 modes:
  - Default (newest first)
  - A → Z
  - Z → A
  - Done last
- Tasks saved to `localStorage` key `tasks`
- Task shape: `{ id: number, text: string, done: boolean, createdAt: number }`

## 4. Quick Links
- Add a label + URL, opens in new tab (`target="_blank"`)
- Auto-prepends `https://` if missing
- Delete individual links via ✕ button on each chip
- Links saved to `localStorage` key `quickLinks`
- Link shape: `{ id: number, name: string, url: string }`

## 5. Light / Dark Mode (Challenge)
- Toggle button in top bar (🌙 / ☀️)
- Applies `data-theme="light"` or `data-theme="dark"` on `<html>`
- All colors driven by CSS custom properties in `:root` and `[data-theme="dark"]`
- Preference saved to `localStorage` key `theme`

## localStorage Keys Summary
| Key             | Type    | Description                  |
|-----------------|---------|------------------------------|
| `theme`         | string  | `"light"` or `"dark"`        |
| `timerDuration` | number  | Session length in minutes    |
| `tasks`         | array   | To-do task objects           |
| `quickLinks`    | array   | Quick link objects           |
