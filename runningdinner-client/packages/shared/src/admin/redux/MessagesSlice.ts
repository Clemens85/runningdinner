import {handleFetchLoading, handleFetchRejected, handleFetchSucceeded} from "../../redux";
import {AnyAction, createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {ThunkDispatch} from "redux-thunk";
import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import {
  findMessageJobsByAdminIdAndTypeAsync,
  findParticipantsAsync,
  findTeamsNotCancelledAsync,
  sendMessagesAsync,
  isOneMessageJobNotFinished,
  getExampleParticipantMessage,
  getExampleTeamMessage,
  getMessagePreviewAsync
} from "../../";
import {
  PreviewMessage,
  Recipient,
  MessageType,
  HttpError,
  MessageJob,
  BaseMessage,
  BaseAdminIdProps,
  ParticipantMessage,
  TeamMessage
} from "../../types";
import {AdminStateType, adminStore, AdminThunk} from "./AdminStore";
import {MessagesState, newInitialMessagesState} from "./StoreTypes";
import {isArrayNotEmpty, isStringEmpty, findEntityById, CONSTANTS} from "../../";

interface UpdatePreviewDataActionPayload {
  value: string;
  pathInMessageObject: string;
}

export interface MessageTypeAdminIdPayload extends BaseAdminIdProps {
  messageType: MessageType;
}

// *** Actions *** //
const setupInitialMessageType = createAction<MessageTypeAdminIdPayload>("setupInitialMessageType");
const updatePreviewInputData = createAction<UpdatePreviewDataActionPayload>("updatePreviewInputData");
export const updateRecipientSelection = createAction<string>("updateRecipientSelection");
export const startEditCustomSelectedRecipients = createAction("startEditCustomSelectedRecipients");
export const finishEditCustomSelectedRecipients = createAction<Recipient[]>("finishEditCustomSelectedRecipients");
const updateRecipientForPreviewByIdInternal = createAction<string>("updateRecipientForPreviewByIdInternal");

const recalculatePreviewMessagesPending = createAction('recalculatePreviewMessagesPending');
const recalculatePreviewMessagesRejected = createAction<HttpError>('recalculatePreviewMessagesRejected');
const recalculatePreviewMessagesSucceeded = createAction<PreviewMessage[]>('recalculatePreviewMessagesSucceeded');
const updatePreviewInputDataValid = createAction<boolean>("updatePreviewInputDataValid");
const updateMessageJobs = createAction<MessageJob[]>("updateMessageJobs");

export function updateRecipientForPreviewById(newRecipientId: string) : AdminThunk {
  return async (dispatch) => {
    dispatch(updateRecipientForPreviewByIdInternal(newRecipientId));
    dispatch(recalculatePreviewMessages());
  };
}

const fetchMessageJobs = createAsyncThunk(
  'fetchMessageJobs',
  async (props: MessageTypeAdminIdPayload) => {
    const {adminId, messageType} = props;
    return await findMessageJobsByAdminIdAndTypeAsync(adminId, messageType);
  }
);

const fetchRecipients = createAsyncThunk(
  'fetchRecipients',
  async (props: MessageTypeAdminIdPayload) => {
    const {adminId, messageType} = props;
    const recipientsRequest = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? findParticipantsAsync(adminId) : findTeamsNotCancelledAsync(adminId);
    const result = await recipientsRequest;
    return result as Recipient[];
  }
);

export const sendMessages = createAsyncThunk(
  'sendMessages',
  async (baseMessageObj: BaseMessage, thunkAPI) => {
    const currentState = thunkAPI.getState() as AdminStateType;
    const {adminId, messageType, customSelectedRecipients} = currentState.messages;
    const enhancedMessageObj = enhanceMessageObjectWithCustomSelectedRecipients(baseMessageObj, messageType, customSelectedRecipients);
    try {
      return await sendMessagesAsync(adminId, enhancedMessageObj, messageType, false);
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export function fetchInitialMessageData(adminId: string, messageType: MessageType) : AdminThunk {
  return async (dispatch) => {
    dispatch(setupInitialMessageType({ adminId, messageType }));
    dispatch(fetchMessageJobs({ adminId, messageType }));
    dispatch(fetchRecipients({ adminId, messageType }));
  };
}

export function queryNotFinishedMessageJobs(messageJobs: MessageJob[]) : AdminThunk {
  return async (dispatch, getState) => {
    const {adminId, messageType} = getState().messages;
    // debounce(() => {
      if (isArrayNotEmpty(messageJobs) && isOneMessageJobNotFinished(messageJobs)) {
        findMessageJobsByAdminIdAndTypeAsync(adminId, messageType)
          .then((messageJobs) => {
            dispatch(updateMessageJobs(messageJobs));
          });
      }
    // }, 1500);
  };
}

export function recalculatePreviewMessages() : AdminThunk {
  return async (dispatch, getState) => {
    const {messageObject, messageType, selectedRecipientForPreview, adminId} = getState().messages;
    if (!isMailMessageValid(messageObject, messageType, selectedRecipientForPreview)) {
      dispatch(updatePreviewInputDataValid(false));
      return;
    }
    dispatch(recalculatePreviewMessagesPending());
    try {
      const response = await getMessagePreviewAsync(adminId, messageObject, selectedRecipientForPreview!, messageType);
      dispatch(recalculatePreviewMessagesSucceeded(response.previewMessageList));
    } catch (err) {
      dispatch(recalculatePreviewMessagesRejected(err));
    }
  };
}

// *** Reducer *** //
export const messagesSlice = createReducer(newInitialMessagesState, builder => {
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
  .addCase(fetchMessageJobs.pending, (state) => {
    handleFetchLoading(state.messageJobs);
  })
  .addCase(fetchMessageJobs.rejected, (state, action) => {
    handleFetchRejected(state.messageJobs, action);
  })
  .addCase(fetchMessageJobs.fulfilled, (state, action) => {
    handleFetchSucceeded(state.messageJobs, action.payload);
    state.lastPollDate = new Date();
  })
  .addCase(setupInitialMessageType, (state, action) => {
    state.messageType = action.payload.messageType;
    state.adminId = action.payload.adminId;
    if (state.messageType === MessageType.MESSAGE_TYPE_TEAMS) {
      state.messageObject = getExampleTeamMessage();
    } else if (state.messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
      state.messageObject = getExampleParticipantMessage();
    } else if (state.messageType === MessageType.MESSAGE_TYPE_DINNERROUTE) {
      state.messageObject = getExampleTeamMessage(); // TODO
    } else {
      throw new Error("Unknown messageType: " + state.messageType);
    }
  })
  .addCase(updatePreviewInputData, (state, action) => {
    const {pathInMessageObject, value} = action.payload;
    set(state.messageObject, pathInMessageObject, value);
    setFirstRecipientForPreviewIfNeeded(state);
  })
  .addCase(sendMessages.fulfilled, (state, action) => {
    const messageJobs = state.messageJobs.data || [];
    state.messageJobs.data = messageJobs.concat(action.payload);
    // state.sendMessagesError = undefined;
    // Other states (pending | rejected) won't need to be handled in here, due to form handles it
  })
  // .addCase(sendMessages.rejected, (state, action) => {
  //   state.sendMessagesError = action.payload;
  // })
  // .addCase(sendMessages.pending, (state) => {
  //   state.sendMessagesError = undefined;
  // })
  .addCase(updateRecipientSelection, (state, action) => {
    state.previousSelection = state.recipientSelection;
    state.recipientSelection = action.payload;
    if (state.recipientSelection === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION) {
      state.showCustomSelectionDialog = true;
    } else {
      state.customSelectedRecipients = [];
    }
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
      state.recipientSelection = isStringEmpty(state.previousSelection) ? CONSTANTS.TEAM_SELECTION.ALL : state.previousSelection;
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
    state.previewMessages = action.payload;
  })
  .addCase(recalculatePreviewMessagesRejected, (state) => {
    state.isMailMessageValid = false;
    state.previewLoading = false;
  })
  .addCase(updateMessageJobs, (state, action) => {
    state.messageJobs.data = action.payload;
    state.lastPollDate = new Date();
  });
});

// *** Selectors *** //
export const getMessageJobsSelector = (state: AdminStateType) => state.messages.messageJobs;
export const getMessageJobsLastPollDate = (state: AdminStateType) => state.messages.lastPollDate;
export const getRecipientsSelector = (state: AdminStateType) => {
  const {recipients, recipientSelection, customSelectedRecipients, showCustomSelectionDialog} = state.messages;
  return {
    recipients,
    recipientSelection,
    customSelectedRecipients,
    showCustomSelectionDialog
  }
};
export const getMessagePreviewSelector = (state: AdminStateType) => {
  const {previewMessages, isMailMessageValid, previewLoading} = state.messages;
  return {
    previewMessages,
    isMailMessageValid,
    previewLoading
  }
};
export const getMessageObjectSelector = (state: AdminStateType) => state.messages.messageObject;
export const getRecipientsPreviewSelector = (state: AdminStateType) => {
  const {recipients, selectedRecipientForPreview} = state.messages;
  return {
    recipients,
    selectedRecipientForPreview,
  }
};

// *** Helpers *** //
export const updateMessageContentPreviewAsync = debounce((value ) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: "message" }))
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateMessageSubjectPreviewAsync = debounce((subject ) => {
  adminStore.dispatch(updatePreviewInputData({ value: subject, pathInMessageObject: "subject" }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateNonHostMessagePartTemplatePreviewAsync = debounce((value ) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: "nonHostMessagePartTemplate" }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

export const updateHostMessagePartTemplatePreviewAsync = debounce((value) => {
  adminStore.dispatch(updatePreviewInputData({ value, pathInMessageObject: "hostMessagePartTemplate" }));
  getThunkDispatch()(recalculatePreviewMessages());
}, 150);

function getThunkDispatch() {
  return adminStore.dispatch as ThunkDispatch<AdminStateType, void, AnyAction>;
}

function setFirstRecipientForPreviewIfNeeded(state: MessagesState) {
  if (!state.selectedRecipientForPreview && isArrayNotEmpty(state.recipients?.data)) { // Ensure we have a preselected recipient for preview
    state.selectedRecipientForPreview = state.recipients.data[0];
  }
}

function enhanceMessageObjectWithCustomSelectedRecipients<T extends BaseMessage> (messageObj: T, messageTye: MessageType, customSelectedRecipients?: Recipient[]) {
  const customSelectedRecipientIds = isArrayNotEmpty(customSelectedRecipients) ? customSelectedRecipients.map(recipient => recipient.id) : [];
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
  const {subject, message} = messageObject;
  const alwaysRequiredFieldsValid = selectedRecipient && !isStringEmpty(subject) && !isStringEmpty(message);
  if (!alwaysRequiredFieldsValid) {
    return false;
  }
  if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
    const teamMessageObject = (messageObject as unknown as TeamMessage);
    return !isStringEmpty(teamMessageObject.hostMessagePartTemplate) && !isStringEmpty(teamMessageObject.nonHostMessagePartTemplate);
  }
  return true;
}