import React from 'react'
import {Hidden, TableCell, Tooltip, useMediaQuery, useTheme} from "@mui/material";
import ParticipantGenderIcon from "../../../common/gender/ParticipantGenderIcon";
import ParticipantGenderTooltip from "../../../common/gender/ParticipantGenderTooltip";
import NumSeats from "./NumSeats";
import useCommonStyles, {TableRowWithCursor} from "../../../common/theme/CommonStyles";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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
import {Span} from "../../../common/theme/typography/Tags";


export type ParticipantClickCallback = {
  onClick: (participant: ParticipantListable) => unknown;
};

type ParticipantRowProps = {
  participant: ParticipantListable;
  selected: boolean;
  showMiscNotes: boolean;
  runningDinnerSessionData: RunningDinnerSessionData;
};

export default function ParticipantRow({participant, selected, onClick, showMiscNotes, runningDinnerSessionData}: ParticipantRowProps & ParticipantClickCallback) {

  const classes = useCommonStyles();

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'));

  const {listNumber} = participant;

  const showMiscNotesForParticipant = showMiscNotes && isStringNotEmpty(participant.notes);
  const tableCellClass = showMiscNotesForParticipant ? classes.bottomBorderNone : "";
  const cellsToShow = isSmallDevice ? 2 : 7;

  return (
      <>
        <TableRowWithCursor hover onClick={() => onClick(participant)} selected={selected} data-testid="participant-row">
            <TableCell className={tableCellClass} data-testid={"participant-number"}>{listNumber}</TableCell>
            <TableCell className={tableCellClass}><Fullname {...participant} /></TableCell>
            <ParticipantDetailCells participant={participant} selected={selected} runningDinnerSessionData={runningDinnerSessionData} showMiscNotes={showMiscNotes} />
        </TableRowWithCursor>
        { showMiscNotesForParticipant &&
          <TableRowWithCursor hover onClick={() => onClick(participant)} selected={selected}>
            <TableCell colSpan={cellsToShow} sx={{ pt: 0 }}><cite><Span>{participant.notes}</Span></cite></TableCell>
          </TableRowWithCursor>
        }
      </>
  );
}

function ParticipantDetailCells({participant, runningDinnerSessionData, showMiscNotes}: ParticipantRowProps) {

  const {t} = useTranslation("admin");

  const teamPartnerWishChild = isTeamPartnerWishChild(participant);
  const showTeamPartnerInfo = isStringNotEmpty(participant.teamPartnerWishEmail) || isStringNotEmpty(participant.teamPartnerWishOriginatorId);

  const {gender} = participant;
  const {email} = participant;

  const classes = useCommonStyles();

  const showMiscNotesForParticipant = showMiscNotes && isStringNotEmpty(participant.notes);
  const tableCellClass = showMiscNotesForParticipant ? classes.bottomBorderNone : "";

  return (
    <Hidden smDown>
      { teamPartnerWishChild &&
        <>
          <TableCell colSpan={4} className={tableCellClass}>
            {t("admin:team_partner_wish_registration_child_participant_root_info_1", { fullname: getFullname(participant.rootTeamPartnerWish!) })}
          </TableCell>
          <TableCell className={tableCellClass}><ParticipantTeamPartnerWishIcon {...participant} /></TableCell>
        </>
      }
      { !teamPartnerWishChild &&
        <>
          <TableCell className={tableCellClass}>
            <ParticipantGenderTooltip gender={gender}>
              <ParticipantGenderIcon gender={gender} />
            </ParticipantGenderTooltip>
          </TableCell>
          <TableCell className={tableCellClass}>{email}</TableCell>
          <TableCell className={tableCellClass}><AddressLocation {...participant} /></TableCell>
          <TableCell className={tableCellClass} ><NumSeats participant={participant} runningDinnerSessionData={runningDinnerSessionData} /></TableCell>
          { showTeamPartnerInfo && <TableCell className={tableCellClass}><ParticipantTeamPartnerWishIcon {...participant} /></TableCell> }
          { !showTeamPartnerInfo && <TableCell className={tableCellClass}></TableCell> }
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
