import React from 'react'
import {Hidden, TableCell, TableRow, Tooltip} from "@material-ui/core";
import ParticipantGenderIcon from "../../../common/gender/ParticipantGenderIcon";
import ParticipantGenderTooltip from "../../../common/gender/ParticipantGenderTooltip";
import NumSeats from "./NumSeats";
import useCommonStyles from "../../../common/theme/CommonStyles";
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import {
  AddressLocation,
  Fullname, getFullname,
  isStringNotEmpty,
  isTeamPartnerWishChild,
  ParticipantListable,
  RunningDinnerSessionData,
  TeamPartnerWishState
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";


export type ParticipantClickCallback = {
  onClick: (participant: ParticipantListable) => unknown;
};

type ParticipantRowProps = {
  participant: ParticipantListable;
  selected: boolean;
  runningDinnerSessionData: RunningDinnerSessionData;
};

export default function ParticipantRow({participant, selected, onClick, runningDinnerSessionData}: ParticipantRowProps & ParticipantClickCallback) {

  const classes = useCommonStyles();

  const {listNumber} = participant;

  return (
      <TableRow hover className={classes.cursorPointer} onClick={() => onClick(participant)} selected={selected} data-testid="participant-row">
        <TableCell data-testid={"participant-number"}>{listNumber}</TableCell>
        <TableCell><Fullname {...participant} /></TableCell>
        <ParticipantDetailCells participant={participant} selected={selected} runningDinnerSessionData={runningDinnerSessionData} />
      </TableRow>
  );
}

function ParticipantDetailCells({participant, runningDinnerSessionData}: ParticipantRowProps) {

  const {t} = useTranslation("admin");

  const teamPartnerWishChild = isTeamPartnerWishChild(participant);
  const showTeamPartnerInfo = isStringNotEmpty(participant.teamPartnerWishEmail) || isStringNotEmpty(participant.teamPartnerWishOriginatorId);

  const {gender} = participant;
  const {email} = participant;

  return (
    <Hidden xsDown>
      { teamPartnerWishChild &&
        <>
          <TableCell colSpan={4}>
            {t("admin:team_partner_wish_registration_child_participant_root_info_1", { fullname: getFullname(participant.rootTeamPartnerWish!) })}
          </TableCell>
          <TableCell><ParticipantTeamPartnerWishIcon {...participant} /></TableCell>
        </>
      }
      { !teamPartnerWishChild &&
        <>
          <TableCell>
            <ParticipantGenderTooltip gender={gender}>
              <ParticipantGenderIcon gender={gender} />
            </ParticipantGenderTooltip>
          </TableCell>
          <TableCell>{email}</TableCell>
          <TableCell><AddressLocation {...participant} /></TableCell>
          <TableCell><NumSeats participant={participant} runningDinnerSessionData={runningDinnerSessionData} /></TableCell>
          { showTeamPartnerInfo && <TableCell><ParticipantTeamPartnerWishIcon {...participant} /></TableCell> }
          { !showTeamPartnerInfo && <TableCell></TableCell> }
        </>
      }
    </Hidden>
  );
}

function ParticipantTeamPartnerWishIcon({teamPartnerWishOriginatorId, teamPartnerWishEmail, teamPartnerWishStateEmailInvitation}: ParticipantListable) {

  let iconColor: 'primary' | 'secondary' = "primary";
  let tooltipLabel;

  const {t} = useTranslation("admin");

  if (isStringNotEmpty(teamPartnerWishOriginatorId)) {
    tooltipLabel = t("admin:team_partner_wish_registration_fulfilled");
  } else if (isStringNotEmpty(teamPartnerWishEmail)) {
    if (teamPartnerWishStateEmailInvitation !== TeamPartnerWishState.EXISTS_SAME_TEAM_PARTNER_WISH) {
      iconColor = "secondary";
      tooltipLabel = t("admin:team_partner_wish_invitation_not_found");
    } else {
      tooltipLabel = t("admin:team_partner_wish_invitation_found");
    }
  } else {
    // Should never reach here
    return null;
  }

  return (
    <Tooltip title={tooltipLabel} aria-label={tooltipLabel} placement="top-end">
      <FavoriteBorderIcon color={iconColor} />
    </Tooltip>
  );
}
