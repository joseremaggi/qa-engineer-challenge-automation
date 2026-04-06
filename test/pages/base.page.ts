import type { ChainablePromiseElement } from 'webdriverio';

export abstract class BasePage {
  // Retry stale-element failures caused by frequent Angular re-renders.
  protected async withStaleRetry<T>(
    action: () => Promise<T>,
    retries = 3,
    delayMs = 120
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await action();
      } catch (error) {
        const message = String(error);
        const isStale =
          message.includes('stale element reference') || message.includes('stale element');

        if (!isStale || attempt === retries) {
          throw error;
        }

        lastError = error;
        await browser.pause(delayMs);
      }
    }

    throw lastError;
  }

  protected async openPath(path = '/'): Promise<void> {
    await browser.url(path);
  }

  protected async waitForVisible(
    element: ChainablePromiseElement<WebdriverIO.Element>,
    timeout = 15000
  ): Promise<void> {
    await this.withStaleRetry(async () => element.waitForDisplayed({ timeout }));
  }

  protected async clickWhenClickable(
    element: ChainablePromiseElement<WebdriverIO.Element>,
    timeout = 15000
  ): Promise<void> {
    await this.withStaleRetry(async () => {
      await element.waitForClickable({ timeout });
      await element.click();
    });
  }

  protected async clearAndType(
    element: ChainablePromiseElement<WebdriverIO.Element>,
    value: string
  ): Promise<void> {
    await this.waitForVisible(element);
    await this.withStaleRetry(async () => {
      await element.clearValue();
      await element.setValue(value);
    });
  }

  protected async waitUntil(
    condition: () => Promise<boolean>,
    timeoutMsg: string,
    timeout = 15000
  ): Promise<void> {
    await browser.waitUntil(condition, { timeout, timeoutMsg });
  }
}
