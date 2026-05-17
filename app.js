// Initialize database connection and global variables
let db
const dbName = "dailiesDB"
const dbVersion = 4  // Incremented for sortOrder field
let currentChart = null
let currentPieChart = null
let expectedTasksPerDay = 1

// Drag and drop variables
let draggedElement = null
let draggedTaskId = null

// Time tracker variables
let timerInterval = null
let timerStartTime = null
let isTimerRunning = false
let currentTaskName = ""

// Current view state
let currentView = "dashboard"
let isCompletedTasksCollapsed = false
let dailyAlertInterval = null
let dashboardHeightSyncFrame = null
const taskCompletionsInFlight = new Set()

const DAILY_ALERT_DEFAULTS = {
  enabled: false,
  channel: "notification",
  triggerTime: "20:00",
  email: "",
}

const WEEKLY_ROUTINES_SETTING_KEY = "weeklyRoutines"
const ROUTINE_NAME_MAX_LENGTH = 60

const WEEKDAY_ROUTINES = [
  { key: "sunday", label: "Sunday", inputId: "routine-sunday" },
  { key: "monday", label: "Monday", inputId: "routine-monday" },
  { key: "tuesday", label: "Tuesday", inputId: "routine-tuesday" },
  { key: "wednesday", label: "Wednesday", inputId: "routine-wednesday" },
  { key: "thursday", label: "Thursday", inputId: "routine-thursday" },
  { key: "friday", label: "Friday", inputId: "routine-friday" },
  { key: "saturday", label: "Saturday", inputId: "routine-saturday" },
]

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
    const oldVersion = event.oldVersion

    // Create tasks object store
    if (!db.objectStoreNames.contains("tasks")) {
      const taskStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true })
      taskStore.createIndex("status", "status")
      taskStore.createIndex("type", "type")
      taskStore.createIndex("endDate", "endDate")
      taskStore.createIndex("sortOrder", "sortOrder")
      console.log("Created tasks store and indexes")
    } else if (oldVersion < 4) {
      // Migration: Add sortOrder index to existing tasks store
      const transaction = event.target.transaction
      const taskStore = transaction.objectStore("tasks")
      
      if (!taskStore.indexNames.contains("sortOrder")) {
        taskStore.createIndex("sortOrder", "sortOrder")
        console.log("Added sortOrder index to tasks store")
      }
      
      // Add sortOrder to existing tasks
      const getAllRequest = taskStore.getAll()
      getAllRequest.onsuccess = () => {
        const tasks = getAllRequest.result
        tasks.forEach((task, index) => {
          if (task.sortOrder === undefined) {
            task.sortOrder = index
            taskStore.put(task)
          }
        })
        console.log("Added sortOrder to existing tasks")
      }
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
    startDailyAlertScheduler()
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
      "bg-indigo-500/10",
      "text-indigo-600",
      "dark:bg-indigo-500/15",
      "dark:text-indigo-400",
    );
    link.classList.add(
      "text-zinc-600",
      "dark:text-zinc-400",
    );
    if (icon) {
      icon.classList.remove("fill");
    }

    // Apply active styles to the selected view
    if (link.dataset.view === view) {
      link.classList.remove(
        "text-zinc-600",
        "dark:text-zinc-400",
      );
      link.classList.add(
        "bg-indigo-500/10",
        "text-indigo-600",
        "dark:bg-indigo-500/15",
        "dark:text-indigo-400",
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
  const routines = document.getElementById('routines-section')
  const timeTracker = document.getElementById('time-tracker-section')
  const timeOverview = document.getElementById('time-overview-section')
  const settings = document.getElementById('settings-section')
  const help = document.getElementById('help-section')
  const resetDb = document.getElementById('reset-database-section')
  
  // Hide all sections first
  dashboard.classList.add('hidden')
  calendar.classList.add('hidden')
  routines.classList.add('hidden')
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
    case "routines":
      // Routines: edit weekly themes
      routines.classList.remove('hidden')
      resetDb.classList.remove('hidden')
      populateRoutinesUI()
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
  syncDashboardTaskCardHeight()
}

function showHelp() {
  setActiveView('help')
}

function setCompletedTasksCollapsed(collapsed, persist = true) {
  isCompletedTasksCollapsed = collapsed

  const toggleButton = document.getElementById("toggle-completed-tasks")
  const chevron = document.getElementById("completed-tasks-chevron")

  if (toggleButton) {
    toggleButton.setAttribute("aria-expanded", (!collapsed).toString())
    toggleButton.setAttribute(
      "title",
      collapsed ? "Expand recent completions" : "Collapse recent completions",
    )
  }

  if (chevron) {
    chevron.textContent = collapsed ? "expand_more" : "expand_less"
  }

  if (persist) {
    localStorage.setItem("completedTasksCollapsed", collapsed.toString())
  }

  updateCompletedTasks()
}

function toggleCompletedTasksCollapse() {
  setCompletedTasksCollapsed(!isCompletedTasksCollapsed)
}

function initializeCompletedTasksCollapse() {
  const toggleButton = document.getElementById("toggle-completed-tasks")
  if (!toggleButton) return

  const savedState = localStorage.getItem("completedTasksCollapsed") === "true"
  setCompletedTasksCollapsed(savedState, false)

  toggleButton.addEventListener("click", toggleCompletedTasksCollapse)
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

  initializeCompletedTasksCollapse()

  const saveAlertButton = document.getElementById("save-alert-settings")
  if (saveAlertButton) {
    saveAlertButton.addEventListener("click", saveDailyAlertSettings)
  }

  const alertChannel = document.getElementById("alert-channel")
  if (alertChannel) {
    alertChannel.addEventListener("change", updateAlertChannelVisibility)
  }

  const routinesForm = document.getElementById("routines-form")
  if (routinesForm) {
    routinesForm.addEventListener("submit", saveRoutines)
  }

  window.addEventListener("resize", syncDashboardTaskCardHeight)

  // Initialize default view as dashboard
  setActiveView("dashboard");
}

function getSettingValue(key) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(null)
      return
    }

    const transaction = db.transaction(["settings"], "readonly")
    const settingsStore = transaction.objectStore("settings")
    const request = settingsStore.get(key)

    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

function setSettingValue(key, value) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"))
      return
    }

    const transaction = db.transaction(["settings"], "readwrite")
    const settingsStore = transaction.objectStore("settings")
    const request = settingsStore.put({
      key,
      value,
      updatedAt: new Date().toISOString(),
    })

    request.onsuccess = () => resolve()
    request.onerror = (event) => reject(event.target.error)
  })
}

function getDefaultWeeklyRoutines() {
  return WEEKDAY_ROUTINES.reduce((routines, day) => {
    routines[day.key] = ""
    return routines
  }, {})
}

function normalizeWeeklyRoutines(value) {
  const routines = getDefaultWeeklyRoutines()
  if (!value || typeof value !== "object") {
    return routines
  }

  WEEKDAY_ROUTINES.forEach((day) => {
    routines[day.key] = typeof value[day.key] === "string"
      ? value[day.key].trim().slice(0, ROUTINE_NAME_MAX_LENGTH)
      : ""
  })

  return routines
}

async function getWeeklyRoutines() {
  try {
    const savedRoutines = await getSettingValue(WEEKLY_ROUTINES_SETTING_KEY)
    return normalizeWeeklyRoutines(savedRoutines)
  } catch (error) {
    console.error("Error loading weekly routines:", error)
    return getDefaultWeeklyRoutines()
  }
}

