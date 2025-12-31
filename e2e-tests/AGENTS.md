# Copilot Instructions for Running Dinner E2E Tests

## Project Overview

Cypress e2e test suite for a "Running Dinner" event management application. Tests cover the full user journey: creating dinner events via wizard, participant registration, admin dashboard, team management, and waitlist handling.

## Architecture & Test Organization

### Test Structure

- **Integration tests**: `cypress/integration/{area}/{feature}.spec.js`
  - `wizard/` - Event creation wizard flows
  - `landing/` - Public registration flows
  - `admin/` - Admin dashboard, teams, participants, waitlist
- **Support helpers**: `cypress/support/{area}/{feature}Helper.js`
  - Organized by UI area (wizard, admin, landing, mui)
  - Each helper exports reusable test utilities and assertions
- **Setup utilities**: `cypress/support/{runningDinnerSetup, participantSetup}.js`
  - Create test data via backend API calls

### Helper Pattern

All helpers export functions from `cypress/support/index.js` for convenient imports:

```javascript
import {
  navigateAdminDashboard,
  getByTestId,
  assertToastIsShown,
} from "../../support";
```

## Critical Conventions

### Test Data Setup

**Always use API-based setup over UI navigation** for creating test fixtures:

- `createRunningDinner({ date, registrationType, numParticipantsToCreate })` - Creates dinner event via POST to `/rest/wizardservice/v1/create`
- `createParticipants(adminId, startNumber, endNumber, overrides)` - Batch creates participants via API
- Setup runs in `beforeEach()` hooks, returns promises with created entities

Example from [dashboard.spec.js](cypress/integration/admin/dashboard.spec.js#L13-L25):

```javascript
beforeEach(() => {
  createRunningDinner({
    date: new Date(),
    numParticipantsToCreate: 18,
  }).then((createRunningDinnerResponse) => {
    runningDinner = createRunningDinnerResponse.runningDinner;
    adminId = runningDinner.adminId;
  });
});
```

### Element Selection

- **Primary**: `getByTestId("data-testid-value")` - all UI elements use `data-testid` attributes
- **Material-UI inputs**: `getTextInputByName("fieldName")` - filters out hidden duplicates with `:not(.hidden input[name="fieldName"])`
- **DOM IDs**: `getByDomId("id")` only when `data-testid` unavailable

### Navigation

Use dedicated navigation helpers, not raw `cy.visit()`:

- `navigateAdminDashboard(adminId)` → `/admin/${adminId}`
- `navigateParticipantsList(adminId)` → `/admin/${adminId}/participants`
- `navigateWizardStart(isDemoMode)` → `/create-running-dinner`

### Date Handling

All dates must be converted to array format for backend API calls:

```javascript
import { toLocalDateArr, formatLocalDate, plusDays } from "../support/util";
const dinnerDate = new Date();
const dateArr = toLocalDateArr(dinnerDate); // [2024, 12, 31]
```

- **Backend expects**: `[year, month, day]` arrays
- **UI displays**: `dd.MM.yyyy` format via `formatLocalDate()`
- **Fixture dates**: Apply dinner date to meal times with `applyDinnerDateToMeals()` (see [runningDinnerSetup.js](cypress/support/runningDinnerSetup.js#L49-L55))

### Material-UI Interactions

- **Time pickers**: Use `openMealTimeControlTimePickerByMealLabel(label)`, `selectHourInTimePicker(hour)`, `applyTimePickerSelection()`
- **Checkboxes**: Verify with `assertMuiCheckboxSelected(element, true/false)` checking `.Mui-checked` class
- **Dialogs**: Use `submitStandardDialog()` to confirm, verify closure with `.should("not.exist")`
- **Gender buttons**: `assertGenderSelected("male")` checks `.MuiIconButton-colorPrimary` class

### Test Fixture Usage

`create-dinner.json` defines the dinner event template. Tests modify it programmatically:

- Set `basicDetails.date` and `publicSettings.endOfRegistrationDate` to calculated dates
- Apply `registrationType: "OPEN" | "PUBLIC" | "CLOSED"`
- For CLOSED dinners, set `publicSettings: null`

## Running Tests

```bash
# Interactive mode
npm run cypress-open-local

# Headless mode
./run-headless.sh  # runs all specs in cypress/integration/**/*.spec.js
```

**Base URL**: `https://localhost:3000` (set in cypress.json)
**Chrome web security**: Disabled (`chromeWebSecurity: false`) for cross-origin API calls

## Common Patterns

### Assertion Pattern

Use descriptive `cy.log()` statements before complex assertions:

```javascript
cy.log(`Assert 3 meals exist and change "Dessert" to "Nachspeise"`);
getMealInputByIndex(0).should("have.value", "Vorspeise");
```

### Dialog Testing Pattern

Many helpers use `within()` callback pattern for scoped assertions:

```javascript
assertRegistrationSummaryDialogShown(() => {
  cy.contains("Max Mustermann");
  submitStandardDialog();
});
```

### Force Clicks

Material-UI overlays often require `{ force: true }`:

```javascript
getByTestId("registration-form-open-action").click({ force: true });
```
