import {LabelValue} from "@runningdinner/shared";
import {useHistory} from "react-router-dom";

export default function useWizardNavigation() {

  const history = useHistory();

  function generateWizardStepPath(wizardStep?: LabelValue) {
    if (!wizardStep) {
      return undefined;
    }
    return `/running-dinner-wizard${wizardStep.value}`;
  }

  function navigateToWizardStep(wizardStep?: LabelValue) {
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


