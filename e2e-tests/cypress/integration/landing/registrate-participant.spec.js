/// <reference types="cypress" />

import {
  assertFormValidationToastIsShown,
  assertGenderSelected,
  getByTestId,
  getTextInputByName,
  fillAddressFieldsInRegistrationForm,
  fillPersonalFieldsInRegistrationForm,
  submitStandardDialog,
  assertRegistrationFinishedPage,
  acknowledgeDataProcessing,
  assertRegistrationSummaryDialogNotShown,
  assertRegistrationSummaryDialogShown,
  assertAddTeamPartnerWishDialogShown,
  navigateAdminDashboard,
  assertConfirmParticipantActivationDialogShown,
  getRegistrationRows,
  navigateParticipantsList,
  getParticipantRows,
} from "../../support";
import {createRunningDinner} from "../../support/runningDinnerSetup"

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

    assertRegistrationSummaryDialogShown(() => {
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

  it('non-numeric input of numSeats lead only last numer being used', () => {

    fillPersonalFieldsInRegistrationForm("Max", "Mustermann", "Max@Mustermann.de");
    fillAddressFieldsInRegistrationForm("Musterstraße", "1", "79100", "Freiburg");
    acknowledgeDataProcessing();

    getTextInputByName("numSeats").type("2-4");

    getTextInputByName("numSeats").should("have.value", "4");

    getByTestId("registration-form-next-action").click({force: true});
    getByTestId("registration-summary-dialog").should("exist");
  });

  it("numSeats is required for registration and 0 is valid", () => {
    fillPersonalFieldsInRegistrationForm("Max", "Mustermann", "Max@Mustermann.de");

    fillAddressFieldsInRegistrationForm("Musterstraße", "1", "79100", "Freiburg");

    acknowledgeDataProcessing();

    getByTestId("registration-form-next-action").click({force: true});
    assertFormValidationToastIsShown();
    assertRegistrationSummaryDialogNotShown();

    getTextInputByName("numSeats").clear().type("0");
    getByTestId("registration-form-next-action").click({force: true});
    assertRegistrationSummaryDialogShown(() => {
      cy.contains("Du hast nicht genügend Plätze um als Gastgeber teilzunehmen, daher wird versucht dich jemandem zuzulosen der genügend Plätze hat").should("exist");
      submitStandardDialog();
    });

    assertRegistrationFinishedPage();
  });


  it('default registration without team partner wish', () => {

    fillPersonalFieldsInRegistrationForm("Max", "Mustermann", "Max@Mustermann.de");
    getByTestId("gender-male-action").click({ force: true});
    assertGenderSelected("male");

    fillAddressFieldsInRegistrationForm("Musterstraße", "1", "79100", "Freiburg");
    getTextInputByName("addressRemarks").type("Adress-Bemerkungen");
    getTextInputByName("numSeats").type("6");

    getByTestId("add-teampartner-wish-action").click({ force: true});
    assertAddTeamPartnerWishDialogShown(() => {
      // Fixed team partner registration should automatically be pre-selected in dialog
      // => Hence nothing further needs to be done here
      submitStandardDialog();
    });

    getTextInputByName("teamPartnerWishRegistrationData.firstnamePart").type("Fixed");
    getTextInputByName("teamPartnerWishRegistrationData.lastname").type("Partner");

    acknowledgeDataProcessing();

    getByTestId("registration-form-next-action").click({force: true});

    assertRegistrationSummaryDialogShown(() => {
      getByTestId("mobilenumber-missing-attention").should("exist");
      cy.contains("Max Mustermann");
      cy.contains("Musterstraße 1");
      cy.contains("79100 Freiburg");
      cy.contains("Max@Mustermann.de");
      cy.contains("Fixed Partner");
      cy.contains("Damit werdet ihr automatisch als ein Team zusammen kochen.");
      cy.contains("Du hast genügend Plätze um als Gastgeber am Event teilzunehmen").should("exist");
      submitStandardDialog();
    });

    assertRegistrationFinishedPage();

    cy.log("Manually activate team partner registration in admin area");
    navigateAdminDashboard(adminId);

    getRegistrationRows()
      .eq(0)
      .within(() => {
        cy.contains("Max@Mustermann.de");
        cy.contains("Fixed Partner");
      }
    );
    getByTestId("activate-participant-action").click(({force: true}));
    assertConfirmParticipantActivationDialogShown(() => {
      submitStandardDialog();
    });

    cy.log("Verify both participants are shown in participant list");
    navigateParticipantsList(adminId);
    getParticipantRows()
      .eq(0)
      .within(() => {
        cy.contains("Max@Mustermann.de")
      });
    getParticipantRows()
      .eq(1)
      .within(() => {
        cy.contains("Fixed Partner")
        cy.contains("Angemeldet durch Max Mustermann")
      });
  });

})