async function setWeeklyRoutines(routines) {
  await setSettingValue(WEEKLY_ROUTINES_SETTING_KEY, normalizeWeeklyRoutines(routines))
}

async function getTodayRoutineName() {
  const todayKey = WEEKDAY_ROUTINES[new Date().getDay()].key
  const routines = await getWeeklyRoutines()
  return (routines[todayKey] || "").trim()
}

function getTodayRoutineBadgeHTML(routineName) {
  const trimmedName = (routineName || "").trim()
  if (!trimmedName) return ""

  return `
      <span class="text-zinc-300 dark:text-zinc-600">&middot;</span>
      <span class="today-routine-badge" title="Today's routine">
        <span class="material-symbols-outlined text-sm">event_repeat</span>
        ${escapeHTML(trimmedName)}
      </span>
    `
}

async function populateRoutinesUI() {
  const routines = await getWeeklyRoutines()

  WEEKDAY_ROUTINES.forEach((day) => {
    const input = document.getElementById(day.inputId)
    if (input) {
      input.value = routines[day.key] || ""
    }
  })
}

async function saveRoutines(event) {
  if (event) {
    event.preventDefault()
  }

  const routines = getDefaultWeeklyRoutines()

  WEEKDAY_ROUTINES.forEach((day) => {
    const input = document.getElementById(day.inputId)
    routines[day.key] = input ? input.value.trim() : ""
  })

  try {
    await setWeeklyRoutines(routines)
    await updateTodayInfo()
    updateStreak()
    showNotification("Routines saved.", "success")
  } catch (error) {
    console.error("Error saving routines:", error)
    showNotification("Failed to save routines.", "error")
  }
}

async function getDailyAlertConfig() {
  try {
    const savedConfig = await getSettingValue("dailyAlertConfig")
    if (!savedConfig || typeof savedConfig !== "object") {
      return { ...DAILY_ALERT_DEFAULTS }
    }

    return {
      ...DAILY_ALERT_DEFAULTS,
      ...savedConfig,
    }
  } catch (error) {
    console.error("Error loading daily alert settings:", error)
    return { ...DAILY_ALERT_DEFAULTS }
  }
}

async function setDailyAlertConfig(config) {
  await setSettingValue("dailyAlertConfig", config)
}

async function getDailyAlertLastTriggeredDate() {
  try {
    return await getSettingValue("dailyAlertLastTriggeredDate")
  } catch (error) {
    console.error("Error loading alert trigger date:", error)
    return null
  }
}

async function setDailyAlertLastTriggeredDate(dateStr) {
  await setSettingValue("dailyAlertLastTriggeredDate", dateStr)
}

function updateAlertChannelVisibility() {
  const alertChannel = document.getElementById("alert-channel")
  const emailWrap = document.getElementById("alert-email-wrap")

  if (!alertChannel || !emailWrap) return

  emailWrap.classList.toggle("hidden", alertChannel.value !== "email")
}

async function populateDailyAlertSettingsUI() {
  const alertEnabled = document.getElementById("alert-enabled")
  const alertChannel = document.getElementById("alert-channel")
  const alertTime = document.getElementById("alert-time")
  const alertEmail = document.getElementById("alert-email")

  if (!alertEnabled || !alertChannel || !alertTime || !alertEmail) return

  const config = await getDailyAlertConfig()
  alertEnabled.checked = Boolean(config.enabled)
  alertChannel.value = config.channel || DAILY_ALERT_DEFAULTS.channel
  alertTime.value = config.triggerTime || DAILY_ALERT_DEFAULTS.triggerTime
  alertEmail.value = config.email || ""

  updateAlertChannelVisibility()
}

async function saveDailyAlertSettings() {
  const alertEnabled = document.getElementById("alert-enabled")
  const alertChannel = document.getElementById("alert-channel")
  const alertTime = document.getElementById("alert-time")
  const alertEmail = document.getElementById("alert-email")

  if (!alertEnabled || !alertChannel || !alertTime || !alertEmail) {
    showNotification("Alert settings controls are missing.", "error")
    return
  }

  const config = {
    enabled: Boolean(alertEnabled.checked),
    channel: alertChannel.value,
    triggerTime: alertTime.value || DAILY_ALERT_DEFAULTS.triggerTime,
    email: alertEmail.value.trim(),
  }

  if (config.channel === "email" && !config.email) {
    showNotification("Please enter an email address for email alerts.", "error")
    return
  }

  try {
    await setDailyAlertConfig(config)
    showNotification("Alert settings saved.", "success")

    if (config.enabled && config.channel === "notification" && "Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission()
      } catch (error) {
        console.error("Notification permission request failed:", error)
      }
    }

    await checkAndTriggerDailyAlert()
  } catch (error) {
    console.error("Error saving alert settings:", error)
    showNotification("Failed to save alert settings.", "error")
  }
}

function hasReachedDailyAlertTime(triggerTime) {
  if (!triggerTime || !triggerTime.includes(":")) return false

  const [hourStr, minuteStr] = triggerTime.split(":")
  const targetHour = parseInt(hourStr, 10)
  const targetMinute = parseInt(minuteStr, 10)

  if (Number.isNaN(targetHour) || Number.isNaN(targetMinute)) return false

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const targetMinutes = targetHour * 60 + targetMinute

  return nowMinutes >= targetMinutes
}

function getCompletedTasksCountForDate(dateStr) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(0)
      return
    }

    const transaction = db.transaction(["tasks"], "readonly")
    const taskStore = transaction.objectStore("tasks")
    const index = taskStore.index("endDate")
    const request = index.count(IDBKeyRange.only(dateStr))

    request.onsuccess = () => resolve(request.result || 0)
    request.onerror = (event) => reject(event.target.error)
  })
}

async function triggerBrowserNotification(message) {
  if (!("Notification" in window)) {
    showNotification(message, "info")
    return
  }

  if (Notification.permission === "granted") {
    new Notification("Dailies Reminder", { body: message })
    showNotification("Daily reminder notification sent.", "success")
    return
  }

  if (Notification.permission === "default") {
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        new Notification("Dailies Reminder", { body: message })
        showNotification("Daily reminder notification sent.", "success")
        return
      }
    } catch (error) {
      console.error("Notification permission request failed:", error)
    }
  }

  showNotification(message, "info")
}

