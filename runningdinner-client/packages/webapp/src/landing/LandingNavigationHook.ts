import { RUNNING_DINNER_EVENTS_PATH } from "../common/mainnavigation/NavigationPaths";
import {useHistory} from "react-router-dom";

export function generateRegistrationFinishedPath(publicDinnerId: string) {
  return `${RUNNING_DINNER_EVENTS_PATH}/${publicDinnerId}/registration-finished`;
}

export function useLandingNavigation() {

  const history = useHistory();

  function navigateToRegistrationFinished(publicDinnerId: string) {
    history.push(generateRegistrationFinishedPath(publicDinnerId));
  }

  function navigateToRunningDinnerEventList() {
    history.push(RUNNING_DINNER_EVENTS_PATH);
  }

  return {
    navigateToRegistrationFinished,
    navigateToRunningDinnerEventList
  };
}