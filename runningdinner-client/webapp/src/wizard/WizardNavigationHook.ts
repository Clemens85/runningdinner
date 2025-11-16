import { NavigationStep } from '@runningdinner/shared';
import { useLocation, useNavigate } from 'react-router-dom';
import { WIZARD_ROOT_PATH } from '../common/mainnavigation/NavigationPaths';

export default function useWizardNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  function generateWizardStepPath(wizardStep?: NavigationStep) {
    if (!wizardStep) {
      return undefined;
    }
    const queryParams = location.search;
    return `${WIZARD_ROOT_PATH}${wizardStep.value}${queryParams}`;
  }

  function navigateToWizardStep(wizardStep?: NavigationStep) {
    const path = generateWizardStepPath(wizardStep);
    if (path) {
      navigate(path);
    }
  }

  return {
    generateWizardStepPath,
    navigateToWizardStep,
  };
}