function triggerEmailReminder(email) {
  const targetEmail = email && email.includes("@") ? email : ""
  if (!targetEmail) {
    showNotification("No valid alert email configured.", "error")
    return
  }

  const subject = encodeURIComponent("Dailies Reminder: No tasks completed today")
  const body = encodeURIComponent("You still have 0 completed tasks today. Open Dailies and finish one task.")
  const mailtoUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`

  window.location.href = mailtoUrl
  showNotification(`Email reminder prepared for ${targetEmail}.`, "info")
}

async function triggerDailyAlert(config) {
  const message = "No tasks completed yet today."

  if (config.channel === "email") {
    triggerEmailReminder(config.email)
  } else {
    triggerBrowserNotification(message)
  }
}

async function checkAndTriggerDailyAlert() {
  if (!db) return

  try {
    const config = await getDailyAlertConfig()
    if (!config.enabled) return

    const today = getTodayDate()
    const lastTriggeredDate = await getDailyAlertLastTriggeredDate()
    if (lastTriggeredDate === today) return

    if (!hasReachedDailyAlertTime(config.triggerTime)) return

    const completedCount = await getCompletedTasksCountForDate(today)
    if (completedCount > 0) return

    await triggerDailyAlert(config)
    await setDailyAlertLastTriggeredDate(today)
  } catch (error) {
    console.error("Error checking daily alert:", error)
  }
}

function startDailyAlertScheduler() {
  if (dailyAlertInterval) {
    clearInterval(dailyAlertInterval)
  }

  checkAndTriggerDailyAlert()
  dailyAlertInterval = setInterval(checkAndTriggerDailyAlert, 30 * 1000)
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

function hasParentTask(task) {
  return task && task.parentId !== undefined && task.parentId !== null
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function getSubtasksForParent(tasks, parentId) {
  return tasks
    .filter((task) => task.parentId === parentId)
    .sort((a, b) => {
      const orderA = a.subtaskOrder !== undefined ? a.subtaskOrder : a.id || 0
      const orderB = b.subtaskOrder !== undefined ? b.subtaskOrder : b.id || 0
      return orderA - orderB
    })
}

function getTopLevelTasks(tasks) {
  return tasks.filter((task) => !hasParentTask(task))
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

  // Get the current max sortOrder for ongoing tasks
  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const request = taskStore.getAll()

  request.onsuccess = () => {
    const allTasks = request.result
    const ongoingTasks = getTopLevelTasks(allTasks).filter(task => !task.status)
    const maxSortOrder = ongoingTasks.length > 0 
      ? Math.max(...ongoingTasks.map(t => t.sortOrder || 0))
      : -1

    const task = {
      title: taskInput.value.trim(),
      type: taskType.value,
      status: false,
      startDate: getTodayDate(),
      endDate: null,
      sortOrder: maxSortOrder + 1
    }

    console.log("Attempting to add task:", task)

    try {
      const writeTransaction = db.transaction(["tasks"], "readwrite")
      const writeTaskStore = writeTransaction.objectStore("tasks")

      const addRequest = writeTaskStore.add(task)

      addRequest.onsuccess = (event) => {
        console.log("Task added successfully, ID:", event.target.result)
        task.id = event.target.result
        taskInput.value = ""
      }

      addRequest.onerror = (event) => {
        console.error("Error adding task:", event.target.error)
        alert("Error adding task. Please try again.")
      }

      writeTransaction.oncomplete = () => {
        console.log("Transaction completed successfully")
        updateDisplayAfterTaskAdd(task)
      }

      writeTransaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error)
      }
    } catch (error) {
      console.error("Error in addTask:", error)
    }
  }
}

function toggleSubtaskForm(parentId) {
  const form = document.getElementById(`subtask-form-${parentId}`)
  if (!form) return

  form.classList.toggle("hidden")
  if (!form.classList.contains("hidden")) {
    const input = form.querySelector('input[name="subtask-title"]')
    if (input) input.focus()
  }
}

function addSubtask(event, parentId) {
  event.preventDefault()
  event.stopPropagation()

  if (!db) {
    console.error("Database not initialized")
    return
  }

  const form = event.target
  const input = form.querySelector('input[name="subtask-title"]')
  const title = input ? input.value.trim() : ""

  if (!title) {
    alert("Please enter a subtask")
    return
  }

  const numericParentId = Number(parentId)
  const readTransaction = db.transaction(["tasks"], "readonly")
  const taskStore = readTransaction.objectStore("tasks")
  const request = taskStore.getAll()

  request.onsuccess = () => {
    const allTasks = request.result
    const parentTask = allTasks.find((task) => task.id === numericParentId)

    if (!parentTask || parentTask.status || hasParentTask(parentTask)) {
      showNotification("Subtasks can only be added to active top-level tasks.", "error")
      return
    }

    const subtasks = getSubtasksForParent(allTasks, numericParentId)
    const maxSubtaskOrder = subtasks.length > 0
      ? Math.max(...subtasks.map((task) => task.subtaskOrder || 0))
      : -1

    const subtask = {
      title,
      type: "Goal",
      status: false,
      startDate: getTodayDate(),
      endDate: null,
      parentId: numericParentId,
      subtaskOrder: maxSubtaskOrder + 1,
    }

    const writeTransaction = db.transaction(["tasks"], "readwrite")
    const writeTaskStore = writeTransaction.objectStore("tasks")
    const addRequest = writeTaskStore.add(subtask)

    addRequest.onsuccess = () => {
      input.value = ""
      form.classList.add("hidden")
    }

    addRequest.onerror = (event) => {
      console.error("Error adding subtask:", event.target.error)
      showNotification("Error adding subtask. Please try again.", "error")
    }

    writeTransaction.oncomplete = () => {
      updateOngoingTasks(false)
    }

    writeTransaction.onerror = (event) => {
      console.error("Subtask transaction error:", event.target.error)
    }
  }

  request.onerror = (event) => {
    console.error("Error checking parent task:", event.target.error)
    showNotification("Error adding subtask. Please try again.", "error")
  }
}

function idbRequestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result)
    request.onerror = (event) => reject(event.target.error)
  })
}

function idbTransactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = (event) => reject(event.target.error)
    transaction.onabort = (event) => reject(event.target.error)
  })
}

async function getTaskCompletionContext(taskId) {
  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const allTasks = await idbRequestToPromise(taskStore.getAll())
  const task = allTasks.find((item) => item.id === taskId)
  return { task, allTasks }
}

function buildTaskCompletionMutation(task, allTasks) {
  const isSubtask = hasParentTask(task)
  const parentTask = isSubtask ? allTasks.find((item) => item.id === task.parentId) : null
  const subtasks = isSubtask ? [] : getSubtasksForParent(allTasks, task.id)
  const incompleteSubtasks = subtasks.filter((subtask) => !subtask.status)
  const today = getTodayDate()
  const completedTask = {
    ...task,
    status: true,
    endDate: today,
    completedAt: Date.now(),
  }
  const isNonNegotiable = task.type === "Non-Negotiable" && !isSubtask
  const activeTopLevelTasks = getTopLevelTasks(allTasks)
    .filter((item) => !item.status && item.id !== task.id)
  const maxSortOrder = activeTopLevelTasks.length > 0
    ? Math.max(...activeTopLevelTasks.map((item) => item.sortOrder || 0))
    : -1
  const successorTask = isNonNegotiable
    ? {
        title: task.title,
        type: "Non-Negotiable",
        status: false,
        startDate: today,
        endDate: null,
        sortOrder: maxSortOrder + 1,
      }
    : null

  return {
    id: task.id,
    task,
    completedTask,
    allTasks,
    isSubtask,
    parentTask,
    subtasks,
    incompleteSubtasks,
    isNonNegotiable,
    successorTask,
  }
}

function getCompletionCheckbox(taskElement, isSubtask) {
  if (!taskElement) return null
  const selector = isSubtask ? ".confirmation-button" : ".task-parent-row .confirmation-button"
  return taskElement.querySelector(selector)
}

function setCompletionCheckboxState(checkbox, checked, disabled) {
  if (!checkbox) return
  checkbox.checked = checked
  checkbox.disabled = disabled
}

function setCompletionAnimationHeight(element) {
  if (!element || !element.style || typeof element.style.setProperty !== "function") return

  const rect = typeof element.getBoundingClientRect === "function"
    ? element.getBoundingClientRect()
    : null
  const height = Math.ceil((rect && rect.height) || element.scrollHeight || 0)
  if (height > 0) {
    element.style.setProperty("--completion-height", `${height}px`)
  }
}

function clearCompletionAnimationHeight(element) {
  if (!element || !element.style || typeof element.style.removeProperty !== "function") return

  element.style.removeProperty("--completion-height")
}

function removeElementWithCompletionAnimation(element, className, afterRemove) {
  if (!element) return null
  let removed = false
  const finishRemoval = () => {
    if (removed) return
    removed = true
    if (element.parentNode) {
      element.remove()
    }
    if (typeof afterRemove === "function") {
      afterRemove()
    }
  }

  setCompletionAnimationHeight(element)
  element.classList.add(className)
  element.addEventListener("animationend", finishRemoval, { once: true })
  const fallbackTimer = setTimeout(finishRemoval, className === "subtask-completing" ? 450 : 650)
  return {
    cancel() {
      removed = true
      clearTimeout(fallbackTimer)
    },
  }
}

function addOngoingEmptyStateIfNeeded(patch) {
  const taskList = document.getElementById("ongoing-tasks")
  if (!taskList || taskList.children.length > 0) return

  const emptyState = document.createElement("div")
  emptyState.className = "empty-state"
  emptyState.innerHTML = '<span class="material-symbols-outlined">inventory_2</span>No ongoing tasks. Add one below!'
  taskList.appendChild(emptyState)
  patch.addedOngoingEmptyState = emptyState
}

function patchParentSubtaskProgress(mutation, patch) {
  if (!mutation.isSubtask || !mutation.parentTask) return

  const parentElement = document.querySelector(`[data-task-id="${mutation.parentTask.id}"]`)
  if (!parentElement) return

  const subtasks = getSubtasksForParent(mutation.allTasks, mutation.parentTask.id)
  const incompleteBefore = subtasks.filter((subtask) => !subtask.status).length
  const incompleteAfter = Math.max(incompleteBefore - 1, 0)
  const completedAfter = subtasks.length - incompleteAfter
  const progressElement = parentElement.querySelector(".subtask-progress")
  const subtaskList = parentElement.querySelector(".subtask-list")

  patch.parentProgress = {
    element: parentElement,
    incompleteSubtasks: parentElement.dataset.incompleteSubtasks,
    progressText: progressElement ? progressElement.textContent : null,
    subtaskListHTML: subtaskList ? subtaskList.innerHTML : null,
  }

  parentElement.dataset.incompleteSubtasks = String(incompleteAfter)
  if (progressElement) {
    progressElement.textContent = `${completedAfter}/${subtasks.length} done`
  }
  if (subtaskList && incompleteAfter === 0) {
    subtaskList.innerHTML = '<div class="subtask-empty">All subtasks complete</div>'
  }
}

function createCompletedTaskElement(task, parentTask = null, index = 0, animate = true) {
  const isSubtask = hasParentTask(task)
  const titleHTML = isSubtask && parentTask
    ? `<span class="completed-parent-title">${escapeHTML(parentTask.title)}</span><span class="completed-separator">/</span><span>${escapeHTML(task.title)}</span>`
    : `<span>${escapeHTML(task.title)}</span>`
  const taskElement = document.createElement("div")
  taskElement.className = animate ? "completed-item stagger-" + Math.min(index + 1, 8) : "completed-item"
  taskElement.dataset.completedTaskId = task.id
  taskElement.innerHTML = `
                <div class="completed-title-wrap">
                    <span class="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
                    <span class="completed-title-text">${titleHTML}</span>
                    ${isSubtask ? '<span class="completed-subtask-badge">Subtask</span>' : ''}
                </div>
                <span class="text-xs font-medium text-zinc-400 dark:text-zinc-500">${task.endDate}</span>
            `
  return taskElement
}

function prependCompletedTaskElement(task, parentTask, patch) {
  const completedList = document.getElementById("completed-tasks")
  if (!completedList) return null

  const emptyState = completedList.querySelector(".empty-state")
  if (emptyState) {
    patch.completedEmptyStateHTML = emptyState.outerHTML || emptyState.innerHTML
    emptyState.remove()
  }

  const taskElement = createCompletedTaskElement(task, parentTask, 0, true)
  if (completedList.firstChild) {
    completedList.insertBefore(taskElement, completedList.firstChild)
  } else {
    completedList.appendChild(taskElement)
  }

  const heading = document.getElementById("completed-tasks-heading")
  if (heading) {
    patch.completedHeadingText = heading.textContent
    heading.textContent = isCompletedTasksCollapsed
      ? "Latest Completion"
      : currentView === "tasks" ? "All Completed Tasks" : "Recent Completions"
  }

  const limit = isCompletedTasksCollapsed ? 1 : currentView !== "tasks" ? 5 : null
  if (limit) {
    patch.trimmedCompletedElements = []
    while (completedList.children.length > limit) {
      const element = completedList.lastElementChild
      patch.trimmedCompletedElements.unshift(element)
      completedList.removeChild(element)
    }
  }

  return taskElement
}

function patchTodayCompletionCount(patch) {
  const countElement = document.getElementById("today-completed-count")
  if (!countElement) return

  patch.todayCountText = countElement.textContent
  const currentCount = Number.parseInt(countElement.textContent, 10)
  const nextCount = Number.isNaN(currentCount) ? 1 : currentCount + 1
  countElement.textContent = `${nextCount} tasks completed`
}

function patchSevenDayOverviewToday(patch) {
  const todayCell = document.querySelector(`[data-overview-date="${getTodayDate()}"]`)
  const countElement = todayCell ? todayCell.querySelector(".day-count") : null
  if (!countElement) return

  patch.todayOverview = {
    element: countElement,
    text: countElement.textContent,
    className: countElement.className,
  }

  const currentCount = Number.parseInt(countElement.textContent, 10)
  const nextCount = Number.isNaN(currentCount) ? 1 : currentCount + 1
  countElement.textContent = String(nextCount)
  countElement.classList.remove("zero")
  countElement.classList.add("positive")
}

function patchProgressChartToday(patch) {
  if (!currentChart || !currentChart.data || !currentChart.data.datasets) return

  const actualDataset = currentChart.data.datasets[1]
  if (!actualDataset || !Array.isArray(actualDataset.data)) return

  const labels = currentChart.data.labels || []
  let todayIndex = labels.indexOf(getTodayDate())
  if (todayIndex === -1) {
    todayIndex = actualDataset.data.length - 1
  }
  if (todayIndex < 0) return

  patch.chartActualData = [...actualDataset.data]
  for (let index = todayIndex; index < actualDataset.data.length; index++) {
    actualDataset.data[index] = Number(actualDataset.data[index] || 0) + 1
  }
  currentChart.update("none")
}

function applyOptimisticTaskCompletion(mutation) {
  const taskElement = document.querySelector(`[data-task-id="${mutation.id}"]`)
  const checkbox = getCompletionCheckbox(taskElement, mutation.isSubtask)
  const patch = {
    taskElement,
    checkbox,
    originalParent: taskElement ? taskElement.parentNode : null,
    originalNextSibling: taskElement ? taskElement.nextSibling : null,
    originalClassName: taskElement ? taskElement.className : null,
  }

  setCompletionCheckboxState(checkbox, true, true)

  if (taskElement) {
    launchConfetti(taskElement)
    if (mutation.isNonNegotiable) {
      taskElement.classList.add("task-celebrating")
    } else {
      const className = mutation.isSubtask ? "subtask-completing" : "task-completing"
      patch.removal = removeElementWithCompletionAnimation(taskElement, className, () => {
        if (mutation.isSubtask) {
          patchParentSubtaskProgress(mutation, patch)
        } else {
          addOngoingEmptyStateIfNeeded(patch)
        }
        syncDashboardTaskCardHeight()
      })
    }
  }

  patch.completedElement = prependCompletedTaskElement(mutation.completedTask, mutation.parentTask, patch)
  patchTodayCompletionCount(patch)
  patchSevenDayOverviewToday(patch)
  patchProgressChartToday(patch)
  syncDashboardTaskCardHeight()

  return patch
}

function restoreCompletedTasksList(patch) {
  const completedList = document.getElementById("completed-tasks")
  if (!completedList) return

  if (patch.completedElement && patch.completedElement.parentNode) {
    patch.completedElement.remove()
  }
  if (patch.trimmedCompletedElements) {
    patch.trimmedCompletedElements.forEach((element) => completedList.appendChild(element))
  }
  if (patch.completedEmptyStateHTML && completedList.children.length === 0) {
    completedList.innerHTML = patch.completedEmptyStateHTML
  }
  const heading = document.getElementById("completed-tasks-heading")
  if (heading && patch.completedHeadingText !== undefined) {
    heading.textContent = patch.completedHeadingText
  }
}

function rollbackOptimisticTaskCompletion(patch) {
  if (!patch) return

  if (patch.addedOngoingEmptyState && patch.addedOngoingEmptyState.parentNode) {
    patch.addedOngoingEmptyState.remove()
  }
  if (patch.removal) {
    patch.removal.cancel()
  }
  if (patch.taskElement) {
    patch.taskElement.className = patch.originalClassName || patch.taskElement.className
    clearCompletionAnimationHeight(patch.taskElement)
    if (!patch.taskElement.parentNode && patch.originalParent) {
      patch.originalParent.insertBefore(patch.taskElement, patch.originalNextSibling || null)
    }
  }
  setCompletionCheckboxState(patch.checkbox, false, false)

  if (patch.parentProgress) {
    const parentElement = patch.parentProgress.element
    parentElement.dataset.incompleteSubtasks = patch.parentProgress.incompleteSubtasks
    const progressElement = parentElement.querySelector(".subtask-progress")
    if (progressElement && patch.parentProgress.progressText !== null) {
      progressElement.textContent = patch.parentProgress.progressText
    }
    const subtaskList = parentElement.querySelector(".subtask-list")
    if (subtaskList && patch.parentProgress.subtaskListHTML !== null) {
      subtaskList.innerHTML = patch.parentProgress.subtaskListHTML
    }
  }

  restoreCompletedTasksList(patch)

  const countElement = document.getElementById("today-completed-count")
  if (countElement && patch.todayCountText !== undefined) {
    countElement.textContent = patch.todayCountText
  }
  if (patch.todayOverview) {
    patch.todayOverview.element.textContent = patch.todayOverview.text
    patch.todayOverview.element.className = patch.todayOverview.className
  }
  if (currentChart && patch.chartActualData) {
    currentChart.data.datasets[1].data = patch.chartActualData
    currentChart.update("none")
  }
  syncDashboardTaskCardHeight()
}

async function persistTaskCompletion(mutation) {
  const transaction = db.transaction(["tasks"], "readwrite")
  const taskStore = transaction.objectStore("tasks")
  const transactionComplete = idbTransactionDone(transaction)
  let successorTask = null

  await idbRequestToPromise(taskStore.put(mutation.completedTask))
  if (mutation.successorTask) {
    const successorId = await idbRequestToPromise(taskStore.add(mutation.successorTask))
    successorTask = { ...mutation.successorTask, id: successorId }
  }

  await transactionComplete
  return { successorTask }
}

function insertOngoingTaskElementSorted(taskElement) {
  const taskList = document.getElementById("ongoing-tasks")
  if (!taskList || !taskElement) return

  const emptyState = taskList.querySelector(".empty-state")
  if (emptyState) {
    emptyState.remove()
  }

  const newSortOrder = Number(taskElement.dataset.sortOrder || 0)
  const siblings = Array.from(taskList.querySelectorAll(".task-parent"))
  const nextElement = siblings.find((element) => Number(element.dataset.sortOrder || 0) > newSortOrder)
  taskList.insertBefore(taskElement, nextElement || null)
}

function replaceOngoingTaskElement(task, allTasks, taskElement) {
  if (!task || !taskElement) return

  const newTaskElement = createOngoingTaskElement(task, [...allTasks, task], 0, false)
  if (taskElement.parentNode) {
    taskElement.remove()
  }
  insertOngoingTaskElementSorted(newTaskElement)
  syncDashboardTaskCardHeight()
}

function finalizeOptimisticTaskCompletion(mutation, patch, result) {
  if (mutation.isNonNegotiable && result.successorTask) {
    replaceOngoingTaskElement(result.successorTask, mutation.allTasks, patch.taskElement)
  }
  if (typeof updateStreak === "function") {
    updateStreak()
  }
}

function resetRejectedCompletionCheckbox(taskId, isSubtask = false) {
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`)
  const isSubtaskElement = isSubtask || Boolean(taskElement?.classList.contains("subtask-item"))
  const checkbox = getCompletionCheckbox(taskElement, isSubtaskElement)
  setCompletionCheckboxState(checkbox, false, false)
}

