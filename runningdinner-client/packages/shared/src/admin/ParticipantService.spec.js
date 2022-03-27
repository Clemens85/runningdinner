import { GenderAspects, newEmptyRunningDinnerBasicDetails, newExampleParticipantInstance, RunningDinner, RunningDinnerType } from "..";
import { CONSTANTS } from "../Constants";
import { newDefaultMeals } from "../wizard";
import {getParticipantsOrganizedInTeams, getWaitingListParticipantsAssignableToTeams} from "./ParticipantService";

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

// TODO Refactor this out into types package (and also newDefaultMeals!)
function newRunningDinnerWithDefaultSessionData() {
  return {
    adminId: '',
    email: '',
    runningDinnerType: RunningDinnerType.STANDARD,
    basicDetails: newEmptyRunningDinnerBasicDetails(),
    sessionData: {
      numSeatsNeededForHost: 6,
      genderAspects: [],
      genders: [],
      registrationTypes: [],
      assignableParticipantSizes: {
        minimumParticipantsNeeded: 18,
        nextParticipantsOffsetSize: 6
      }
    },
    options: {
      teamSize: 2,
      meals: newDefaultMeals(new Date()),
      forceEqualDistributedCapacityTeams: true,
      genderAspects: GenderAspects.FORCE_GENDER_MIX,
      considerShortestPaths: false,
      teamPartnerWishDisabled: false
    },
    publicSettings: null,
    contract: {}
  }  
}

function newParticipants(numberOfParticipantsToCreate) {
  const result = [];
  for (let i = 0; i < numberOfParticipantsToCreate; i++) {
    const participant = newExampleParticipantInstance();
    participant.email = `${i}@${i}.de`;
    participant.assignmentType = CONSTANTS.ASSIGNMENT_TYPE.NOT_ASSIGNABLE;
    result.push(participant);
  }
  return result;
}

it("Filters participants assigned into teams properly", () => {
  const result = getParticipantsOrganizedInTeams([assigned, assignable, notAssignable]);
  expect(result).toContain(assigned);
  expect(result).not.toContain(assignable);
  expect(result).not.toContain(notAssignable);
});

it("getWaitingListParticipantsAssignableToTeams with empty waiting list should return empty participant lists and 6 missing participants", () => {
  const participants = [];
  const result = getWaitingListParticipantsAssignableToTeams(newRunningDinnerWithDefaultSessionData(), participants);
  expect(result.numMissingParticipantsForAllAssignable).toBe(6);
  expect(result.participantsAssignable.length).toBe(0);
  expect(result.participantsRemaining.length).toBe(0);
});

it("getWaitingListParticipantsAssignableToTeams with 4 participants on waiting list should return 2 missing participants and no assignable participants", () => {
  const participants = newParticipants(4);
  const result = getWaitingListParticipantsAssignableToTeams(newRunningDinnerWithDefaultSessionData(), participants);
  expect(result.numMissingParticipantsForAllAssignable).toBe(2);
  expect(result.participantsAssignable.length).toBe(0);
  expect(result.participantsRemaining.length).toBe(4);
});


it("getWaitingListParticipantsAssignableToTeams with 6 participants on waiting list should return all 6 participants being assignable and no remaining participants", () => {
  const participants = newParticipants(6);
  const result = getWaitingListParticipantsAssignableToTeams(newRunningDinnerWithDefaultSessionData(), participants);
  expect(result.numMissingParticipantsForAllAssignable).toBe(0);
  expect(result.participantsAssignable.length).toBe(6);
  expect(result.participantsRemaining.length).toBe(0);
});

it("getWaitingListParticipantsAssignableToTeams with 8 participants on waiting list should return 6 participants being assignable and 2 remaining participants", () => {
  const participants = newParticipants(8);
  const result = getWaitingListParticipantsAssignableToTeams(newRunningDinnerWithDefaultSessionData(), participants);
  expect(result.numMissingParticipantsForAllAssignable).toBe(4);
  expect(result.participantsAssignable.length).toBe(6);
  expect(result.participantsRemaining.length).toBe(2);
});

it("getWaitingListParticipantsAssignableToTeams with 13 participants on waiting list should return 12 participants being assignable and 1 remaining participant", () => {
  const participants = newParticipants(13);
  const result = getWaitingListParticipantsAssignableToTeams(newRunningDinnerWithDefaultSessionData(), participants);
  expect(result.numMissingParticipantsForAllAssignable).toBe(5);
  expect(result.participantsAssignable.length).toBe(12);
  expect(result.participantsRemaining.length).toBe(1);
  expect(result.participantsRemaining[0].email).toBe("12@12.de"); // The 13th participant (0-index based)
});

