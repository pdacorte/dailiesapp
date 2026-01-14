// Initialize database connection and global variables
let db
const dbName = "dailiesDB"
const dbVersion = 3
let currentChart = null
let currentPieChart = null
let expectedTasksPerDay = 1

// Time tracker variables
let timerInterval = null
let timerStartTime = null
let isTimerRunning = false
let currentTaskName = ""

// Current view state
let currentView = "dashboard"

// Update user info display from Google Drive authentication
function updateUserInfoDisplay(userInfo) {
  const userNameElement = document.getElementById('user-name');
  const userEmailElement = document.getElementById('user-email');
  const userAvatarElement = document.getElementById('user-avatar');
  
  if (userInfo && userInfo.name && userInfo.email) {
    // Update name and email
    userNameElement.textContent = userInfo.name;
    userEmailElement.textContent = userInfo.email;
    
    // Update avatar if picture is available
    if (userInfo.picture) {
      userAvatarElement.style.backgroundImage = `url('${userInfo.picture}')`;
      userAvatarElement.classList.remove('bg-gradient-to-br', 'from-blue-400', 'to-purple-500');
    } else {
      // Reset to gradient if no picture
      userAvatarElement.style.backgroundImage = '';
      userAvatarElement.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-purple-500');
    }
  } else {
    // Reset to defaults if no user info
    userNameElement.textContent = 'User';
    userEmailElement.textContent = 'user@email.com';
    userAvatarElement.style.backgroundImage = '';
    userAvatarElement.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-purple-500');
  }
}

// Array of motivational quotes to display
const motivationalQuotes = [
  {
    text: "It's okay to be wrong when you iterate quickly.",
    author: "Altman",
  },
  {
    text: "Execution is the best anxiety reliever - Adopt a do it now mentality.",
    author: "X",
  },
  {
    text: "The distance between dreams and reality is called discipline.",
    author: "Paulo Coelho",
  },
  {
    text: "The secret of genius is to carry the spirit of the child into old age, which means never losing your enthusiasm.",
    author: "Aldous Huxley",
  },
  {
    text: "Routine, in an intelligent man, is a sign of ambition.",
    author: "W. H. Auden",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "Discipline is choosing between what  you want now and what you want most.",
    author: "Abraham Lincoln",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "He who cannot obey himself will be commanded. That is the nature of living creatures.",
    author: "Nietzsche",
  },
  {
    text: "You win by doing the boring things longer than everyone else.",
    author: "",
  },
  {
    text: "Our greatest weariness comes from work not done.",
    author: "Eric Hoffer",
  },
  {
    text: "The most regretful people on earth are those who felt the call to creative work, who felt their own creative power restive and uprising, and gave it neither power nor time.",
    author: "Mary Oliver",
  },
  {
    text: "Don't plant your bad days. They grow into weeks... months. Before you know it you got yourself a bad year. Choke those little bad days.",
    author: "Tom Waits",
  },
  {
    text: "Complaining is not a strategy. You have to work with the world as you find it, not as you would have it be.",
    author: "Bezos",
  },
  {
    text: "An expert is a man who has made all the mistakes which can be made in a very narrow field.",
    author: "Niels Bohr",
  },
  {
    text: "Act in accordance with your values, not your feelings. Motivation is a myth.",
    author: "Hormozi",
  },
  {
    text: "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.",
    author: "Aristotle",
  },
  {
    text: "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.",
    author: "Samuel Beckett",
  },
  {
    text: "To go wrong in one's own way is better than to go right in someone else's.",
    author: "Fyodor Dostoevsky",
  },
  {
    text: "Difficulties strengthen the mind as labor does the body.",
    author: "Seneca",
  },
  {
    text: "Devote the rest of your life to making progress.",
    author: "Epictetus",
  },
  {
    text: "Don't explain your philosophy. Embody it.",
    author: "Epictetus",
  },
  {
    text: "There is no greatness where there is not simplicity, goodness, and truth.",
    author: "Leo Tolstoy",
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
  },
]

// Set up initial theme and database when page loads
document.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.classList.toggle("dark", savedTheme === "dark")
  initializeSidebar()
  initializeDB()
  setupEventListeners()
  checkAutoBackup()
  setupAutoSave()
  
  // Load Google Drive API key on startup
  setTimeout(async () => {
    const apiKey = await loadGoogleDriveApiKey();
    if (apiKey) {
      updateGoogleDriveConfigWithKey(apiKey);
      console.log('Google Drive API key loaded from database');
      
      // Check for stored user info and update display
      try {
        if (typeof getUserInfo === 'function') {
          const userInfo = await getUserInfo();
          if (userInfo) {
            updateUserInfoDisplay(userInfo);
          }
        }
      } catch (error) {
        console.log('Could not load user info:', error.message);
      }
    }
  }, 1000);
})

// Make database accessible to Google Drive functions
window.getDatabase = () => db;

// Initialize IndexedDB database and create object stores if needed
function initializeDB() {
  console.log("Initializing database...")
  const request = indexedDB.open(dbName, dbVersion)

  request.onerror = (event) => {
    console.error("Database error:", event.target.error)
  }

  request.onupgradeneeded = (event) => {
    console.log("Upgrading database...")
    db = event.target.result

    // Create tasks object store
    if (!db.objectStoreNames.contains("tasks")) {
      const taskStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true })
      taskStore.createIndex("status", "status")
      taskStore.createIndex("type", "type")
      taskStore.createIndex("endDate", "endDate")
      console.log("Created tasks store and indexes")
    }

    // Create time tracking object store
    if (!db.objectStoreNames.contains("timeTracking")) {
      const timeStore = db.createObjectStore("timeTracking", { keyPath: "id", autoIncrement: true })
      timeStore.createIndex("taskName", "taskName")
      timeStore.createIndex("timestamp", "timestamp")
      console.log("Created timeTracking store and indexes")
    }

    // Create settings object store
    if (!db.objectStoreNames.contains("settings")) {
      const settingsStore = db.createObjectStore("settings", { keyPath: "key" })
      console.log("Created settings store")
    }
  }

  request.onsuccess = (event) => {
    console.log("Database initialized successfully")
    db = event.target.result
    updateDisplay()
    updateTimeTrackerDisplay()
  }
}

// Initialize sidebar state
function initializeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
  
  if (isCollapsed) {
    sidebar.classList.add("collapsed");
  }
}