// Mark a task as complete and create next day's task if Non-Negotiable
async function completeTask(taskId) {
  const numericTaskId = Number(taskId)
  if (!db || Number.isNaN(numericTaskId)) {
    resetRejectedCompletionCheckbox(numericTaskId)
    return
  }
  if (taskCompletionsInFlight.has(numericTaskId)) return

  const initialTaskElement = document.querySelector(`[data-task-id="${numericTaskId}"]`)
  const initialIsSubtask = Boolean(initialTaskElement?.classList.contains("subtask-item"))
  const initialIncompleteSubtasks = Number(initialTaskElement?.dataset.incompleteSubtasks || 0)
  if (!initialIsSubtask && initialIncompleteSubtasks > 0) {
    resetRejectedCompletionCheckbox(numericTaskId)
    showNotification("Finish all subtasks before completing the parent task.", "info")
    return
  }

  taskCompletionsInFlight.add(numericTaskId)
  let patch = null

  try {
    const { task, allTasks } = await getTaskCompletionContext(numericTaskId)
    if (!task) {
      resetRejectedCompletionCheckbox(numericTaskId)
      showNotification("Task not found.", "error")
      return
    }

    const mutation = buildTaskCompletionMutation(task, allTasks)
    if (!mutation.isSubtask && mutation.incompleteSubtasks.length > 0) {
      resetRejectedCompletionCheckbox(numericTaskId)
      showNotification("Finish all subtasks before completing the parent task.", "info")
      return
    }

    patch = applyOptimisticTaskCompletion(mutation)
    const result = await persistTaskCompletion(mutation)
    finalizeOptimisticTaskCompletion(mutation, patch, result)
  } catch (error) {
    console.error("Error completing task:", error)
    rollbackOptimisticTaskCompletion(patch)
    showNotification("Error completing task. Please try again.", "error")
  } finally {
    taskCompletionsInFlight.delete(numericTaskId)
  }
}

