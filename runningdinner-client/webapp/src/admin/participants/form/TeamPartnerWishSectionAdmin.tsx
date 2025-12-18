import { Box, Grid } from '@mui/material';
import { BaseAdminIdProps, getFullname, isStringEmpty, ParticipantListable } from '@runningdinner/shared';
import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormFieldset from '../../../common/theme/FormFieldset';
import LinkExtern from '../../../common/theme/LinkExtern';
import { Span } from '../../../common/theme/typography/Tags';
import { useAdminNavigation } from '../../AdminNavigationHook';
import { TeamPartnerWishFormInput } from './TeamPartnerWishFormInput';

export type TeamPartnerWishSectionAdminProps = {
  childTeamPartnerWish?: ParticipantListable;
  rootTeamPartnerWish?: ParticipantListable;
  teamPartnerWishOriginatorId?: string;
} & BaseAdminIdProps;

export function TeamPartnerWishSectionAdmin(props: TeamPartnerWishSectionAdminProps) {
  const { rootTeamPartnerWish, childTeamPartnerWish, teamPartnerWishOriginatorId } = props;

  if (isStringEmpty(teamPartnerWishOriginatorId)) {
    return <TeamPartnerWishEmailInvitationFormInput />;
  } else if (rootTeamPartnerWish) {
    return <RootTeamPartnerWishInfo {...props} />;
  } else if (childTeamPartnerWish) {
    return <ChildTeamPartnerWishInfo {...props} />;
  }
  return null;
}

function TeamPartnerWishEmailInvitationFormInput() {
  const { t } = useTranslation('common');

  return (
    <Box mt={3}>
      <FormFieldset>{t('common:teampartner_wish_headline')}</FormFieldset>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 12,
          }}
        >
          <TeamPartnerWishFormInput teamPartnerWishHelperText={t('admin:team_partner_wish_help')} />
        </Grid>
      </Grid>
    </Box>
  );
}

function ChildTeamPartnerWishInfo({ childTeamPartnerWish, adminId }: TeamPartnerWishSectionAdminProps) {
  const { t } = useTranslation(['admin', 'common']);

  const { generateParticipantPath } = useAdminNavigation();
  const childParticipantUrl = `${generateParticipantPath(adminId, childTeamPartnerWish?.id || '')}?t=${Date.now().toString()}`;

  const { watch } = useFormContext();
  const firstnamePart = watch('firstnamePart');
  const lastname = watch('lastname');

  return (
    <Box mt={3}>
      <FormFieldset>{t('common:teampartner_wish_headline')}</FormFieldset>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Span>
            <Trans
              i18nKey={'admin:team_partner_wish_registration_child_participant_child_info_1'}
              values={{ fullname: getFullname(childTeamPartnerWish!) }}
              // @ts-ignore
              components={{ anchor: <LinkExtern href={childParticipantUrl} self={true} /> }}
            />
          </Span>
          <Span>{t('admin:team_partner_wish_registration_child_participant_child_info_2', { fullname: getFullname({ firstnamePart, lastname }) })}</Span>
        </Grid>
      </Grid>
    </Box>
  );
}

function RootTeamPartnerWishInfo({ rootTeamPartnerWish, teamPartnerWishOriginatorId, adminId }: TeamPartnerWishSectionAdminProps) {
  const { t } = useTranslation(['admin', 'common']);

  const { generateParticipantPath } = useAdminNavigation();
  const rootParticipantId = teamPartnerWishOriginatorId || '';
  const rootParticipantUrl = `${generateParticipantPath(adminId, rootParticipantId)}?t=${Date.now().toString()}`;

  return (
    <Box mt={3}>
      <FormFieldset>{t('common:teampartner_wish_headline')}</FormFieldset>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Span>{t('admin:team_partner_wish_registration_child_participant_root_info_1', { fullname: getFullname(rootTeamPartnerWish!) })}</Span>
          <Span>
            <Trans
              i18nKey={'admin:team_partner_wish_registration_child_participant_root_info_2'}
              values={{ fullname: getFullname(rootTeamPartnerWish!) }}
              // @ts-ignore
              components={{ anchor: <LinkExtern href={rootParticipantUrl} self={true} /> }}
            />
          </Span>
        </Grid>
      </Grid>
    </Box>
  );
}
