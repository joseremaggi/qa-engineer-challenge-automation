# Bug Reports and Regression Test Cases

## Scope

The following bugs were observed in the item management web application.
Each bug includes a dedicated regression test case that should pass once the issue is fixed.

Environment used for reporting:

- URL: `https://immense-hollows-74271.herokuapp.com/`
- Browser: Chrome (desktop and mobile emulation)
- Report date: April 4, 2026

Automation coverage:

- Regression spec file: `test/specs/bug-regressions.e2e.ts`
- Desktop command: `npm run test:bugs`
- Desktop + mobile emulation command: `npm run test:bugs:all`

## BUG-001 - Typo in Delete Confirmation Message

- Severity: Low
- Area: Delete confirmation modal

Steps to reproduce:

1. Open the application.
2. Click `Delete` on any existing item.
3. Observe the confirmation modal text.

Actual result:

- Modal shows: `¿Are you shure you want to delete this item?`

Expected result:

- Modal should show correct English text, for example:
  `Are you sure you want to delete this item?`

Impact:

- User-facing typo reduces product quality and trust.

Regression test case (TC-BUG-001):

1. Open the app.
2. Click `Delete` on any item.
3. Verify the confirmation message text.
4. Close or cancel the modal.

Pass criteria:

- Text is grammatically correct and does not contain `shure`.

## BUG-002 - Image Input Is Not Cleared After Saving

- Severity: Medium
- Area: Create/Edit form state management

Steps to reproduce:

1. Open the application.
2. Select an image and enter text.
3. Save the item (`Create Item` or `Update Item`).
4. Return to create mode and inspect the image input state.

Actual result:

- The file selection remains populated after saving.

Expected result:

- Image input should be cleared after a successful save, so the next operation starts with a clean form.

Impact:

- Can cause accidental reuse of the previous image in subsequent operations.

Regression test case (TC-BUG-002):

1. Create or update an item with an image.
2. After save, check file input value/state.
3. Start a new create flow without selecting a new image.

Pass criteria:

- File input is empty after save.
- User must explicitly pick a new image for the next item.

## BUG-003 - Edit Form Keeps Stale Data After Deleting the Edited Item

- Severity: High
- Area: Edit/Delete interaction and form synchronization

Steps to reproduce:

1. Click `Edit` on an existing item.
2. Without canceling edit mode, delete the same item from the list.
3. Observe the form on the right side.

Actual result:

- Edit form still shows data from an item that no longer exists.

Expected result:

- Form should reset to create mode or clear the deleted item context immediately.

Impact:

- Inconsistent UI state; user can attempt operations on stale/non-existing data.

Regression test case (TC-BUG-003):

1. Enter edit mode for an item.
2. Delete that same item.
3. Verify form state and buttons.

Pass criteria:

- Form exits edit mode automatically.
- No stale text/image is shown from the deleted item.
- `Update Item` is not available for deleted entity context.

## BUG-004 - Incorrect Error Message When Creating Without Image

- Severity: Low
- Area: Validation message copy

Steps to reproduce:

1. Open the application.
2. Enter text in the form.
3. Try to create an item without selecting an image.
4. Observe the displayed validation message/alert.

Actual result:

- Message shown: `You must to select an image`

Expected result:

- Correct message, for example:
  `You must select an image.`

Impact:

- User-facing grammar issue and non-professional validation copy.

Regression test case (TC-BUG-004):

1. Fill text only.
2. Trigger create action without image.
3. Verify validation message text.

Pass criteria:

- Message is grammatically correct and clearly instructs the user to select an image.

## Notes

- Known behavior to ignore (not a bug): the app data can reset periodically.
- If the dataset resets during execution, rerun the affected test case.
