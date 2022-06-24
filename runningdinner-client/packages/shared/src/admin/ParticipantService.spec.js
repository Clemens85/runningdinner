import {getParticipantsOrganizedInTeams} from "./ParticipantService";

const assigned = {
  id: 'x',
  assignmentType: 'ASSIGNED_TO_TEAM'
};
const assignable = {
  id: 'y',
  assignmentType: 'ASSIGNABLE'
};
const notAssignable = {
  id: 'z',
  assignmentType: 'NOT_ASSIGNABLE'
};

// Refactor this out into types package (and also newDefaultMeals!)
// function newRunningDinnerWithDefaultSessionData() {
//   return {
//     adminId: '',
//     email: '',
//     runningDinnerType: RunningDinnerType.STANDARD,
//     basicDetails: newEmptyRunningDinnerBasicDetails(),
//     sessionData: {
//       numSeatsNeededForHost: 6,
//       genderAspects: [],
//       genders: [],
//       registrationTypes: [],
//       assignableParticipantSizes: {
//         minimumParticipantsNeeded: 18,
//         nextParticipantsOffsetSize: 6
//       }
//     },
//     options: {
//       teamSize: 2,
//       meals: newDefaultMeals(new Date()),
//       forceEqualDistributedCapacityTeams: true,
//       genderAspects: GenderAspects.FORCE_GENDER_MIX,
//       considerShortestPaths: false,
//       teamPartnerWishDisabled: false
//     },
//     publicSettings: null,
//     contract: {}
//   }
// }

// function newParticipants(numberOfParticipantsToCreate) {
//   const result = [];
//   for (let i = 0; i < numberOfParticipantsToCreate; i++) {
//     const participant = newExampleParticipantInstance();
//     participant.email = `${i}@${i}.de`;
//     participant.assignmentType = CONSTANTS.ASSIGNMENT_TYPE.NOT_ASSIGNABLE;
//     result.push(participant);
//   }
//   return result;
// }

it("Filters participants assigned into teams properly", () => {
  const result = getParticipantsOrganizedInTeams([assigned, assignable, notAssignable]);
  expect(result).toContain(assigned);
  expect(result).not.toContain(assignable);
  expect(result).not.toContain(notAssignable);
});

