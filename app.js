// Initialize database connection and global variables
let db
const dbName = "dailiesDB"
const dbVersion = 1
let currentChart = null
let expectedTasksPerDay = 1

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
]

// Set up initial theme and database when page loads
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.classList.toggle("dark", savedTheme === "dark")
  initializeDB()
  setupEventListeners()
})

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
  }

  request.onsuccess = (event) => {
    console.log("Database initialized successfully")
    db = event.target.result
    updateDisplay()
  }
}

// Set up event listeners for form submission, theme toggle, and expected tasks
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
            <p class="mb-2">Today is the ${today.getDate()} of ${today.toLocaleString("default", { month: "long" })}!</p>
            <p class="mb-4">You have completed ${completedToday} tasks today.</p>
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p class="italic mb-2">"${quote.text}"</p>
                <p class="text-right text-sm text-gray-600 dark:text-gray-400">- ${quote.author}</p>
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
                    <input type="checkbox" onchange="completeTask(${task.id})" class="form-checkbox h-5 w-5 text-blue-600">
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

