import React from "react";
import TeamService from "shared/admin/TeamService";
import {CONSTANTS} from "shared/Constants";
import {findEntityById, isArrayNotEmpty, isStringEmpty} from "shared/Utils";
import MessageService, {MESSAGE_TYPE_DINNERROUTE, MESSAGE_TYPE_PARTICIPANTS, MESSAGE_TYPE_TEAMS} from "shared/admin/MessageService";
import debounce from 'lodash/debounce';
import ParticipantService from "shared/admin/ParticipantService";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";

// See https://kentcdodds.com/blog/how-to-use-react-context-effectively

export const RECIPIENTS_SELECTION_CHANGE = "RECIPIENTS_SELECTION_CHANGE";
export const START_EDIT_CUSTOM_SELECTED_RECIPIENTS = "START_EDIT_CUSTOM_SELECTED_RECIPIENTS";
export const FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS = "FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS";
export const CHANGE_PREVIEW_RECIPIENT = "CHANGE_PREVIEW_RECIPIENT";
export const ADD_MESSAGEJOB = "ADD_MESSAGEJOB";

const START_LOADING_DATA = "START_LOADING_DATA";
const FINISHED_LOADING_DATA = "FINISHED_LOADING_DATA";
const ADMIN_ID = "ADMIN_ID";
const ERROR = "ERROR";

const UPDATE_MESSAGE_CONTENT = "UPDATE_MESSAGE_CONTENT";
const UPDATE_MESSAGE_SUBJECT = "UPDATE_MESSAGE_SUBJECT";
const UPDATE_MESSAGE_HOST_MESSAGE_PART_TEMPLATE = "UPDATE_MESSAGE_HOST_MESSAGE_PART_TEMPLATE";
const UPDATE_MESSAGE_NONHOST_MESSAGE_PART_TEMPLATE = "UPDATE_MESSAGE_NONHOST_MESSAGE_PART_TEMPLATE";
const UPDATE_MAIL_MESSAGE_VALID = "UPDATE_MAIL_MESSAGE_VALID";
const UPDATE_RECIPIENTS = "UPDATE_RECIPIENTS";

const START_LOADING_MESSAGEJOBS = "START_LOADING_MESSAGEJOBS";
const FINISHED_LOADING_MESSAGEJOBS = "FINISHED_LOADING_MESSAGEJOBS";
const UPDATE_MESSAGEJOBS = "UPDATE_MESSAGEJOBS";

const START_LOADING_PREVIEW = "START_LOADING_PREVIEW";
const FINISHED_LOADING_PREVIEW = "FINISHED_LOADING_PREVIEW";

function newAction(type, payload) {
  return {
    type,
    payload
  };
}

const INITIAL_STATE_TEMPLATE = {
  loadingData: false,
  adminId: null,

  recipients: [],
  recipientSelection: '',
  previousSelection: '',
  customSelectedRecipients: [],
  showCustomSelectionDialog: false,

  messageType: '',
  messageObject: null,

  selectedRecipientForPreview: null,
  previewLoading: false,
  previewMessages: [],
  isMailMessageValid: false,

  messageJobs: [],
  messageJobsLoading: false,
  lastPollDate: new Date()
};

const MessagesContext = React.createContext(INITIAL_STATE_TEMPLATE);
const MessagesDispatchContext = React.createContext(undefined);

