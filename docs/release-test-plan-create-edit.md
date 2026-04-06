# Release Test Plan - Create and Edit Features

## 1. Objective

Validate that `Create` and `Edit` features are stable, usable, and releasable on desktop and mobile before production deployment.

## 2. Release Scope

Primary in-scope coverage:

- Create item with image and text.
- Edit existing item text and image.
- Create/Edit validation rules and form state behavior.

Supporting in-scope coverage for this release:

- Foundational UI checks required before Create/Edit execution.
- Edit/Delete interaction sanity (to protect Edit state consistency).

Out of scope as release blockers for this plan:

- Full Delete feature regression pack as a standalone sign-off track.
- Full non-functional performance benchmarking.
- Security deep testing.

## 3. Test Strategy

- Execute manual test cases as the primary release gate for Create/Edit.
- Use automated E2E WebdriverIO regression to provide quick feedback in CI.
- Validate on desktop and mobile profile:
  - Desktop Chrome
  - Chrome mobile emulation (iPhone X)

## 4. Test Types

1. Smoke:
   - Basic app load and form state
   - Create happy path
   - Edit happy path
2. Functional:
   - Required fields
   - Character limit
   - Validation messaging
   - Form reset and state transitions
3. Regression:
   - Re-run core Create/Edit test cases after each candidate fix
4. UI/Responsive:
   - Critical responsive checks for mobile profile

## 5. Manual Test Case Baseline (Must Be Considered)

Core release-gating manual cases (mandatory):

- Foundational UI:
  - `TC-UI-001`, `TC-UI-002`, `TC-UI-003`
- Create P0:
  - `TC-CRT-001`, `TC-CRT-002`, `TC-CRT-003`, `TC-CRT-005`, `TC-CRT-006`, `TC-CRT-008`, `TC-CRT-010`
- Edit P0:
  - `TC-EDT-001`, `TC-EDT-002`, `TC-EDT-003`, `TC-EDT-004`, `TC-EDT-005`, `TC-EDT-009`

Extended Create/Edit coverage for this release window (strongly recommended):

- Create P1:
  - `TC-CRT-004`, `TC-CRT-007`, `TC-CRT-009`, `TC-UX-001`
- Edit P1/P2:
  - `TC-EDT-006`, `TC-EDT-007`, `TC-EDT-008`
- Responsive critical:
  - `TC-RESP-001`

Tracked but non-gating for this specific Create/Edit sign-off:

- Delete suite:
  - `TC-DEL-001`, `TC-DEL-002`, `TC-DEL-003`, `TC-DEL-004`, `TC-DEL-005`
- Additional compatibility checks:
  - `TC-RESP-002`, `TC-RESP-003`

### Manual Execution Matrix (Template)

Use this matrix during execution and update `Status` and `Notes`.

| ID | Scope | Priority | Gating | Status | Notes |
|---|---|---|---|---|---|
| TC-UI-001 | UI | P0 | Yes | Not Run | |
| TC-UI-002 | UI | P0 | Yes | Not Run | |
| TC-UI-003 | UI | P0 | Yes | Not Run | |
| TC-CRT-001 | Create | P0 | Yes | Not Run | |
| TC-CRT-002 | Create | P0 | Yes | Not Run | |
| TC-CRT-003 | Create | P0 | Yes | Not Run | |
| TC-CRT-004 | Create | P1 | Recommended | Not Run | |
| TC-CRT-005 | Create | P0 | Yes | Not Run | |
| TC-CRT-006 | Create | P0 | Yes | Not Run | |
| TC-CRT-007 | Create | P1 | Recommended | Not Run | |
| TC-CRT-008 | Create | P0 | Yes | Not Run | |
| TC-CRT-009 | Create | P1 | Recommended | Not Run | |
| TC-CRT-010 | Create | P0 | Yes | Not Run | |
| TC-UX-001 | Create/UX | P1 | Recommended | Not Run | |
| TC-EDT-001 | Edit | P0 | Yes | Not Run | |
| TC-EDT-002 | Edit | P0 | Yes | Not Run | |
| TC-EDT-003 | Edit | P0 | Yes | Not Run | |
| TC-EDT-004 | Edit | P0 | Yes | Not Run | |
| TC-EDT-005 | Edit | P0 | Yes | Not Run | |
| TC-EDT-006 | Edit | P1 | Recommended | Not Run | |
| TC-EDT-007 | Edit | P2 | Recommended | Not Run | |
| TC-EDT-008 | Edit | P1 | Recommended | Not Run | |
| TC-EDT-009 | Edit | P0 | Yes | Not Run | |
| TC-DEL-001 | Delete | P0 | No | Not Run | Tracked, non-gating in this plan |
| TC-DEL-002 | Delete | P0 | No | Not Run | Tracked, non-gating in this plan |
| TC-DEL-003 | Delete | P1 | No | Not Run | Tracked, non-gating in this plan |
| TC-DEL-004 | Delete | P1 | No | Not Run | Tracked, non-gating in this plan |
| TC-DEL-005 | Delete | P2 | No | Not Run | Tracked, non-gating in this plan |
| TC-RESP-001 | Responsive | P1 | Recommended | Not Run | |
| TC-RESP-002 | Responsive | P2 | No | Not Run | Tracked, non-gating in this plan |
| TC-RESP-003 | Compatibility | P1 | No | Not Run | Tracked, non-gating in this plan |

## 6. Automated Regression Coverage

WebdriverIO regression in this repository covers:

- Create flow
- Edit flow
- Delete flow
- Bug regression cases linked to reported defects

Automation is complementary and does not replace mandatory manual P0/P1 release checks.

## 7. Environments

- QA URL: `https://immense-hollows-74271.herokuapp.com/`
- Browsers:
  - Chrome (desktop)
  - Chrome mobile emulation (iPhone X)
- CI:
  - GitHub Actions Ubuntu runner

Optional extra (non-gating for this plan):

- Appium real-device/simulator runs for Android/iOS exploratory confidence.

## 8. Test Data

- Unique text generated per run (timestamp + random suffix).
- JPG fixture image for deterministic uploads.
- Existing seeded items from the environment for Edit flow.

## 9. Entry Criteria

- Target environment available and reachable.
- Create/Edit changes deployed to test environment.
- Manual test cases reviewed and approved.
- Automation suite executable locally and in CI.

## 10. Exit Criteria

- 100% of mandatory Create/Edit P0 manual cases executed.
- 100% pass on mandatory P0 manual cases.
- P1 Create/Edit cases executed with documented results and risk acceptance if any fail.
- No open Critical or High defects in Create/Edit scope.
- CI automation results attached (desktop + mobile jobs).

## 11. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Environment data resets periodically | Can invalidate expected results | Use unique test data and rerun impacted cases |
| Flaky UI timing during upload/save | False negatives in E2E tests | Use explicit waits and stable selectors |
| Browser/dependency mismatch in CI | Pipeline instability | Pin Node version and install Chrome in workflow |

## 12. Execution Plan

1. Run foundational UI cases (`TC-UI-*`).
2. Execute mandatory Create/Edit P0 manual cases.
3. Execute extended P1/P2 Create/Edit manual cases.
4. Run automated regression in CI and local verification as needed.
5. Triage failures (bug vs test vs environment), retest, and close.

## 13. Deliverables

- Manual execution matrix by Test Case ID (Pass/Fail/Blocked + evidence).
- Defect list linked to failing cases.
- Automated run artifacts from CI.
- Final release recommendation for Create/Edit.
