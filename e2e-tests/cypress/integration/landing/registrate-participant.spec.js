/// <reference types="cypress" />

import {
  assertDashboardAdminActivityContains,
  assertEditMealTimesDialogIsClosed, assertGenderSelected,
  assertMealsExistInDashboardWithTimes,
  assertToastIsShown, getByTestId,
  getMealTimeControlInputByMealLabel, getTextInputByName,
  navigateAdminDashboard,
  openEditMealTimesDialogAndExecuteInDialog,
  submitStandardDialog,
} from "../../support";
import {createRunningDinner, RUNNING_DINNER_ADMIN_EMAIL} from "../../support/runningDinnerSetup"

describe('participant registration', () => {

  let runningDinner, adminId, publicDinnerUrl;

  beforeEach(() => {
    createRunningDinner({
      date: new Date(),
      registrationType: "PUBLIC"
    }).then(createRunningDinnerResponse => {
      runningDinner = createRunningDinnerResponse.runningDinner;
      adminId = runningDinner.adminId;
      // TODO: This is really stupid, backend gives us no publicDinnerUrl upon wizard finish....:
      publicDinnerUrl = `/running-dinner-events/${runningDinner.publicSettings.publicDinnerId}`;

      cy.log(`Open public dinner ${publicDinnerUrl}`);
      cy.visit(publicDinnerUrl);
      getByTestId("registration-form-open-action").click({ force: true });
    });
  })

  it('default registration without team partner wish', () => {

    cy.log("Ensure undefined is preselected as gender");
    assertGenderSelected("undefined");

    getTextInputByName("firstnamePart").type("Max");
    getTextInputByName("lastname").type("Mustermann");
    getTextInputByName("email").type("Max@Mustermann.de");
    getByTestId("gender-male-action").click({ force: true});
    assertGenderSelected("male");

    getTextInputByName("street").type("Musterstraße");
    getTextInputByName("streetNr").type("1");
    getTextInputByName("zip").type("79100");
    getTextInputByName("cityName").type("Freiburg");
    getTextInputByName("addressRemarks").type("Adress-Bemerkungen");
    getTextInputByName("numSeats").type("6");

    getByTestId("dataProcessingAcknowledged").click({ force: true});

    getByTestId("registration-form-next-action").click({force: true});

    getByTestId("registration-summary-dialog").within(() => {
      getByTestId("mobilenumber-missing-attention").should("exist");
      cy.contains("Max Mustermann");
      cy.contains("Musterstraße 1");
      cy.contains("79100 Freiburg");
      cy.contains("Max@Mustermann.de");
      cy.contains("Du hast genügend Plätze um als Gastgeber am Event teilzunehmen").should("exist");
      submitStandardDialog();
    });

    cy.contains("Anmeldung abgeschlossen");
    cy.contains("Herzlichen Glückwunsch");
    cy.contains(RUNNING_DINNER_ADMIN_EMAIL);
  });

  it.only('non-numeric input of numSeats lead to validation issue', () => {

    getTextInputByName("firstnamePart").type("Max");
    getTextInputByName("lastname").type("Mustermann");
    getTextInputByName("email").type("Max@Mustermann.de");

    getTextInputByName("street").type("Musterstraße");
    getTextInputByName("streetNr").type("1");
    getTextInputByName("zip").type("79100");
    getTextInputByName("cityName").type("Freiburg");
    getTextInputByName("addressRemarks").type("Adress-Bemerkungen");
    getTextInputByName("numSeats").type("2-4");

    getByTestId("dataProcessingAcknowledged").click({ force: true});

    getByTestId("registration-form-next-action").click({force: true});

    assertToastIsShown("Ungültige Eingabe");
  });

})
