import { getByTestId, getMealTimeControlInputByMealLabel, getTextInputByName } from '../index';

export function navigateWizardStart(demo) {
  cy.visit('/create-running-dinner');
  getByTestId(`wizard-open-action${demo ? '-demo' : ''}`)
    .invoke('removeAttr', 'target')
    .click();

  getWizardNextButton().should('exist');
  getWizardPrevButton().should('not.exist');
}

export function getWizardNextButton() {
  return getByTestId('wizard-next-action');
}

export function getWizardPrevButton() {
  return getByTestId('wizard-previous-action');
}

export function getWizardTitleInput() {
  return getTextInputByName('title');
}

export function getWizardZipInput() {
  return getTextInputByName('zip');
}

export function getWizardCityInput() {
  return getTextInputByName('city');
}

export function getWizardDateTextInput() {
  return getTextInputByName('date');
}

export function getWizardDateControl() {
  return cy.get('[data-sectionindex="0"] > .MuiPickersSectionList-sectionContent');
}

export function getMealInputByIndex(index) {
  return getTextInputByName(`meals[${index}].label`);
}

export function openMealTimeControlTimePickerByMealLabel(mealLabel) {
  cy.get(`#meal-time-${mealLabel}-label`).parent().find('button').first().click({ force: true });
}

export function getWizardPublicTitleInput() {
  return getTextInputByName('title');
}

export function getWizardEndOfRegistrationDateInput() {
  return getTextInputByName('endOfRegistrationDate');
}
