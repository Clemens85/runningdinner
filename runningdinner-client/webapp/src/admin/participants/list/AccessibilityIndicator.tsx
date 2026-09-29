import AccessibleIcon from '@mui/icons-material/Accessible';
import { Tooltip } from '@mui/material';
import { Participant } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

export interface AccessibilityIndicatorProps {
  participant: Participant;
}

export function AccessibilityIndicator({ participant }: AccessibilityIndicatorProps) {
  const { t } = useTranslation('admin');

  const { homeAccessible, requiresAccessibleHome } = participant;
  if (!homeAccessible && !requiresAccessibleHome) {
    return null;
  }

  const labels = [];
  if (requiresAccessibleHome) {
    labels.push(t('admin:accessibility_requires_accessible_home_short'));
  }
  if (homeAccessible) {
    labels.push(t('admin:accessibility_home_accessible_short'));
  }
  const tooltipLabel = labels.join(' / ');

  return (
    <Tooltip title={tooltipLabel} aria-label={tooltipLabel} placement="top-end">
      <AccessibleIcon fontSize="small" color={requiresAccessibleHome ? 'warning' : 'primary'} sx={{ display: 'block' }} data-testid="accessibility-indicator" />
    </Tooltip>
  );
}