// Launch confetti particles from a task element
function launchConfetti(taskElement) {
  const rect = taskElement.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const colors = ['#6366f1', '#34d399', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
  const particleCount = 30

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'confetti-particle'
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = Math.random() * 6 + 4
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
    const velocity = Math.random() * 80 + 60
    const tx = Math.cos(angle) * velocity
    const ty = Math.sin(angle) * velocity - Math.random() * 40
    const rotation = Math.random() * 720 - 360

    particle.style.cssText = `
      left: ${centerX}px;
      top: ${centerY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      --tx: ${tx}px;
      --ty: ${ty}px;
      --r: ${rotation}deg;
    `
    document.body.appendChild(particle)
    setTimeout(() => particle.remove(), 800)
  }
}

// Update all display elements on the page
async function updateDisplay() {
  await updateTodayInfo()
  updateOngoingTasks()
  updateCompletedTasks()
  updateStreak()
  updateLast7DaysOverview()
  updateChart()
}

// Lighter update after task completion - skips quote refresh unless the task list needs rebuilding.
function updateDisplayAfterTaskChange(refreshOngoingTasks = false) {
  if (refreshOngoingTasks) {
    updateOngoingTasks(false)
  }
  updateTodayCompletionCount()
  updateCompletedTasks()
  updateStreak()
  updateLast7DaysOverview()
  updateChart()
}

