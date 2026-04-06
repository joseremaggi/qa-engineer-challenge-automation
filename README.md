# QA Engineer Challenge - WebdriverIO + TypeScript

This repository includes:

- A consolidated challenge document in `docs/QA Engineer Challenge.pdf` (manual test cases, bug reports, and release test plan).
- Automated UI tests implemented with `WebdriverIO + TypeScript`.
- CI/CD workflows using GitHub Actions (E2E + bug regressions).
- A `docker-compose.yml` bonus setup to run tests independent of the host OS.
- An implementation guide for the automation framework in `docs/implementation-guide-webdriverio.md`.

## Target Application

- URL: `https://immense-hollows-74271.herokuapp.com/`

## Tech Stack

- WebdriverIO
- TypeScript
- Mocha
- Page Object Model (POM)
- Appium (optional extra for real-device/simulator execution)

## Project Structure

```text
.
├── docs
│   ├── QA Engineer Challenge.pdf
│   └── implementation-guide-webdriverio.md
├── test
│   ├── fixtures
│   │   ├── test-image.jpg
│   │   └── test-image.png
│   ├── pages
│   │   ├── base.page.ts
│   │   └── stranger-list.page.ts
│   ├── specs
│   │   ├── item-crud.e2e.ts
│   │   └── bug-regressions.e2e.ts
│   └── utils
│       └── item-factory.ts
├── .github/workflows/e2e.yml
├── .github/workflows/bugs.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── wdio.android.real.conf.ts
├── wdio.ios.real.conf.ts
└── wdio.conf.ts
```

## Prerequisites (Local)

- Node.js 20+
- npm
- Google Chrome installed locally

## Install Dependencies

```bash
npm install
```

## Run Automated Tests

Default and challenge-recommended execution:

- `Desktop`: local Chrome
- `Mobile`: Chrome mobile emulation (`iPhone X` profile)

This is the primary compatibility path used for challenge compliance.

Desktop:

```bash
npm run test:desktop
```

Mobile emulation (Chrome device emulation):

```bash
npm run test:mobile
```

Run desktop + mobile emulation:

```bash
npm run test:all
```

This command runs desktop and mobile even if desktop fails.
It runs the main CRUD suite only.

Run bug-regression suite on desktop (expected to fail until app bugs are fixed):

```bash
npm run test:bugs
```

Run bug-regression suite on mobile:

```bash
npm run test:bugs:mobile
```

Run bug-regression suite on desktop + mobile emulation:

```bash
npm run test:bugs:all
```

This command runs desktop and mobile even if the desktop bug suite fails.

Run all desktop suites together (CRUD + bug regressions):

```bash
npm run test:desktop:all-suites
```

Type-check:

```bash
npm run typecheck
```

## Optional Extra: Real Mobile (Appium)

Real mobile is optional and not required for the default desktop/mobile-emulated flow.

Additional prerequisites:

- Android emulator or real Android device with Chrome
- macOS + Xcode (for iOS simulator / real iOS device)
- Android SDK / ADB available in PATH
- Java (required by Android tooling)

Real mobile commands:

- Android CRUD:
  - `npm run test:mobile:real` (alias)
  - `npm run test:mobile:real:android`
- iOS CRUD:
  - `npm run test:mobile:real:ios`
- Android bug suite:
  - `npm run test:bugs:mobile:real`
  - `npm run test:bugs:mobile:real:android`
- iOS bug suite:
  - `npm run test:bugs:mobile:real:ios`
- Desktop + Android real:
  - `npm run test:all:real-mobile`
  - `npm run test:bugs:all:real-mobile`
- Desktop + iOS real:
  - `npm run test:all:real-ios`
  - `npm run test:bugs:all:real-ios`
- Desktop + Android real + iOS real:
  - `npm run test:all:real-mobile:full`
  - `npm run test:bugs:all:real-mobile:full`

Install project dependencies (includes Appium service):

```bash
npm install
```

Install Appium Android driver once:

```bash
npm run appium:driver:install:android
```

Install Appium iOS driver once:

```bash
npm run appium:driver:install:ios
```

Check that a device/emulator is visible:

```bash
adb devices
```

Optional environment variables:

- `ANDROID_DEVICE_NAME` (default: `Android Emulator`)
- `ANDROID_PLATFORM_VERSION` (example: `14`)
- `ANDROID_UDID` (example: `emulator-5554`, recommended when you have multiple devices)
- `IOS_DEVICE_NAME` (default: `iPhone 15`)
- `IOS_PLATFORM_VERSION` (example: `17.5`)
- `IOS_UDID` (required for real iPhone devices)
- `APPIUM_PORT` (default: `4723`)
- `WDA_LOCAL_PORT` (default: `8100`)

Notes:

- Bug-regression specs are expected to fail until the reported product bugs are fixed.
- `test:mobile` uses desktop Chrome mobile emulation.
- `test:mobile:real` uses Appium with a real Android session.
- `test:mobile:real:ios` uses Appium with Safari on iOS simulator/device.
- For iOS real device, Xcode signing/WebDriverAgent setup is required.

### Android Troubleshooting

If you see:

