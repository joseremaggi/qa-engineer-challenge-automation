import type { Frameworks, Options } from '@wdio/types';

const target = process.env.TARGET?.toLowerCase() === 'mobile' ? 'mobile' : 'desktop';
const slowMoMs = Number(process.env.SLOW_MO_MS ?? '0');
const runHeadless =
  process.env.HEADLESS?.toLowerCase() === 'true' || process.env.CI?.toLowerCase() === 'true';
const resolvedLogLevel = (process.env.WDIO_LOG_LEVEL ?? 'warn') as
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'silent';

const baseChromeArgs = [
  '--disable-gpu',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--window-size=1920,1080',
  ...(runHeadless ? ['--headless=new', '--remote-debugging-port=9222'] : [])
];

const chromeOptions = {
  args: target === 'mobile' ? [...baseChromeArgs, '--window-size=390,844'] : baseChromeArgs,
  ...(target === 'mobile' ? { mobileEmulation: { deviceName: 'iPhone X' } } : {})
};

export const config: Options.Testrunner = {
  runner: 'local',
  specs: ['./test/specs/**/*.e2e.ts'],
  maxInstances: 1,
  baseUrl: 'https://immense-hollows-74271.herokuapp.com',
  logLevel: resolvedLogLevel,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
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
  mochaOpts: {
    ui: 'bdd',
    timeout: 90000
  },
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true
    }
  },
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': chromeOptions,
      ['goog:loggingPrefs']: {
        browser: 'ALL'
      }
    } as unknown as WebdriverIO.Capabilities
  ] as WebdriverIO.Capabilities[],
  before: async () => {
    await browser.setTimeout({
      implicit: 0,
      pageLoad: 60000,
      script: 30000
    });
  },
  beforeCommand: async () => {
    if (slowMoMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, slowMoMs));
    }
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
