const assert = require("assert")
const fs = require("fs")
const path = require("path")
const vm = require("vm")

function createSandbox() {
  class FixedDate extends Date {
    constructor(...args) {
      if (args.length > 0) {
        super(...args)
        return
      }
      super("2026-05-18T12:00:00")
    }

    static now() {
      return new FixedDate().getTime()
    }
  }

  const noop = () => {}
  const element = () => ({
    addEventListener: noop,
    appendChild: noop,
    remove: noop,
    removeChild: noop,
    scrollIntoView: noop,
    setAttribute: noop,
    click: noop,
    classList: {
      add: noop,
      remove: noop,
      toggle: noop,
      contains: () => false,
    },
    style: {},
    dataset: {},
    innerHTML: "",
    textContent: "",
    value: "",
  })

  const sandbox = {
    Blob: function Blob() {},
    Chart: function Chart() {},
    Date: FixedDate,
    IDBKeyRange: { only: (value) => value },
    URL: {
      createObjectURL: () => "blob:test",
      revokeObjectURL: noop,
    },
    alert: noop,
    clearInterval,
    console: {
      error: console.error,
      log: noop,
      warn: console.warn,
    },
    confirm: () => true,
    document: {
      addEventListener: noop,
      body: element(),
      createElement: element,
      documentElement: element(),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
    },
    indexedDB: { open: () => ({}) },
    localStorage: {
      getItem: () => null,
      setItem: noop,
      removeItem: noop,
    },
    navigator: { clipboard: {} },
    requestAnimationFrame: (callback) => callback(),
    setInterval,
    setTimeout,
    window: {},
  }

  sandbox.window = sandbox
  return vm.createContext(sandbox)
}

function createSuccessRequest(result, afterSuccess = () => {}) {
  const request = { result }
  Object.defineProperty(request, "onsuccess", {
    set(handler) {
      if (typeof handler === "function") {
        handler({ target: { result } })
        afterSuccess()
      }
    },
  })
  Object.defineProperty(request, "onerror", { set() {} })
  return request
}

function createFakeTaskDatabase(existingTasks, nextId) {
  let addedTask = null

  return {
    getAddedTask: () => addedTask,
    transaction(stores, mode) {
      assert.strictEqual(stores.length, 1)
      assert.strictEqual(stores[0], "tasks")

      if (mode === "readonly") {
        return {
          objectStore: () => ({
            getAll: () => createSuccessRequest(existingTasks),
          }),
        }
      }

      const writeTransaction = { completed: false }
      Object.defineProperty(writeTransaction, "oncomplete", {
        set(handler) {
          writeTransaction.complete = handler
          if (writeTransaction.completed && typeof handler === "function") {
            handler({ target: writeTransaction })
          }
        },
      })
      Object.defineProperty(writeTransaction, "onerror", { set() {} })

      return Object.assign(writeTransaction, {
        objectStore: () => ({
          add: (task) => {
            addedTask = task
            return createSuccessRequest(nextId, () => {
              writeTransaction.completed = true
              if (typeof writeTransaction.complete === "function") {
                writeTransaction.complete({ target: writeTransaction })
              }
            })
          },
        }),
      })
    },
  }
}