// Toggle sidebar collapse state
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
  
  // Save state to localStorage
  const isCollapsed = sidebar.classList.contains("collapsed");
  localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
}

// Set active sidebar link styling
function setActiveNav(view) {
  const links = document.querySelectorAll(".sidebar-link[data-view]");
  links.forEach((link) => {
    const icon = link.querySelector(".material-symbols-outlined");

    // Reset classes
    link.classList.remove(
      "bg-blue-500/10",
      "text-blue-600",
      "dark:bg-blue-500/20",
      "dark:text-blue-400",
    );
    if (icon) {
      icon.classList.remove("fill");
    }

    // Apply active styles to the selected view
    if (link.dataset.view === view) {
      link.classList.add(
        "bg-blue-500/10",
        "text-blue-600",
        "dark:bg-blue-500/20",
        "dark:text-blue-400",
      );
      if (icon) {
        icon.classList.add("fill");
      }
    }
  });
}

// Show/hide main sections based on selected view
function setActiveView(view) {
  // Update current view
  currentView = view
  
  // Get all section elements
  const dashboard = document.getElementById('dashboard-section')
  const calendar = document.getElementById('calendar-section')
  const timeTracker = document.getElementById('time-tracker-section')
  const timeOverview = document.getElementById('time-overview-section')
  const settings = document.getElementById('settings-section')
  const help = document.getElementById('help-section')
  const resetDb = document.getElementById('reset-database-section')
  
  // Hide all sections first
  dashboard.classList.add('hidden')
  calendar.classList.add('hidden')
  timeTracker.classList.add('hidden')
  timeOverview.classList.add('hidden')
  settings.classList.add('hidden')
  help.classList.add('hidden')
  resetDb.classList.add('hidden')
  
  // Show sections based on view
  switch (view) {
    case "tasks":
      // My Tasks: show only dashboard (ongoing tasks)
      dashboard.classList.remove('hidden')
      resetDb.classList.remove('hidden')
      break
    case "calendar":
      // Calendar only
      calendar.classList.remove('hidden')
      resetDb.classList.remove('hidden')
      break
    case "time":
      // Time Overview: time tracker + time overview
      timeTracker.classList.remove('hidden')
      timeOverview.classList.remove('hidden')
      resetDb.classList.remove('hidden')
      break
    case "settings":
      // Settings view
      settings.classList.remove('hidden')
      resetDb.classList.remove('hidden')
      // Load settings when showing settings section
      if (typeof loadSettings === 'function') {
        loadSettings()
      }
      break
    case "help":
      // Help view
      help.classList.remove('hidden')
      resetDb.classList.remove('hidden')
      break
    case "dashboard":
    default:
      // Dashboard: show everything (dashboard, calendar, time tracker, time overview)
      dashboard.classList.remove('hidden')
      calendar.classList.remove('hidden')
      timeTracker.classList.remove('hidden')
      timeOverview.classList.remove('hidden')
      resetDb.classList.remove('hidden')
      break
  }
  
  // Update active nav
  setActiveNav(view)
  
  // Update completed tasks display based on view
  updateCompletedTasks()
}

function showHelp() {
  setActiveView('help')
}

// Set up event listeners for form submission, theme toggle, and expected tasks
function focusOnOngoingTasks() {
  // Scroll to the ongoing tasks section
  const ongoingTasksSection = document.getElementById('ongoing-tasks')
  if (ongoingTasksSection) {
    ongoingTasksSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    
    // Also focus on the task input field for quick entry
    const taskInput = document.getElementById('task-input')
    if (taskInput) {
      taskInput.focus()
    }
    
    // Set active view to dashboard (where ongoing tasks are)
    setActiveView('dashboard')
  }
}

function setupEventListeners() {
  document.getElementById("add-task-form").addEventListener("submit", (e) => {
    e.preventDefault()
    addTask()
  })

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme)
  
  // Add listener for expected tasks input
  document.getElementById("expected-tasks").addEventListener("change", (e) => {
    expectedTasksPerDay = parseInt(e.target.value) || 1;
    updateChart();
  });

  // Sidebar navigation clicks
  document.querySelectorAll(".sidebar-link[data-view]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      setActiveView(view);
    });
  });

  // Initialize default view as dashboard
  setActiveView("dashboard");
}

// Format a date object to YYYY-MM-DD string
function formatDate(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]  // YYYY-MM-DD
}

// Get today's date in user's timezone as YYYY-MM-DD string
function getTodayDate() {
  // Get the local date string for the user's timezone
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const localDate = new Date(now.getTime() - (offset * 60 * 1000))
  const result = localDate.toISOString().split('T')[0]
  console.log('getTodayDate returning:', result)
  return result
}

// Get a random quote from the motivationalQuotes array
function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
  return motivationalQuotes[randomIndex]
}

// Add a new task to the database
function addTask() {
  if (!db) {
    console.error("Database not initialized")
    return
  }

  const taskInput = document.getElementById("task-input")
  const taskType = document.getElementById("task-type")

  // Input validation
  if (!taskInput.value.trim()) {
    alert("Please enter a task")
    return
  }

  const task = {
    title: taskInput.value.trim(),
    type: taskType.value,
    status: false,
    startDate: getTodayDate(),
    endDate: null,
  }

  console.log("Attempting to add task:", task)

  try {
    const transaction = db.transaction(["tasks"], "readwrite")
    const taskStore = transaction.objectStore("tasks")

    const request = taskStore.add(task)

    request.onsuccess = (event) => {
      console.log("Task added successfully, ID:", event.target.result)
      taskInput.value = ""
      updateDisplay()
    }

    request.onerror = (event) => {
      console.error("Error adding task:", event.target.error)
      alert("Error adding task. Please try again.")
    }

    transaction.oncomplete = () => {
      console.log("Transaction completed successfully")
    }

    transaction.onerror = (event) => {
      console.error("Transaction error:", event.target.error)
    }
  } catch (error) {
    console.error("Error in addTask:", error)
  }
}

// Mark a task as complete and create next day's task if Non-Negotiable
function completeTask(taskId) {
  const transaction = db.transaction(["tasks"], "readwrite")
  const taskStore = transaction.objectStore("tasks")

  taskStore.get(taskId).onsuccess = (event) => {
    const task = event.target.result
    task.status = true
    const today = getTodayDate()
    console.log('Setting endDate to:', today)
    task.endDate = today

    taskStore.put(task).onsuccess = () => {
      // If task is Non-Negotiable, create next day's task
      if (task.type === "Non-Negotiable") {
        const nextTask = {
          title: task.title,
          type: "Non-Negotiable",
          status: false,
          startDate: formatDate(new Date(new Date().getTime() + 86400000)),
          endDate: null,
        }
        taskStore.add(nextTask)
      }
      updateDisplay()
    }
  }
}

