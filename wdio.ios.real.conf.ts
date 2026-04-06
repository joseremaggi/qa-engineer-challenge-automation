import type { Frameworks, Options } from '@wdio/types';

const resolvedLogLevel = (process.env.WDIO_LOG_LEVEL ?? 'warn') as
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'silent';

const iosDeviceName = process.env.IOS_DEVICE_NAME ?? 'iPhone 15';
const iosPlatformVersion = process.env.IOS_PLATFORM_VERSION;
const iosUdid = process.env.IOS_UDID;
const appiumPort = Number(process.env.APPIUM_PORT ?? '4723');
const wdaLocalPort = Number(process.env.WDA_LOCAL_PORT ?? '8100');

const capabilities: Record<string, unknown> = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': iosDeviceName,
  'appium:browserName': 'Safari',
  'appium:newCommandTimeout': 180,
  'appium:wdaLocalPort': wdaLocalPort
};

if (iosPlatformVersion) {
  capabilities['appium:platformVersion'] = iosPlatformVersion;
}

if (iosUdid) {
  capabilities['appium:udid'] = iosUdid;
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