function messagesReducer(state, action) {
  switch (action.type) {
    case START_LOADING_DATA: {
      return { ...state, loadingData: true, error: undefined, recipients: [] };
    }
    case FINISHED_LOADING_DATA: {
      return { ...state, loadingData: false, error: undefined };
    }
    case ERROR: {
      return { ...state, loadingData: false, error: action.payload };
    }
    case START_LOADING_MESSAGEJOBS: {
      return { ...state, messageJobsLoading: true };
    }
    case FINISHED_LOADING_MESSAGEJOBS: {
      return { ...state, messageJobsLoading: false };
    }
    case UPDATE_MESSAGEJOBS: {
      return { ...state, messageJobs: action.payload, lastPollDate: new Date() };
    }
    case ADD_MESSAGEJOB: {
      const resultingMessageJobs = state.messageJobs.concat(action.payload);
      return { ...state, messageJobs: resultingMessageJobs};
    }
    case UPDATE_RECIPIENTS: {
      return { ...state, recipients: action.payload };
    }
    case ADMIN_ID: {
      return { ...state, adminId: action.payload };
    }
    case RECIPIENTS_SELECTION_CHANGE: {
      const newSelectionValue = action.payload;
      const previousSelection = state.recipientSelection;
      const result = { ...state, recipientSelection: newSelectionValue, previousSelection: previousSelection};
      if (newSelectionValue === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION) {
        result.showCustomSelectionDialog = true;
      } else {
        result.customSelectedRecipients = [];
      }
      return result;
    }
    case START_EDIT_CUSTOM_SELECTED_RECIPIENTS: {
      return { ...state, showCustomSelectionDialog: true};
    }
    case FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS: {
      const customSelectedEntities = action.payload;
      const result = { ...state, showCustomSelectionDialog: false};
      if (isArrayNotEmpty(customSelectedEntities)) {
        result.customSelectedRecipients = customSelectedEntities;
      } else {
        result.customSelectedRecipients = [];
        result.recipientSelection = isStringEmpty(result.previousSelection) ? CONSTANTS.TEAM_SELECTION.ALL : result.previousSelection;
      }
      return result;
    }
    case CHANGE_PREVIEW_RECIPIENT: {
      const recipientId = action.payload;
      const foundRecipient = findEntityById(state.recipients, recipientId);
      return {...state, selectedRecipientForPreview: foundRecipient};
    }
    case UPDATE_MAIL_MESSAGE_VALID: {
      return {...state, isMailMessageValid: action.payload};
    }
    case START_LOADING_PREVIEW: {
      return { ...state, previewLoading: true }
    }
    case FINISHED_LOADING_PREVIEW: {
      return { ...state, previewMessages: action.payload, previewLoading: false, isMailMessageValid: true }
    }
    case UPDATE_MESSAGE_CONTENT: {
      const result =  { ...state };
      result.messageObject.message = action.payload;
      setFirstRecipientForPreviewIfNeeded(result);
      return result;
    }
    case UPDATE_MESSAGE_SUBJECT: {
      const result =  { ...state };
      result.messageObject.subject = action.payload;
      setFirstRecipientForPreviewIfNeeded(result);
      return result;
    }
    case UPDATE_MESSAGE_NONHOST_MESSAGE_PART_TEMPLATE: {
      const result =  { ...state };
      result.messageObject.nonHostMessagePartTemplate = action.payload;
      setFirstRecipientForPreviewIfNeeded(result);
      return result;
    }
    case UPDATE_MESSAGE_HOST_MESSAGE_PART_TEMPLATE: {
      const result =  { ...state };
      result.messageObject.hostMessagePartTemplate = action.payload;
      setFirstRecipientForPreviewIfNeeded(result);
      return result;
    }
    default: {
      throw new Error(`Unknown action type: ${JSON.stringify(action)}`);
    }
  }
}

function setFirstRecipientForPreviewIfNeeded(state) {
  if (!state.selectedRecipientForPreview && isArrayNotEmpty(state.recipients)) { // Ensure we have a preselected recipient for preview
    state.selectedRecipientForPreview = state.recipients[0];
  }
}

function MessagesProvider(props) {

  const [state, dispatch] = React.useReducer(
      messagesReducer,
      createInitialState(props.messageType)
  );

  return (
      <MessagesContext.Provider value={state}>
        <MessagesDispatchContext.Provider value={dispatch}>
          {props.children}
        </MessagesDispatchContext.Provider>
      </MessagesContext.Provider>
  );
}

function createInitialState(messageType) {
  const result = {
    ...INITIAL_STATE_TEMPLATE,
    messageType: messageType
  };
  let messageObject;
  if (messageType === MESSAGE_TYPE_TEAMS) {
    messageObject = MessageService.getExampleTeamMessage();
  } else if (messageType === MESSAGE_TYPE_PARTICIPANTS) {
    messageObject = MessageService.getExampleParticipantMessage();
  } else if (messageType === MESSAGE_TYPE_DINNERROUTE) {
    messageObject = MessageService.getExampleTeamMessage(); // TODO
  } else {
    throw new Error("Unknown messageType: " + messageType);
  }
  result.messageObject = messageObject;
  return result;
}

function MessagesFetchData(props) {

  const dispatch = useMessagesDispatch();
  const { adminId } = props;

  const { messageType, messageObject, selectedRecipientForPreview } = useMessagesState();
  const { message, subject, hostMessagePartTemplate, nonHostMessagePartTemplate } = messageObject;

  React.useEffect(() => {
    fetchMessagesDataAsync(adminId, messageType, dispatch);
    // eslint-disable-next-line
  }, []);

  React.useEffect( () => {
    updatePreviewMessageAsync(adminId, messageObject, messageType, selectedRecipientForPreview, dispatch);
    // eslint-disable-next-line
  }, [message, subject, hostMessagePartTemplate, nonHostMessagePartTemplate, selectedRecipientForPreview]);

  return <>{props.children}</>;
}

function useMessagesState() {
  const context = React.useContext(MessagesContext);
  if (context === undefined) {
    throw new Error(
        "useMessagesState must be used within a MessagesProvider"
    );
  }
  return context;
}

function useMessagesDispatch() {
  const context = React.useContext(MessagesDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useMessagesDispatch must be used within a MessagesProvider"
    );
  }
  return context;
}

