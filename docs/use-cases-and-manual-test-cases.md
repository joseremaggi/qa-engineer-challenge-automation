# Use Cases and Manual Test Cases

## Scope

This document covers manual validation for:

1. Create item
2. Edit existing item
3. Delete created item

## Use Cases

## UC-01 Create Item

- Actor: End user
- Goal: Add a new item with image and text.
- Preconditions:
  - User opens `https://immense-hollows-74271.herokuapp.com/`.
  - Form is visible in create mode.
- Main Flow:
  1. User selects a valid image.
  2. User enters text in the item textarea.
  3. User clicks `Create Item`.
  4. System stores item and displays it in the list.
- Expected Result:
  - New item is visible in list with entered text and image.

## UC-02 Edit Existing Item

- Actor: End user
- Goal: Update text and/or image from an existing item.
- Preconditions:
  - At least one item exists in the list.
- Main Flow:
  1. User clicks `Edit` on an existing item.
  2. System switches form to edit mode.
  3. User updates text and/or image.
  4. User clicks `Update Item`.
  5. System updates list entry.
- Expected Result:
  - Updated information is shown in the list.

## UC-03 Delete Created Item

- Actor: End user
- Goal: Remove an item from the list.
- Preconditions:
  - Item exists in the list.
- Main Flow:
  1. User clicks `Delete` for target item.
  2. Confirmation modal appears.
  3. User confirms by clicking `Yes, delete it!`.
  4. System removes item from list.
- Expected Result:
  - Item is no longer visible in list.

## Manual Test Cases

| ID | Feature | Priority | Preconditions | Steps | Expected Result |
|---|---|---|---|---|---|
| TC-MAN-001 | Create item (happy path) | High | Form in create mode | 1) Select valid PNG/JPG image (<=320x320). 2) Enter valid text (<=300 chars). 3) Click `Create Item`. | Item appears in list with correct text and image. |
| TC-MAN-002 | Create item without image | Medium | Form in create mode | 1) Leave image empty. 2) Enter valid text. 3) Try to create item. | Create action is blocked and/or required validation appears for image. |
| TC-MAN-003 | Create item without text | High | Form in create mode | 1) Select valid image. 2) Leave text empty. 3) Try to create item. | Create button remains disabled and item is not created. |
| TC-MAN-004 | Edit existing item text only | High | Existing item in list | 1) Click `Edit` for an existing item. 2) Change text. 3) Click `Update Item`. | Updated text is visible in list for that item. |
| TC-MAN-005 | Edit existing item image + text | Medium | Existing item in list | 1) Click `Edit`. 2) Upload new valid image. 3) Update text. 4) Click `Update Item`. | Image and text are updated successfully. |
| TC-MAN-006 | Cancel edit | Medium | Existing item in list | 1) Click `Edit`. 2) Modify text. 3) Click `Cancel`. | Form returns to create mode and changes are not saved. |
| TC-MAN-007 | Delete item with confirmation | High | Existing item in list | 1) Click `Delete`. 2) In modal click `Yes, delete it!`. | Item is removed from list. |
| TC-MAN-008 | Delete item and cancel modal | Medium | Existing item in list | 1) Click `Delete`. 2) Click `Cancel` in modal. | Item remains visible in list. |

## Compatibility Execution Notes

Desktop manual run:

1. Open app in desktop Chrome.
2. Execute TC-MAN-001 through TC-MAN-008.
3. Record results and evidence.

Mobile manual run:

1. Open app in mobile browser or Chrome DevTools device emulation.
2. Execute the same TC-MAN-001 through TC-MAN-008.
3. Validate responsive layout and control accessibility.

Submission baseline note:

- In automated execution, mobile compatibility is covered by Chrome mobile emulation (`TARGET=mobile`).
- Appium real-device execution can be added as optional extra evidence.

## Pending Scope

Bug report cases are intentionally excluded from this document and will be added later.