async function main() {
  const appPath = path.join(__dirname, "..", "app.js")
  const appSource = fs.readFileSync(appPath, "utf8")
  const sandbox = createSandbox()

  vm.runInContext(appSource, sandbox, { filename: "app.js" })
  const normalize = (value) => JSON.parse(JSON.stringify(value))

  assert.strictEqual(typeof sandbox.getDefaultWeeklyRoutines, "function")
  assert.strictEqual(typeof sandbox.normalizeWeeklyRoutines, "function")
  assert.strictEqual(typeof sandbox.getWeeklyRoutines, "function")
  assert.strictEqual(typeof sandbox.setWeeklyRoutines, "function")
  assert.strictEqual(typeof sandbox.getTodayRoutineName, "function")
  assert.strictEqual(typeof sandbox.populateRoutinesUI, "function")
  assert.strictEqual(typeof sandbox.saveRoutines, "function")
  assert.strictEqual(typeof sandbox.getTodayRoutineBadgeHTML, "function")

  assert.deepStrictEqual(normalize(sandbox.getDefaultWeeklyRoutines()), {
    sunday: "",
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
  })

  assert.deepStrictEqual(normalize(sandbox.normalizeWeeklyRoutines({
    monday: "  Leg Day  ",
    tuesday: "A".repeat(80),
    extra: "Ignored",
  })), {
    sunday: "",
    monday: "Leg Day",
    tuesday: "A".repeat(60),
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
  })

  assert.deepStrictEqual(normalize(sandbox.normalizeWeeklyRoutines(null)), {
    sunday: "",
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
  })

  sandbox.getSettingValue = async (key) => {
    assert.strictEqual(key, "weeklyRoutines")
    return { monday: "Leg Day", tuesday: "German Learning Day" }
  }

  assert.deepStrictEqual(normalize(await sandbox.getWeeklyRoutines()), {
    sunday: "",
    monday: "Leg Day",
    tuesday: "German Learning Day",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
  })

  sandbox.getSettingValue = async () => ({ monday: "  Leg Day  " })
  assert.strictEqual(await sandbox.getTodayRoutineName(), "Leg Day")

  let savedKey = null
  let savedValue = null
  sandbox.setSettingValue = async (key, value) => {
    savedKey = key
    savedValue = value
  }

  await sandbox.setWeeklyRoutines({ monday: "Leg Day" })
  assert.strictEqual(savedKey, "weeklyRoutines")
  assert.deepStrictEqual(normalize(savedValue), {
    sunday: "",
    monday: "Leg Day",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
  })

  const inputs = {
    "routine-sunday": { value: "" },
    "routine-monday": { value: "" },
    "routine-tuesday": { value: "" },
    "routine-wednesday": { value: "" },
    "routine-thursday": { value: "" },
    "routine-friday": { value: "" },
    "routine-saturday": { value: "" },
  }

  sandbox.document.getElementById = (id) => inputs[id] || null
  sandbox.getSettingValue = async () => ({ monday: "Leg Day", friday: "Review Day" })

  await sandbox.populateRoutinesUI()
  assert.strictEqual(inputs["routine-monday"].value, "Leg Day")
  assert.strictEqual(inputs["routine-friday"].value, "Review Day")
  assert.strictEqual(inputs["routine-sunday"].value, "")

  inputs["routine-monday"].value = "  Leg Day  "
  inputs["routine-tuesday"].value = " German Learning Day "
  inputs["routine-friday"].value = "Review Day"
  sandbox.updateTodayInfo = async () => {}
  sandbox.updateStreak = () => {}
  sandbox.showNotification = () => {}
  let prevented = false
  sandbox.setSettingValue = async (key, value) => {
    savedKey = key
    savedValue = value
  }

  await sandbox.saveRoutines({ preventDefault: () => { prevented = true } })
  assert.strictEqual(prevented, true)
  assert.strictEqual(savedKey, "weeklyRoutines")
  assert.deepStrictEqual(normalize(savedValue), {
    sunday: "",
    monday: "Leg Day",
    tuesday: "German Learning Day",
    wednesday: "",
    thursday: "",
    friday: "Review Day",
    saturday: "",
  })

  assert.strictEqual(sandbox.getTodayRoutineBadgeHTML(""), "")

  const badgeHTML = sandbox.getTodayRoutineBadgeHTML("<Leg Day>")
  assert.ok(badgeHTML.includes("today-routine-badge"))
  assert.ok(badgeHTML.includes("event_repeat"))
  assert.ok(badgeHTML.includes("&lt;Leg Day&gt;"))
  assert.ok(!badgeHTML.includes("<Leg Day>"))

  const taskInput = { value: "  Write daily plan  " }
  const taskType = { value: "Goal" }
  const fakeDatabase = createFakeTaskDatabase([
    { id: 1, title: "Existing goal", status: false, sortOrder: 2 },
    { id: 2, title: "Completed goal", status: true, sortOrder: 4 },
    { id: 3, title: "Nested step", status: false, parentId: 1, subtaskOrder: 0 },
  ], 10)
  let fullRefreshCount = 0
  let taskAddRefreshCount = 0
  let taskAddRefreshTask = null
  const realUpdateDisplayAfterTaskAdd = sandbox.updateDisplayAfterTaskAdd

  sandbox.__fakeDatabase = fakeDatabase
  vm.runInContext("db = __fakeDatabase", sandbox)
  sandbox.document.getElementById = (id) => ({
    "task-input": taskInput,
    "task-type": taskType,
  })[id] || null
  sandbox.updateDisplay = () => { fullRefreshCount += 1 }
  sandbox.updateDisplayAfterTaskAdd = (task) => {
    taskAddRefreshCount += 1
    taskAddRefreshTask = normalize(task)
  }

  sandbox.addTask()

  assert.deepStrictEqual(normalize(fakeDatabase.getAddedTask()), {
    id: 10,
    title: "Write daily plan",
    type: "Goal",
    status: false,
    startDate: "2026-05-18",
    endDate: null,
    sortOrder: 3,
  })
  assert.strictEqual(taskInput.value, "")
  assert.strictEqual(fullRefreshCount, 0)
  assert.strictEqual(taskAddRefreshCount, 1)
  assert.deepStrictEqual(taskAddRefreshTask, {
    id: 10,
    title: "Write daily plan",
    type: "Goal",
    status: false,
    startDate: "2026-05-18",
    endDate: null,
    sortOrder: 3,
  })
  sandbox.updateDisplayAfterTaskAdd = realUpdateDisplayAfterTaskAdd

  const emptyState = {
    removed: false,
    remove() { this.removed = true },
  }
  const appendedTasks = []
  const taskList = {
    appendChild(element) {
      appendedTasks.push(element)
      return element
    },
    querySelector(selector) {
      if (selector === ".empty-state") {
        return emptyState.removed ? null : emptyState
      }

      const taskIdMatch = selector.match(/^\[data-task-id="(.+)"\]$/)
      if (taskIdMatch) {
        return appendedTasks.find((element) => String(element.dataset.taskId) === taskIdMatch[1]) || null
      }

      return null
    },
    querySelectorAll(selector) {
      if (selector === ".task-parent") {
        return appendedTasks.filter((element) => element.className.includes("task-parent"))
      }

      return []
    },
  }
  let fallbackRefreshCount = 0
  let heightSyncCount = 0

  sandbox.document.getElementById = (id) => id === "ongoing-tasks" ? taskList : null
  sandbox.document.createElement = () => ({
    addEventListener(eventName) {
      this.events.push(eventName)
    },
    className: "",
    dataset: {},
    draggable: false,
    events: [],
    innerHTML: "",
  })
  sandbox.updateOngoingTasks = () => { fallbackRefreshCount += 1 }
  sandbox.syncDashboardTaskCardHeight = () => { heightSyncCount += 1 }

  sandbox.updateDisplayAfterTaskAdd({
    id: 20,
    title: "<Append & Verify>",
    type: "Non-Negotiable",
    status: false,
  })

  assert.strictEqual(emptyState.removed, true)
  assert.strictEqual(fallbackRefreshCount, 0)
  assert.strictEqual(heightSyncCount, 1)
  assert.strictEqual(appendedTasks.length, 1)
  assert.strictEqual(appendedTasks[0].className, "task-item task-parent")
  assert.strictEqual(appendedTasks[0].draggable, true)
  assert.strictEqual(appendedTasks[0].dataset.taskId, 20)
  assert.strictEqual(appendedTasks[0].dataset.incompleteSubtasks, 0)
  assert.deepStrictEqual(appendedTasks[0].events, [
    "dragstart",
    "dragover",
    "drop",
    "dragend",
    "dragenter",
    "dragleave",
  ])
  assert.ok(appendedTasks[0].innerHTML.includes("&lt;Append &amp; Verify&gt;"))
  assert.ok(appendedTasks[0].innerHTML.includes("Non-Negotiable"))
  assert.ok(appendedTasks[0].innerHTML.includes("completeTask(20)"))
  assert.ok(appendedTasks[0].innerHTML.includes("toggleSubtaskForm(20)"))
  assert.ok(appendedTasks[0].innerHTML.includes("deleteTask(20)"))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