function updateDisplayAfterTaskAdd(task) {
  const taskList = document.getElementById("ongoing-tasks")

  if (!taskList || !task || hasParentTask(task)) {
    updateOngoingTasks(false)
    return
  }

  if (typeof taskList.querySelector !== "function" ||
      typeof taskList.querySelectorAll !== "function") {
    updateOngoingTasks(false)
    return
  }

  if (taskList.querySelector(`[data-task-id="${task.id}"]`)) {
    return
  }

  const emptyState = taskList.querySelector(".empty-state")
  if (emptyState) {
    emptyState.remove()
  }

  const taskIndex = taskList.querySelectorAll(".task-parent").length
  taskList.appendChild(createOngoingTaskElement(task, [task], taskIndex, false))
  syncDashboardTaskCardHeight()
}

function syncDashboardTaskCardHeight() {
  const dashboard = document.getElementById("dashboard-section")
  const ongoingCard = document.querySelector(".ongoing-tasks-card")
  const statsColumn = document.querySelector(".dashboard-stats-column")

  if (!dashboard || !ongoingCard || !statsColumn) return

  if (dashboardHeightSyncFrame) {
    cancelAnimationFrame(dashboardHeightSyncFrame)
  }

  dashboardHeightSyncFrame = requestAnimationFrame(() => {
    dashboardHeightSyncFrame = null

    if (window.innerWidth < 1024 || dashboard.classList.contains("hidden")) {
      ongoingCard.style.height = ""
      return
    }

    const visibleCards = Array.from(statsColumn.children).filter((element) => {
      return element.getClientRects().length > 0 && !element.classList.contains("hidden")
    })

    if (visibleCards.length === 0) {
      ongoingCard.style.height = ""
      return
    }

    const firstCardRect = visibleCards[0].getBoundingClientRect()
    const lastCardRect = visibleCards[visibleCards.length - 1].getBoundingClientRect()
    const targetHeight = Math.ceil(lastCardRect.bottom - firstCardRect.top)

    if (targetHeight > 0) {
      ongoingCard.style.height = `${targetHeight}px`
    }
  })
}

// Update the today's info section with date and quote
async function updateTodayInfo() {
  const today = new Date()
  const todayInfo = document.getElementById("today-info")
  const quote = getRandomQuote()
  const todayStr = getTodayDate()

  if (!todayInfo) return

  try {
    const completedToday = await getCompletedTasksCountForDate(todayStr)
    const routineBadgeHTML = getTodayRoutineBadgeHTML(await getTodayRoutineName())

    todayInfo.innerHTML = `
            <div class="today-summary-row">
                <h2 class="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">Today is the ${today.getDate()} of ${today.toLocaleString("default", { month: "long" })}</h2>
                ${routineBadgeHTML}
                <span class="text-zinc-300 dark:text-zinc-600">&middot;</span>
                <span id="today-completed-count" class="text-sm font-medium text-zinc-500 dark:text-zinc-400">${completedToday} tasks completed</span>
            </div>
            <div class="quote-streak-row">
                <div class="quote-box">
                    <p class="italic text-sm md:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 pl-4">"${escapeHTML(quote.text)}"</p>
                    ${quote.author ? `<p class="text-right text-xs text-zinc-400 dark:text-zinc-500 mt-2">- ${escapeHTML(quote.author)}</p>` : ''}
                </div>
                <div class="compact-streak-card" aria-label="Current streak">
                    <div class="compact-streak-icon">
                        <span class="material-symbols-outlined fill">local_fire_department</span>
                    </div>
                    <div class="min-w-0">
                        <p class="compact-streak-label">Current Streak</p>
                        <span id="streak-count" class="compact-streak-count">0 days</span>
                    </div>
                </div>
            </div>
        `
  } catch (error) {
    console.error("Error updating today's info:", error)
  }
}

function updateTodayCompletionCount() {
  if (!db) return

  const countElement = document.getElementById("today-completed-count")
  if (!countElement) return

  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const index = taskStore.index("endDate")
  const request = index.count(IDBKeyRange.only(getTodayDate()))

  request.onsuccess = () => {
    countElement.textContent = `${request.result} tasks completed`
  }

  request.onerror = (event) => {
    console.error("Error updating today's completion count:", event.target.error)
  }
}

function createOngoingTaskElement(task, allTasks, index, animate = true) {
  const subtasks = getSubtasksForParent(allTasks, task.id)
  const incompleteSubtasks = subtasks.filter((subtask) => !subtask.status)
  const completedSubtasks = subtasks.length - incompleteSubtasks.length
  const progressHTML = subtasks.length > 0
    ? `<span class="subtask-progress">${completedSubtasks}/${subtasks.length} done</span>`
    : ""
  const subtaskListHTML = incompleteSubtasks.length > 0
    ? `<div class="subtask-list">
        ${incompleteSubtasks.map((subtask) => `
          <div class="subtask-item" data-task-id="${subtask.id}">
            <input type="checkbox" onchange="completeTask(${subtask.id})" class="confirmation-button" aria-label="Complete subtask ${escapeHTML(subtask.title)}">
            <span class="subtask-title">${escapeHTML(subtask.title)}</span>
            <button type="button" onclick="deleteTask(${subtask.id})" class="task-delete-btn" title="Delete subtask">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        `).join('')}
      </div>`
    : subtasks.length > 0
      ? `<div class="subtask-list"><div class="subtask-empty">All subtasks complete</div></div>`
      : ""
  const taskElement = document.createElement("div")
  taskElement.className = animate ? "task-item task-parent stagger-" + Math.min(index + 1, 8) : "task-item task-parent"
  taskElement.draggable = true
  taskElement.dataset.taskId = task.id
  taskElement.dataset.incompleteSubtasks = incompleteSubtasks.length
  taskElement.dataset.sortOrder = task.sortOrder !== undefined ? task.sortOrder : index
  const badgeClass = task.type === 'Non-Negotiable' ? 'non-negotiable' : 'goal'
  taskElement.innerHTML = `
              <div class="task-parent-row">
                <span class="material-symbols-outlined drag-handle text-lg">drag_indicator</span>
                <input type="checkbox" onchange="completeTask(${task.id})" class="confirmation-button" aria-label="Complete task ${escapeHTML(task.title)}">
                <span class="task-title-text">${escapeHTML(task.title)}</span>
                <div class="task-meta-actions">
                  ${progressHTML}
                  <span class="task-type-badge ${badgeClass}">${task.type}</span>
                  <button type="button" onclick="toggleSubtaskForm(${task.id})" class="subtask-toggle-btn" title="Add subtask" aria-controls="subtask-form-${task.id}">
                    <span class="material-symbols-outlined text-base">add_task</span>
                    <span class="subtask-toggle-text">Subtask</span>
                  </button>
                  <button type="button" onclick="deleteTask(${task.id})" class="task-delete-btn" title="Delete task">
                    <span class="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>
              ${subtaskListHTML}
              <form id="subtask-form-${task.id}" class="subtask-form hidden" onsubmit="addSubtask(event, ${task.id})">
                <input type="text" name="subtask-title" placeholder="Add a subtask" class="input-field subtask-input" autocomplete="off">
                <button type="submit" class="btn-primary subtask-add-btn">
                  <span class="material-symbols-outlined text-base">add</span>
                  Add
                </button>
                <button type="button" onclick="toggleSubtaskForm(${task.id})" class="btn-ghost subtask-cancel-btn">Cancel</button>
              </form>
          `

  taskElement.addEventListener('dragstart', handleDragStart)
  taskElement.addEventListener('dragover', handleDragOver)
  taskElement.addEventListener('drop', handleDrop)
  taskElement.addEventListener('dragend', handleDragEnd)
  taskElement.addEventListener('dragenter', handleDragEnter)
  taskElement.addEventListener('dragleave', handleDragLeave)

  return taskElement
}

