import { AnyAction, createAction, createAsyncThunk, createReducer, createSelector } from '@reduxjs/toolkit';
import { debounce } from 'lodash-es';
import { cloneDeep } from 'lodash-es';
import { set } from 'lodash-es';
import { ThunkDispatch } from 'redux-thunk';

import {
  findParticipantRecipients,
  findTeamsNotCancelledAsync,
  getBackendIssuesFromErrorResponse,
  getExampleDinnerRouteMessage,
  getExampleParticipantMessage,
  getExampleTeamMessage,
  getMessagePreviewAsync,
  sendMessagesAsync,
} from '../../';
import { findEntityById,isArrayNotEmpty, isStringEmpty } from '../../';
import { handleFetchLoading, handleFetchRejected, handleFetchSucceeded } from '../../redux';
import { BaseAdminIdProps, BaseMessage, HttpError, MessageType, ParticipantMessage, PreviewMessage, Recipient, TeamMessage } from '../../types';
import { AdminStateType, adminStore, AdminThunk } from './AdminStore';
import { MessagesState, newInitialMessagesState } from './StoreTypes';

interface UpdatePreviewDataActionPayload {
  value: string;
  pathInMessageObject: string;
}

export interface MessageTypeAdminIdPayload extends BaseAdminIdProps {
  messageType: MessageType;
}

// *** Actions *** //
export const setupInitialMessageType = createAction<MessageTypeAdminIdPayload>('setupInitialMessageType');
const updatePreviewInputData = createAction<UpdatePreviewDataActionPayload>('updatePreviewInputData');
export const setPreviousRecipientSelection = createAction<string>('setPreviousRecipientSelection');
export const startEditCustomSelectedRecipients = createAction('startEditCustomSelectedRecipients');
export const finishEditCustomSelectedRecipients = createAction<Recipient[]>('finishEditCustomSelectedRecipients');
export const setCustomSelectedRecipients = createAction<Recipient[]>('setCustomSelectedRecipients');
const updateRecipientForPreviewByIdInternal = createAction<string>('updateRecipientForPreviewByIdInternal');

const recalculatePreviewMessagesPending = createAction('recalculatePreviewMessagesPending');
const recalculatePreviewMessagesRejected = createAction<HttpError>('recalculatePreviewMessagesRejected');
const recalculatePreviewMessagesSucceeded = createAction<PreviewMessage[]>('recalculatePreviewMessagesSucceeded');
const updatePreviewInputDataValid = createAction<boolean>('updatePreviewInputDataValid');

export function updateRecipientForPreviewById(newRecipientId: string): AdminThunk {
  return async (dispatch) => {
    dispatch(updateRecipientForPreviewByIdInternal(newRecipientId));
    dispatch(recalculatePreviewMessages());
  };
}

const fetchRecipients = createAsyncThunk('fetchRecipients', async (props: MessageTypeAdminIdPayload) => {
  const { adminId, messageType } = props;
  if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
    const participantRecipients = await findParticipantRecipients(adminId);
    return participantRecipients as Recipient[];
  } else {
    const teams = await findTeamsNotCancelledAsync(adminId);
    return teams as Recipient[];
  }
});

