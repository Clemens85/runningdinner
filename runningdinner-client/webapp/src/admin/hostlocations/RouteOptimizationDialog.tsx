import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Button, Dialog, DialogContent, Divider, FormHelperText, Slider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { BaseAdminIdProps, CalculateDinnerRouteOptimizationRequest, isStringNotEmpty, OptimizationImpact, RouteDistanceMetrics } from '@runningdinner/shared';
import { t } from 'i18next';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCheckbox from '../../common/input/FormCheckbox';

import { FetchProgressBar } from '../../common/FetchProgressBar';
import { ProgressBar } from '../../common/ProgressBar';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import Paragraph from '../../common/theme/typography/Paragraph';
import { Span } from '../../common/theme/typography/Tags';
import { newRouteOptimizationSettings, RouteOptimizationSettings } from '@runningdinner/shared';
import { usePredictOptimizationImpact } from './usePredictOptimizationImpact';
import { useRouteOptimization } from './useRouteOptimization';

type RouteOptimizationDialogProps = {
  onClose: () => void;
  isOpen?: boolean;
  routeDistanceMetrics?: RouteDistanceMetrics | undefined;
} & BaseAdminIdProps;

export function RouteOptimizationDialog({ isOpen, onClose, adminId, routeDistanceMetrics }: RouteOptimizationDialogProps) {
  const { t } = useTranslation(['common', 'admin']);

  const predictOptimizationQuery = usePredictOptimizationImpact(adminId);
  const { isPending, triggerCalculateOptimization, previewUrl, errorMessage, resetAll } = useRouteOptimization({ adminId });

  const formMethods = useForm<RouteOptimizationSettings>({
    defaultValues: newRouteOptimizationSettings(),
    mode: 'onTouched',
  });

  const { handleSubmit, control, reset, watch } = formMethods;

  const minimumDistanceInMeters = watch('minimumDistanceInMeters');

  async function handleTriggerCalculationOptimization(formData: RouteOptimizationSettings) {
    const calculateRequest: CalculateDinnerRouteOptimizationRequest = {
      currentAverageDistanceInMeters: routeDistanceMetrics?.averageDistanceInMeters || -1,
      currentSumDistanceInMeters: routeDistanceMetrics?.sumDistanceInMeters || -1,
      ignoreMealAssignments: formData.ignoreMealAssignments,
      minimumDistanceInMeters: formData.minimumDistanceInMeters,
    };
    triggerCalculateOptimization(calculateRequest);
  }

  const okButtonDisabled = isPending() || !routeDistanceMetrics || isStringNotEmpty(previewUrl) || predictOptimizationQuery.data === 'NONE';

  function handleClose() {
    resetAll();
    reset();
    onClose();
  }

  const zero_minimum_distance_label = t('admin:dinner_route_optimize_minimum_distance_none');

  return (
    <FormProvider {...formMethods}>
      <Dialog
        onClose={(_event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        open={!!isOpen}
        maxWidth={'md'}
        sx={{
          zIndex: 10002,
        }}
      >
        <DialogTitleCloseable onClose={handleClose}>{t('admin:dinner_route_optimize_title')}</DialogTitleCloseable>
        <DialogContent>
          <Paragraph>
            <Trans i18nKey={'admin:dinner_route_optimize_description'} />
            <br />
            <Trans i18nKey={'admin:dinner_route_optimize_note'} />
          </Paragraph>
          <Box my={2}>
            <FetchProgressBar {...predictOptimizationQuery} />
            {predictOptimizationQuery.data && !previewUrl && <OptimizationImpactInfo optimizationImpact={predictOptimizationQuery.data} />}
          </Box>

          <Box my={1}>
            <Divider>
              {/* , color: 'primary.main'  */}
              <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                {t('common:settings')}
              </Typography>
            </Divider>
          </Box>

          <Box my={2}>
            <FormCheckbox
              name="ignoreMealAssignments"
              label={t('admin:dinner_route_optimize_ignore_meal_assignments')}
              disabled={isPending() || isStringNotEmpty(previewUrl)}
              helperText="Erlaubt der Optimierung, existierende Speisen-Zuordnungen der Teams zu verwerfen, um optimiertere Laufwege zu erzielen"
            />
          </Box>

          <Box mb={2} mt={3}>
            <Typography variant="body1">{t('admin:dinner_route_optimize_minimum_distance')}</Typography>
            <Box px={2}>
              <Controller
                name="minimumDistanceInMeters"
                control={control}
                render={({ field }) => (
                  <Slider
                    {...field}
                    aria-label={t('common:distance')}
                    disabled={isPending() || isStringNotEmpty(previewUrl)}
                    getAriaValueText={() => `${field.value} m`}
                    step={50}
                    marks={[
                      { value: 0, label: '0 m' },
                      { value: 250, label: '250 m' },
                      { value: 500, label: '500 m' },
                      { value: 750, label: '750 m' },
                      { value: 1000, label: '1 km' },
                    ]}
                    min={0}
                    valueLabelDisplay="auto"
                    max={1000}
                  />
                )}
              />
            </Box>
            <FormHelperText>
              {t('admin:dinner_route_optimize_minimum_distance_help')}
              <br />
              <Trans
                i18nKey={'admin:dinner_route_optimize_minimum_distance_current'}
                values={{ distance: minimumDistanceInMeters === 0 ? zero_minimum_distance_label : `${minimumDistanceInMeters} m` }}
              />
            </FormHelperText>
          </Box>

          <Box mt={4}>
            <Divider />
          </Box>

          <Box mb={2} mt={3}>
            {!routeDistanceMetrics && <ProgressBar showLoadingProgress={true} />}
            {isPending() && <OptimizationProgressBar />}
            {errorMessage && <ErrorAlert errorMessage={errorMessage} />}
            {previewUrl && (
              <Box sx={{ textAlign: 'center', mb: -4 }}>
                <Button onClick={handleClose} color="primary" startIcon={<OpenInNewIcon />} href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <Paragraph>
                    <strong>
                      <Trans i18nKey={'admin:dinner_route_optimize_preview_open'} />
                    </strong>
                  </Paragraph>
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActionsPanel
          onOk={handleSubmit(handleTriggerCalculationOptimization)}
          okButtonDisabled={okButtonDisabled}
          onCancel={handleClose}
          okLabel={t('admin:dinner_route_optimize_action')}
          cancelLabel={t('common:cancel')}
        />
      </Dialog>
    </FormProvider>
  );
}

function OptimizationProgressBar() {
  return (
    <Box flexDirection="column" alignItems="center" gap={2}>
      <ProgressBar showLoadingProgress={true} />
      <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 2 }}>
        {t('admin:dinner_route_optimization_running')}
      </Typography>
    </Box>
  );
}

type ErrorAlertProps = {
  errorMessage: string;
};
function ErrorAlert({ errorMessage }: ErrorAlertProps) {
  return (
    <Box my={2}>
      <Alert severity="error" variant="outlined">
        <Span i18n={errorMessage} />
      </Alert>
    </Box>
  );
}

type OptimizationImpactInfoProps = {
  optimizationImpact: OptimizationImpact;
};
function OptimizationImpactInfo({ optimizationImpact }: OptimizationImpactInfoProps) {
  const { t } = useTranslation(['admin']);

  if (!optimizationImpact || optimizationImpact === 'NONE') {
    return <ErrorAlert errorMessage="admin:dinner_route_optimize_prediction_no_impact" />;
  }

  let color = 'default';
  if (optimizationImpact === 'LOW') {
    color = 'warning.main';
  } else if (optimizationImpact === 'HIGH') {
    color = 'success.main';
  } else if (optimizationImpact === 'MEDIUM') {
    color = 'info.main';
  }

  const impactLabel = t('admin:dinner_route_optimization_impact_' + optimizationImpact.toLowerCase());

  return (
    <Typography variant="body1" component="div">
      <Trans
        i18nKey="admin:dinner_route_optimize_prediction_impact"
        components={{
          typography: <Typography variant="body1" component="span" color={color} />,
        }}
        values={{ impact: impactLabel }}
      />
    </Typography>
  );
}