// Update the list of ongoing (uncompleted) tasks
// animate: whether to play stagger entry animations (default true on initial load)
function updateOngoingTasks(animate = true) {
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

      let tasks = getTopLevelTasks(allTasks).filter((task) => !task.status)

      tasks.sort((a, b) => {
        const orderA = a.sortOrder !== undefined ? a.sortOrder : a.order !== undefined ? a.order : 999999
        const orderB = b.sortOrder !== undefined ? b.sortOrder : b.order !== undefined ? b.order : 999999
        return orderA - orderB
      })

      console.log("Filtered and sorted ongoing tasks:", tasks)

      if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">inventory_2</span>No ongoing tasks. Add one below!</div>'
        syncDashboardTaskCardHeight()
        return
      }

      tasks.forEach((task, index) => {
        taskList.appendChild(createOngoingTaskElement(task, allTasks, index, animate))
      })

      syncDashboardTaskCardHeight()
    }

    request.onerror = (event) => {
      console.error("Error fetching tasks:", event.target.error)
      taskList.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span>Error loading tasks</div>'
      syncDashboardTaskCardHeight()
    }
  } catch (error) {
    console.error("Error in updateOngoingTasks:", error)
  }
}

// Update the list of recently completed tasks
function updateCompletedTasks() {
  const completedList = document.getElementById("completed-tasks")
  if (!completedList || !db) return
  
  completedList.innerHTML = ""

  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")

  // Get all tasks and filter for completed ones in JavaScript
  const request = taskStore.getAll()

  request.onsuccess = () => {
    const allTasks = request.result
    const taskById = new Map(allTasks.map((task) => [task.id, task]))
    let tasks = allTasks
      .filter((task) => task.status === true) // Filter completed tasks
      .sort((a, b) => {
        // Sort by precise completion time first, then fallback to endDate and id
        const completedAtDiff = (b.completedAt || 0) - (a.completedAt || 0)
        if (completedAtDiff !== 0) return completedAtDiff

        const dateDiff = new Date(b.endDate) - new Date(a.endDate)
        if (dateDiff !== 0) return dateDiff
        return b.id - a.id
      })
    
    // Collapsed mode: show only the latest completed task
    if (isCompletedTasksCollapsed) {
      tasks = tasks.slice(0, 1)
    }
    // Expanded mode: only show last 5 on dashboard, show all on My Tasks screen
    else if (currentView !== "tasks") {
      tasks = tasks.slice(0, 5)
    }

    if (tasks.length === 0) {
      completedList.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">check_circle</span>No completed tasks yet</div>'
      syncDashboardTaskCardHeight()
      return
    }

    // Update heading based on collapsed state and view
    const heading = document.getElementById('completed-tasks-heading')
    if (heading) {
      if (isCompletedTasksCollapsed) {
        heading.textContent = "Latest Completion"
      } else {
        heading.textContent = currentView === "tasks" ? "All Completed Tasks" : "Recent Completions"
      }
    }

    tasks.forEach((task, index) => {
      const parentTask = hasParentTask(task) ? taskById.get(task.parentId) : null
      completedList.appendChild(createCompletedTaskElement(task, parentTask, index, true))
    })

    syncDashboardTaskCardHeight()
  }

  request.onerror = (event) => {
    console.error("Error fetching completed tasks:", event.target.error)
    completedList.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span>Error loading completed tasks</div>'
    syncDashboardTaskCardHeight()
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
    const isDark = document.documentElement.classList.contains('dark')
    const gridColor = isDark ? 'rgba(63, 63, 70, 0.3)' : 'rgba(228, 228, 231, 0.6)'
    const textColor = isDark ? '#a1a1aa' : '#71717a'

    currentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Expected",
            data: expected,
            borderColor: "#a5b4fc",
            backgroundColor: "rgba(165, 180, 252, 0.08)",
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "#a5b4fc",
          },
          {
            label: "Actual",
            data: actual,
            borderColor: "#34d399",
            backgroundColor: "rgba(52, 211, 153, 0.08)",
            fill: true,
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#34d399",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: { size: 11, family: 'Inter' },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#27272a' : '#ffffff',
            titleColor: isDark ? '#e4e4e7' : '#18181b',
            bodyColor: isDark ? '#a1a1aa' : '#71717a',
            borderColor: isDark ? '#3f3f46' : '#e4e4e7',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, family: 'Inter', weight: '600' },
            bodyFont: { size: 11, family: 'Inter' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor, drawBorder: false },
            ticks: { color: textColor, font: { size: 10, family: 'Inter' } },
            border: { display: false },
          },
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 9, family: 'Inter' }, maxRotation: 0, maxTicksLimit: 8 },
            border: { display: false },
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
    
    overviewElement.innerHTML = results.map((day, i) => {
      const countClass = day.count > 0 ? 'positive' : 'zero'
      const parts = day.date.split(', ')
      const shortDate = parts[0] || day.date
      return `
        <div class="day-cell stagger-${i + 1}" data-overview-date="${dates[i]}">
          <span class="day-label">${shortDate}</span>
          <span class="day-count ${countClass}">${day.count}</span>
        </div>
      `
    }).join('')

    syncDashboardTaskCardHeight()
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

function deleteTask(taskId) {
  const numericTaskId = Number(taskId)
  const readTransaction = db.transaction(["tasks"], "readonly")
  const taskStore = readTransaction.objectStore("tasks")
  const request = taskStore.getAll()

  request.onsuccess = () => {
    const allTasks = request.result
    const task = allTasks.find((item) => item.id === numericTaskId)

    if (!task) {
      showNotification("Task not found.", "error")
      return
    }

    const childTasks = allTasks.filter((item) => item.parentId === numericTaskId)
    const deleteMessage = childTasks.length > 0
      ? `Delete this task and its ${childTasks.length} subtasks? This cannot be undone.`
      : "Are you sure you want to delete this task?"

    if (!confirm(deleteMessage)) {
      return
    }

    const writeTransaction = db.transaction(["tasks"], "readwrite")
    const writeTaskStore = writeTransaction.objectStore("tasks")

    writeTaskStore.delete(numericTaskId)
    childTasks.forEach((childTask) => {
      writeTaskStore.delete(childTask.id)
    })

    writeTransaction.oncomplete = () => {
      console.log("Task deleted successfully")
      updateDisplay()
    }

    writeTransaction.onerror = (event) => {
      console.error("Error deleting task:", event.target.error)
      alert("Error deleting task. Please try again.")
    }
  }

  request.onerror = (event) => {
    console.error("Error checking task before delete:", event.target.error)
    alert("Error deleting task. Please try again.")
  }
}

