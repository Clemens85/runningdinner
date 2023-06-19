import {newEmptyParticipantInstance, saveParticipantAsync, sendTeamPartnerWishInvitationAsync} from "@runningdinner/shared";

export const CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION = "CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION";
export const UPDATE_PARTICIPANT_TEAM_PARTNER_WISH_ACTION = "UPDATE_PARTICIPANT_TEAM_PARTNER_WISH_ACTION";
export const SEND_INVITATION_TEAM_PARTNER_WISH_ACTION = "SEND_INVITATION_TEAM_PARTNER_WISH_ACTION";
export const NO_TEAM_PARTNER_WISH_ACTION = "NO_TEAM_PARTNER_WISH_ACTION";

const newParticipantTeamPartnerWishAction = (fromParticipant) => {
  return {
    type: CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION,
    fromParticipant: fromParticipant
  }
};

const sendInvitationTeamPartnerWishAction = (fromParticipant) => {
  return {
    type: SEND_INVITATION_TEAM_PARTNER_WISH_ACTION,
    fromParticipant: fromParticipant
  }
};

const updateMatchingParticipantTeamPartnerWishAction = (fromParticipant, matchingParticipant) => {
  return {
    type: UPDATE_PARTICIPANT_TEAM_PARTNER_WISH_ACTION,
    fromParticipant: fromParticipant,
    matchingParticipant: matchingParticipant
  }
};

const noTeamPartnerWishAction = () => {
  return {
    type: NO_TEAM_PARTNER_WISH_ACTION
  }
};

const handleTeamPartnerWishAction = async (adminId, teamPartnerWishAction) => {

  const {fromParticipant} = teamPartnerWishAction;

  let resultPayload = {};

  const {type} = teamPartnerWishAction;
  switch (type) {
    case CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION:
      resultPayload = newEmptyParticipantInstance();
      resultPayload = { ...resultPayload,
                        email: fromParticipant.teamPartnerWishEmail,
                        teamPartnerWishEmail: fromParticipant.email };
      break;
    case SEND_INVITATION_TEAM_PARTNER_WISH_ACTION:
      resultPayload = await sendTeamPartnerWishInvitationAsync(adminId, fromParticipant);
      break;
    case UPDATE_PARTICIPANT_TEAM_PARTNER_WISH_ACTION:
      const {matchingParticipant} = teamPartnerWishAction;
      matchingParticipant.teamPartnerWishEmail = fromParticipant.email;
      resultPayload = await saveParticipantAsync(adminId, matchingParticipant);
      break;
    default:
      return {...teamPartnerWishAction};
  }

  return { ...teamPartnerWishAction, resultPayload};

};

export {
  newParticipantTeamPartnerWishAction,
  sendInvitationTeamPartnerWishAction,
  updateMatchingParticipantTeamPartnerWishAction,
  noTeamPartnerWishAction,
  handleTeamPartnerWishAction
};
