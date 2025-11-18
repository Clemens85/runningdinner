import { MessageType } from '@runningdinner/shared';
import { useFormContext } from 'react-hook-form';

export function useCurrentRecipientSelectionValue(messageType: MessageType) {
  const { watch } = useFormContext();
  const nameToWatch = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? 'participantSelection' : 'teamSelection';
  return watch(nameToWatch);
}
