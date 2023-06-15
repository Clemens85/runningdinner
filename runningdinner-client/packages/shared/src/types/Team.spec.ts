import {hasAllTeamMembersSameTeamPartnerWish, Team, TeamStatus} from "./Team"
import {Participant, TeamPartnerOption} from "./Participant";

it("hasAllTeamMembersSameTeamPartnerWish for team partner wish emails", () => {

  const p1 = newParticipant("max@muster.de", "maria@muster.de");
  const p2 = newParticipant( "Maria@muster.de", "max@muster.de");

  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.NONE)).toBe(false);
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.REGISTRATION)).toBe(false);

  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.INVITATION)).toBe(true);
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p2, p1]), TeamPartnerOption.INVITATION)).toBe(true);

  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([]), TeamPartnerOption.INVITATION)).toBe(false);
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1]), TeamPartnerOption.INVITATION)).toBe(false);

  p1.email = "foo@bar.de";
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.INVITATION)).toBe(false);
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p2, p1]), TeamPartnerOption.INVITATION)).toBe(false);
});

it("hasAllTeamMembersSameTeamPartnerWish for team partner wish registrations", () => {

  const p1 = newParticipant("max@muster.de", "", "X");
  const p2 = newParticipant( "maria@muster.de", "", "X");

  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.NONE)).toBe(false);
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.INVITATION)).toBe(false);

  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.REGISTRATION)).toBe(true);
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p2, p1]), TeamPartnerOption.REGISTRATION)).toBe(true);

  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([]), TeamPartnerOption.REGISTRATION)).toBe(false);
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1]), TeamPartnerOption.REGISTRATION)).toBe(false);

  p1.teamPartnerWishOriginatorId = "Y";
  expect(hasAllTeamMembersSameTeamPartnerWish(newTeam([p1, p2]), TeamPartnerOption.INVITATION)).toBe(false);
});

function newTeam(teamMembers: Participant[]) {
  const team: Team = {
    teamMembers,
    teamNumber: 1,
    status: TeamStatus.OK,
    hostTeamMember: teamMembers[0],
    meal: {
      time: new Date(),
      label: "Dessert"
    }
  };
  return team;
}

function newParticipant(email: string, teamPartnerWishEmail: string, teamPartnerWishOriginatorId?: string) {
  const result: Participant = {
    addressRemarks: "",
    age: 0,
    cityName: "",
    email,
    firstnamePart: "",
    gender: "",
    gluten: false,
    lactose: false,
    lastname: "",
    mealSpecificsNote: "",
    mobileNumber: "",
    notes: "",
    numSeats: 0,
    street: "",
    streetNr: "",
    vegan: false,
    vegetarian: false,
    zip: "",
    teamPartnerWishEmail,
    teamPartnerWishOriginatorId
  };
  return result;
}