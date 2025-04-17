# testquire

[![npm version](https://img.shields.io/npm/v/testquire.svg)](https://www.npmjs.com/package/testquire)
[![license](https://img.shields.io/npm/l/testquire.svg)](https://github.com/kosrotoff/testquire/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dt/testquire.svg)](https://www.npmjs.com/package/testquire)

**testquire** is a lightweight utility for mocking dependencies in Node.js tests by overriding the native `require` function at runtime.

Easily mock internal dependencies **without changing your source code** — works with any test framework that supports mocking.

> 🔍 Supports file and module targeting via [`micromatch`](https://www.npmjs.com/package/micromatch), and mocks both functions and class methods recursively.

---

## 📦 Installation

To install `testquire`, use either `npm` or `yarn`:

With npm:

```bash
npm install testquire --save-dev
```

With yarn:

```bash
yarn add testquire --dev
```

---

## 🚀 Quick Start

First, set up `testquire` in your test setup file:

```js
// test/setup.js
const testquire = require('testquire');
const { mock } = require('node:test'); // or any other mocking library

testquire.init({
    mockFn: mock.fn.bind(mock), // Use any mocking function here
    includeFiles: ['./src/**/*.js', './lib/**/*.js'],
});

// 🔁 Don't forget to restore all mocks between tests!
afterEach(() => {
    mock.restoreAll();
});
```

Alternatively, you can use another approach to pass arguments to your mock function:

```js
// test/setup.js
const testquire = require('testquire');
const { mock } = require('node:test'); // or any other mocking library

testquire.init({
    mockFn: (...args) => mock.fn(...args), // Another way to pass arguments to your mock function
    includeFiles: ['./src/**/*.js', './lib/**/*.js'],
});

// 🔁 Don't forget to restore all mocks between tests!
afterEach(() => {
    mock.restoreAll();
});
```

---

## 🧪 Example Usage

Here’s an example of how to use `testquire` with mocked dependencies:

```js
const { myFunction } = require('./src/myModule');
// Simply import the module where you want to mock something
const { externalService } = require('./src/externalService');

describe('myFunction', () => {
    it('should work with mocked service', () => {
        externalService.fetchData.mock.mockImplementation(() => 'mocked');

        expect(myFunction()).toBe('mocked');
    });
});
```

---

## ⚙️ Configuration

You can configure `testquire` in two ways:

1. Pass a config object directly to `testquire.init(config)`
2. Create a config file in the project root (used only if no config is passed)

The following config files are supported, in priority order:

- `testquire.config.js`
- `testquire.config.json`

Example configuration file:

```js
// testquire.config.js
module.exports = {
    mockFn: (fn) => jest.fn(fn),
    includeFiles: ['./src/**/*.js'],
    excludeModules: ['fs'],
};
```

### Configuration Options

| Option           | Type                | Description                           |
|------------------|---------------------|---------------------------------------|
| `mockFn`         | `(value) => mocked` | **Required.** Function to mock values |
| `includeFiles`   | `string[]`          | File patterns to include for mocking  |
| `excludeFiles`   | `string[]`          | File patterns to exclude from mocking |
| `includeModules` | `string[]`          | Node modules to include for mocking   |
| `excludeModules` | `string[]`          | Node modules to exclude from mocking  |

---

## 🔧 How It Works

- Overrides `Module.prototype.require`
- Matches files or modules against include/exclude patterns
- If matched, recursively applies `mockFn` to all functions and class methods
- Caches mocked results to avoid re-processing, improving performance

---

## ✅ Why Use testquire?

- Framework-agnostic (works with Jest, Mocha, Vitest, etc.)
- Mock internal module dependencies **without changing source code**
- No need to manually inject dependencies into your modules
- Works without clearing the `require` cache:
    - Faster execution
    - Avoids common issues related to cache invalidation
- Deep mocking of nested objects and class methods for more flexibility

---

## ⚠️ Limitations

- **Only supports CommonJS (`require`) modules**, not ESM (`import`)
    - Workaround: Use tools like `babel` or `ts-jest` to transpile ESM to CommonJS during tests.
- Overriding `require` may conflict with other tools that also override it (e.g., `proxyquire`).
- Modules loaded before calling `init()` won’t be re-mocked.

---

## 🧩 Framework Compatibility

| Framework     | Works | Notes                                                                 |
|---------------|-------|-----------------------------------------------------------------------|
| **node:test** | ✅     | Use `mock.fn` and call `mock.restoreAll()` in `afterEach()` manually. |

> 💡 If your framework provides its own mock implementation, simply pass it as `mockFn`.

---

## 💬 Let us know!

If you’ve tested `testquire` with another test framework not listed here, or encountered any issues, please open an
issue or submit a PR. We’d love to hear your feedback and improve the library!

---

## 📝 License

MIT
