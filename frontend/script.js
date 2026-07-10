const API_URL = 'http://localhost:5000/api/tasks';

const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

// Fetch tasks from backend and render them
async function fetchTasks() {
  try {
    const url = currentFilter === 'all' ? API_URL : `${API_URL}?status=${currentFilter}`;
    const res = await fetch(url);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    taskList.innerHTML = `<p class="empty-state">Could not load tasks. Is the backend running?</p>`;
    console.error(err);
  }
}

// Render task list to the DOM
function renderTasks(tasks) {
  if (!tasks.length) {
    taskList.innerHTML = `<p class="empty-state">No tasks here yet.</p>`;
    return;
  }

  taskList.innerHTML = tasks.map(task => `
    <div class="task-card ${task.priority}">
      <h3>${task.title}</h3>
      ${task.description ? `<p>${task.description}</p>` : ''}
      <div class="task-meta">
        <span>Status: ${task.status} | Priority: ${task.priority}</span>
        <div class="task-actions">
          ${task.status !== 'in-progress' ? `<button class="btn-progress" onclick="updateStatus('${task._id}', 'in-progress')">In Progress</button>` : ''}
          ${task.status !== 'completed' ? `<button class="btn-complete" onclick="updateStatus('${task._id}', 'completed')">Complete</button>` : ''}
          <button class="btn-delete" onclick="deleteTask('${task._id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Add a new task
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newTask = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    priority: document.getElementById('priority').value,
    dueDate: document.getElementById('dueDate').value || null
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    taskForm.reset();
    fetchTasks();
  } catch (err) {
    console.error(err);
  }
});

// Update task status
async function updateStatus(id, status) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchTasks();
  } catch (err) {
    console.error(err);
  }
}

// Delete a task
async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
  } catch (err) {
    console.error(err);
  }
}

// Filter button handling
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    fetchTasks();
  });
});

// Initial load
fetchTasks();
