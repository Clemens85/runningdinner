import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Grid, Tooltip } from '@mui/material';
import { getTeamPartnerOptionOfTeam, hasAllTeamMembersSameTeamPartnerWish, Team } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

export type TeamPartnerWishIconProps = {
  team: Team;
  showLabelAsTooltip: boolean;
  mt?: number;
};

export function TeamPartnerWishIcon({ team, showLabelAsTooltip, mt }: TeamPartnerWishIconProps) {
  const { t } = useTranslation('admin');

  const teamPartnerOption = getTeamPartnerOptionOfTeam(team);
  const hasSameTeamPartnerWish = hasAllTeamMembersSameTeamPartnerWish(team, teamPartnerOption);

  if (!hasSameTeamPartnerWish) {
    return null;
  }
  const label = t('admin:team_partner_wish_fulfilled');

  if (showLabelAsTooltip) {
    return (
      <Tooltip title={label} aria-label={label} placement="top-end">
        <FavoriteBorderIcon color={'primary'} />
      </Tooltip>
    );
  } else {
    return (
      <>
        <Grid container alignItems={'center'} sx={{ mt: mt }}>
          <Grid>
            <FavoriteBorderIcon color={'primary'} />
          </Grid>
          <Grid sx={{ pl: 1 }}>{label}</Grid>
        </Grid>
      </>
    );
  }
}
