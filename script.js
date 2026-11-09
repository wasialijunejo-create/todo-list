// script.js - To-Do List
// Every task is a small object: { id: 123, text: "Buy milk", done: false }
// All tasks live in the "tasks" array. Whenever it changes we save it and redraw the list.

const STORAGE_KEY = 'todo-tasks';

// ---------- Grab the page elements we need ----------
const form = document.getElementById('taskForm');
const input = document.getElementById('taskInput');
const list = document.getElementById('taskList');
const counter = document.getElementById('counter');
const emptyMessage = document.getElementById('emptyMessage');
const clearBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter');

let tasks = loadTasks();   // the list of tasks
let currentFilter = 'all'; // 'all', 'active' or 'completed'

// ---------- Saving and loading (localStorage keeps tasks after refresh) ----------
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return []; // storage blocked or data broken: start with an empty list
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // If saving fails the app still works, tasks just will not survive a refresh
  }
}

// ---------- Changing the tasks ----------
function addTask(text) {
  tasks.push({ id: Date.now(), text: text, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

// ---------- Drawing the list on the page ----------
function render() {
  list.replaceChildren(); // empty the list first

  // Pick which tasks to show for the current filter
  const visible = tasks.filter((t) => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'completed') return t.done;
    return true;
  });

  visible.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task' + (task.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as done');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text; // textContent is safe: it never runs HTML

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '×'; // the "x" symbol
    del.setAttribute('aria-label', 'Delete "' + task.text + '"');
    del.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, text, del);
    list.append(li);
  });

  // Update the counter, the empty message and the "clear" button
  const left = tasks.filter((t) => !t.done).length;
  counter.textContent = left + (left === 1 ? ' task left' : ' tasks left');
  emptyMessage.hidden = visible.length > 0;
  clearBtn.hidden = !tasks.some((t) => t.done);
}

// ---------- Events ----------
form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading
  const text = input.value.trim();
  if (text === '') return; // ignore empty tasks
  addTask(text);
  input.value = '';
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('active', b === button));
    render();
  });
});

clearBtn.addEventListener('click', clearCompleted);

// ---------- Start ----------
render();
