import { useQuery } from '@tanstack/react-query';

import { assertDefined, isQuerySucceeded } from '../..';
import { isAfterInDays } from '../../date';
import { ParticipantList, ParticipantRegistrationInfo, RunningDinner } from '../../types';
import { findParticipantRegistrationsByAdminIdAsync, findParticipantsAsync } from '../ParticipantService';
import { isClosedDinner } from '../RunningDinnerService';

export interface TeamsNotExistingInfo {
  numParticipants: number;
  numAssignableParticipants: number;
  numNotAssignableParticipants: number;
  registrationStillRunning: boolean;
  numExpectedTeams: number;
  endOfRegistrationDate?: Date;
  warnTeamsCanBeCreatedButRegistrationStillRunning?: boolean;
  infoTeamCreationNotPossibleAndRegistrationStillRunning?: boolean;
  notActivatedParticipants?: ParticipantRegistrationInfo[];
}

async function findParticipantsAndRegistrationsAsync(adminId: string) {
  const findParticipantsResponse = findParticipantsAsync(adminId);
  const findParticipantRegistrationsResponse = findParticipantRegistrationsByAdminIdAsync(adminId, 0);
  const participantList = await findParticipantsResponse;
  const participantRegistrationInfoList = await findParticipantRegistrationsResponse;
  const notActivatedParticipants = participantRegistrationInfoList.registrations.filter((r) => !r.activationDate);
  return {
    activatedParticipantList: participantList,
    notActivatedParticipants,
  };
}

export function useTeamsNotExisting(runningDinner: RunningDinner) {
  const { adminId } = runningDinner;

  const findParticipantsAndRegistrationsQuery = useQuery({
    queryKey: ['findParticipantsAndRegistrations', adminId],
    queryFn: () => findParticipantsAndRegistrationsAsync(adminId),
  });

  let teamsNotExistingInfo: TeamsNotExistingInfo | null = null;
  if (isQuerySucceeded(findParticipantsAndRegistrationsQuery)) {
    assertDefined(findParticipantsAndRegistrationsQuery.data);
    teamsNotExistingInfo = calculateTeamsNotExistingInfo(
      findParticipantsAndRegistrationsQuery.data.activatedParticipantList,
      findParticipantsAndRegistrationsQuery.data.notActivatedParticipants,
    );
  }

  function calculateTeamsNotExistingInfo(participantList: ParticipantList, notActivatedParticipants: ParticipantRegistrationInfo[]): TeamsNotExistingInfo {
    let numAssignableParticipants;
    let numNotAssignableParticipants;

    const { numParticipantsTotal } = participantList;
    const { missingParticipantsInfo } = participantList;

    if (missingParticipantsInfo.numParticipantsMissing > 0) {
      numNotAssignableParticipants = numParticipantsTotal;
      numAssignableParticipants = 0;
    } else {
      numNotAssignableParticipants = participantList.participantsWaitingList.length;
      numAssignableParticipants = participantList.participants.length;
    }

    const result: TeamsNotExistingInfo = {
      numParticipants: numParticipantsTotal,
      numAssignableParticipants,
      numNotAssignableParticipants,
      registrationStillRunning: false,
      numExpectedTeams: numAssignableParticipants / runningDinner.options.teamSize,
    };

    if (!isClosedDinner(runningDinner) && runningDinner.publicSettings.endOfRegistrationDate) {
      result.endOfRegistrationDate = runningDinner.publicSettings.endOfRegistrationDate;
      result.registrationStillRunning = !isAfterInDays(new Date(), result.endOfRegistrationDate);
      if (result.registrationStillRunning) {
        if (result.numExpectedTeams > 0) {
          result.warnTeamsCanBeCreatedButRegistrationStillRunning = true;
        } else {
          result.infoTeamCreationNotPossibleAndRegistrationStillRunning = true;
        }
      }
      result.notActivatedParticipants = notActivatedParticipants;
    }

    return result;
  }

  return {
    teamsNotExistingInfo,
    loading: findParticipantsAndRegistrationsQuery.isFetching,
    error: findParticipantsAndRegistrationsQuery.error,
  };
}
