// -----------------------------------------------------
// Simple To-Do List App — Interactive Functionality
// File: script.js (Part 3/3)
// -----------------------------------------------------

// Wait for DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', () => {
  // ---------- DOM element references ----------
  const taskInput = document.getElementById('taskInput');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskList = document.getElementById('taskList');
  const filterAllBtn = document.getElementById('filterAll');
  const filterActiveBtn = document.getElementById('filterActive');
  const filterCompletedBtn = document.getElementById('filterCompleted');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const remainingCountSpan = document.getElementById('remainingCount');

  // ---------- App State ----------
  let tasks = [];          // array of task objects: { id, text, completed }
  let currentFilter = 'all';   // 'all', 'active', 'completed'

  // ---------- Helper Functions ----------
  
  // Save tasks to localStorage (persistence)
  function saveTasksToLocalStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }

  // Load tasks from localStorage on startup
  function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('todoTasks');
    if (storedTasks) {
      try {
        tasks = JSON.parse(storedTasks);
        // ensure each task has valid fields (migration for older format)
        tasks = tasks.filter(task => task && typeof task === 'object').map(task => ({
          id: task.id || Date.now() + Math.random(),
          text: task.text || 'untitled',
          completed: task.completed === true
        }));
      } catch(e) {
        console.warn("Failed to parse stored tasks", e);
        tasks = [];
      }
    } else {
      // Default sample tasks for demonstration (gentle onboarding)
      tasks = [
        { id: 'sample1', text: 'Review project goals', completed: false },
        { id: 'sample2', text: 'Write documentation', completed: true },
        { id: 'sample3', text: 'Test to-do app features', completed: false }
      ];
    }
    renderTasks();
  }

  // Update remaining (active) tasks counter
  function updateRemainingCounter() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    remainingCountSpan.textContent = activeTasks;
  }

  // Core render function: applies current filter and displays tasks
  function renderTasks() {
    // Clear the task list element
    taskList.innerHTML = '';
    
    // Filter tasks based on currentFilter
    let filteredTasks = [];
    if (currentFilter === 'all') {
      filteredTasks = tasks;
    } else if (currentFilter === 'active') {
      filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
      filteredTasks = tasks.filter(task => task.completed);
    }
    
    // If no tasks after filtering, show empty state message
    if (filteredTasks.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'empty-state';
      let messageText = '';
      if (tasks.length === 0) {
        messageText = '✨ No tasks yet. Add one above! ✨';
      } else if (currentFilter === 'active') {
        messageText = '🏆 All caught up! No active tasks.';
      } else if (currentFilter === 'completed') {
        messageText = '📭 No completed tasks yet.';
      } else {
        messageText = '📋 Your to-do list is empty.';
      }
      emptyMessage.textContent = messageText;
      taskList.appendChild(emptyMessage);
    } else {
      // Loop through filtered tasks and create DOM elements
      filteredTasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
      });
    }
    
    // Update remaining tasks counter (active tasks count)
    updateRemainingCounter();
    
    // Save tasks to localStorage after each render (data persistence)
    saveTasksToLocalStorage();
  }
  
  // Create a DOM element for a single task (with event listeners)
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) {
      li.classList.add('completed');
    }
    li.dataset.id = task.id;
    
    // Left part: checkbox + text (wrapper for toggling)
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    // Custom checkbox circle
    const checkSpan = document.createElement('span');
    checkSpan.className = 'custom-checkbox';
    
    // Task text span
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    
    taskContent.appendChild(checkSpan);
    taskContent.appendChild(textSpan);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    
    // Assemble list item
    li.appendChild(taskContent);
    li.appendChild(deleteBtn);
    
    // ----- Event Listeners for this task -----
    // Toggle completion (click on content or checkbox area)
    taskContent.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskCompletion(task.id);
    });
    
    // Delete task event
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTaskById(task.id);
    });
    
    return li;
  }
  
  // Toggle task completed status by id
  function toggleTaskCompletion(id) {
    const taskIndex = tasks.findIndex(task => task.id == id);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      renderTasks();    // re-render after state change
    }
  }
  
  // Delete task by id
  function deleteTaskById(id) {
    tasks = tasks.filter(task => task.id != id);
    renderTasks();
  }
  
  // Add a new task
  function addNewTask() {
    let newTaskText = taskInput.value.trim();
    if (newTaskText === '') {
      // subtle feedback: input shake or just ignore? Provide small friendly alert
      taskInput.style.border = '1px solid #f0b3b3';
      taskInput.style.backgroundColor = '#fff8f0';
      setTimeout(() => {
        taskInput.style.border = '';
        taskInput.style.backgroundColor = '';
      }, 500);
      return;
    }
    
    // Create unique ID (timestamp + random)
    const newId = Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const newTask = {
      id: newId,
      text: newTaskText,
      completed: false
    };
    
    tasks.push(newTask);
    taskInput.value = '';   // clear input field
    // if current filter is 'completed', showing only completed tasks could hide new active one.
    // Better to set filter to 'all' to make new task visible for better UX.
    if (currentFilter === 'completed') {
      currentFilter = 'all';
      updateActiveFilterButton('all');
    }
    renderTasks();
    // auto-focus input for quick consecutive adds
    taskInput.focus();
  }
  
  // Delete all completed tasks
  function clearCompletedTasks() {
    const hadCompleted = tasks.some(task => task.completed === true);
    if (!hadCompleted) {
      // minor visual feedback: no completed tasks
      const clearBtn = clearCompletedBtn;
      clearBtn.style.transform = 'scale(0.97)';
      setTimeout(() => { clearBtn.style.transform = ''; }, 150);
      return;
    }
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
  }
  
  // Update active state of filter buttons and apply filter
  function setFilter(filterType) {
    currentFilter = filterType;
    updateActiveFilterButton(filterType);
    renderTasks();
  }
  
  // Highlight the active filter button in the UI
  function updateActiveFilterButton(filterType) {
    // Remove active class from all filter buttons
    const allFilterBtns = [filterAllBtn, filterActiveBtn, filterCompletedBtn];
    allFilterBtns.forEach(btn => {
      btn.classList.remove('active-filter');
    });
    
    // Add active class to the corresponding button
    if (filterType === 'all') {
      filterAllBtn.classList.add('active-filter');
    } else if (filterType === 'active') {
      filterActiveBtn.classList.add('active-filter');
    } else if (filterType === 'completed') {
      filterCompletedBtn.classList.add('active-filter');
    }
  }
  
  // Handle 'Enter' key in input field
  function handleInputKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addNewTask();
    }
  }
  
  // ------------------------------------------------------------------
  // EVENT LISTENERS (UI interactions)
  // ------------------------------------------------------------------
  
  // Add task button click
  addTaskBtn.addEventListener('click', addNewTask);
  
  // Press Enter inside input field
  taskInput.addEventListener('keypress', handleInputKeyPress);
  
  // Filter buttons
  filterAllBtn.addEventListener('click', () => setFilter('all'));
  filterActiveBtn.addEventListener('click', () => setFilter('active'));
  filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
  
  // Clear completed tasks
  clearCompletedBtn.addEventListener('click', clearCompletedTasks);
  
  // Optional: clear input field border after focus again
  taskInput.addEventListener('focus', () => {
    taskInput.style.border = '';
    taskInput.style.backgroundColor = '';
  });
  
  // Initial load: get tasks from localStorage or default sample tasks
  loadTasksFromLocalStorage();
  
  // Ensure filter buttons reflect default filter = 'all' after loading
  // (loadTasksFromLocalStorage -> renderTasks uses currentFilter = 'all' by default)
  // But we set UI active state explicit:
  updateActiveFilterButton('all');
  
  // Final sync: if there were tasks loaded, counter updates already inside renderTasks.
  // Edge: set focus to input on load for better UX.
  taskInput.focus();
});