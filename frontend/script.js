const API_URL = 'http://localhost:5000/api/tasks';

const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const welcomeUser = document.getElementById('welcome-user');
const logoutBtn = document.getElementById('logout-btn');

let currentFilter = 'all';

// Redirect to login if no token is present
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Show the logged-in user's name
const userName = localStorage.getItem('userName');
if (userName) {
  welcomeUser.textContent = `Hi, ${userName}`;
}

// Logout handler
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
});

// Helper: build headers with the auth token attached
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };
}

// Fetch tasks belonging to the logged-in user
async function fetchTasks() {
  try {
    const url = currentFilter === 'all' ? API_URL : `${API_URL}?status=${currentFilter}`;
    const res = await fetch(url, { headers: authHeaders() });

    if (res.status === 401) {
      // Token missing/expired - send back to login
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

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
      headers: authHeaders(),
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
      headers: authHeaders(),
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
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
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
