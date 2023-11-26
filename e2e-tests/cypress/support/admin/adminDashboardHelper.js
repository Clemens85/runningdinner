import {getByTestId} from "../index";

export function assertMealsExistInDashboardWithTimes(expectedMealLabels, expectedMealTimes) {
  cy.log(`Asserting that dashboard displays ${expectedMealLabels.length} meals with ${expectedMealTimes.length} times`);
  getByTestId("meal-item").should("have.length", expectedMealLabels.length);
  for (let i = 0; i < expectedMealLabels.length; i++) {
    assertMealItemContainsData(i, expectedMealLabels[i], expectedMealTimes[i]);
  }
}

export function openEditMealTimesDialogAndExecuteInDialog(funcToExecute) {
  getByTestId("open-edit-meals-action").click();
  getByTestId("edit-meals-dialog").within(funcToExecute);
}

export function assertEditMealTimesDialogIsClosed() {
  getByTestId("edit-meals-dialog").should("not.exist");
}

export function assertDashboardAdminActivityContains(index, expectedActivityContent) {
  getByTestId("admin-activity-container")
    .eq(index)
    .contains(expectedActivityContent);
}

function assertMealItemContainsData(mealItemIndex, expectedLabel, expectedTime) {
  cy.log(`Expect that meal item with index ${mealItemIndex} contains ${expectedLabel} with time ${expectedTime}`);
  return getMealItemByIndex(mealItemIndex)
        .parent()
        .should("contain", expectedLabel)
        .should("contain", expectedTime);
}

function getMealItemByIndex(index) {
  return getByTestId("meal-item").eq(index);
}

export function assertConfirmParticipantActivationDialogShown(funcToExecute) {
  return getByTestId("confirm-participant-activation-dialog").within(funcToExecute);
}

export function getRegistrationRows() {
  return getByTestId("registration-row");
}