`No Chromedriver found that can automate Chrome 'xxx'`

The Android config already enables Chromedriver auto-download, but it still requires internet access on first run.

You can also set a custom driver cache folder:

```bash
CHROMEDRIVER_DIR="$PWD/.chromedrivers" npm run test:mobile:real:android
```

If you see:

`Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported`

export SDK vars before running tests:

```bash
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"
```

If you see:

`session not created` / `from chrome not reachable`

run this recovery sequence and retry:

```bash
# 1) Restart emulator/device state for Chrome
adb shell am force-stop com.android.chrome
adb shell pm clear com.android.chrome

# 2) Ensure Chrome opens manually at least once
adb shell monkey -p com.android.chrome -c android.intent.category.LAUNCHER 1

# 3) Clear local chromedriver cache and re-run
rm -rf .chromedrivers
npm run test:mobile:real:android
```

To force a specific emulator/device:

```bash
ANDROID_UDID=emulator-5554 npm run test:mobile:real:android
```

If you see:

`cmd: Can't find service: settings` or hidden API policy errors

your emulator image is likely still booting or has limited system services. Wait for full boot:

```bash
adb -s emulator-5554 wait-for-device
adb -s emulator-5554 shell getprop sys.boot_completed
```

The value must be `1` before running tests.

This project already sets Appium capabilities to bypass hidden API policy failures on those images:

- `appium:ignoreHiddenApiPolicyError=true`
- `appium:skipDeviceInitialization=true`

## Allure Report

Generate and open a local Allure report from this project root:

```bash
npm run allure:generate
npm run allure:open
```

Alternative (generate + open in one command):

```bash
npm run allure:serve
```

Important:

- Do not open Allure `index.html` via `file://` (double click), because browser CORS policy will block JSON widgets.
- Always open via `allure:open` / `allure:serve` or an HTTP server.

### Allure in CI (GitHub Actions)

The workflows generate Allure artifacts automatically on each run:

- E2E workflow:
  - `allure-results-<target>`
  - `allure-report-<target>` (HTML report)
- Bug workflow:
  - `allure-results-bugs-<target>`
  - `allure-report-bugs-<target>` (HTML report)

How to view it:

1. Open the workflow run in the `Actions` tab.
2. Download `allure-report-desktop`/`allure-report-mobile` (E2E) or `allure-report-bugs-desktop`/`allure-report-bugs-mobile` (bugs workflow).
3. Extract the artifact folder locally.
4. Serve it via HTTP (example):

```bash
cd ~/Downloads/allure-report-desktop
python3 -m http.server 8080
```

5. In a second terminal, open:

```bash
open http://localhost:8080
```

6. Stop the server with `Ctrl + C` when finished.

### Interpreting Test Counts in Allure

If you run desktop + mobile together, Allure can group both executions under the same test name.
That is why you may see `3` test cases in the UI even when both targets ran.

How to avoid mixed/accumulated results:

```bash
rm -rf allure-results allure-report
```

How to generate separate reports per target:

```bash
# Desktop report
rm -rf allure-results allure-report
npm run test:desktop
npm run allure:generate
mv allure-report allure-report-desktop

# Mobile report
rm -rf allure-results allure-report
npm run test:mobile
npm run allure:generate
mv allure-report allure-report-mobile
```

## CI/CD

GitHub Actions workflows:

- `.github/workflows/e2e.yml`
  - Triggers on push and pull request (plus manual `workflow_dispatch`).
  - Runs the automated CRUD E2E suite in matrix: `desktop`, `mobile`.
  - Runs typecheck and uploads Allure artifacts.
- `.github/workflows/bugs.yml`
  - Manual trigger (`workflow_dispatch`).
  - Runs bug-regression suite in matrix: `desktop`, `mobile`.
  - Runs typecheck and uploads Allure artifacts.

This satisfies the challenge requirement:

> "A CI/CD pipeline job must be created using GitHub or GitLab tools to run the automated tests."

## Docker (Bonus)

By default, Docker services run the full automation pack (CRUD + bug regressions):

```bash
docker compose run --rm tests-desktop
docker compose run --rm tests-mobile
```

Run both in sequence:

```bash
docker compose run --rm tests-desktop && docker compose run --rm tests-mobile
```

If you want CRUD-only runs in Docker:

```bash
docker compose run --rm tests-desktop npm run test:desktop
docker compose run --rm tests-mobile npm run test:mobile
```

Useful Docker commands:

```bash
# Build images explicitly
docker compose build

# Clean containers/images for this project
docker compose down --rmi local
```

Notes:

- Bug-regression specs are expected to fail until the reported product bugs are fixed.
- `docker-compose.yml` pins `platform: linux/amd64` for Apple Silicon compatibility with the Google Chrome package.
- If your CLI does not support `docker compose`, use the equivalent `docker-compose` commands.
- Docker image includes Node 20 + Google Chrome, so host dependencies are minimal.
- This makes execution consistent across operating systems.

## Notes

- Test data uses unique texts to avoid collisions.
- The suite cleans up created data and restores edited data whenever possible.
- The application can periodically reset its data set; tests include defensive handling for that behavior.
