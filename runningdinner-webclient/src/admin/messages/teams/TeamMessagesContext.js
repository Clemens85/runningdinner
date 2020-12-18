import React from "react";
import TeamService from "shared/admin/TeamService";
import {CONSTANTS} from "shared/Constants";
import {findEntityById, isArrayNotEmpty, isStringEmpty} from "shared/Utils";
import MessageService from "shared/admin/MessageService";
import debounce from 'lodash/debounce';

// See https://kentcdodds.com/blog/how-to-use-react-context-effectively

const START_LOADING_DATA = "START_LOADING_DATA";
const FINISHED_LOADING_DATA = "FINISHED_LOADING_DATA";
const ADMIN_ID = "ADMIN_ID";
const ERROR = "ERROR";
export const RECIPIENTS_SELECTION_CHANGE = "RECIPIENTS_SELECTION_CHANGE";
export const START_EDIT_CUSTOM_SELECTED_RECIPIENTS = "START_EDIT_CUSTOM_SELECTED_RECIPIENTS";
export const FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS = "FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS";
export const CHANGE_PREVIEW_RECIPIENT = "CHANGE_PREVIEW_RECIPIENT";

const UPDATE_MESSAGE_CONTENT = "UPDATE_MESSAGE_CONTENT";
const UPDATE_MESSAGE_SUBJECT = "UPDATE_MESSAGE_SUBJECT";
const UPDATE_MAIL_MESSAGE_VALID = "UPDATE_MAIL_MESSAGE_VALID";

const START_LOADING_PREVIEW = "START_LOADING_PREVIEW";
const FINISHED_LOADING_PREVIEW = "FINISHED_LOADING_PREVIEW";

function newAction(type, payload) {
  return {
    type,
    payload
  };
}

const INITIAL_STATE = {
  loadingData: false,
  adminId: null,

  teams: [],

  teamSelection: null,
  previousTeamSelection: null,
  customSelectedTeams: [],
  showCustomSelectionDialog: false,

  ...MessageService.getExampleTeamMessage(),

  selectedTeamForPreview: null,
  previewLoading: false,
  previewMessages: [],
  isMailMessageValid: false
};

const TeamMessagesContext = React.createContext(INITIAL_STATE);
const TeamMessagesDispatchContext = React.createContext(undefined);

function teamMessagesReducer(state, action) {
  switch (action.type) {
    case START_LOADING_DATA: {
      return { ...state, loadingData: true, error: undefined, teams: [] };
    }
    case FINISHED_LOADING_DATA: {
      return { ...state, loadingData: false, error: undefined, teams: action.payload }
    }
    case ERROR: {
      return { ...state, loadingData: false, error: action.payload };
    }
    case ADMIN_ID: {
      return { ...state, adminId: action.payload };
    }
    case RECIPIENTS_SELECTION_CHANGE: {
      const newSelectionValue = action.payload;
      const previousTeamSelection = state.teamSelection;
      const result = { ...state, teamSelection: newSelectionValue, previousTeamSelection: previousTeamSelection};
      if (newSelectionValue === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION) {
        result.showCustomSelectionDialog = true;
      } else {
        result.customSelectedTeams = [];
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
        result.customSelectedTeams = customSelectedEntities;
      } else {
        result.customSelectedTeams = [];
        result.teamSelection = isStringEmpty(result.previousTeamSelection) ? CONSTANTS.TEAM_SELECTION.ALL : result.previousTeamSelection;
      }
      return result;
    }
    case CHANGE_PREVIEW_RECIPIENT: {
      const recipientId = action.payload;
      const foundRecipient = findEntityById(state.teams, recipientId);
      return {...state, selectedTeamForPreview: foundRecipient};
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
      const result = { ...state, message: action.payload };
      if (!result.selectedTeamForPreview && isArrayNotEmpty(result.teams)) { // Ensure we have a preselected recipient for preview
        result.selectedTeamForPreview = result.teams[0];
      }
      return result;
    }
    case UPDATE_MESSAGE_SUBJECT: {
      const result =  { ...state, subject: action.payload };
      if (!result.selectedTeamForPreview && isArrayNotEmpty(result.teams)) { // Ensure we have a preselected recipient for preview
        result.selectedTeamForPreview = result.teams[0];
      }
      return result;
    }
    default: {
      throw new Error(`Unknown action type: ${JSON.stringify(action)}`);
    }
  }
}

