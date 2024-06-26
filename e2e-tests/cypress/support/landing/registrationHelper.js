import {getTextInputByName} from "../mui/muiHelper";
import {RUNNING_DINNER_ADMIN_EMAIL} from "../runningDinnerSetup";
import {getByTestId} from "../index";

export function fillPersonalFieldsInRegistrationForm(firstname, lastname, email) {
  getTextInputByName("firstnamePart").type(firstname);
  getTextInputByName("lastname").type(lastname);
  getTextInputByName("email").type(email);
}

export function fillAddressFieldsInRegistrationForm(street, streetNr, zip, cityName) {
  getTextInputByName("street").type(street);
  getTextInputByName("streetNr").type(streetNr);
  getTextInputByName("zip").type(zip);
  getTextInputByName("cityName").type(cityName);
}

export function assertRegistrationFinishedPage() {
  cy.contains("Anmeldung abgeschlossen");
  cy.contains("Herzlichen Glückwunsch");
  cy.contains(RUNNING_DINNER_ADMIN_EMAIL);
}

export function acknowledgeDataProcessing() {
  getByTestId("dataProcessingAcknowledged").click({ force: true});
}

export function assertRegistrationSummaryDialogNotShown() {
  getByTestId("registration-summary-dialog").should("not.exist");
}

export function assertRegistrationSummaryDialogShown(funcToExecute) {
  return getByTestId("registration-summary-dialog").within(funcToExecute);
}

export function assertAddTeamPartnerWishDialogShown(funcToExecute) {
  return getByTestId("add-teampartner-wish-dialog").within(funcToExecute);
}