async function fetchMessagesDataAsync(adminId, messageType, dispatch) {
  dispatch(newAction(ADMIN_ID, adminId));
  dispatch(newAction(START_LOADING_DATA));
  try {
    const recipientsRequest = messageType === MESSAGE_TYPE_PARTICIPANTS ? ParticipantService.findParticipantsAsync(adminId) : TeamService.findTeamsNotCancelledAsync(adminId);
    fetchMessageJobsAsync(adminId, messageType, dispatch);
    const recipients = await recipientsRequest;
    dispatch(newAction(UPDATE_RECIPIENTS,recipients));
    dispatch(newAction(FINISHED_LOADING_DATA));
  } catch (error) {
    dispatch(newAction(ERROR, error));
  }
}

function fetchMessageJobsAsync(adminId, messageType, dispatch) {
  dispatch(newAction(START_LOADING_MESSAGEJOBS));
  return MessageService.findMessageJobsByAdminIdAndTypeAsync(adminId, messageType)
                        .then((messageJobs) => {
                            dispatch(newAction(UPDATE_MESSAGEJOBS, messageJobs));
                            dispatch(newAction(FINISHED_LOADING_MESSAGEJOBS));
                        })
                        .catch((error) => dispatch(newAction(ERROR, error)));
}

async function updatePreviewMessageAsync(adminId,
                                         messageObject,
                                         messageType,
                                         selectedRecipient,
                                         dispatch) {

  if (!isMailMessageValid(messageObject, messageType, selectedRecipient)) {
    dispatch(newAction(UPDATE_MAIL_MESSAGE_VALID, false));
    return;
  }

  dispatch(newAction(START_LOADING_PREVIEW));

  try {
    const response = await MessageService.getMessagePreviewAsync(adminId, messageObject, selectedRecipient, messageType);
    setPreviewMessagesAsync(response.previewMessageList, dispatch);
  } catch (error) {
    dispatch(newAction(ERROR, error));
  }
}

const updateMessageContentPreviewAsync = debounce((content, dispatch) => {
  dispatch(newAction(UPDATE_MESSAGE_CONTENT, content));
}, 150);

const updateMessageSubjectPreviewAsync = debounce((subject, dispatch) => {
  dispatch(newAction(UPDATE_MESSAGE_SUBJECT, subject));
}, 150);

const updateNonHostMessagePartTemplatePreviewAsync = debounce((content, dispatch) => {
  dispatch(newAction(UPDATE_MESSAGE_NONHOST_MESSAGE_PART_TEMPLATE, content));
}, 150);
const updateHostMessagePartTemplatePreviewAsync = debounce((content, dispatch) => {
  dispatch(newAction(UPDATE_MESSAGE_HOST_MESSAGE_PART_TEMPLATE, content));
}, 150);

const setPreviewMessagesAsync = debounce((messages, dispatch) => {
  dispatch(newAction(FINISHED_LOADING_PREVIEW, messages));
}, 150);

const enhanceMessageObjectWithCustomSelectedRecipients = (messageObj, messageTye, customSelectedRecipients) => {
  const customSelectedRecipientIds = isArrayNotEmpty(customSelectedRecipients) ? customSelectedRecipients.map(recipient => recipient.id) : [];
  const result = cloneDeep(messageObj);
  if (messageTye === MESSAGE_TYPE_PARTICIPANTS) {
    result.customSelectedParticipantIds = customSelectedRecipientIds;
  } else {
    result.customSelectedTeamIds = customSelectedRecipientIds;
  }
  return result;
};

const queryNotFinishedMessageJobsAsync = debounce((adminId, messageJobs, messageType, dispatch) => {
  if (isArrayNotEmpty(messageJobs) && isOneMessageJobNotFinished(messageJobs)) {
    MessageService.findMessageJobsByAdminIdAndTypeAsync(adminId, messageType)
        .then((messageJobs) => {
          dispatch(newAction(UPDATE_MESSAGEJOBS, messageJobs));
        });
  }
}, 1500);

function isOneMessageJobNotFinished(messageJobs) {
  const messageJobNotFinished = find(messageJobs, function(messageJob) {
    const status = MessageService.getStatusResult(messageJob);
    return status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_NOT_FINISHED;
  });
  return messageJobNotFinished;
}

function isMailMessageValid(messageObject, messageType, selectedRecipient) {
  const {subject, message} = messageObject;
  const alwaysRequiredFieldsValid = selectedRecipient && !isStringEmpty(subject) && !isStringEmpty(message);
  if (!alwaysRequiredFieldsValid) {
    return false;
  }
  if (messageType === MESSAGE_TYPE_TEAMS) {
    return !isStringEmpty(messageObject.hostMessagePartTemplate) && !isStringEmpty(messageObject.nonHostMessagePartTemplate);
  }
  return true;
}

export {
  MessagesProvider,
  MessagesFetchData,
  useMessagesState,
  useMessagesDispatch,
  newAction,
  updateMessageContentPreviewAsync,
  updateMessageSubjectPreviewAsync,
  updateNonHostMessagePartTemplatePreviewAsync,
  updateHostMessagePartTemplatePreviewAsync,
  queryNotFinishedMessageJobsAsync,
  enhanceMessageObjectWithCustomSelectedRecipients
};