function TeamMessagesProvider(props) {
  const [state, dispatch] = React.useReducer(
      teamMessagesReducer,
      INITIAL_STATE
  );
  return (
      <TeamMessagesContext.Provider value={state}>
        <TeamMessagesDispatchContext.Provider value={dispatch}>
          {props.children}
        </TeamMessagesDispatchContext.Provider>
      </TeamMessagesContext.Provider>
  );
}

function TeamMessagesFetchData(props) {

  const dispatch = useTeamMessagesDispatch();
  const { adminId } = props;

  const {message, subject, hostMessagePartTemplate, nonHostMessagePartTemplate, selectedTeamForPreview} = useTeamMessagesState();

  React.useEffect(() => {
    fetchTeamMessagesDataAsync(adminId, dispatch);
    // eslint-disable-next-line
  }, []);

  React.useEffect( () => {
    updatePreviewMessageAsync(adminId, subject, message, hostMessagePartTemplate, nonHostMessagePartTemplate, selectedTeamForPreview, dispatch);
    // eslint-disable-next-line
  }, [message, subject, hostMessagePartTemplate, nonHostMessagePartTemplate, selectedTeamForPreview]);

  return <>{props.children}</>;
}

function useTeamMessagesState() {
  const context = React.useContext(TeamMessagesContext);
  if (context === undefined) {
    throw new Error(
        "useTeamMessagesState must be used within a TeamMessagesProvider"
    );
  }
  return context;
}

function useTeamMessagesDispatch() {
  const context = React.useContext(TeamMessagesDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useTeamMessagesDispatch must be used within a TeamMessagesProvider"
    );
  }
  return context;
}

async function fetchTeamMessagesDataAsync(adminId, dispatch) {
  dispatch(newAction(START_LOADING_DATA));
  dispatch(newAction(ADMIN_ID, adminId));
  try {
    const teams = await TeamService.findTeamsNotCancelledAsync(adminId);
    dispatch(newAction(FINISHED_LOADING_DATA, teams));
  } catch (error) {
    dispatch(newAction(ERROR, error));
  }
}

async function updatePreviewMessageAsync(adminId, updatedMessageSubject, updatedMessageText, hostMessagePartTemplate, nonHostMessagePartTemplate, selectedRecipient, dispatch) {

  if (!isMailMessageValid(updatedMessageSubject, updatedMessageText, selectedRecipient)) {
    dispatch(newAction(UPDATE_MAIL_MESSAGE_VALID, false));
    return;
  }

  dispatch(newAction(START_LOADING_PREVIEW));

  try {
    const teamMailMessage = {
      subject: updatedMessageSubject,
      message: updatedMessageText,
      hostMessagePartTemplate: hostMessagePartTemplate,
      nonHostMessagePartTemplate: nonHostMessagePartTemplate
    };
    const response = await MessageService.getTeamMailPreviewAsync(adminId, teamMailMessage, selectedRecipient);
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

const setPreviewMessagesAsync = debounce((messages, dispatch) => {
  dispatch(newAction(FINISHED_LOADING_PREVIEW, messages));
}, 150);


function isMailMessageValid(subject, message, selectedRecipient) {
  return selectedRecipient && !isStringEmpty(subject) && !isStringEmpty(message);
}

export {
  TeamMessagesProvider,
  TeamMessagesFetchData,
  useTeamMessagesState,
  useTeamMessagesDispatch,
  newAction,
  updateMessageContentPreviewAsync,
  updateMessageSubjectPreviewAsync
};
