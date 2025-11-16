import { Box, Card, CardContent, Dialog, DialogContent } from '@mui/material';
import { Fullname, isStringNotEmpty,LocalDate, ParticipantRegistrationInfo, Time } from '@runningdinner/shared';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { FormCheckboxSimple } from '../../common/input/FormCheckboxSimple';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import LinkExtern from '../../common/theme/LinkExtern';
import Paragraph from '../../common/theme/typography/Paragraph';
import { SmallTitle } from '../../common/theme/typography/Tags';

type MissingParticipantActivationDialogProps = {
  open: boolean;
  onClose: (disableNotification?: boolean) => unknown;
  missingParticipantActivations: ParticipantRegistrationInfo[];
};

export function MissingParticipantActivationItem({ email, firstnamePart, lastname, createdAt, mobileNumber, teamPartnerWishChildInfo }: ParticipantRegistrationInfo) {
  const { t } = useTranslation(['common', 'admin']);

  return (
    <Card>
      <CardContent>
        <div>
          <LinkExtern href={`mailto:${email}`}>
            <SmallTitle>{email}</SmallTitle>
          </LinkExtern>
        </div>
        <div>
          <Fullname firstnamePart={firstnamePart} lastname={lastname} />
        </div>
        <div>
          <Paragraph>
            Registriert am <LocalDate date={createdAt} /> {t('common:at_time')} <Time date={createdAt} />
          </Paragraph>
        </div>
        {isStringNotEmpty(mobileNumber) && (
          <>
            <Paragraph>
              {t('common:mobile')}: <LinkExtern href={`tel:${mobileNumber}`} title={mobileNumber} />
            </Paragraph>
          </>
        )}
        {isStringNotEmpty(teamPartnerWishChildInfo) && (
          <Trans i18nKey="admin:team_partner_wish_registration_child_participant_child_info_1" values={{ fullname: teamPartnerWishChildInfo }} components={{ anchor: <span /> }} />
        )}
      </CardContent>
    </Card>
  );
}

export function MissingParticipantActivationDialog({ open, onClose, missingParticipantActivations }: MissingParticipantActivationDialogProps) {
  const { t } = useTranslation(['common', 'admin']);

  const [disableNotification, setDisableNotification] = useState(false);

  function handleCancel() {
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleCancel} aria-labelledby="form-dialog-title" data-testid="missing-participant-activation-dialog">
      <DialogTitleCloseable onClose={handleCancel}>{t('admin:registrations_not_yet_confirmed_old')}</DialogTitleCloseable>
      <DialogContent>
        <Box pt={2}>
          <Paragraph>
            {t('admin:registrations_not_yet_confirmed_old_info_1')}
            <br />
            <br />
            {t('admin:registrations_not_yet_confirmed_old_info_2')}
            <br />
            <br />
            {t('admin:registrations_not_yet_confirmed_old_info_3')}
            <br />
            {t('admin:registrations_not_yet_confirmed_old_info_4')}
          </Paragraph>
        </Box>

        {missingParticipantActivations.map((mpa) => (
          <Box key={mpa.id} pt={2}>
            <MissingParticipantActivationItem {...mpa} />
          </Box>
        ))}

        <Box mt={3}>
          <FormCheckboxSimple
            label={t('common:show_message_not_any_longer')}
            name="disableMissingParticipantActivationDialog"
            value={disableNotification}
            onChange={(evt) => setDisableNotification(evt.target.checked)}
          />
        </Box>
      </DialogContent>
      <DialogActionsPanel onOk={() => onClose(disableNotification)} okLabel={t('common:ok')} onCancel={handleCancel} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}
