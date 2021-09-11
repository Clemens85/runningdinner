import {NavigationStep} from "@runningdinner/shared";
import {useHistory} from "react-router-dom";
import {WIZARD_ROOT_PATH} from "../common/mainnavigation/NavigationPaths";

export default function useWizardNavigation() {

  const history = useHistory();

  function generateWizardStepPath(wizardStep?: NavigationStep) {
    if (!wizardStep) {
      return undefined;
    }
    const queryParams = history.location.search;
    return `${WIZARD_ROOT_PATH}${wizardStep.value}${queryParams}`;
  }

  function navigateToWizardStep(wizardStep?: NavigationStep) {
    const path = generateWizardStepPath(wizardStep);
    if (path) {
      history.push(path);
    }
  }

  return {
    generateWizardStepPath,
    navigateToWizardStep
  };
}


