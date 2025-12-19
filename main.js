const API_URL = 'https://todo-api-tester.up.railway.app/api/todos';
// ======================
// ELEMENTS
// ======================
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');

// FILTER STATE
let allTodos = [];
let currentFilter = 'all'; // all | active | completed

// EMPTY STATE TEMPLATE
const emptyStateTemplate = `
    <div id="empty-state" class="text-center py-10 text-gray-500">
        <i class="fas fa-clipboard-list text-4xl mb-4 text-gray-300"></i>
        <p class="text-lg">Tidak ada tugas</p>
        <p class="text-sm mt-2">Tambahkan tugas baru untuk memulai</p>
    </div>
`;

// ======================
// READ (GET)
// ======================
async function getTodos() {
    try {
        const res = await fetch(API_URL);
        allTodos = await res.json();
        applyFilter();
    } catch (err) {
        console.error('Gagal mengambil todo:', err);
    }
}

// ======================
// CREATE (POST)
// ======================
async function createTodo(title) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        todoInput.value = '';
        getTodos();
    } catch (err) {
        console.error('Gagal menambah todo:', err);
    }
}

// ======================
// UPDATE (PUT)
// ======================
async function updateTodo(id, isCompleted) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: isCompleted ? 1 : 0 })
        });

        getTodos();
    } catch (err) {
        console.error('Gagal update todo:', err);
    }
}

// ======================
// DELETE (DELETE)
// ======================
async function deleteTodo(id) {
    if (!confirm('Hapus tugas ini?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        getTodos();
    } catch (err) {
        console.error('Gagal hapus todo:', err);
    }
}

// ======================
// CLEAR COMPLETED
// ======================
async function clearCompleted() {
    const completedTodos = allTodos.filter(t => t.is_completed === 1);
    if (!completedTodos.length) return alert('Tidak ada tugas yang selesai');

    if (!confirm('Hapus semua tugas yang selesai?')) return;

    try {
        await Promise.all(
            completedTodos.map(t => fetch(`${API_URL}/${t.id}`, { method: 'DELETE' }))
        );
        getTodos();
    } catch (err) {
        console.error('Gagal menghapus tugas selesai:', err);
    }
}

// ======================
// FILTER LOGIC
// ======================
function applyFilter() {
    let filteredTodos = [];

    if (currentFilter === 'active') {
        filteredTodos = allTodos.filter(t => t.is_completed === 0);
    } else if (currentFilter === 'completed') {
        filteredTodos = allTodos.filter(t => t.is_completed === 1);
    } else {
        filteredTodos = allTodos;
    }

    renderTodos(filteredTodos);
}

function setActiveFilter(filter) {
    currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white', 'active');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });

    const activeBtn = document.getElementById(`filter-${filter}`);
    activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    activeBtn.classList.add('bg-blue-500', 'text-white', 'active');

    applyFilter();
}

// ======================
// RENDER UI
// ======================
function renderTodos(todos) {
    todoList.innerHTML = '';

    if (!todos.length) {
        todoList.innerHTML = emptyStateTemplate;
        updateTaskCount();
        return;
    }

    todos.forEach(todo => renderTodo(todo));
    updateTaskCount();
}

function renderTodo(todo) {
    const div = document.createElement('div');
    div.className = `
        flex items-center justify-between p-3 mb-2
        bg-white border rounded-lg shadow-sm
    `;

    div.innerHTML = `
        <div class="flex items-center gap-3">
            <input 
                type="checkbox"
                class="w-5 h-5"
                ${todo.is_completed ? 'checked' : ''}
                onchange="updateTodo(${todo.id}, this.checked)"
            >
            <span class="${todo.is_completed ? 'line-through text-gray-400' : ''}">
                ${todo.title}
            </span>
        </div>

        <button
            onclick="deleteTodo(${todo.id})"
            class="text-red-500 hover:text-red-600"
        >
            <i class="fas fa-trash"></i>
        </button>
    `;

    todoList.appendChild(div);
}

// ======================
// TASK COUNT
// ======================
function updateTaskCount() {
    const remaining = allTodos.filter(t => t.is_completed === 0).length;
    taskCount.textContent = `${remaining} tugas tersisa`;
}

// ======================
// EVENT LISTENERS
// ======================
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (!title) return;
    createTodo(title);
});

document.getElementById('filter-all').addEventListener('click', () => setActiveFilter('all'));
document.getElementById('filter-active').addEventListener('click', () => setActiveFilter('active'));
document.getElementById('filter-completed').addEventListener('click', () => setActiveFilter('completed'));

clearCompletedBtn.addEventListener('click', clearCompleted);

// ======================
// INITIAL LOAD
// ======================
document.addEventListener('DOMContentLoaded', getTodos);