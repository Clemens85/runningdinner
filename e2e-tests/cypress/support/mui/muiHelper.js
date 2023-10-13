import {getByTestId} from "../index";

export function getTextInputByName(inputFieldName, optionalOptions) {
  const options = optionalOptions ? optionalOptions : {};
  const inputSelector = `input[name="${inputFieldName}"]`;
  return cy.get(`${inputSelector}:not(.hidden ${inputSelector})`, options);
}

export function getLabelOfMuiTextInput(inputField) {
  return inputField
    .parents('.MuiTextField-root')
    .first()
    .find("label")
}

export function assertMuiCheckboxByTestId(dataTestId, selected) {
  return assertMuiCheckboxSelected(getByTestId(dataTestId), selected);
}

export function assertMuiCheckboxSelected(checkboxElement, selected) {
  const assertionPrefix = selected ? "" : "not.";
  return checkboxElement
          .should(`${assertionPrefix}have.class`, "Mui-checked");
}

export function selectHourInTimePicker(hourToSelect) {
  cy.get(".MuiMultiSectionDigitalClock-root")
    .find(".MuiMenuItem-root")
    .filter(`:contains("${hourToSelect}")`)
    // .trigger("mousedown", { button: 0, force: true });
    .click({force: true});
    // .click({ force: true});
}

export function applyTimePickerSelection() {
  return cy.get(".MuiPickersLayout-actionBar")
           .find("button")
           .filter(`:contains("OK")`)
           .click({force: true});
}

export function assertToastIsShown(toastText) {
  cy.contains(toastText);
}

export function assertFormValidationToastIsShown() {
  assertToastIsShown("Ein paar Eingaben sind noch nicht ganz korrekt, bitte prüfe die Einträge in den rot markierten Feldern");
}