import ContextMenuIcon from '../../../common/contextmenu/ContextMenuIcon';
import { BaseAdminIdProps, CallbackHandler, getKeyValueList, isStringNotEmpty, newExampleParticipantInstance, Participant, useDisclosure } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { SwapParticipantNumbersDialog } from './SwapParticipantNumbersDialog';

type ParticipantFormContextMenuProps = {
  teamPartnerWishChild: boolean;
  participant: Participant;
  onParticipantsSwapped: CallbackHandler;
} & BaseAdminIdProps;

export function ParticipantFormContextMenu({ adminId, participant, teamPartnerWishChild, onParticipantsSwapped }: ParticipantFormContextMenuProps) {
  const { t } = useTranslation('admin');

  const { setValue } = useFormContext();

  const { open: openSwapParticipantsDialog, close: closeSwapParticipantsDialog, isOpen: showSwapParticipantsDialog } = useDisclosure();

  const handleSetExampleData = () => {
    const exampleDataAsList = getKeyValueList(newExampleParticipantInstance());
    for (let i = 0; i < exampleDataAsList.length; i++) {
      const exampleDataEntry = exampleDataAsList[i];
      setValue(exampleDataEntry.key, exampleDataEntry.value);
    }
  };

  const handleParticipantsSwapped = () => {
    closeSwapParticipantsDialog();
    onParticipantsSwapped();
  };

  const actionMenuItems = [];
  if (isStringNotEmpty(participant?.id)) {
    actionMenuItems.push({ label: t('admin:participants_swap_number'), onClick: openSwapParticipantsDialog });
  }
  if (!teamPartnerWishChild) {
    actionMenuItems.push({ label: t('admin:fill_with_example_data'), onClick: handleSetExampleData });
  }

  return (
    <>
      <ContextMenuIcon entries={actionMenuItems} dataTestId={'participant-form-context-menu-icon'} />
      {showSwapParticipantsDialog && (
        <SwapParticipantNumbersDialog adminId={adminId} srcParticipant={participant} onParticipantsSwapped={handleParticipantsSwapped} onCancel={closeSwapParticipantsDialog} />
      )}
    </>
  );
}
