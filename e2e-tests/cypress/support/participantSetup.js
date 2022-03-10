export function createParticipants(adminId, startNumber, endNumber, participantOverrides) {
  return new Cypress.Promise((resolve) => {
    let passes = 0;
    for (let i = startNumber; i <= endNumber; i++) {
      const participantJson = newParticipantJson(i, participantOverrides);
      cy.log(`Create participant number ${i} in dinner ${adminId}`);
      executeCreateParticipant(adminId, participantJson).then(response => {
        if (response.status === 200 || response.status === 201)  {
          passes++;
        }
      });
    }
    cy.then(() => {
      cy.log(`Awaited all participants being created`);
      expect(passes).to.eq(endNumber - startNumber + 1);
      resolve();
    });
  });

}

function executeCreateParticipant(adminId, participantJson) {
  return cy.request({
    method: "POST",
    url:  `/rest/participantservice/v1/runningdinner/${adminId}/participant`,
    body: participantJson
  });
}

export function newParticipantJson(participantNumber, participantOverrides) {
  let result = {
    "firstnamePart": `Firstname${participantNumber}`,
    "lastname": `Lastname${participantNumber}`,
    "email": `firstname${participantNumber}@lastname${participantNumber}.de`,
    "mobileNumber": "",
    "gender": "MALE",
    "age": 25,
    "street": "Musterstraße",
    "streetNr": "1",
    "zip": "79100",
    "cityName": "Freiburg",
    "numSeats": "6",
    "addressRemarks": "",
    "vegetarian": true,
    "lactose": false,
    "gluten": false,
    "vegan": false,
    "mealSpecificsNote": "",
    "teamPartnerWish": "foo@bar.de",
    "notes": ""
  };
  if (participantOverrides) {
    result = { ...result, ...participantOverrides };
  }
  return result;
}