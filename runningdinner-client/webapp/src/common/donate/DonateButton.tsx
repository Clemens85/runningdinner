import FavoriteIcon from '@mui/icons-material/Favorite';
import { Box, Button, Dialog, DialogActions, DialogContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CONSTANTS, useDisclosure } from '@runningdinner/shared';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { FormCheckboxSimple } from '../input/FormCheckboxSimple';
import { commonStyles } from '../theme/CommonStyles';
import { DialogActionsButtons } from '../theme/dialog/DialogActionsButtons';
import { DialogTitleCloseable } from '../theme/DialogTitleCloseable';
import LinkExtern from '../theme/LinkExtern';
import { PrimaryButton } from '../theme/PrimaryButton';
import SecondaryButton from '../theme/SecondaryButton';
import Paragraph from '../theme/typography/Paragraph';

export enum DonateDialogType {
  STANDARD,
  TEAM_MESSAGES,
  DINNER_ROUTE_MESSAGES,
}

type DonateDialogProps = {
  onClose: (remindMe: boolean) => unknown;
  donateDialogType: DonateDialogType;
};

const donationLink = 'https://www.paypal.com/donate/?hosted_button_id=GDVG7J8G3GSF4';

export function DonateButton() {
  const { isOpen, close, open } = useDisclosure();

  const { t } = useTranslation('common');

  return (
    <>
      <Button color={'primary'} startIcon={<FavoriteIcon />} sx={{ borderRadius: 28 }} variant={'contained'} onClick={open}>
        {t('common:donate')}
      </Button>
      {isOpen && <DonateDialog onClose={close} donateDialogType={DonateDialogType.STANDARD} />}
    </>
  );
}

export function DonateDialog({ onClose, donateDialogType }: DonateDialogProps) {
  const { t } = useTranslation('common');

  const [remindMe, setRemindMe] = useState(false);

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};

  const handleClose = () => {
    onClose(remindMe);
  };

  const title = donateDialogType === DonateDialogType.STANDARD ? t('common:dear_users') : t('donate_headline_messages');

  return (
    <Dialog onClose={handleClose} open={true} maxWidth={'md'}>
      <DialogTitleCloseable onClose={handleClose}>{title}</DialogTitleCloseable>
      <DialogContent>
        {donateDialogType === DonateDialogType.STANDARD && <StandardDonateContent />}
        {donateDialogType === DonateDialogType.TEAM_MESSAGES && <TeamMessagesDonateContent remindMe={remindMe} onRemindMeChanged={setRemindMe} />}
        {donateDialogType === DonateDialogType.DINNER_ROUTE_MESSAGES && <DinnerRouteMessagesDonateContent />}
      </DialogContent>
      <DialogActions>
        <DialogActionsButtons
          okButton={
            <PrimaryButton onClick={handleClose} href={donationLink} target="_blank" rel="noopener noreferrer" size={'medium'} sx={fullWidthProps} data-testid="dialog-submit">
              {t('common:donate_continue')}
            </PrimaryButton>
          }
          cancelButton={
            <SecondaryButton onClick={handleClose} sx={fullWidthProps} data-testid="dialog-cancel">
              {t('common:not_now')}
            </SecondaryButton>
          }
        />
      </DialogActions>

      <NoPaypalLink />
    </Dialog>
  );
}

type RemindMeProps = {
  remindMe: boolean;
  onRemindMeChanged: (remindMe: boolean) => unknown;
};

function TeamMessagesDonateContent({ remindMe, onRemindMeChanged }: RemindMeProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Paragraph>{t('common:donate_team_messages_intro')}</Paragraph>
      <br />
      <Paragraph>
        {t('common:donate_team_messages_prompt')}
        <br />
        {t('common:donate_team_messages_amount')}
      </Paragraph>
      <br />
      <Paragraph>
        <Trans i18nKey={'common:donate_team_messages_hint'} />
      </Paragraph>
      <br />
      <ThanksForSupport />
      <Box my={2}>
        <i>{t('common:donate_team_messages_all_functions')}</i>
      </Box>

      <Box mt={2}>
        <FormCheckboxSimple label={t('common:remind_me')} name="remindMe" value={remindMe} onChange={(evt) => onRemindMeChanged(evt.target.checked)} />
      </Box>
    </>
  );
}

function DinnerRouteMessagesDonateContent() {
  return (
    <>
      <Paragraph>
        <Trans i18nKey={'common:donate_dinner_route_messages_intro'} />
      </Paragraph>
      <br />
      <Paragraph>
        <Trans i18nKey={'common:donate_dinner_route_messages_prompt'} />
      </Paragraph>
      <br />
      <Paragraph>
        <Trans i18nKey={'common:donate_dinner_route_messages_amount'} />
      </Paragraph>
      <br />
      <ThanksForSupport />
    </>
  );
}

function StandardDonateContent() {
  return (
    <>
      <Paragraph>
        <Trans i18nKey={'common:donate_standard_intro'} />
      </Paragraph>
      <br />
      <Paragraph>
        <Trans i18nKey="common:donate_standard_prompt" />
      </Paragraph>
      <br />
      <Paragraph>
        <Trans i18nKey={'common:donate_standard_amount'} />
      </Paragraph>
      <br />
      <ThanksForSupport />
    </>
  );
}

function ThanksForSupport() {
  const { t } = useTranslation('common');
  return <Paragraph>{t('common:donate_thanks_support')}</Paragraph>;
}

function NoPaypalLink() {
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));

  const link = (
    <Typography variant={'caption'}>
      <cite>
        <Trans
          i18nKey={'common:donate_no_paypal_contact'}
          // @ts-ignore
          components={{ anchor: <LinkExtern /> }}
          values={{ email: CONSTANTS.GLOBAL_ADMIN_EMAIL }}
        />
      </cite>
    </Typography>
  );

  if (isMobileDevice) {
    return <Box sx={{ p: 2 }}>{link}</Box>;
  }

  return <DialogContent sx={{ pt: 0 }}>{link}</DialogContent>;
}
