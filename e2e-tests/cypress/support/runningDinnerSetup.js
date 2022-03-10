import { createParticipants } from "./participantSetup";
import { toLocalDateArr } from "./util";

/**
 * @param {date, registrationType, numParticipantsToCreate} createRunningDinnerSettings 
 * @returns 
 */
export function createRunningDinner(createRunningDinnerSettings) {

  const registrationType = createRunningDinnerSettings.registrationType || "OPEN";
  const date = toLocalDateArr(createRunningDinnerSettings.date);
  const numParticipantsToCreate = createRunningDinnerSettings.numParticipantsToCreate;

  return new Cypress.Promise((resolve) => {
    cy.log(`Create running dinner event with settings ${JSON.stringify(createRunningDinnerSettings)}`);
    cy.fixture("create-dinner")
      .then(runningDinnerJson => {
        runningDinnerJson.basicDetails.date = date;
        runningDinnerJson.basicDetails.registrationType = registrationType;
        if (runningDinnerJson.basicDetails.registrationType === "CLOSED") {
          runningDinnerJson.publicSettings = null;
        }
        applyDinnerDateToMeals(runningDinnerJson);
        executeCreateRunningDinnerRequest(runningDinnerJson).then((response) => {
          const runningDinnerResponse = response.body;
          cy.log(`Created running dinner ${JSON.stringify(runningDinnerResponse)}`);
          if (numParticipantsToCreate >= 1) {
            createParticipants(runningDinnerResponse.runningDinner.adminId, 1, numParticipantsToCreate).then(() => {
              resolve(runningDinnerResponse);
            });
          } else {
            resolve(runningDinnerResponse);
          }
        });
      });
  });
}

function executeCreateRunningDinnerRequest(runningDinnerJson) {
  return cy.request({
    method: "POST",
    url:  "rest/wizardservice/v1/create",
    body: runningDinnerJson
  });
}

function applyDinnerDateToMeals(runningDinnerJson) {
  const dinnerDateAsArr = runningDinnerJson.basicDetails.date;
  for (let i = 0; i < runningDinnerJson.options.meals.length; i++) {
    const meal = runningDinnerJson.options.meals[i];
    meal.time = dinnerDateAsArr.concat(meal.time.slice(3));
  }
}