export const sendMessages = createAsyncThunk('sendMessages', async (baseMessageObj: BaseMessage, thunkAPI) => {
  const currentState = thunkAPI.getState() as AdminStateType;
  const { adminId, messageType, customSelectedRecipients } = currentState.messages;
  const enhancedMessageObj = enhanceMessageObjectWithCustomSelectedRecipients(baseMessageObj, messageType, customSelectedRecipients);
  try {
    return await sendMessagesAsync(adminId, enhancedMessageObj, messageType, false);
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export function fetchInitialMessageData(adminId: string, messageType: MessageType): AdminThunk {
  return async (dispatch) => {
    dispatch(setupInitialMessageType({ adminId, messageType }));
    dispatch(fetchRecipients({ adminId, messageType }));
  };
}

export function recalculatePreviewMessages(): AdminThunk {
  return async (dispatch, getState) => {
    const { messageObject, messageType, selectedRecipientForPreview, adminId } = getState().messages;
    if (!isMailMessageValid(messageObject, messageType, selectedRecipientForPreview)) {
      dispatch(updatePreviewInputDataValid(false));
      return;
    }
    dispatch(recalculatePreviewMessagesPending());
    try {
      const response = await getMessagePreviewAsync(adminId, messageObject, selectedRecipientForPreview!, messageType);
      dispatch(recalculatePreviewMessagesSucceeded(response.previewMessageList));
    } catch (err) {
      dispatch(recalculatePreviewMessagesRejected(err as HttpError));
    }
  };
}

// *** Reducer *** //
export const messagesSlice = createReducer(newInitialMessagesState, (builder) => {
  builder
    .addCase(fetchRecipients.fulfilled, (state, action) => {
      handleFetchSucceeded(state.recipients, action.payload);
    })
    .addCase(fetchRecipients.pending, (state) => {
      handleFetchLoading(state.recipients);
    })
    .addCase(fetchRecipients.rejected, (state, action) => {
      handleFetchRejected(state.recipients, action);
    })
    .addCase(setupInitialMessageType, (state, action) => {
      state.messageType = action.payload.messageType;
      state.adminId = action.payload.adminId;
      if (state.messageType === MessageType.MESSAGE_TYPE_TEAMS) {
        state.messageObject = getExampleTeamMessage();
      } else if (state.messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
        state.messageObject = getExampleParticipantMessage();
      } else if (state.messageType === MessageType.MESSAGE_TYPE_DINNERROUTE) {
        state.messageObject = getExampleDinnerRouteMessage();
      } else {
        throw new Error('Unknown messageType: ' + state.messageType);
      }
      // TODO: This is not very nice, but currently needed for resetting views when navigating away and again into this view (otherwise old preview will be shown)
      state.previewMessages = [];
      state.previewIssues = [];
      state.selectedRecipientForPreview = undefined;
      state.isMailMessageValid = false;
    })
    .addCase(updatePreviewInputData, (state, action) => {
      const { pathInMessageObject, value } = action.payload;
      set(state.messageObject, pathInMessageObject, value);
      setFirstRecipientForPreviewIfNeeded(state);
    })
    .addCase(setPreviousRecipientSelection, (state, action) => {
      state.previousRecipientSelection = action.payload;
    })
    .addCase(startEditCustomSelectedRecipients, (state) => {
      state.showCustomSelectionDialog = true;
    })
    .addCase(finishEditCustomSelectedRecipients, (state, action) => {
      const customSelectedEntities = action.payload;
      state.showCustomSelectionDialog = false;
      if (isArrayNotEmpty(customSelectedEntities)) {
        state.customSelectedRecipients = customSelectedEntities;
      } else {
        state.customSelectedRecipients = [];
      }
    })
    .addCase(setCustomSelectedRecipients, (state, action) => {
      const customSelectedEntities = action.payload;
      if (isArrayNotEmpty(customSelectedEntities)) {
        state.customSelectedRecipients = customSelectedEntities;
        state.showCustomSelectionDialog = false;
      } else {
        state.customSelectedRecipients = [];
      }
    })
    .addCase(updateRecipientForPreviewByIdInternal, (state, action) => {
      state.selectedRecipientForPreview = findEntityById(state.recipients.data, action.payload);
    })
    .addCase(updatePreviewInputDataValid, (state, action) => {
      state.isMailMessageValid = action.payload;
    })
    .addCase(recalculatePreviewMessagesPending, (state) => {
      state.previewLoading = true;
    })
    .addCase(recalculatePreviewMessagesSucceeded, (state, action) => {
      state.isMailMessageValid = true;
      state.previewLoading = false;
      state.previewIssues = [];
      state.previewMessages = action.payload;
    })
    .addCase(recalculatePreviewMessagesRejected, (state, action) => {
      state.isMailMessageValid = false;
      state.previewIssues = getBackendIssuesFromErrorResponse(action.payload, false) || [];
      state.previewLoading = false;
    });
});

// *** Selectors *** //
export const getRecipientsSelector = createSelector(
  (state: AdminStateType) => state.messages.recipients,
  (state: AdminStateType) => state.messages.previousRecipientSelection,
  (state: AdminStateType) => state.messages.customSelectedRecipients,
  (state: AdminStateType) => state.messages.showCustomSelectionDialog,
  (recipients, previousRecipientSelection, customSelectedRecipients, showCustomSelectionDialog) => {
    return {
      recipients,
      previousRecipientSelection,
      customSelectedRecipients,
      showCustomSelectionDialog,
    };
  },
);

export const getMessagePreviewSelector = createSelector(
  (state: AdminStateType) => state.messages.previewMessages,
  (state: AdminStateType) => state.messages.isMailMessageValid,
  (state: AdminStateType) => state.messages.previewLoading,
  (state: AdminStateType) => state.messages.previewIssues,
  (previewMessages, isMailMessageValid, previewLoading, previewIssues) => {
    return {
      previewMessages,
      isMailMessageValid,
      previewLoading,
      previewIssues,
    };
  },
);

export const getMessageObjectSelector = (state: AdminStateType) => state.messages.messageObject;

export const getRecipientsPreviewSelector = createSelector(
  (state: AdminStateType) => state.messages.recipients,
  (state: AdminStateType) => state.messages.selectedRecipientForPreview,
  (recipients, selectedRecipientForPreview) => {
    return {
      recipients,
      selectedRecipientForPreview,
    };
  },
);

// *** Helpers *** //
export const updateMessageContentPreviewAsync = debounce((value) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: 'message' }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateMessageSubjectPreviewAsync = debounce((subject) => {
  adminStore.dispatch(updatePreviewInputData({ value: subject, pathInMessageObject: 'subject' }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateNonHostMessagePartTemplatePreviewAsync = debounce((value) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: 'nonHostMessagePartTemplate' }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateHostMessagePartTemplatePreviewAsync = debounce((value) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: 'hostMessagePartTemplate' }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateDinnerRouteSelfPartTemplatePreviewAsync = debounce((value) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: 'selfTemplate' }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateDinnerRouteHostsPartTemplatePreviewAsync = debounce((value) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: 'hostsTemplate' }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

function getThunkDispatch() {
  return adminStore.dispatch as ThunkDispatch<AdminStateType, void, AnyAction>;
}

function setFirstRecipientForPreviewIfNeeded(state: MessagesState) {
  if (!state.selectedRecipientForPreview && isArrayNotEmpty(state.recipients?.data)) {
    // Ensure we have a preselected recipient for preview
    state.selectedRecipientForPreview = state.recipients.data[0];
  }
}

function enhanceMessageObjectWithCustomSelectedRecipients<T extends BaseMessage>(messageObj: T, messageTye: MessageType, customSelectedRecipients?: Recipient[]) {
  const customSelectedRecipientIds = isArrayNotEmpty(customSelectedRecipients) ? customSelectedRecipients.map((recipient) => recipient.id) : [];
  const result = cloneDeep(messageObj);
  if (messageTye === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
    // @ts-ignore
    (result as ParticipantMessage).customSelectedParticipantIds = customSelectedRecipientIds;
  } else {
    // @ts-ignore
    (result as BaseTeamMessage).customSelectedTeamIds = customSelectedRecipientIds;
  }
  return result;
}

function isMailMessageValid<T extends BaseMessage>(messageObject: T, messageType: MessageType, selectedRecipient?: Recipient) {
  const { subject, message } = messageObject;
  const alwaysRequiredFieldsValid = selectedRecipient && !isStringEmpty(subject) && !isStringEmpty(message);
  if (!alwaysRequiredFieldsValid) {
    return false;
  }
  if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
    const teamMessageObject = messageObject as unknown as TeamMessage;
    return !isStringEmpty(teamMessageObject.hostMessagePartTemplate) && !isStringEmpty(teamMessageObject.nonHostMessagePartTemplate);
  }
  return true;
}
