import fs from 'node:fs';
import path from 'node:path';
import type { ChainablePromiseElement } from 'webdriverio';
import { BasePage } from './base.page';

// Use an optional pause to visually debug typing issues.
const pauseAfterTextMs = Number(process.env.PAUSE_AFTER_TEXT_MS ?? '0');

class StrangerListPage extends BasePage {
  private get pageHeading(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('h1*=List of items');
  }

  private get imageInput(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('#inputImage');
  }

  private get textInput(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('textarea[name="text"]');
  }

  private get createButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('button=Create Item');
  }

  private get updateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('button=Update Item');
  }

  private get cancelButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('button=Cancel');
  }

  private get confirmDeleteButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('button=Yes, delete it!');
  }

  private get deleteModalMessage(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('.modal-body p');
  }

  private get modalCancelButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('.modal-footer .btn-warning');
  }

  async open(): Promise<void> {
    await this.openPath('/');
    await this.waitForVisible(this.pageHeading);
  }

  async itemExists(text: string): Promise<boolean> {
    return this.withStaleRetry(async () =>
      browser.execute((targetText) => {
        const rows = Array.from(document.querySelectorAll('ul.media-list li.media .story'));
        return rows.some((row) => (row.textContent || '').trim() === targetText);
      }, text)
    );
  }

  async getAllItemTexts(): Promise<string[]> {
    return this.withStaleRetry(async () =>
      browser.execute(() => {
        return Array.from(document.querySelectorAll('.story'))
          .map((storyElement) => (storyElement.textContent || '').trim())
          .filter((text) => Boolean(text));
      })
    );
  }

  async getFirstItemTextExcluding(excludedTexts: string[]): Promise<string> {
    const allTexts = await this.getAllItemTexts();
    const result = allTexts.find((text) => !excludedTexts.includes(text));

    if (!result) {
      throw new Error('No editable items were found in the list.');
    }

    return result;
  }

  async createItem(text: string, imageAbsolutePath: string): Promise<void> {
    await this.ensureCreateMode();
    await this.attachImage(imageAbsolutePath);
    await this.setTextInForm(text);
    await this.reapplyTextIfItGetsCleared(text);
    await this.ensureTextPresentBeforeSubmit(text);

    const createEnabled = await this.createButton.isEnabled().catch(() => false);
    if (!createEnabled) {
      throw new Error('Create button is disabled even though image and text were provided.');
    }

    const itemCountBefore = (await this.getAllItemTexts()).length;
    await this.waitForVisible(this.createButton);
    await this.createButton.click();
    await this.raiseCreateAlertIfPresent();

    try {
      await this.waitUntil(
        async () => this.itemExists(text),
        `The item "${text}" was not created.`,
        30000
      );
    } catch (error) {
      const formTextAfterSubmit = await this.getFormTextValue().catch(() => '<unavailable>');
      const imageValueAfterSubmit = await this.getImageInputValue().catch(() => '<unavailable>');
      const itemCountAfter = (await this.getAllItemTexts()).length;
      const browserErrors = await this.getRecentBrowserErrors();

      throw new Error(
        [
          `The item "${text}" was not created.`,
          `Diagnostics: itemCountBefore=${itemCountBefore}, itemCountAfter=${itemCountAfter}.`,
          `Form text after submit: "${formTextAfterSubmit}".`,
          `Image input after submit: "${imageValueAfterSubmit}".`,
          browserErrors ? `Browser errors: ${browserErrors}` : '',
          `Original error: ${String(error)}`
        ].join(' ')
      );
    }
  }

  async createItemWithoutImage(text: string): Promise<void> {
    await this.ensureCreateMode();
    await this.setTextInForm(text);
    await this.clickWhenClickable(this.createButton);
  }

  async editItem(
    currentText: string,
    newText: string,
    imageAbsolutePath?: string
  ): Promise<void> {
    await this.clickRowActionButton(currentText, 'Edit');
    await this.waitForVisible(this.updateButton);

    await this.setTextInForm(newText);

    if (imageAbsolutePath) {
      await this.attachImage(imageAbsolutePath);
    }

    await this.clickWhenClickable(this.updateButton);

    await this.waitUntil(
      async () => this.itemExists(newText),
      `The item "${currentText}" was not updated to "${newText}".`
    );
  }

  async deleteItem(text: string): Promise<void> {
    await this.clickRowActionButton(text, 'Delete');
    await this.waitForVisible(this.confirmDeleteButton);
    await this.clickWhenClickable(this.confirmDeleteButton);

    await this.waitUntil(
      async () => !(await this.itemExists(text)),
      `The item "${text}" was not deleted.`
    );
  }

  async openDeleteModalForItem(text: string): Promise<void> {
    await this.clickRowActionButton(text, 'Delete');
    await this.waitForVisible(this.deleteModalMessage);
  }

  async getDeleteModalMessageText(): Promise<string> {
    await this.waitForVisible(this.deleteModalMessage);
    return (await this.deleteModalMessage.getText()).trim();
  }

  async cancelDeleteModal(): Promise<void> {
    await this.clickWhenClickable(this.modalCancelButton);
  }

  async clickEditForItem(text: string): Promise<void> {
    await this.clickRowActionButton(text, 'Edit');
    await this.waitForVisible(this.updateButton);
  }

  async isEditMode(): Promise<boolean> {
    return this.updateButton.isDisplayed().catch(() => false);
  }

  async getFormTextValue(): Promise<string> {
    await this.textInput.waitForExist({ timeout: 15000 });
    return ((await this.textInput.getValue()) || '').trim();
  }

  async getImageInputValue(): Promise<string> {
    await this.imageInput.waitForExist({ timeout: 15000 });
    return String((await this.imageInput.getValue()) || '').trim();
  }

  async getAndAcceptAlertText(timeout = 10000): Promise<string> {
    await this.waitUntil(
      async () => browser.isAlertOpen(),
      'Expected browser alert was not displayed.',
      timeout
    );

    const alertText = await browser.getAlertText();
    await browser.acceptAlert();
    return alertText.trim();
  }

  private async ensureCreateMode(): Promise<void> {
    const isUpdateButtonVisible = await this.updateButton.isDisplayed().catch(() => false);

    if (isUpdateButtonVisible) {
      await this.clickWhenClickable(this.cancelButton);
      await this.waitForVisible(this.createButton);
    }
  }

  // Find and click the row action in one DOM execution to avoid stale references.
  private async clickRowActionButton(
    itemText: string,
    actionButtonLabel: 'Edit' | 'Delete'
  ): Promise<void> {
    const clicked = await this.withStaleRetry(async () =>
      browser.execute(
        (targetText, targetLabel) => {
          const rows = Array.from(document.querySelectorAll('ul.media-list li.media'));

          for (const row of rows) {
            const storyElement = row.querySelector('.story');
            const rowText = (storyElement?.textContent || '').trim();

            if (rowText !== targetText) {
              continue;
            }

            const buttons = Array.from(row.querySelectorAll('button'));
            const actionButton = buttons.find(
              (button) => (button.textContent || '').trim() === targetLabel
            );

            if (!actionButton) {
              return false;
            }

            (actionButton as HTMLButtonElement).click();
            return true;
          }

          return false;
        },
        itemText,
        actionButtonLabel
      )
    );

    if (!clicked) {
      throw new Error(
        `No "${actionButtonLabel}" button was found for item text "${itemText}".`
      );
    }
  }

  // Try multiple upload strategies because mobile Chrome does not support uploadFile.
  private async attachImage(imageAbsolutePath: string): Promise<void> {
    await this.imageInput.waitForExist({ timeout: 15000 });
    const attemptErrors: string[] = [];
    const isMobileSession = browser.isMobile;

    // uploadFile is great for desktop/grid sessions but is unsupported in mobile Chrome.
    if (!isMobileSession) {
      try {
        const uploadedPath = await browser.uploadFile(imageAbsolutePath);
        await this.imageInput.setValue(uploadedPath);
        const selectedValue = await this.imageInput.getValue();
        if (selectedValue) {
          return;
        }
        attemptErrors.push('uploadFile completed but the file input stayed empty.');
      } catch (error) {
        attemptErrors.push(`uploadFile failed: ${String(error)}`);
      }
    }

    if (isMobileSession) {
      try {
        const fileName = path.basename(imageAbsolutePath);
        const remotePath = `/sdcard/Download/${fileName}`;
        const fileContentBase64 = fs.readFileSync(imageAbsolutePath).toString('base64');
        const mobileBrowser = browser as unknown as {
          pushFile?: (remotePath: string, base64Data: string) => Promise<void>;
        };

        if (typeof mobileBrowser.pushFile !== 'function') {
          attemptErrors.push('pushFile command is not available on this mobile driver.');
        } else {
          await mobileBrowser.pushFile(remotePath, fileContentBase64);
          await this.imageInput.click();
          await this.pickAndroidFileFromNativeChooser(fileName);

          const selectedValue = await this.imageInput.getValue();
          if (selectedValue) {
            return;
          }

          attemptErrors.push(
            'Android native file-chooser flow completed but the file input stayed empty.'
          );
        }
      } catch (error) {
        attemptErrors.push(`Android native chooser strategy failed: ${String(error)}`);
      }
    }

    try {
      await this.imageInput.setValue(imageAbsolutePath);
      const selectedValue = await this.imageInput.getValue();
      if (selectedValue) {
        return;
      }
      attemptErrors.push('Direct setValue completed but the file input stayed empty.');
    } catch (error) {
      attemptErrors.push(`Direct setValue failed: ${String(error)}`);
    }

    throw new Error(
      `Image file was not attached: ${imageAbsolutePath}. Attempts: ${attemptErrors.join(' | ')}`
    );
  }

  private async setTextInForm(text: string): Promise<void> {
    await this.waitForVisible(this.textInput);
    const attemptErrors: string[] = [];

    try {
      await this.textInput.click();
      await this.textInput.clearValue();
      await this.textInput.setValue(text);

      if ((await this.getFormTextValue()) === text) {
        if (pauseAfterTextMs > 0) {
          await browser.pause(pauseAfterTextMs);
        }
        return;
      }

      attemptErrors.push('clearValue + setValue did not persist the expected text.');
    } catch (error) {
      attemptErrors.push(`clearValue + setValue failed: ${String(error)}`);
    }

    if (browser.isMobile) {
      try {
        await this.textInput.click();
        await this.textInput.clearValue();
        await this.textInput.addValue(text);

        if ((await this.getFormTextValue()) === text) {
          if (pauseAfterTextMs > 0) {
            await browser.pause(pauseAfterTextMs);
          }
          return;
        }

        attemptErrors.push('clearValue + addValue did not persist the expected text.');
      } catch (error) {
        attemptErrors.push(`clearValue + addValue failed: ${String(error)}`);
      }

      try {
        const textarea = await this.textInput;
        await browser.execute(
          (element, value) => {
            const textareaElement = element as unknown as HTMLTextAreaElement;
            textareaElement.focus();
            textareaElement.value = value;
            textareaElement.dispatchEvent(new Event('input', { bubbles: true }));
            textareaElement.dispatchEvent(new Event('change', { bubbles: true }));
            textareaElement.dispatchEvent(new Event('blur', { bubbles: true }));
          },
          textarea,
          text
        );

        if ((await this.getFormTextValue()) === text) {
          if (pauseAfterTextMs > 0) {
            await browser.pause(pauseAfterTextMs);
          }
          return;
        }

        attemptErrors.push('Mobile DOM fallback did not persist the expected text.');
      } catch (error) {
        attemptErrors.push(`Mobile DOM fallback failed: ${String(error)}`);
      }
    }

    throw new Error(
      `Text area value was not set correctly. Expected "${text}", got "${await this.getFormTextValue()}". Attempts: ${attemptErrors.join(' | ')}`
    );
  }

  private async pickAndroidFileFromNativeChooser(fileName: string): Promise<void> {
    const contextBrowser = browser as unknown as {
      getContexts?: () => Promise<string[]>;
      switchContext?: (name: string) => Promise<void>;
    };

    if (!contextBrowser.getContexts || !contextBrowser.switchContext) {
      throw new Error('Context-switch commands are not available on this mobile driver.');
    }

    const contexts = await contextBrowser.getContexts();
    const nativeContext = contexts.find((context) => context.toUpperCase().includes('NATIVE_APP'));
    const webContext = contexts.find(
      (context) =>
        context.toUpperCase().includes('CHROMIUM') || context.toUpperCase().includes('WEBVIEW')
    );

    if (!nativeContext) {
      throw new Error(`Native context was not found. Available contexts: ${contexts.join(', ')}`);
    }

    await contextBrowser.switchContext(nativeContext);

    try {
      const fileOption = $(
        `//*[@resource-id="com.google.android.documentsui:id/title" and contains(@text,"${fileName}")]`
      );

      const fallbackFileOption = $(`android=new UiSelector().textContains("${fileName}")`);

      const existsInList = await fileOption.isExisting().catch(() => false);
      const existsInFallback = await fallbackFileOption.isExisting().catch(() => false);

      if (!existsInList && !existsInFallback) {
        const downloadsOption = $('android=new UiSelector().textContains("Downloads")');
        const downloadsExists = await downloadsOption.isExisting().catch(() => false);
        if (downloadsExists) {
          await downloadsOption.click();
        }
      }

      if (await fileOption.isExisting().catch(() => false)) {
        await fileOption.click();
      } else if (await fallbackFileOption.isExisting().catch(() => false)) {
        await fallbackFileOption.click();
      } else {
        throw new Error(`File "${fileName}" was not found in the native file chooser.`);
      }
    } finally {
      if (webContext) {
        await contextBrowser.switchContext(webContext);
      }
    }
  }

  private async reapplyTextIfItGetsCleared(text: string): Promise<void> {
    const stable = await this.isTextStableForWindow(text, 3000);

    if (stable) {
      return;
    }

    await this.setTextInForm(text);
  }

  private async isTextStableForWindow(expectedText: string, windowMs: number): Promise<boolean> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < windowMs) {
      const current = await this.getFormTextValue();
      if (current !== expectedText) {
        return false;
      }

      await browser.pause(120);
    }

    return true;
  }

  // Read browser logs as best-effort diagnostics; some drivers do not support this.
  private async getRecentBrowserErrors(): Promise<string> {
    try {
      const getLogs = (browser as unknown as { getLogs: (type: string) => Promise<unknown[]> })
        .getLogs;

      if (!getLogs) {
        return '';
      }

      const rawLogs = await getLogs('browser');
      const errors = rawLogs
        .map((entry) => String(entry))
        .filter((line) => /error|ERR_/i.test(line))
        .slice(-3);

      return errors.join(' | ');
    } catch {
      return '';
    }
  }

  private async ensureTextPresentBeforeSubmit(expectedText: string): Promise<void> {
    const current = await this.getFormTextValue();

    if (current === expectedText) {
      return;
    }

    await this.setTextInForm(expectedText);

    await this.waitUntil(
      async () => (await this.getFormTextValue()) === expectedText,
      `Text was cleared before submit. Expected "${expectedText}", got "${await this.getFormTextValue()}".`,
      5000
    );
  }

  private async raiseCreateAlertIfPresent(): Promise<void> {
    const hasAlert = await browser.isAlertOpen();

    if (hasAlert) {
      const alertText = await browser.getAlertText();
      await browser.acceptAlert();
      throw new Error(`Create flow raised an alert: "${alertText}"`);
    }
  }
}

export const strangerListPage = new StrangerListPage();
