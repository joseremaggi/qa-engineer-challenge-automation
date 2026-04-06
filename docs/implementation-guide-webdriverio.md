# Implementation Guide: WebdriverIO + TypeScript (From Scratch)

## 1. Goal

Build and document a complete QA challenge solution with:

- WebdriverIO + TypeScript
- Page Object Model (POM)
- Manual + automated coverage for Create/Edit/Delete
- CI/CD in GitHub Actions
- Docker support (bonus)
- Desktop + mobile compatibility

Important alignment for this repository:

- Default `mobile` execution means **Chrome mobile emulation** (`iPhone X`) from `wdio.conf.ts`.
- Real mobile with Appium (Android/iOS) is kept as an **optional extra**.

## 2. Prerequisites

Base setup (required):

1. Node.js 20+
2. npm
3. Google Chrome

Optional setup (only for real mobile extra):

1. Appium 2.x
2. Android SDK + emulator/device (Android)
3. Xcode (iOS simulator/device on macOS)

## 3. Project Bootstrap

Initialize:

```bash
npm init -y
```

Install core packages:

```bash
npm install -D \
  webdriverio \
  @wdio/cli \
  @wdio/local-runner \
  @wdio/mocha-framework \
  @wdio/spec-reporter \
  @wdio/allure-reporter \
  @wdio/types \
  @wdio/globals \
  typescript \
  ts-node \
  @types/node \
  cross-env
```

## 4. TypeScript and NPM Scripts

Configure `tsconfig.json` with strict checks and WDIO globals.

Create scripts in `package.json`:

- Main CRUD:
  - `test:desktop`
  - `test:mobile` (mobile emulation)
  - `test:all` (desktop + mobile emulation)
- Bug regressions:
  - `test:bugs:desktop`
  - `test:bugs:mobile`
  - `test:bugs:all`
- Quality:
  - `typecheck`

Optional Appium scripts (extra only):

- `test:mobile:real:android`
- `test:mobile:real:ios`
- `test:bugs:mobile:real:android`
- `test:bugs:mobile:real:ios`

## 5. WDIO Configuration

Main config (`wdio.conf.ts`) should include:

1. `baseUrl`
2. specs path: `./test/specs/**/*.e2e.ts`
3. Mocha framework
4. `maxInstances: 1` (important for shared-data environments)
5. target-based capability switching:
   - `TARGET=desktop` -> Chrome desktop
   - `TARGET=mobile` -> Chrome emulation (`iPhone X`)
6. explicit timeouts (`implicit`, `pageLoad`, `script`)
7. report configuration (`spec` + `allure`)
8. screenshots on failure in `afterTest`

Optional extra configs:

- `wdio.android.real.conf.ts`
- `wdio.ios.real.conf.ts`

These are not required to satisfy the default desktop/mobile-emulated challenge flow.

## 6. Test Architecture (POM)

Recommended structure:

```text
test/
  pages/
    base.page.ts
    stranger-list.page.ts
  specs/
    item-crud.e2e.ts
    bug-regressions.e2e.ts
  utils/
    item-factory.ts
  fixtures/
    test-image.jpg
```

Why POM:

- Selectors and actions live in one place.
- Specs stay readable and business-focused.
- Maintenance is easier when UI changes.

## 7. Base Page Utilities

In `base.page.ts`, implement reusable helpers:

- navigation helper
- visible/clickable waits
- safe typing helper
- generic `waitUntil` wrapper with clear failure messages

This standardizes interaction behavior across tests.

## 8. Feature Page Object

In `stranger-list.page.ts`:

1. Centralize selectors for form/list/modal.
2. Implement business actions:
   - `open`
   - `createItem`
   - `editItem`
   - `deleteItem`
   - state helpers (`itemExists`, form mode checks, etc.)
3. Keep synchronization inside page methods.

Design rule:

- Assertions belong in specs.
- Interaction details belong in page objects.

## 9. Dynamic Test Data

Use a factory helper (`item-factory.ts`) to create unique values with timestamp/random suffix.

Benefits:

- avoids collisions with existing data
- supports reruns in shared environments
- simplifies cleanup logic

## 10. Automated Specs

CRUD spec (`item-crud.e2e.ts`) should cover:

1. Create an item
2. Edit another existing item
3. Delete the created item

Regression spec (`bug-regressions.e2e.ts`) should cover reported bugs and pass only after fixes.

## 11. Fixtures

Keep deterministic upload files in `test/fixtures/` (for example `test-image.jpg`).

## 12. CI/CD Pipeline (GitHub Actions)

Workflow file: `.github/workflows/e2e.yml`

Recommended steps:

1. checkout
2. Node setup
3. Chrome setup
4. `npm ci`
5. `npm run typecheck`
6. matrix run:
   - `desktop`
   - `mobile` (Chrome emulation)
7. generate/upload Allure artifacts

This satisfies the challenge CI/CD requirement for automated test execution.

## 13. Docker Support (Bonus)

Add:

- `Dockerfile`
- `docker-compose.yml`

Use Docker services to run:

- desktop suite
- mobile emulation suite

This keeps execution OS-independent with minimal host setup.

## 14. Validation Flow

Recommended local checks before submission:

1. `npm run typecheck`
2. `npm run test:all`
3. `npm run test:bugs:all`
4. `npm run allure:generate` (optional visual report)

## 15. Important WebdriverIO Notes

### 15.1 Selector strategy

- Prefer stable selectors and semantic anchors.
- Avoid index-only selectors when possible.

### 15.2 Wait strategy

- Use explicit waits for readiness.
- Use `waitUntil` for business-level conditions.

### 15.3 Upload strategy

- Validate that file input was really populated.
- Use platform-appropriate upload handling (desktop vs real mobile).

### 15.4 Shared-environment stability

- Keep one instance.
- Use unique test data.
- Add cleanup where possible.

### 15.5 Mobile strategy for this challenge

- Primary mobile coverage: Chrome emulation profile.
- Optional extra: Appium Android/iOS real sessions.

## 16. Delivery Checklist

Before submitting:

1. Documentation complete and aligned (`README` + `docs/*`).
2. Manual cases, bug reports, and release plan present.
3. Desktop + mobile emulation automation executable.
4. CI workflow present and valid.
5. Docker compose present (bonus).
6. Optional Appium section clearly marked as extra.
