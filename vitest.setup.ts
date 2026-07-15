import "@testing-library/jest-dom/vitest"

const storage = new Map<string, string>()
const localStorageMock: Storage = {
  get length() {
    return storage.size
  },
  clear() {
    storage.clear()
  },
  getItem(key) {
    return storage.get(key) ?? null
  },
  key(index) {
    return Array.from(storage.keys())[index] ?? null
  },
  removeItem(key) {
    storage.delete(key)
  },
  setItem(key, value) {
    storage.set(key, value)
  },
}

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
})
