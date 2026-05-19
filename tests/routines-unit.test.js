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

function createTestElement(tagName = "div") {
  const element = {
    tagName: tagName.toUpperCase(),
    id: "",
    name: "",
    className: "",
    dataset: {},
    children: [],
    innerHTML: "",
    textContent: "",
    value: "",
    parentNode: null,
    classList: {
      add(...classNames) {
        const names = new Set(element.className.split(/\s+/).filter(Boolean))
        classNames.forEach((className) => names.add(className))
        element.className = Array.from(names).join(" ")
      },
      remove(...classNames) {
        const removeNames = new Set(classNames)
        element.className = element.className
          .split(/\s+/)
          .filter((className) => className && !removeNames.has(className))
          .join(" ")
      },
      contains(className) {
        return element.className.split(/\s+/).includes(className)
      },
      toggle(className) {
        if (this.contains(className)) {
          this.remove(className)
          return false
        }
        this.add(className)
        return true
      },
    },
    appendChild(child) {
      child.parentNode = this
      this.children.push(child)
      return child
    },
    insertBefore(child, beforeElement) {
      child.parentNode = this
      const existingIndex = this.children.indexOf(child)
      if (existingIndex !== -1) this.children.splice(existingIndex, 1)
      const index = this.children.indexOf(beforeElement)
      if (index === -1) {
        this.children.push(child)
      } else {
        this.children.splice(index, 0, child)
      }
      return child
    },
    removeChild(child) {
      const index = this.children.indexOf(child)
      if (index !== -1) this.children.splice(index, 1)
      child.parentNode = null
      return child
    },
    remove() {
      if (this.parentNode && typeof this.parentNode.removeChild === "function") {
        this.parentNode.removeChild(this)
      }
    },
    addEventListener() {},
    querySelector(selector) {
      return findTestElement(this, selector)
    },
    querySelectorAll(selector) {
      return findAllTestElements(this, selector)
    },
    get firstChild() {
      return this.children[0] || null
    },
    get firstElementChild() {
      return this.children[0] || null
    },
  }

  return element
}

function matchesTestSelector(element, selector) {
  if (selector.startsWith(".")) {
    return element.className.split(/\s+/).includes(selector.slice(1))
  }

  if (selector.startsWith("#")) {
    return element.id === selector.slice(1)
  }

  const taskIdMatch = selector.match(/^\[data-task-id="(.+)"\]$/)
  if (taskIdMatch) {
    return String(element.dataset.taskId) === taskIdMatch[1]
  }

  const namedInputMatch = selector.match(/^input\[name="(.+)"\]$/)
  if (namedInputMatch) {
    return element.tagName === "INPUT" && element.name === namedInputMatch[1]
  }

  return false
}

function findTestElement(root, selector) {
  return findAllTestElements(root, selector)[0] || null
}

