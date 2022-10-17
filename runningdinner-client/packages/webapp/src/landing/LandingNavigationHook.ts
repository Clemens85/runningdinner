import { RUNNING_DINNER_EVENTS_PATH } from "../common/mainnavigation/NavigationPaths";
import {useNavigate} from "react-router-dom";

export function generateRegistrationFinishedPath(publicDinnerId: string) {
  return `/${RUNNING_DINNER_EVENTS_PATH}/${publicDinnerId}/registration-finished`;
}

export function useLandingNavigation() {

  const navigate = useNavigate();

  function navigateToRegistrationFinished(publicDinnerId: string) {
    navigate(generateRegistrationFinishedPath(publicDinnerId));
  }

  function navigateToRunningDinnerEventList() {
    navigate(`/${RUNNING_DINNER_EVENTS_PATH}`);
  }

  return {
    navigateToRegistrationFinished,
    navigateToRunningDinnerEventList
  };
}