// Update all display elements on the page
function updateDisplay() {
  updateTodayInfo()
  updateOngoingTasks()
  updateCompletedTasks()
  updateStreak()
  updateLast7DaysOverview()
  updateChart()
}

// Update the today's info section with date and quote
function updateTodayInfo() {
  const today = new Date()
  const todayInfo = document.getElementById("today-info")
  const quote = getRandomQuote()

  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const index = taskStore.index("endDate")

  const todayStr = getTodayDate()
  const request = index.count(IDBKeyRange.only(todayStr))

  request.onsuccess = () => {
    const completedToday = request.result
    todayInfo.innerHTML = `
            <div class="flex flex-wrap items-baseline gap-2 mb-4 text-sm md:text-base font-bold">
                <span>Today is the ${today.getDate()} of ${today.toLocaleString("default", { month: "long" })}!</span>
                <span class="text-gray-400 dark:text-gray-500">•</span>
                <span>You have completed ${completedToday} tasks today.</span>
            </div>
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p class="italic mb-2 text-base md:text-1xl leading-snug">"${quote.text}"</p>
                <p class="text-right text-xs md:text-sm text-gray-600 dark:text-gray-400">- ${quote.author}</p>
            </div>
        `
  }
}

// Update the list of ongoing (uncompleted) tasks
function updateOngoingTasks() {
  if (!db) {
    console.error("Database not initialized")
    return
  }

  const taskList = document.getElementById("ongoing-tasks")
  if (!taskList) {
    console.error("Could not find ongoing-tasks element")
    return
  }

  console.log("Updating ongoing tasks...")
  taskList.innerHTML = ""

  try {
    const transaction = db.transaction(["tasks"], "readonly")
    const taskStore = transaction.objectStore("tasks")

    const request = taskStore.getAll()

    request.onsuccess = () => {
      const allTasks = request.result
      console.log("All tasks:", allTasks)

      const tasks = allTasks.filter((task) => !task.status)
      console.log("Filtered ongoing tasks:", tasks)

      if (tasks.length === 0) {
        taskList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No ongoing tasks</p>'
        return
      }

      const isDarkMode = document.documentElement.classList.contains('dark');
      const crossIcon = isDarkMode ? './icons/whitecross.svg' : './icons/cross.svg';

      tasks.forEach((task) => {
        const taskElement = document.createElement("div")
        taskElement.className = "flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        taskElement.innerHTML = `
                    <input type="checkbox" onchange="completeTask(${task.id})" class="confirmation-button">
                    <span class="flex-grow">${task.title}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">${task.type}</span>
                    <button onclick="deleteTask(${task.id})" class="bg-blue-500 hover:bg-blue-600 rounded p-1.5 ml-2" title="Delete task">
                        <img src="${crossIcon}" class="h-3 w-3 scale-150" alt="Delete">
                    </button>
                `
        taskList.appendChild(taskElement)
      })
    }

    request.onerror = (event) => {
      console.error("Error fetching tasks:", event.target.error)
      taskList.innerHTML = '<p class="text-red-500">Error loading tasks</p>'
    }
  } catch (error) {
    console.error("Error in updateOngoingTasks:", error)
  }
}

// Update the list of recently completed tasks
function updateCompletedTasks() {
  const completedList = document.getElementById("completed-tasks")
  if (!completedList) return
  
  completedList.innerHTML = ""

  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")

  // Get all tasks and filter for completed ones in JavaScript
  const request = taskStore.getAll()

  request.onsuccess = () => {
    let tasks = request.result
      .filter((task) => task.status === true) // Filter completed tasks
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
    
    // Only show last 5 on dashboard, show all on My Tasks screen
    if (currentView !== "tasks") {
      tasks = tasks.slice(0, 5)
    }

    if (tasks.length === 0) {
      completedList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No completed tasks</p>'
      return
    }

    // Update heading based on view
    const heading = document.getElementById('completed-tasks-heading')
    if (heading) {
      heading.textContent = currentView === "tasks" ? "All Completed Tasks" : "Last 5 Completed Tasks"
    }

    tasks.forEach((task) => {
      const taskElement = document.createElement("div")
      taskElement.className = "flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
      taskElement.innerHTML = `
                <span>${task.title}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">${task.endDate}</span>
            `
      completedList.appendChild(taskElement)
    })
  }

  request.onerror = (event) => {
    console.error("Error fetching completed tasks:", event.target.error)
    completedList.innerHTML = '<p class="text-red-500">Error loading completed tasks</p>'
  }
}

// Calculate and update the current streak count
function updateStreak() {
  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const index = taskStore.index("endDate")

  let streak = 0
  const currentDate = new Date()
  const offset = currentDate.getTimezoneOffset()

  function checkDate(date) {
    // Adjust for timezone
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    const dateStr = formatDate(localDate)
    console.log('Checking streak for date:', dateStr) // Debug log

    const request = index.count(IDBKeyRange.only(dateStr))

    request.onsuccess = () => {
      console.log('Tasks completed on', dateStr + ':', request.result) // Debug log
      if (request.result > 0) {
        streak++
        // Move to previous day using the same timezone offset
        const prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000)
        checkDate(prevDate)
      } else {
        console.log('Final streak count:', streak) // Debug log
        document.getElementById("streak-count").textContent = `${streak} days`
      }
    }
  }

  checkDate(currentDate)
}

// Update the progress chart comparing expected vs actual tasks
function updateChart() {
  const ctx = document.getElementById("progress-chart").getContext("2d")

  // Destroy previous chart instance if it exists
  if (currentChart) {
    currentChart.destroy()
  }

  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const index = taskStore.index("endDate")

  // Get last 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return formatDate(d)
  }).reverse()

  Promise.all(
    dates.map(
      (date) =>
        new Promise((resolve) => {
          const request = index.count(IDBKeyRange.only(date))
          request.onsuccess = () => resolve(request.result)
        }),
    ),
  ).then((counts) => {
    const expected = dates.map((_, i) => expectedTasksPerDay * (i + 1))
    const actual = counts.reduce((acc, curr, i) => {
      const prev = i > 0 ? acc[i - 1] : 0
      acc.push(prev + curr)
      return acc
    }, [])

    // Create new chart and store the instance
    currentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Expected",
            data: expected,
            borderColor: "#3498db",
            fill: false,
          },
          {
            label: "Actual",
            data: actual,
            borderColor: "#2ecc71",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  })
}

// Update the overview of completed tasks for the last 7 days
function updateLast7DaysOverview() {
  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const index = taskStore.index("endDate")

  // Get last 7 days including today
  const dates = Array.from({ length: 7 }, (_, i) => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const localDate = new Date(now.getTime() - (offset * 60 * 1000) - (i * 24 * 60 * 60 * 1000))
    return formatDate(localDate)
  }).reverse()

  console.log('7 day overview dates:', dates) // Debug log

  Promise.all(
    dates.map(
      (date) =>
        new Promise((resolve) => {
          const request = index.count(IDBKeyRange.only(date))
          request.onsuccess = () =>
            resolve({
              date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              count: request.result,
            })
        }),
    ),
  ).then((results) => {
    console.log('7 day overview results:', results) // Debug log
    const overviewElement = document.getElementById("seven-day-overview")
    overviewElement.innerHTML = results
      .map(
        (day) => `
            <div class="text-center">
                <div class="text-sm mb-1">${day.date}</div>
                <div class="text-lg font-semibold ${day.count > 0 ? "text-green-500" : "text-red-500"}">${day.count}</div>
            </div>
        `,
      )
      .join("")
  })
}

// Reset the database by deleting and reinitializing it
function resetDatabase() {
  if (!confirm("Are you sure you want to reset the database? This will delete all tasks and cannot be undone.")) {
    return
  }

  // Close the current database connection
  if (db) {
    db.close()
  }

  // Delete the database
  const deleteRequest = indexedDB.deleteDatabase(dbName)

  deleteRequest.onerror = () => {
    console.error("Error deleting database")
    alert("Failed to reset database. Please try again.")
  }

  deleteRequest.onsuccess = () => {
    console.log("Database deleted successfully")
    // Reinitialize the database
    initializeDB()
    alert("Database has been reset successfully!")
    // Reload the page to reset all states
    window.location.reload()
  }
}

// Toggle between light and dark theme
function toggleTheme() {
  document.documentElement.classList.toggle("dark")
  const isDark = document.documentElement.classList.contains("dark")
  localStorage.setItem("theme", isDark ? "dark" : "light")
  updateOngoingTasks()
  updateTimePieChart()
}

// Add this new function to handle task deletion
function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  const transaction = db.transaction(["tasks"], "readwrite");
  const taskStore = transaction.objectStore("tasks");

  const request = taskStore.delete(taskId);

  request.onsuccess = () => {
    console.log("Task deleted successfully");
    updateDisplay();
  };

  request.onerror = (event) => {
    console.error("Error deleting task:", event.target.error);
    alert("Error deleting task. Please try again.");
  };
}

// Time Tracker Functions

// Toggle timer start/stop
function toggleTimer() {
  const taskInput = document.getElementById("timer-task-input");
  const taskName = taskInput.value.trim();

  if (!taskName) {
    alert("Please enter a task name");
    return;
  }

  if (isTimerRunning) {
    stopTimer();
  } else {
    startTimer(taskName);
  }
}

// Start the timer
function startTimer(taskName) {
  if (isTimerRunning) {
    return;
  }

  currentTaskName = taskName;
  isTimerRunning = true;
  timerStartTime = Date.now();

  const controlBtn = document.getElementById("timer-control-btn");
  controlBtn.textContent = "Stop";
  controlBtn.className = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-md transition duration-300";

  const taskInput = document.getElementById("timer-task-input");
  taskInput.disabled = true;

  // Update timer display every second
  timerInterval = setInterval(() => {
    updateTimerDisplay();
  }, 1000);

  updateTimerDisplay();
}

// Stop the timer and save the time
function stopTimer() {
  if (!isTimerRunning) {
    return;
  }

  const elapsedTime = Date.now() - timerStartTime;
  const seconds = Math.floor(elapsedTime / 1000);

  // Save time tracking data
  saveTimeTracking(currentTaskName, seconds);

  // Reset timer state
  isTimerRunning = false;
  timerStartTime = null;
  currentTaskName = "";

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const controlBtn = document.getElementById("timer-control-btn");
  controlBtn.textContent = "Start";
  controlBtn.className = "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md transition duration-300";

  const taskInput = document.getElementById("timer-task-input");
  taskInput.disabled = false;

  document.getElementById("timer-display").textContent = "00:00:00";

  // Update displays
  updateTimeTrackerDisplay();
}

// Update the timer display
function updateTimerDisplay() {
  if (!isTimerRunning || !timerStartTime) {
    return;
  }

  const elapsed = Date.now() - timerStartTime;
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  document.getElementById("timer-display").textContent = display;
}

// Save time tracking data to IndexedDB
function saveTimeTracking(taskName, seconds) {
  if (!db) {
    console.error("Database not initialized");
    return;
  }

  const timeEntry = {
    taskName: taskName,
    seconds: seconds,
    timestamp: new Date().toISOString()
  };

  const transaction = db.transaction(["timeTracking"], "readwrite");
  const timeStore = transaction.objectStore("timeTracking");

  const request = timeStore.add(timeEntry);

  request.onsuccess = () => {
    console.log("Time tracking entry saved successfully");
  };

  request.onerror = (event) => {
    console.error("Error saving time tracking:", event.target.error);
  };
}

// Format seconds to readable time string
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Update time tracker display (counters and history)
function updateTimeTrackerDisplay() {
  if (!db) {
    return;
  }

  updateTaskCounters();
  updateTaskHistory();
  updateTimePieChart();
}

// Start timer with specific task name
function startTimerWithTask(taskName) {
  const taskInput = document.getElementById("timer-task-input");
  taskInput.value = taskName;
  
  if (isTimerRunning) {
    stopTimer();
  }
  startTimer(taskName);
}

// Update task counters showing total time per task
function updateTaskCounters() {
  const countersContainer = document.getElementById("task-counters");

  const transaction = db.transaction(["timeTracking"], "readonly");
  const timeStore = transaction.objectStore("timeTracking");

  const request = timeStore.getAll();

  request.onsuccess = () => {
    const allEntries = request.result;

    // Calculate total time per task
    const taskTotals = {};
    allEntries.forEach(entry => {
      if (taskTotals[entry.taskName]) {
        taskTotals[entry.taskName] += entry.seconds;
      } else {
        taskTotals[entry.taskName] = entry.seconds;
      }
    });

    // Display counters
    if (Object.keys(taskTotals).length === 0) {
      countersContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No tracked tasks yet</p>';
      return;
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    const crossIcon = isDarkMode ? './icons/whitecross.svg' : './icons/cross.svg';

    countersContainer.innerHTML = Object.entries(taskTotals)
      .sort((a, b) => b[1] - a[1]) // Sort by time descending
      .map(([taskName, totalSeconds]) => `
        <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span class="flex-grow">${taskName}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">${formatTime(totalSeconds)}</span>
          <button onclick="startTimerWithTask('${taskName.replace(/'/g, "\\'")}')" class="bg-green-500 hover:bg-green-600 text-white rounded p-1.5 ml-2" title="Start timer for this task">
            <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
            </svg>
          </button>
          <button onclick="deleteTaskTimeTracking('${taskName.replace(/'/g, "\\'")}')" class="bg-blue-500 hover:bg-blue-600 rounded p-1.5 ml-2" title="Delete task time tracking">
            <img src="${crossIcon}" class="h-3 w-3 scale-150" alt="Delete">
          </button>
        </div>
      `).join("");
  };

  request.onerror = (event) => {
    console.error("Error fetching time tracking data:", event.target.error);
    countersContainer.innerHTML = '<p class="text-red-500">Error loading task counters</p>';
  };
}

// Update task history (last 3 sessions)
function updateTaskHistory() {
  const historyContainer = document.getElementById("task-history");

  if (!db) {
    historyContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No recent sessions</p>';
    return;
  }

  const transaction = db.transaction(["timeTracking"], "readonly");
  const timeStore = transaction.objectStore("timeTracking");
  
  // Get all entries and sort by timestamp
  const request = timeStore.getAll();

  request.onsuccess = () => {
    const allEntries = request.result;
    
    // Sort by timestamp descending and take last 3
    const recentEntries = allEntries
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);

    // Display history
    if (recentEntries.length === 0) {
      historyContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No recent sessions</p>';
      return;
    }

    historyContainer.innerHTML = recentEntries.map(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `
        <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span>${entry.taskName}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">${formatTime(entry.seconds)} • ${dateStr}</span>
        </div>
      `;
    }).join("");
  };

  request.onerror = (event) => {
    console.error("Error fetching task history:", event.target.error);
    historyContainer.innerHTML = '<p class="text-red-500">Error loading task history</p>';
  };
}

// Delete all time tracking entries for a specific task
function deleteTaskTimeTracking(taskName) {
  if (!confirm(`Are you sure you want to delete all time tracking data for "${taskName}"?`)) {
    return;
  }

  if (!db) {
    console.error("Database not initialized");
    return;
  }

  const transaction = db.transaction(["timeTracking"], "readwrite");
  const timeStore = transaction.objectStore("timeTracking");
  const index = timeStore.index("taskName");

  // Get all entries for this task name
  const request = index.getAll(taskName);

  request.onsuccess = () => {
    const entries = request.result;
    
    if (entries.length === 0) {
      console.log("No entries found for task:", taskName);
      return;
    }

    // Delete all entries
    let deleteCount = 0;
    entries.forEach(entry => {
      const deleteRequest = timeStore.delete(entry.id);
      deleteRequest.onsuccess = () => {
        deleteCount++;
        if (deleteCount === entries.length) {
          console.log(`Deleted ${deleteCount} time tracking entries for task: ${taskName}`);
          updateTimeTrackerDisplay();
        }
      };
      deleteRequest.onerror = (event) => {
        console.error("Error deleting time tracking entry:", event.target.error);
      };
    });
  };

  request.onerror = (event) => {
    console.error("Error fetching time tracking entries:", event.target.error);
    alert("Error deleting task time tracking. Please try again.");
  };
}

// Update pie chart showing time distribution by task
function updateTimePieChart() {
  const ctx = document.getElementById("time-pie-chart");
  if (!ctx) {
    return;
  }

  // Destroy previous pie chart instance if it exists
  if (currentPieChart) {
    currentPieChart.destroy();
  }

  if (!db) {
    return;
  }

  const transaction = db.transaction(["timeTracking"], "readonly");
  const timeStore = transaction.objectStore("timeTracking");

  const request = timeStore.getAll();

  request.onsuccess = () => {
    const allEntries = request.result;

    // Calculate total time per task
    const taskTotals = {};
    allEntries.forEach(entry => {
      if (taskTotals[entry.taskName]) {
        taskTotals[entry.taskName] += entry.seconds;
      } else {
        taskTotals[entry.taskName] = entry.seconds;
      }
    });

    // If no data, show empty state
    if (Object.keys(taskTotals).length === 0) {
      return;
    }

    // Sort tasks by time and get top tasks (limit to 10 for readability)
    const sortedTasks = Object.entries(taskTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sortedTasks.map(([taskName]) => taskName);
    const data = sortedTasks.map(([, seconds]) => seconds);

    // Generate colors for the pie chart
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085'
    ];

    // Create new pie chart
    currentPieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const formattedTime = formatTime(value);
                return `${label}: ${formattedTime}`;
              }
            }
          }
        }
      }
    });
  };

   request.onerror = (event) => {
     console.error("Error fetching time tracking data for pie chart:", event.target.error);
   };
 }

// Database Export/Import Functions

// Export all database data as JSON
async function exportDatabase() {
  if (!db) {
    showNotification("Database not initialized. Please wait for the app to load.", "error");
    return;
  }

  // Show loading state
  const exportButton = document.querySelector('a[onclick="exportDatabase()"]');
  if (exportButton) {
    const originalHTML = exportButton.innerHTML;
    exportButton.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span><span class="sidebar-text">Exporting...</span>';
    exportButton.style.pointerEvents = 'none';
  }

  try {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      appVersion: "1.0",
      tasks: [],
      timeTracking: []
    };

    // Export tasks with error handling for each transaction
    const tasks = await new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(["tasks"], "readonly");
        const taskStore = transaction.objectStore("tasks");
        const request = taskStore.getAll();
        
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            reject(new Error("Failed to retrieve tasks"));
          }
        };
        request.onerror = () => reject(new Error(`Task export failed: ${request.error?.message || "Unknown error"}`));
        
        transaction.onerror = () => reject(new Error(`Transaction failed: ${transaction.error?.message || "Unknown error"}`));
      } catch (error) {
        reject(new Error(`Export setup failed: ${error.message}`));
      }
    });

    // Export time tracking
    const timeTracking = await new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(["timeTracking"], "readonly");
        const timeStore = transaction.objectStore("timeTracking");
        const request = timeStore.getAll();
        
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            reject(new Error("Failed to retrieve time tracking"));
          }
        };
        request.onerror = () => reject(new Error(`Time tracking export failed: ${request.error?.message || "Unknown error"}`));
        
        transaction.onerror = () => reject(new Error(`Transaction failed: ${transaction.error?.message || "Unknown error"}`));
      } catch (error) {
        reject(new Error(`Export setup failed: ${error.message}`));
      }
    });

    // Validate exported data
    if (!Array.isArray(tasks) || !Array.isArray(timeTracking)) {
      throw new Error("Exported data is not in expected format");
    }

    exportData.tasks = tasks;
    exportData.timeTracking = timeTracking;

    // Create JSON string with error handling for circular references
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Validate JSON
    try {
      JSON.parse(jsonString);
    } catch (error) {
      throw new Error("Generated JSON is invalid");
    }
    
    // Create download link
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailiesapp-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    // Also save to localStorage as backup
    localStorage.setItem('dailiesapp_last_export', jsonString);
    localStorage.setItem('dailiesapp_last_export_date', new Date().toISOString());

    showNotification(`Successfully exported ${tasks.length} tasks and ${timeTracking.length} time tracking entries. File downloaded automatically.`, "success");
    
  } catch (error) {
    console.error("Error exporting database:", error);
    showNotification(`Export failed: ${error.message}`, "error");
  } finally {
    // Restore button state
    if (exportButton) {
      exportButton.innerHTML = '<span class="material-symbols-outlined">download</span><span class="sidebar-text">Export Data</span>';
      exportButton.style.pointerEvents = 'auto';
    }
  }
}

// Helper function to show notifications
function showNotification(message, type = "info") {
  // Remove any existing notification
  const existingNotification = document.getElementById('export-import-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'export-import-notification';
  notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
    'bg-blue-100 text-blue-800 border border-blue-200'
  }`;
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="material-symbols-outlined mr-2">
        ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Import database from JSON file
function importDatabase() {
  if (!db) {
    alert("Database not initialized. Please wait for the app to load.");
    return;
  }

  // Create file input element
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";
  
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show loading indicator
    const originalButton = event.target;
    if (originalButton) {
      originalButton.disabled = true;
      originalButton.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span><span class="sidebar-text">Importing...</span>';
    }

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // Validate import data structure
      if (!importData.version || !importData.tasks || !importData.timeTracking) {
        throw new Error("Invalid backup file format. Expected fields: version, tasks, timeTracking");
      }

      // Validate data types
      if (!Array.isArray(importData.tasks) || !Array.isArray(importData.timeTracking)) {
        throw new Error("Invalid data structure: tasks and timeTracking must be arrays");
      }

      // Check for required fields in tasks
      for (const task of importData.tasks) {
        if (!task.title || typeof task.title !== 'string') {
          throw new Error("Invalid task data: missing or invalid title");
        }
        if (!['Goal', 'Non-Negotiable'].includes(task.type)) {
          throw new Error("Invalid task data: type must be 'Goal' or 'Non-Negotiable'");
        }
      }

      // Check for required fields in time tracking
      for (const entry of importData.timeTracking) {
        if (!entry.taskName || typeof entry.taskName !== 'string') {
          throw new Error("Invalid time tracking data: missing or invalid taskName");
        }
        if (typeof entry.seconds !== 'number' || entry.seconds < 0) {
          throw new Error("Invalid time tracking data: seconds must be a non-negative number");
        }
      }

      if (!confirm(`This will import ${importData.tasks.length} tasks and ${importData.timeTracking.length} time tracking entries. This will replace your current data. Continue?`)) {
        return;
      }

      // Clear existing data first
      await clearDatabase();
      
      // Import tasks in batches to avoid transaction timeouts
      const batchSize = 50;
      for (let i = 0; i < importData.tasks.length; i += batchSize) {
        const batch = importData.tasks.slice(i, i + batchSize);
        await Promise.all(batch.map(task => 
          new Promise((resolve, reject) => {
            const transaction = db.transaction(["tasks"], "readwrite");
            const taskStore = transaction.objectStore("tasks");
            const request = taskStore.add(task);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
        ));
      }

      // Import time tracking in batches
      for (let i = 0; i < importData.timeTracking.length; i += batchSize) {
        const batch = importData.timeTracking.slice(i, i + batchSize);
        await Promise.all(batch.map(entry => 
          new Promise((resolve, reject) => {
            const transaction = db.transaction(["timeTracking"], "readwrite");
            const timeStore = transaction.objectStore("timeTracking");
            const request = timeStore.add(entry);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
        ));
      }

      alert(`Successfully imported ${importData.tasks.length} tasks and ${importData.timeTracking.length} time tracking entries! Refreshing display...`);
      updateDisplay();
      updateTimeTrackerDisplay();
      
    } catch (error) {
      console.error("Error importing database:", error);
      alert(`Error importing database: ${error.message}\n\nPlease ensure you're importing a valid DailiesApp backup file.`);
    } finally {
      // Restore button state
      if (originalButton) {
        originalButton.disabled = false;
        originalButton.innerHTML = '<span class="material-symbols-outlined">upload</span><span class="sidebar-text">Import Data</span>';
      }
      document.body.removeChild(input);
    }
  };

  document.body.appendChild(input);
  input.click();
}

// Clear all database data
async function clearDatabase() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["tasks", "timeTracking"], "readwrite");
    
    // Clear tasks
    const taskStore = transaction.objectStore("tasks");
    const taskRequest = taskStore.clear();
    
    // Clear time tracking
    const timeStore = transaction.objectStore("timeTracking");
    const timeRequest = timeStore.clear();
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Cloud sync functionality - Direct Google Drive sync
async function syncWithCloud() {
  console.log('Cloud sync button clicked');
  
  if (!db) {
    console.error('Database not initialized');
    alert("Database not initialized. Please wait for the app to load.");
    return;
  }

  // Check if Google Drive API key is configured
  const apiKey = await loadGoogleDriveApiKey();
  console.log('Loaded API key:', apiKey ? 'Yes' : 'No');
  
  if (!apiKey) {
    alert("Google Drive API key not configured. Please go to Settings to add your Google Drive API Client ID.");
    return;
  }

  // Update Google Drive configuration with the API key
  updateGoogleDriveConfig(apiKey);
  console.log('Google Drive config updated');

  // Check if Google Drive functions are available
  if (typeof showGoogleDriveSyncModal !== 'function') {
    console.error('showGoogleDriveSyncModal function not found');
    alert('Google Drive sync is not available. Please make sure all scripts are loaded and refresh the page.');
    return;
  }

  // Check if Google APIs are initialized
  if (typeof areGoogleApisInitialized === 'function' && !areGoogleApisInitialized()) {
    console.log('Google APIs not initialized, attempting to initialize...');
    try {
      if (typeof initializeGoogleApis === 'function') {
        await initializeGoogleApis();
        console.log('Google APIs initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Google APIs:', error);
      alert(`Failed to initialize Google Drive: ${error.message}. Please check your API key and internet connection.`);
      return;
    }
  }

  // Show Google Drive sync modal directly
  console.log('Showing Google Drive sync modal');
  showGoogleDriveSyncModal();
}

// Save data to cloud (copy to clipboard as JSON)
async function saveToCloud() {
  try {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      tasks: [],
      timeTracking: []
    };

    // Export tasks
    const tasks = await new Promise((resolve, reject) => {
      const transaction = db.transaction(["tasks"], "readonly");
      const taskStore = transaction.objectStore("tasks");
      const request = taskStore.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Export time tracking
    const timeTracking = await new Promise((resolve, reject) => {
      const transaction = db.transaction(["timeTracking"], "readonly");
      const timeStore = transaction.objectStore("timeTracking");
      const request = timeStore.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    exportData.tasks = tasks;
    exportData.timeTracking = timeTracking;

    // Create JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Copy to clipboard
    await navigator.clipboard.writeText(jsonString);
    
    // Also save to localStorage as backup
    localStorage.setItem('dailiesapp_cloud_backup', jsonString);
    localStorage.setItem('dailiesapp_cloud_backup_date', new Date().toISOString());
    
    alert(`Successfully saved ${tasks.length} tasks and ${timeTracking.length} time tracking entries to clipboard and local storage!\n\nJSON data has been copied to your clipboard. You can paste it into a text file or cloud storage.`);
    
  } catch (error) {
    console.error("Error saving to cloud:", error);
    alert("Error saving to cloud. Please check console for details.");
  }
}

// Load data from cloud (paste from clipboard)
async function loadFromCloud() {
  try {
    // Try to get data from clipboard first
    const clipboardText = await navigator.clipboard.readText();
    
    if (!clipboardText || !clipboardText.trim()) {
      // If clipboard is empty, try localStorage
      const storedData = localStorage.getItem('dailiesapp_cloud_backup');
      if (!storedData) {
        throw new Error("No cloud data found in clipboard or local storage.");
      }
      
      if (!confirm("Found backup data in local storage. Load this data?")) {
        return;
      }
      
      await importFromJSONString(storedData);
      return;
    }
    
    // Check if clipboard text looks like JSON
    if (!clipboardText.trim().startsWith('{') || !clipboardText.includes('"version"')) {
      throw new Error("Clipboard doesn't contain valid DailiesApp backup data.");
    }
    
    if (!confirm("Found data in clipboard. Load this data?")) {
      return;
    }
    
    await importFromJSONString(clipboardText);
    
  } catch (error) {
    console.error("Error loading from cloud:", error);
    alert(`Error loading from cloud: ${error.message}\n\nMake sure you have copied valid DailiesApp backup data to your clipboard.`);
  }
}

// Import from JSON string (shared function)
async function importFromJSONString(jsonString) {
  try {
    const importData = JSON.parse(jsonString);
    
    // Validate import data structure
    if (!importData.version || !importData.tasks || !importData.timeTracking) {
      throw new Error("Invalid backup data format");
    }

    if (!Array.isArray(importData.tasks) || !Array.isArray(importData.timeTracking)) {
      throw new Error("Invalid data structure");
    }

    if (!confirm(`This will import ${importData.tasks.length} tasks and ${importData.timeTracking.length} time tracking entries. This will replace your current data. Continue?`)) {
      return;
    }

    // Clear existing data first
    await clearDatabase();
    
    // Import tasks
    const batchSize = 50;
    for (let i = 0; i < importData.tasks.length; i += batchSize) {
      const batch = importData.tasks.slice(i, i + batchSize);
      await Promise.all(batch.map(task => 
        new Promise((resolve, reject) => {
          const transaction = db.transaction(["tasks"], "readwrite");
          const taskStore = transaction.objectStore("tasks");
          const request = taskStore.add(task);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ));
    }

    // Import time tracking
    for (let i = 0; i < importData.timeTracking.length; i += batchSize) {
      const batch = importData.timeTracking.slice(i, i + batchSize);
      await Promise.all(batch.map(entry => 
        new Promise((resolve, reject) => {
          const transaction = db.transaction(["timeTracking"], "readwrite");
          const timeStore = transaction.objectStore("timeTracking");
          const request = timeStore.add(entry);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ));
    }

    // Save to localStorage as well
    localStorage.setItem('dailiesapp_cloud_backup', jsonString);
    localStorage.setItem('dailiesapp_cloud_backup_date', new Date().toISOString());
    
    alert(`Successfully imported ${importData.tasks.length} tasks and ${importData.timeTracking.length} time tracking entries from cloud!`);
    updateDisplay();
    updateTimeTrackerDisplay();
    
  } catch (error) {
    throw new Error(`Failed to import data: ${error.message}`);
  }
}

// Auto-save to localStorage periodically
function setupAutoSave() {
  // Auto-save every 5 minutes
  setInterval(async () => {
    if (!db) return;
    
    try {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        tasks: [],
        timeTracking: []
      };

      const tasks = await new Promise((resolve, reject) => {
        const transaction = db.transaction(["tasks"], "readonly");
        const taskStore = transaction.objectStore("tasks");
        const request = taskStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const timeTracking = await new Promise((resolve, reject) => {
        const transaction = db.transaction(["timeTracking"], "readonly");
        const timeStore = transaction.objectStore("timeTracking");
        const request = timeStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      exportData.tasks = tasks;
      exportData.timeTracking = timeTracking;

      const jsonString = JSON.stringify(exportData);
      localStorage.setItem('dailiesapp_auto_backup', jsonString);
      localStorage.setItem('dailiesapp_auto_backup_date', new Date().toISOString());
      
      console.log(`Auto-saved ${tasks.length} tasks and ${timeTracking.length} time entries`);
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

 // Check for auto-backup on startup
function checkAutoBackup() {
  const backupDate = localStorage.getItem('dailiesapp_auto_backup_date');
  if (backupDate) {
    const backupTime = new Date(backupDate);
    const now = new Date();
    const hoursDiff = (now - backupTime) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) { // Backup is less than 24 hours old
      console.log(`Auto-backup available from ${backupTime.toLocaleString()}`);
    }
  }
}

// Google Drive API Key Functions

// Save Google Drive API key to database
async function saveGoogleDriveApiKey() {
  const apiKeyInput = document.getElementById('google-drive-api-key');
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showApiKeyStatus('Please enter a valid Google Drive API Client ID', 'error');
    return;
  }
  
  if (!db) {
    showApiKeyStatus('Database not initialized. Please wait for the app to load.', 'error');
    return;
  }
  
  try {
    const transaction = db.transaction(['settings'], 'readwrite');
    const settingsStore = transaction.objectStore('settings');
    
    const setting = {
      key: 'googleDriveApiKey',
      value: apiKey,
      updatedAt: new Date().toISOString()
    };
    
    const request = settingsStore.put(setting);
    
    request.onsuccess = () => {
      showApiKeyStatus('Google Drive API key saved successfully!', 'success');
      apiKeyInput.value = ''; // Clear the input for security
      
      // Update Google Drive configuration
      updateGoogleDriveConfigWithKey(apiKey);
    };
    
    request.onerror = (event) => {
      console.error('Error saving API key:', event.target.error);
      showApiKeyStatus('Error saving API key. Please try again.', 'error');
    };
    
  } catch (error) {
    console.error('Error saving API key:', error);
    showApiKeyStatus('Error saving API key. Please try again.', 'error');
  }
}

// Load Google Drive API key from database
async function loadGoogleDriveApiKey() {
  if (!db) {
    console.error('Database not initialized');
    return null;
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const settingsStore = transaction.objectStore('settings');
    const request = settingsStore.get('googleDriveApiKey');
    
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.value);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = (event) => {
      console.error('Error loading API key:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Clear Google Drive API key from database
async function clearGoogleDriveApiKey() {
  if (!confirm('Are you sure you want to clear your Google Drive API key? This will disable Google Drive sync.')) {
    return;
  }
  
  if (!db) {
    showApiKeyStatus('Database not initialized. Please wait for the app to load.', 'error');
    return;
  }
  
  try {
    const transaction = db.transaction(['settings'], 'readwrite');
    const settingsStore = transaction.objectStore('settings');
    const request = settingsStore.delete('googleDriveApiKey');
    
    request.onsuccess = () => {
      showApiKeyStatus('Google Drive API key cleared successfully.', 'success');
      document.getElementById('google-drive-api-key').value = '';
      
      // Clear Google Drive configuration
      updateGoogleDriveConfig('');
    };
    
    request.onerror = (event) => {
      console.error('Error clearing API key:', event.target.error);
      showApiKeyStatus('Error clearing API key. Please try again.', 'error');
    };
    
  } catch (error) {
    console.error('Error clearing API key:', error);
    showApiKeyStatus('Error clearing API key. Please try again.', 'error');
  }
}

// Test Google Drive API key connection
async function testGoogleDriveApiKey() {
  const apiKey = await loadGoogleDriveApiKey();
  
  if (!apiKey) {
    showApiKeyStatus('No API key found. Please save your Google Drive API key first.', 'error');
    return;
  }
  
  showApiKeyStatus('Testing Google Drive API connection...', 'info');
  
  // Update configuration with the loaded key
  updateGoogleDriveConfigWithKey(apiKey);
  
  // Test by trying to initialize Google APIs
  try {
    if (typeof initializeGoogleApis === 'function') {
      await initializeGoogleApis();
      showApiKeyStatus('Google Drive API connection successful!', 'success');
    } else {
      showApiKeyStatus('Google Drive API functions not loaded. Please refresh the page.', 'error');
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    showApiKeyStatus(`Connection failed: ${error.message}`, 'error');
  }
}

// Update Google Drive configuration with API key
function updateGoogleDriveConfigWithKey(apiKey) {
  if (typeof window.updateGoogleDriveConfig === 'function') {
    // Use the new function from google-drive-config.js
    window.updateGoogleDriveConfig({ clientId: apiKey });
    console.log('Google Drive configuration updated with API key');
  } else if (typeof window.GOOGLE_DRIVE_CONFIG !== 'undefined') {
    // Fallback to direct assignment
    window.GOOGLE_DRIVE_CONFIG.CLIENT_ID = apiKey;
    console.log('Google Drive configuration updated (legacy method)');
    
    // Re-initialize token client if needed
    if (typeof initializeTokenClient === 'function' && apiKey) {
      try {
        initializeTokenClient();
      } catch (error) {
        console.error('Error re-initializing token client:', error);
      }
    }
  }
}

// Show API key status message
function showApiKeyStatus(message, type = 'info') {
  const statusElement = document.getElementById('api-key-status');
  if (!statusElement) return;
  
  statusElement.className = `p-3 rounded-md ${
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
    'bg-blue-100 text-blue-800 border border-blue-200'
  }`;
  
  statusElement.innerHTML = `
    <div class="flex items-center">
      <span class="material-symbols-outlined mr-2">
        ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>${message}</span>
    </div>
  `;
  
  statusElement.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusElement.classList.add('hidden');
  }, 5000);
}

// Load API key when settings view is shown
async function loadSettings() {
  const apiKey = await loadGoogleDriveApiKey();
  const apiKeyInput = document.getElementById('google-drive-api-key');
  
  if (apiKey) {
    // Don't show the actual key, just indicate it's saved
    apiKeyInput.placeholder = 'API key is saved (enter new key to update)';
    apiKeyInput.value = '';
  } else {
    apiKeyInput.placeholder = 'Enter your Google Drive API Client ID';
    apiKeyInput.value = '';
  }
}



