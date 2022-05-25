/// <reference types="cypress" />

import {
  assertDashboardAdminActivityContains,
  assertEditMealTimesDialogIsClosed,
  assertMealsExistInDashboardWithTimes,
  assertToastIsShown,
  getMealTimeControlInputByMealLabel,
  navigateAdminDashboard,
  openEditMealTimesDialogAndExecuteInDialog,
  submitStandardDialog,
} from "../../support";
import { createRunningDinner } from "../../support/runningDinnerSetup"

describe('participants list', () => {

  let runningDinner, adminId;

  beforeEach(() => {
    createRunningDinner({
      date: new Date(),
      numParticipantsToCreate: 18
    }).then(createRunningDinnerResponse => {
      runningDinner = createRunningDinnerResponse.runningDinner;
      adminId = runningDinner.adminId;
    });
  })

  it('shows meals on dashboard and update of meal times work', () => {
    navigateAdminDashboard(adminId);

    assertMealsExistInDashboardWithTimes(["Vorspeise", "Hauptgericht", "Dessert"],
                                        ["19:00 Uhr", "21:00 Uhr", "23:00 Uhr"]);

    openEditMealTimesDialogAndExecuteInDialog(() => {
      getMealTimeControlInputByMealLabel("Hauptgericht")
        .should("have.value", "21:00")
        .clear()
        .type("21:30");

      submitStandardDialog();
    });

    assertToastIsShown("Zeitplan erfolgreich gespeichert!");
    assertEditMealTimesDialogIsClosed();

    assertMealsExistInDashboardWithTimes(["Vorspeise", "Hauptgericht", "Dessert"],
                                         ["19:00 Uhr", "21:30 Uhr", "23:00 Uhr"]);

    assertDashboardAdminActivityContains(0, "Du hast die Uhrzeiten für die einzelnen Speisen geändert");
  });

})
