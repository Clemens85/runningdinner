/// <reference types="cypress" />

import {
  assertFormValidationToastIsShown,
  assertGenderSelected,
  assertToastIsShown,
  getByTestId,
  getTextInputByName,
  fillAddressFieldsInRegistrationForm,
  fillPersonalFieldsInRegistrationForm,
  submitStandardDialog, assertRegistrationFinishedPage, acknowledgeDataProcessing,
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

    fillPersonalFieldsInRegistrationForm("Max", "Mustermann", "Max@Mustermann.de");
    getByTestId("gender-male-action").click({ force: true});
    assertGenderSelected("male");

    fillAddressFieldsInRegistrationForm("Musterstraße", "1", "79100", "Freiburg");
    getTextInputByName("addressRemarks").type("Adress-Bemerkungen");
    getTextInputByName("numSeats").type("6");

    acknowledgeDataProcessing();

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

    assertRegistrationFinishedPage();
  });

  it.only('non-numeric input of numSeats lead to validation issue', () => {

    fillPersonalFieldsInRegistrationForm("Max", "Mustermann", "Max@Mustermann.de");

    fillAddressFieldsInRegistrationForm("Musterstraße", "1", "79100", "Freiburg");

    getTextInputByName("numSeats").type("2-4");

    acknowledgeDataProcessing();
    getByTestId("registration-form-next-action").click({force: true});

    getByTestId("registration-summary-dialog").should("not.exist");
    assertToastIsShown("Ungültige Eingabe");
  });

  it("numSeats is required for registration and 0 is valid", () => {
    fillPersonalFieldsInRegistrationForm("Max", "Mustermann", "Max@Mustermann.de");

    fillAddressFieldsInRegistrationForm("Musterstraße", "1", "79100", "Freiburg");

    acknowledgeDataProcessing();

    getByTestId("registration-form-next-action").click({force: true});
    assertFormValidationToastIsShown();
    getByTestId("registration-summary-dialog").should("not.exist");

    getTextInputByName("numSeats").clear().type("0");
    getByTestId("registration-form-next-action").click({force: true});
    getByTestId("registration-summary-dialog").within(() => {
      cy.contains("Du hast nicht genügend Plätze um als Gastgeber teilzunehmen, daher wird versucht dich jemandem zuzulosen der genügend Plätze hat").should("exist");
      submitStandardDialog();
    });

    assertRegistrationFinishedPage();
  });

})
