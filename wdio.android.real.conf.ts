import type { Frameworks, Options } from '@wdio/types';
import fs from 'node:fs';
import path from 'node:path';

const resolvedLogLevel = (process.env.WDIO_LOG_LEVEL ?? 'warn') as
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'silent';

const androidDeviceName = process.env.ANDROID_DEVICE_NAME ?? 'Android Emulator';
const androidPlatformVersion = process.env.ANDROID_PLATFORM_VERSION;
const androidUdid = process.env.ANDROID_UDID;
const appiumPort = Number(process.env.APPIUM_PORT ?? '4723');
const chromedriverDir = process.env.CHROMEDRIVER_DIR ?? path.resolve(process.cwd(), '.chromedrivers');

if (!fs.existsSync(chromedriverDir)) {
  fs.mkdirSync(chromedriverDir, { recursive: true });
}

const capabilities: Record<string, unknown> = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': androidDeviceName,
  'appium:browserName': 'Chrome',
  'appium:adbExecTimeout': 120000,
  'appium:androidDeviceReadyTimeout': 120,
  'appium:uiautomator2ServerLaunchTimeout': 120000,
  'appium:uiautomator2ServerInstallTimeout': 120000,
  'appium:ignoreHiddenApiPolicyError': true,
  'appium:skipDeviceInitialization': true,
  'appium:newCommandTimeout': 180,
  'appium:autoGrantPermissions': true,
  'appium:chromedriverAutodownload': true,
  'appium:chromedriverExecutableDir': chromedriverDir,
  'appium:recreateChromeDriverSessions': true,
  'appium:chromeOptions': {
    args: ['--disable-fre', '--no-first-run', '--no-default-browser-check']
  },
  pageLoadStrategy: 'eager'
};

if (androidPlatformVersion) {
  capabilities['appium:platformVersion'] = androidPlatformVersion;
}

if (androidUdid) {
  capabilities['appium:udid'] = androidUdid;
}

export const config: Options.Testrunner = {
  runner: 'local',
  specs: ['./test/specs/**/*.e2e.ts'],
  maxInstances: 1,
  hostname: '127.0.0.1',
  port: appiumPort,
  path: '/',
  baseUrl: 'https://immense-hollows-74271.herokuapp.com',
  logLevel: resolvedLogLevel,
  waitforTimeout: 20000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 1,
  framework: 'mocha',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false
      }
    ]
  ],
  services: [
    [
      'appium',
      {
        args: {
          address: '127.0.0.1',
          port: appiumPort,
          basePath: '/',
          allowInsecure: 'chromedriver_autodownload',
          logNoColors: true
        },
        command: 'appium'
      }
    ]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  },
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true
    }
  },
  capabilities: [capabilities as unknown as WebdriverIO.Capabilities],
  before: async () => {
    await browser.setTimeout({
      implicit: 0,
      pageLoad: 90000,
      script: 60000
    });
  },
  afterTest: async (
    _test: unknown,
    _context: unknown,
    result: Frameworks.TestResult
  ) => {
    if (!result.passed) {
      await browser.takeScreenshot();
    }
  }
};
