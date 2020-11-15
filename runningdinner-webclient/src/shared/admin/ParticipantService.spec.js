import ParticipantService from "./ParticipantService";

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

it("Filters participants assigned into teams properly", () => {

  const result = ParticipantService.getParticipantsOrganizedInTeams([assigned, assignable, notAssignable]);
  expect(result).toContain(assigned);
  expect(result).not.toContain(assignable);
  expect(result).not.toContain(notAssignable);
});
