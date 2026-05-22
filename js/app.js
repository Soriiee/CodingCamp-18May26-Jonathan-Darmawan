/* ═══════════════════════════════════════════════════════════════
   app.js  –  My Dashboard
   Features: Greeting, Focus Timer (custom duration), To-Do List
             (add / edit / done / delete / sort), Quick Links,
             Light/Dark mode
   Storage:  localStorage only
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ─────────────────────────────────────────
   1. GREETING & CLOCK
───────────────────────────────────────── */
function updateGreetingAndClock() {
  const now  = new Date();
  const hour = now.getHours();

  let greeting;
  if (hour >= 5  && hour < 12) greeting = '☀️ Good morning!';
  else if (hour >= 12 && hour < 17) greeting = '🌤️ Good afternoon!';
  else if (hour >= 17 && hour < 21) greeting = '🌆 Good evening!';
  else greeting = '🌙 Good night!';

  $('greeting').textContent = greeting;

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  $('datetime').textContent = `${dateStr}  •  ${timeStr}`;
}

updateGreetingAndClock();
setInterval(updateGreetingAndClock, 1000);

/* ─────────────────────────────────────────
   2. LIGHT / DARK MODE
───────────────────────────────────────── */
const themeToggleBtn = $('theme-toggle');
let currentTheme = loadLS('theme', 'light');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggleBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  saveLS('theme', theme);
  currentTheme = theme;
}

applyTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  applyTheme(currentTheme === 'light' ? 'dark' : 'light');
});

/* ─────────────────────────────────────────
   3. FOCUS TIMER  (challenge: custom duration)
───────────────────────────────────────── */
const timerDisplay    = $('timer-display');
const customMinInput  = $('custom-minutes');
const applyDurationBtn = $('apply-duration');
const startBtn        = $('timer-start');
const stopBtn         = $('timer-stop');
const resetBtn        = $('timer-reset');

let timerDuration = loadLS('timerDuration', 25); // minutes
let totalSeconds  = timerDuration * 60;
let remaining     = totalSeconds;
let timerInterval = null;
let timerRunning  = false;

customMinInput.value = timerDuration;

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(remaining);
}

renderTimer();

applyDurationBtn.addEventListener('click', () => {
  const val = parseInt(customMinInput.value, 10);
  if (isNaN(val) || val < 1 || val > 120) {
    alert('Please enter a value between 1 and 120 minutes.');
    return;
  }
  // Stop any running timer first
  clearInterval(timerInterval);
  timerRunning = false;

  timerDuration = val;
  totalSeconds  = val * 60;
  remaining     = totalSeconds;
  saveLS('timerDuration', timerDuration);
  renderTimer();
});

startBtn.addEventListener('click', () => {
  if (timerRunning) return;
  timerRunning = true;

  timerInterval = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.textContent = '00:00';
      // Simple audio cue using Web Audio API
      playBeep();
      return;
    }
    remaining--;
    renderTimer();
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  remaining = totalSeconds;
  renderTimer();
});

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (_) { /* audio not available */ }
}

/* ─────────────────────────────────────────
   4. TO-DO LIST  (challenge: sort tasks)
───────────────────────────────────────── */
const todoInput  = $('todo-input');
const todoAddBtn = $('todo-add');
const todoList   = $('todo-list');
const sortSelect = $('sort-select');

// Each task: { id, text, done, createdAt }
let tasks = loadLS('tasks', []);

function saveTasks() {
  saveLS('tasks', tasks);
}

function getSortedTasks() {
  const copy = [...tasks];
  const mode = sortSelect.value;

  if (mode === 'az') {
    copy.sort((a, b) => a.text.localeCompare(b.text));
  } else if (mode === 'za') {
    copy.sort((a, b) => b.text.localeCompare(a.text));
  } else if (mode === 'done') {
    copy.sort((a, b) => Number(a.done) - Number(b.done));
  } else {
    // default: newest first (highest id first)
    copy.sort((a, b) => b.id - a.id);
  }
  return copy;
}

function renderTasks() {
  todoList.innerHTML = '';
  const sorted = getSortedTasks();

  if (sorted.length === 0) {
    const empty = document.createElement('li');
    empty.style.cssText = 'text-align:center;color:var(--text-muted);font-size:.85rem;padding:12px 0;';
    empty.textContent = 'No tasks yet. Add one above!';
    todoList.appendChild(empty);
    return;
  }

  sorted.forEach((task) => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'todo-checkbox';
    cb.checked = task.done;
    cb.addEventListener('change', () => toggleDone(task.id));

    // Text span
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task.text;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-task';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(task.id, li, span));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-task delete';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  tasks.push({ id: Date.now(), text, done: false, createdAt: Date.now() });
  saveTasks();
  renderTasks();
  todoInput.value = '';
  todoInput.focus();
}

function toggleDone(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function startEdit(id, li, span) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  // Replace span with input
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-edit-input';
  input.value = task.text;
  li.replaceChild(input, span);
  input.focus();

  // Replace Edit button with Save button
  const actions = li.querySelector('.todo-actions');
  const editBtn = actions.querySelector('.btn-task:not(.delete)');
  editBtn.textContent = 'Save';

  const saveHandler = () => {
    const newText = input.value.trim();
    if (!newText) return;
    task.text = newText;
    saveTasks();
    renderTasks();
  };

  editBtn.replaceEventListener = true;
  editBtn.onclick = saveHandler;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveHandler();
    if (e.key === 'Escape') renderTasks(); // cancel
  });
}

todoAddBtn.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
sortSelect.addEventListener('change', renderTasks);

renderTasks();

/* ─────────────────────────────────────────
   5. QUICK LINKS
───────────────────────────────────────── */
const linkNameInput = $('link-name-input');
const linkUrlInput  = $('link-url-input');
const linkAddBtn    = $('link-add');
const linksGrid     = $('links-grid');

// Each link: { id, name, url }
let links = loadLS('quickLinks', []);

function saveLinks() {
  saveLS('quickLinks', links);
}

function renderLinks() {
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text-muted);font-size:.85rem;';
    empty.textContent = 'No links yet. Add one above!';
    linksGrid.appendChild(empty);
    return;
  }

  links.forEach((link) => {
    const chip = document.createElement('a');
    chip.className = 'link-chip';
    chip.href = link.url;
    chip.target = '_blank';
    chip.rel = 'noopener noreferrer';

    const label = document.createElement('span');
    label.textContent = link.name;

    const delBtn = document.createElement('button');
    delBtn.className = 'link-delete';
    delBtn.textContent = '✕';
    delBtn.title = 'Remove link';
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteLink(link.id);
    });

    chip.appendChild(label);
    chip.appendChild(delBtn);
    linksGrid.appendChild(chip);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();

  if (!name || !url) {
    alert('Please fill in both the label and the URL.');
    return;
  }

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

function deleteLink(id) {
  links = links.filter((l) => l.id !== id);
  saveLinks();
  renderLinks();
}

linkAddBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });

renderLinks();
