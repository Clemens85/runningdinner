// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

export function navigateParticipantsList(adminId) {
  cy.visit(`/admin/${adminId}/participants`);
}

export function navigateAdminDashboard(adminId) {
  cy.visit(`/admin/${adminId}`);
}

export function navigateTeamsList(adminId) {
  cy.visit(`/admin/${adminId}/teams`);
}

export function getByTestId(dataTestId, optionalQuerySuffix) {
  const querySuffix = optionalQuerySuffix ? optionalQuerySuffix : '';
  return cy.get(`[data-testid="${dataTestId}"]${querySuffix}`);
}

export function getSelectedLanguageButton(lang) {
  return getByTestId(`language-switch-${lang}-selected`);
}

export function getUnselectedLanguageButton(lang) {
  return getByTestId(`language-switch-${lang}`);
}

export function getMealTimeControlByMealLabel(mealLabel) {
  return getByTestId(`meal-time-${mealLabel}`);
}

export function getMealTimeControlInputByMealLabel(mealLabel) {
  return getMealTimeControlByMealLabel(mealLabel)
    .find("input")
    .first();
}

export function submitStandardDialog() {
  return getByTestId("dialog-submit")
          .click({ force: true });
}

export function getButtonByLabel(label) {
  return cy.get(`button:contains('${label}')`);
}

export * from "./wizard/wizardHelper";
export * from "./mui/muiHelper";
export * from "./admin/adminDashboardHelper";
export * from "./commonHelper";
export * from "./landing/registrationHelper";
export * from "./admin/teamsHelper";
export * from "./admin/waitingListHelper";
export * from "./admin/participantListHelper";