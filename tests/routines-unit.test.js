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
    console,
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
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
