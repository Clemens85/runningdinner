import {useTranslation} from "react-i18next";
import {getTeamPartnerOptionOfTeam, hasAllTeamMembersSameTeamPartnerWish, Team} from "@runningdinner/shared";
import {Tooltip} from "@material-ui/core";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import React from "react";
import { SpacingGrid } from "../../common/theme/SpacingGrid";

export type TeamPartnerWishIconProps = {
  team: Team;
  showLabelAsTooltip: boolean;
  mt?: number;
}

export function TeamPartnerWishIcon({team, showLabelAsTooltip, mt}: TeamPartnerWishIconProps) {

  const {t} = useTranslation("admin");

  const teamPartnerOption = getTeamPartnerOptionOfTeam(team);
  const hasSameTeamPartnerWish = hasAllTeamMembersSameTeamPartnerWish(team, teamPartnerOption);

  if (!hasSameTeamPartnerWish) {
    return null;
  }
  const label = t("admin:team_partner_wish_fulfilled");

  if (showLabelAsTooltip) {
    return (
      <Tooltip title={label} aria-label={label} placement="top-end">
        <FavoriteBorderIcon color={"primary"} />
      </Tooltip>
    );
  } else {
    return (
      <>
        <SpacingGrid container alignItems={"center"} mt={mt}>
          <SpacingGrid item><FavoriteBorderIcon color={"primary"} /></SpacingGrid>
          <SpacingGrid item pl={1}>{label}</SpacingGrid>
        </SpacingGrid>
      </>
    );
  }

}
