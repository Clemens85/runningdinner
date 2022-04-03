/// <reference types="cypress" />

import {
  getWizardCityInput,
  getWizardTitleInput,
  getWizardZipInput,
  getWizardDateInput,
  navigateWizardStart,
  getWizardNextButton,
  getSelectedLanguageButton,
  getMealInputByIndex,
  getMealTimeControlByMealLabel,
  getMealTimeControlInputByMealLabel,
  openMealTimeControlTimePickerByMealLabel,
  selectHourInTimePicker, applyTimePickerSelection, getWizardPublicTitleInput, getWizardEndOfRegistrationDateInput,
} from "../../support";
import {formatLocalDate, plusDays} from "../../support/util";

describe('participants list', () => {

  const NOW = new Date();
  const NOW_PLUS_7_DAYS = plusDays(NOW, 7);
  const NOW_PLUS_5_DAYS = plusDays(NOW, 5);

  beforeEach(() => {
  })

  it('Meal times can be changed by both keyboard and time picker', () => {
    navigateWizardStart(false);

    cy.log(`Change basic information in wizard and set dinner date to ${formatLocalDate(NOW_PLUS_7_DAYS)}`);
    getWizardTitleInput().clear().type("Dinner Title");
    getWizardZipInput().clear().type("79100");
    getWizardCityInput().clear().type("Freiburg");
    getWizardDateInput()
      .should("have.value", formatLocalDate(NOW))
      .clear()
      .type(formatLocalDate(NOW_PLUS_7_DAYS));
    getSelectedLanguageButton("de").should("exist");

    getWizardNextButton().click();

    cy.log(`Assert 3 meals exist and change "Dessert" to "Nachspeise"`);
    getMealInputByIndex(0).should("have.value", "Vorspeise");
    getMealInputByIndex(1).should("have.value", "Hauptgericht");
    getMealInputByIndex(2 ).should("have.value", "Dessert");
    getMealInputByIndex(2).clear().type("Nachspeise");

    getWizardNextButton().click();

    cy.log(`Assert Hauptgericht is set to 21:00 Uhr and change it's time by typing 21:30`);
    getMealTimeControlInputByMealLabel("Hauptgericht")
      .should("have.value", "21:00")
      .clear()
      .type("21:30");

    cy.log(`Assert Nachspeise is set to 23:00 Uhr and change it's time by using time picker to 22:00`);
    getMealTimeControlInputByMealLabel("Nachspeise")
      .should("have.value", "23:00");
    openMealTimeControlTimePickerByMealLabel("Nachspeise");
    selectHourInTimePicker("22");
    applyTimePickerSelection();

    getWizardNextButton().click();

    getWizardPublicTitleInput().should("exist");
    getWizardEndOfRegistrationDateInput()
      .should("have.value", formatLocalDate(NOW_PLUS_5_DAYS));
  })

})
