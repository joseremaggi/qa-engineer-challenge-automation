import path from 'node:path';
import { expect } from '@wdio/globals';
import { strangerListPage } from '../pages/stranger-list.page';
import { ItemFactory } from '../utils/item-factory';

// Regression checks for known bugs; these should pass after product fixes land.
describe('Stranger List - Bug Regression Coverage', () => {
  const imageFixturePath = path.resolve(process.cwd(), 'test/fixtures/test-image.jpg');

  let editedOriginalText = '';
  let editedTemporaryText = '';

  beforeEach(async () => {
    await strangerListPage.open();
  });

  afterEach(async () => {
    if (
      editedOriginalText &&
      editedTemporaryText &&
      (await strangerListPage.itemExists(editedTemporaryText))
    ) {
      await strangerListPage.editItem(editedTemporaryText, editedOriginalText);
    }

    editedOriginalText = '';
    editedTemporaryText = '';
  });

  it('TC-BUG-001: delete modal message should use correct wording', async () => {
    const existingItemText = await strangerListPage.getFirstItemTextExcluding([]);

    await strangerListPage.openDeleteModalForItem(existingItemText);
    const modalMessage = await strangerListPage.getDeleteModalMessageText();
    await strangerListPage.cancelDeleteModal();

    await expect(modalMessage).toContain('Are you sure you want to delete this item?');
    await expect(modalMessage.toLowerCase()).not.toContain('shure');
  });

  it('TC-BUG-002: image input should be cleared after a successful save', async () => {
    editedOriginalText = await strangerListPage.getFirstItemTextExcluding([]);
    editedTemporaryText = ItemFactory.uniqueItemText('Bug 002 edited text');

    await strangerListPage.editItem(editedOriginalText, editedTemporaryText, imageFixturePath);

    const imageInputValue = await strangerListPage.getImageInputValue();
    await expect(imageInputValue).toBe('');
  });

  it('TC-BUG-003: edit form should reset after deleting the item being edited', async () => {
    const targetItemText = await strangerListPage.getFirstItemTextExcluding([]);

    await strangerListPage.clickEditForItem(targetItemText);
    await expect(await strangerListPage.isEditMode()).toBe(true);

    await strangerListPage.deleteItem(targetItemText);

    await expect(await strangerListPage.isEditMode()).toBe(false);
    await expect(await strangerListPage.getFormTextValue()).toBe('');
  });

  it('TC-BUG-004: image-required validation text should be grammatically correct', async () => {
    const textOnlyValue = ItemFactory.uniqueItemText('Bug 004 text-only attempt');

    await strangerListPage.createItemWithoutImage(textOnlyValue);
    const alertText = await strangerListPage.getAndAcceptAlertText();

    await expect(alertText).toBe('You must select an image.');
  });
});
