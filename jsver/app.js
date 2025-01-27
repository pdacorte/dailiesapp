// Initialize IndexedDB
let db
const dbName = "dailiesDB"
const dbVersion = 1

// Add this at the top of the file with other global variables
let currentChart = null

// Add this near the top of the file with other constants
const motivationalQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "Everything you've ever wanted is sitting on the other side of fear.",
    author: "George Addair",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
  },
]

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.classList.toggle("dark", savedTheme === "dark")
  initializeDB()
  setupEventListeners()
})

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
  }

  request.onsuccess = (event) => {
    console.log("Database initialized successfully")
    db = event.target.result
    updateDisplay()
  }
}

function setupEventListeners() {
  document.getElementById("add-task-form").addEventListener("submit", (e) => {
    e.preventDefault()
    addTask()
  })

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme)
}

// Helper Functions
function formatDate(date) {
  return new Date(date).toISOString().split("T")[0]
}

function getTodayDate() {
  return formatDate(new Date())
}

// Add this function to get a random quote
function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
  return motivationalQuotes[randomIndex]
}

// Task Management
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

function completeTask(taskId) {
  const transaction = db.transaction(["tasks"], "readwrite")
  const taskStore = transaction.objectStore("tasks")

  taskStore.get(taskId).onsuccess = (event) => {
    const task = event.target.result
    task.status = true
    task.endDate = getTodayDate()

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

// Display Functions
function updateDisplay() {
  updateTodayInfo()
  updateOngoingTasks()
  updateCompletedTasks()
  updateStreak()
  updateLast7DaysOverview()
  updateChart()
}

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
            <p class="mb-2">Today is the ${today.getDate()} of ${today.toLocaleString("default", { month: "long" })}!</p>
            <p class="mb-4">You have completed ${completedToday} tasks today.</p>
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p class="italic mb-2">"${quote.text}"</p>
                <p class="text-right text-sm text-gray-600 dark:text-gray-400">- ${quote.author}</p>
            </div>
        `
  }
}

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

      tasks.forEach((task) => {
        const taskElement = document.createElement("div")
        taskElement.className = "flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        taskElement.innerHTML = `
                    <input type="checkbox" onchange="completeTask(${task.id})" class="form-checkbox h-5 w-5 text-blue-600">
                    <span class="flex-grow">${task.title}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">${task.type}</span>
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

function updateCompletedTasks() {
  const completedList = document.getElementById("completed-tasks")
  completedList.innerHTML = ""

  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")

  // Get all tasks and filter for completed ones in JavaScript
  const request = taskStore.getAll()

  request.onsuccess = () => {
    const tasks = request.result
      .filter((task) => task.status === true) // Filter completed tasks
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
      .slice(0, 5)

    if (tasks.length === 0) {
      completedList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No completed tasks</p>'
      return
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

function updateStreak() {
  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const index = taskStore.index("endDate")

  let streak = 0
  const currentDate = new Date()

  function checkDate(date) {
    const dateStr = formatDate(date)
    const request = index.count(IDBKeyRange.only(dateStr))

    request.onsuccess = () => {
      if (request.result > 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
        checkDate(currentDate)
      } else {
        document.getElementById("streak-count").textContent = `${streak} days`
      }
    }
  }

  checkDate(currentDate)
}

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
    const expectedDaily = 1 // Default expected tasks per day
    const expected = dates.map((_, i) => expectedDaily * (i + 1))
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

function updateLast7DaysOverview() {
  const transaction = db.transaction(["tasks"], "readonly")
  const taskStore = transaction.objectStore("tasks")
  const index = taskStore.index("endDate")

  // Get last 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return formatDate(d)
  }).reverse()

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

function toggleTheme() {
  document.documentElement.classList.toggle("dark")
  const isDark = document.documentElement.classList.contains("dark")
  localStorage.setItem("theme", isDark ? "dark" : "light")
}