// Drag and Drop Event Handlers

function handleDragStart(e) {
  draggedElement = this
  draggedTaskId = parseInt(this.dataset.taskId)
  this.style.opacity = '0.4'
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/html', this.innerHTML)
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault()
  }
  e.dataTransfer.dropEffect = 'move'
  return false
}

function handleDragEnter(e) {
  if (this !== draggedElement) {
    this.classList.add('drag-over')
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over')
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation()
  }
  
  this.classList.remove('drag-over')
  
  if (draggedElement !== this) {
    // Get all task elements
    const taskList = document.getElementById("ongoing-tasks")
    const allTasks = Array.from(taskList.children).filter((task) => task.classList.contains('task-parent'))
    
    // Find positions
    const draggedIndex = allTasks.indexOf(draggedElement)
    const targetIndex = allTasks.indexOf(this)
    
    // Reorder DOM elements
    if (draggedIndex < targetIndex) {
      this.parentNode.insertBefore(draggedElement, this.nextSibling)
    } else {
      this.parentNode.insertBefore(draggedElement, this)
    }
    
    // Save new order to database
    saveTaskOrder()
  }
  
  return false
}

function handleDragEnd(e) {
  this.style.opacity = '1'
  
  // Remove all drag styling
  const taskList = document.getElementById("ongoing-tasks")
  const allTasks = Array.from(taskList.children).filter((task) => task.classList.contains('task-parent'))
  allTasks.forEach(task => {
    task.classList.remove('drag-over')
  })
}

// Save the current task order to database
function saveTaskOrder() {
  const taskList = document.getElementById("ongoing-tasks")
  const taskElements = Array.from(taskList.children).filter((task) => task.classList.contains('task-parent'))
  
  // Get task IDs in current order
  const taskIds = taskElements.map(el => parseInt(el.dataset.taskId))
  
  // Update sortOrder in database
  const transaction = db.transaction(["tasks"], "readwrite")
  const taskStore = transaction.objectStore("tasks")
  
  taskIds.forEach((taskId, index) => {
    const getRequest = taskStore.get(taskId)
    getRequest.onsuccess = () => {
      const task = getRequest.result
      if (task) {
        task.sortOrder = index
        taskStore.put(task)
      }
    }
  })
  
  transaction.oncomplete = () => {
    console.log("Task order saved successfully")
  }
  
  transaction.onerror = (event) => {
    console.error("Error saving task order:", event.target.error)
  }
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
  controlBtn.innerHTML = '<span class="material-symbols-outlined text-lg">stop</span> Stop';
  controlBtn.className = "btn-danger h-10 px-6 flex items-center gap-2";

  // Add running animation to timer display
  document.getElementById("timer-display").classList.add("timer-running");

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
  controlBtn.innerHTML = '<span class="material-symbols-outlined text-lg">play_arrow</span> Start';
  controlBtn.className = "btn-success h-10 px-6 flex items-center gap-2";

  // Remove running animation from timer display
  document.getElementById("timer-display").classList.remove("timer-running");

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
      countersContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">hourglass_empty</span>No tracked tasks yet</div>';
      return;
    }

    countersContainer.innerHTML = Object.entries(taskTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([taskName, totalSeconds], i) => `
        <div class="time-entry-item stagger-${Math.min(i + 1, 8)}">
          <span class="flex-grow text-sm font-medium text-zinc-700 dark:text-zinc-200">${taskName}</span>
          <span class="text-xs font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">${formatTime(totalSeconds)}</span>
          <button onclick="startTimerWithTask('${taskName.replace(/'/g, "\\'")}')" class="task-delete-btn" style="color: #10b981" title="Start timer for this task">
            <span class="material-symbols-outlined text-lg">play_circle</span>
          </button>
          <button onclick="deleteTaskTimeTracking('${taskName.replace(/'/g, "\\'")}')" class="task-delete-btn" title="Delete task time tracking">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      `).join("");
  };

  request.onerror = (event) => {
    console.error("Error fetching time tracking data:", event.target.error);
    countersContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span>Error loading counters</div>';
  };
}

// Update task history (last 3 sessions)
function updateTaskHistory() {
  const historyContainer = document.getElementById("task-history");

  if (!db) {
    historyContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">history</span>No recent sessions</div>';
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
      historyContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">history</span>No recent sessions</div>';
      return;
    }

    historyContainer.innerHTML = recentEntries.map((entry, i) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `
        <div class="completed-item stagger-${Math.min(i + 1, 8)}">
          <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200">${entry.taskName}</span>
          <span class="text-xs font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">${formatTime(entry.seconds)} &middot; ${dateStr}</span>
        </div>
      `;
    }).join("");
  };

  request.onerror = (event) => {
    console.error("Error fetching task history:", event.target.error);
    historyContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span>Error loading history</div>';
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
      '#818cf8', '#34d399', '#fb923c', '#f87171', '#a78bfa',
      '#38bdf8', '#fbbf24', '#f472b6', '#4ade80', '#e879f9'
    ];

    const isDark = document.documentElement.classList.contains('dark')
    const textColor = isDark ? '#a1a1aa' : '#71717a'

    // Create new pie chart
    currentPieChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: isDark ? '#18181b' : '#ffffff',
          borderWidth: 3,
          borderRadius: 4,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              font: { size: 11, family: 'Inter' },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14,
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#27272a' : '#ffffff',
            titleColor: isDark ? '#e4e4e7' : '#18181b',
            bodyColor: isDark ? '#a1a1aa' : '#71717a',
            borderColor: isDark ? '#3f3f46' : '#e4e4e7',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, family: 'Inter', weight: '600' },
            bodyFont: { size: 11, family: 'Inter' },
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const formattedTime = formatTime(value);
                return ` ${label}: ${formattedTime}`;
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
      timeTracking: [],
      routines: getDefaultWeeklyRoutines()
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

    const routines = await getWeeklyRoutines();

    // Validate exported data
    if (!Array.isArray(tasks) || !Array.isArray(timeTracking)) {
      throw new Error("Exported data is not in expected format");
    }

    exportData.tasks = tasks;
    exportData.timeTracking = timeTracking;
    exportData.routines = routines;

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
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-lg flex-shrink-0">
        ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds with exit animation
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('exiting');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
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
        if (task.parentId !== undefined && task.parentId !== null && typeof task.parentId !== 'number') {
          throw new Error("Invalid task data: parentId must be a number when provided");
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

      const routinesToImport = normalizeWeeklyRoutines(importData.routines);

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

      await setWeeklyRoutines(routinesToImport);

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
      timeTracking: [],
      routines: getDefaultWeeklyRoutines()
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
    exportData.routines = await getWeeklyRoutines();

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

    const routinesToImport = normalizeWeeklyRoutines(importData.routines);

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

    await setWeeklyRoutines(routinesToImport);

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
        timeTracking: [],
        routines: getDefaultWeeklyRoutines()
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
      exportData.routines = await getWeeklyRoutines();

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
  
  statusElement.className = `p-3 rounded-xl text-sm ${
    type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
    type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
    'bg-indigo-50 text-indigo-700 border border-indigo-200'
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

  await populateDailyAlertSettingsUI()
}



