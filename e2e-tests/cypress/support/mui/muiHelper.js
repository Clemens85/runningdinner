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

export function selectHourInTimePicker(hourToSelect) {
  cy.get(".MuiPickersModal-dialogRoot")
    .find(".MuiPickersClockNumber-clockNumber")
    .filter(`:contains("${hourToSelect}")`)
    // .trigger("mousedown", { button: 0, force: true });
    .click({force: true})
    .click({ force: true});
}

export function applyTimePickerSelection() {
  return cy.get(".MuiPickersModal-dialogRoot")
           .find(".MuiButton-label")
           .filter(`:contains("OK")`)
           .click({force: true});
}
