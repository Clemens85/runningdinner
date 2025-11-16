import { CallbackHandler, CallbackHandlerAsync, useDisclosure, BasePublicDinnerProps, RegistrationDataCollection } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@mui/material';
import { DialogTitleCloseable } from '../common/theme/DialogTitleCloseable';
import DialogActionsPanel from '../common/theme/DialogActionsPanel';
import { RegistrationSummaryContentView } from './RegistrationSummaryContentView';
import { RegistrationPaymentDialog } from './RegistrationPaymentDialog';

type RegistrationSummaryDialogProps = {
  registrationDataCollection: RegistrationDataCollection;
  onCancel: CallbackHandler;
  onPerformRegistration: CallbackHandlerAsync;
} & BasePublicDinnerProps;

export function RegistrationSummaryDialog({ publicRunningDinner, registrationDataCollection, onPerformRegistration, onCancel }: RegistrationSummaryDialogProps) {
  const { t } = useTranslation(['landing', 'common']);

  const { isOpen: isRegistrationPaymentDialogOpen, open: openRegistrationPaymentDialog, close: closeRegistrationPaymentDialog } = useDisclosure();

  const { registrationSummary } = registrationDataCollection;

  function handleOpenRegistrationPaymentDialog() {
    openRegistrationPaymentDialog();
  }

  const needsPayment = !!registrationSummary.registrationPaymentSummary;

  return (
    <>
      <Dialog onClose={onCancel} open={!isRegistrationPaymentDialogOpen} data-testid={'registration-summary-dialog'}>
        <DialogTitleCloseable onClose={onCancel}>{t('landing:registration_finish')}</DialogTitleCloseable>
        <DialogContent>
          <RegistrationSummaryContentView {...registrationSummary} />
        </DialogContent>
        {!needsPayment && <DialogActionsPanel onOk={onPerformRegistration} onCancel={onCancel} okLabel={t('landing:registration_perform')} cancelLabel={t('common:cancel')} />}
        {needsPayment && (
          <DialogActionsPanel
            onOk={handleOpenRegistrationPaymentDialog}
            onCancel={onCancel}
            okLabel={t('landing:registration_payment_continue')}
            cancelLabel={t('common:cancel')}
          />
        )}
      </Dialog>
      {isRegistrationPaymentDialogOpen && (
        <RegistrationPaymentDialog onCancel={closeRegistrationPaymentDialog} publicRunningDinner={publicRunningDinner} registrationDataCollection={registrationDataCollection} />
      )}
    </>
  );
}
