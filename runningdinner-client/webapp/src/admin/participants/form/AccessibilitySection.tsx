import AccessibleIcon from '@mui/icons-material/Accessible';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, Divider, FormHelperText, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCheckbox from '../../../common/input/FormCheckbox';

export default function AccessibilitySection() {
  const { t } = useTranslation('common');
  const { watch } = useFormContext();

  const hasAccessibilityData = !!watch('homeAccessible') || !!watch('requiresAccessibleHome');
  const [open, setOpen] = useState(hasAccessibilityData);

  // Participant data is typically loaded into the form after mount
  useEffect(() => {
    if (hasAccessibilityData) {
      setOpen(true);
    }
  }, [hasAccessibilityData]);

  return (
    <Box sx={{ my: 3 }}>
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setOpen(!open)}
        data-testid="accessibility-section-toggle"
        sx={{ alignItems: 'center', cursor: 'pointer', userSelect: 'none', py: 0.5 }}
      >
        <AccessibleIcon fontSize="small" sx={{ display: 'block' }} />
        <Typography variant="subtitle1" sx={{ flexGrow: 1, lineHeight: 1.4 }}>
          {t('accessibility')}
        </Typography>
        {open ? <ExpandLessIcon fontSize="small" color="action" sx={{ display: 'block' }} /> : <ExpandMoreIcon fontSize="small" color="action" sx={{ display: 'block' }} />}
      </Stack>
      <Divider />
      <Collapse in={open} timeout="auto">
        <Box sx={{ mt: 1 }}>
          <Stack>
            <FormCheckbox name="homeAccessible" size="small" label={<Typography variant="body2">{t('accessibility_home_accessible')}</Typography>} data-testid="homeAccessible" />
            <FormCheckbox
              name="requiresAccessibleHome"
              size="small"
              label={<Typography variant="body2">{t('accessibility_requires_accessible_home')}</Typography>}
              data-testid="requiresAccessibleHome"
            />
          </Stack>
          <FormHelperText sx={{ mt: 1 }}>{t('accessibility_help')}</FormHelperText>
        </Box>
      </Collapse>
    </Box>
  );
}
