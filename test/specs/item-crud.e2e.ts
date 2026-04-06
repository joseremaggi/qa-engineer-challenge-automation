import path from 'node:path';
import { expect } from '@wdio/globals';
import { strangerListPage } from '../pages/stranger-list.page';
import { ItemFactory } from '../utils/item-factory';

describe('Stranger List - Create, Edit and Delete', () => {
  const imageFixturePath = path.resolve(process.cwd(), 'test/fixtures/test-image.jpg');

  let createdItemText = '';
  let editedOriginalText = '';
  let editedTemporaryText = '';

  beforeEach(async () => {
    await strangerListPage.open();
  });

  // Run cleanup as best effort so scenario failures stay visible.
  after(async () => {
    try {
      if (
        editedOriginalText &&
        editedTemporaryText &&
        (await strangerListPage.itemExists(editedTemporaryText))
      ) {
        await strangerListPage.editItem(editedTemporaryText, editedOriginalText);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Cleanup warning (restore edited item): ${String(error)}`);
    }

    try {
      if (createdItemText && (await strangerListPage.itemExists(createdItemText))) {
        await strangerListPage.deleteItem(createdItemText);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Cleanup warning (delete created item): ${String(error)}`);
    }
  });

  it('creates a new item', async () => {
    createdItemText = ItemFactory.uniqueItemText('Automation create item');

    await strangerListPage.createItem(createdItemText, imageFixturePath);

    await expect(await strangerListPage.itemExists(createdItemText)).toBe(true);
  });

  it('edits an existing item different from the created one', async () => {
    editedOriginalText = await strangerListPage.getFirstItemTextExcluding([createdItemText]);
    editedTemporaryText = ItemFactory.uniqueItemText('Automation edited item');

    await strangerListPage.editItem(editedOriginalText, editedTemporaryText, imageFixturePath);

    await expect(await strangerListPage.itemExists(editedTemporaryText)).toBe(true);
  });

  it('deletes the item created by this suite', async () => {
    // Create data here when this test runs in isolation.
    if (!createdItemText || !(await strangerListPage.itemExists(createdItemText))) {
      createdItemText = ItemFactory.uniqueItemText('Automation delete item');
      await strangerListPage.createItem(createdItemText, imageFixturePath);
    }

    await strangerListPage.deleteItem(createdItemText);

    await expect(await strangerListPage.itemExists(createdItemText)).toBe(false);
  });
});