function findAllTestElements(root, selector) {
  const matches = []
  const visit = (element) => {
    if (matchesTestSelector(element, selector)) matches.push(element)
    element.children.forEach(visit)
  }

  root.children.forEach(visit)
  return matches
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

function createFakeCompletionDatabase(existingTasks) {
  const tasks = existingTasks.map((task) => ({ ...task }))
  const updates = []
  let nextId = Math.max(...tasks.map((task) => task.id || 0), 0) + 1

  return {
    getUpdates: () => updates,
    transaction(stores, mode) {
      assert.strictEqual(stores.length, 1)
      assert.strictEqual(stores[0], "tasks")

      if (mode === "readonly") {
        return {
          objectStore: () => ({
            getAll: () => createSuccessRequest(tasks),
          }),
        }
      }

      assert.strictEqual(mode, "readwrite")

      const writeTransaction = {}
      const completeTransaction = () => {
        if (typeof writeTransaction.complete === "function") {
          writeTransaction.complete({ target: writeTransaction })
        }
      }

      Object.defineProperty(writeTransaction, "oncomplete", {
        set(handler) {
          writeTransaction.complete = handler
        },
      })
      Object.defineProperty(writeTransaction, "onerror", { set() {} })

      return Object.assign(writeTransaction, {
        objectStore: () => ({
          put: (task) => createSuccessRequest(task.id, () => {
            updates.push({ ...task })
            setTimeout(completeTransaction, 0)
          }),
          add: (task) => {
            const id = nextId++
            tasks.push({ ...task, id })
            return createSuccessRequest(id, () => setTimeout(completeTransaction, 0))
          },
        }),
      })
    },
  }
}

async function main() {
  const appPath = path.join(__dirname, "..", "app.js")
  const appSource = fs.readFileSync(appPath, "utf8")
  const customCssPath = path.join(__dirname, "..", "custom.css")
  const customCss = fs.readFileSync(customCssPath, "utf8")
  const sandbox = createSandbox()

  vm.runInContext(appSource, sandbox, { filename: "app.js" })
  const normalize = (value) => JSON.parse(JSON.stringify(value))
  const extractKeyframes = (name) => {
    const marker = `@keyframes ${name}`
    const start = customCss.indexOf(marker)
    assert.notStrictEqual(start, -1, `${name} keyframes should exist`)
    const next = customCss.indexOf("@keyframes", start + marker.length)
    return customCss.slice(start, next === -1 ? customCss.length : next)
  }

  ;[
    "taskComplete",
    "taskCompleteDark",
    "subtaskComplete",
    "subtaskCompleteDark",
  ].forEach((keyframeName) => {
    const keyframes = extractKeyframes(keyframeName)
    assert.ok(
      !/transform\s*:/.test(keyframes),
      `${keyframeName} should not transform the scroll-container item`,
    )
  })

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

  const fakeSubtaskDatabase = createFakeTaskDatabase([
    {
      id: 30,
      title: "Parent task",
      type: "Goal",
      status: false,
      startDate: "2026-05-18",
      endDate: null,
      sortOrder: 0,
    },
  ], 31)
  const parentElement = createTestElement("div")
  parentElement.className = "task-item task-parent"
  parentElement.dataset.taskId = "30"
  parentElement.dataset.incompleteSubtasks = "0"

  const parentRow = createTestElement("div")
  parentRow.className = "task-parent-row"
  const metaActions = createTestElement("div")
  metaActions.className = "task-meta-actions"
  const taskTypeBadge = createTestElement("span")
  taskTypeBadge.className = "task-type-badge goal"
  metaActions.appendChild(taskTypeBadge)
  parentRow.appendChild(metaActions)
  parentElement.appendChild(parentRow)

  const subtaskForm = createTestElement("form")
  subtaskForm.id = "subtask-form-30"
  subtaskForm.className = "subtask-form"
  const subtaskInput = createTestElement("input")
  subtaskInput.name = "subtask-title"
  subtaskInput.value = "  <Draft & Check>  "
  subtaskForm.appendChild(subtaskInput)
  parentElement.appendChild(subtaskForm)

  let subtaskPrevented = false
  let subtaskStopped = false
  let subtaskRefreshCount = 0
  let subtaskHeightSyncCount = 0
  let parentCompletionGuardMessage = null

  sandbox.__fakeSubtaskDatabase = fakeSubtaskDatabase
  vm.runInContext("db = __fakeSubtaskDatabase", sandbox)
  sandbox.document.createElement = createTestElement
  sandbox.document.querySelector = (selector) => {
    if (selector === '[data-task-id="30"]') return parentElement
    return parentElement.querySelector(selector)
  }
  sandbox.updateOngoingTasks = () => { subtaskRefreshCount += 1 }
  sandbox.syncDashboardTaskCardHeight = () => { subtaskHeightSyncCount += 1 }
  sandbox.showNotification = (message) => { parentCompletionGuardMessage = message }

  sandbox.addSubtask({
    target: subtaskForm,
    preventDefault: () => { subtaskPrevented = true },
    stopPropagation: () => { subtaskStopped = true },
  }, 30)

  assert.strictEqual(subtaskPrevented, true)
  assert.strictEqual(subtaskStopped, true)
  assert.deepStrictEqual(normalize(fakeSubtaskDatabase.getAddedTask()), {
    id: 31,
    title: "<Draft & Check>",
    type: "Goal",
    status: false,
    startDate: "2026-05-18",
    endDate: null,
    parentId: 30,
    subtaskOrder: 0,
  })
  assert.strictEqual(subtaskInput.value, "")
  assert.strictEqual(subtaskForm.classList.contains("hidden"), true)
  assert.strictEqual(subtaskRefreshCount, 0)
  assert.strictEqual(subtaskHeightSyncCount, 1)

  const createdSubtaskList = parentElement.querySelector(".subtask-list")
  assert.ok(createdSubtaskList)
  assert.ok(parentElement.children.indexOf(createdSubtaskList) < parentElement.children.indexOf(subtaskForm))
  const createdSubtaskItems = createdSubtaskList.querySelectorAll(".subtask-item")
  assert.strictEqual(createdSubtaskItems.length, 1)
  assert.strictEqual(String(createdSubtaskItems[0].dataset.taskId), "31")
  assert.ok(createdSubtaskItems[0].innerHTML.includes("&lt;Draft &amp; Check&gt;"))
  assert.ok(createdSubtaskItems[0].innerHTML.includes("completeTask(31)"))
  assert.ok(createdSubtaskItems[0].innerHTML.includes("deleteTask(31)"))
  assert.strictEqual(parentElement.dataset.incompleteSubtasks, "1")

  const createdSubtaskProgress = parentElement.querySelector(".subtask-progress")
  assert.ok(createdSubtaskProgress)
  assert.strictEqual(createdSubtaskProgress.textContent, "0/1 done")
  assert.ok(metaActions.children.indexOf(createdSubtaskProgress) < metaActions.children.indexOf(taskTypeBadge))

  await sandbox.completeTask(30)
  assert.strictEqual(parentCompletionGuardMessage, "Finish all subtasks before completing the parent task.")

  const fakeCompletionDatabase = createFakeCompletionDatabase([
    {
      id: 10,
      title: "Seamless completion",
      type: "Goal",
      status: false,
      startDate: "2026-05-18",
      endDate: null,
      sortOrder: 0,
    },
  ])
  const completedTaskElement = {
    addEventListener: () => {},
    classList: {
      add: () => {},
      contains: () => false,
      remove: () => {},
    },
    dataset: { incompleteSubtasks: "0", taskId: "10" },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 48 }),
    querySelector: () => null,
    remove: () => {},
  }
  const completedItems = []
  const completedList = {
    children: completedItems,
    appendChild(element) {
      element.parentNode = this
      completedItems.push(element)
      return element
    },
    insertBefore(element, beforeElement) {
      element.parentNode = this
      const index = completedItems.indexOf(beforeElement)
      if (index === -1) {
        completedItems.push(element)
      } else {
        completedItems.splice(index, 0, element)
      }
      return element
    },
    removeChild(element) {
      const index = completedItems.indexOf(element)
      if (index !== -1) completedItems.splice(index, 1)
      element.parentNode = null
      return element
    },
    querySelector: () => null,
    get firstChild() { return completedItems[0] || null },
    get lastElementChild() { return completedItems[completedItems.length - 1] || null },
  }
  const todayCount = { textContent: "0 tasks completed" }
  let broadCompletionRefreshCount = 0
  sandbox.__fakeCompletionDatabase = fakeCompletionDatabase
  vm.runInContext("db = __fakeCompletionDatabase", sandbox)
  sandbox.setTimeout = (handler) => {
    handler()
    return 0
  }
  sandbox.document.querySelector = (selector) => {
    return selector === '[data-task-id="10"]' ? completedTaskElement : null
  }
  sandbox.document.createElement = () => ({
    className: "",
    dataset: {},
    innerHTML: "",
    parentNode: null,
    remove() {
      if (this.parentNode && typeof this.parentNode.removeChild === "function") {
        this.parentNode.removeChild(this)
      }
    },
    style: {},
  })
  sandbox.document.getElementById = (id) => ({
    "completed-tasks": completedList,
    "today-completed-count": todayCount,
  })[id] || null
  sandbox.document.body = { appendChild: () => {} }
  sandbox.updateDisplay = () => { broadCompletionRefreshCount += 1 }
  sandbox.updateDisplayAfterTaskChange = () => { broadCompletionRefreshCount += 1 }
  sandbox.updateOngoingTasks = () => { broadCompletionRefreshCount += 1 }

  await sandbox.completeTask(10)

  assert.strictEqual(broadCompletionRefreshCount, 0)
  assert.deepStrictEqual(normalize(fakeCompletionDatabase.getUpdates()), [
    {
      id: 10,
      title: "Seamless completion",
      type: "Goal",
      status: true,
      startDate: "2026-05-18",
      endDate: "2026-05-18",
      completedAt: sandbox.Date.now(),
      sortOrder: 0,
    },
  ])
  assert.strictEqual(completedItems.length, 1)
  assert.strictEqual(todayCount.textContent, "1 tasks completed")

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
