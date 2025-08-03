import { Alert, Box, Button, Dialog, DialogContent, Tooltip, Typography } from '@mui/material';
import {
  BaseAdminIdProps,
  useDisclosure,
  isStringNotEmpty,
  DinnerRouteWithDistancesList,
  OptimizationImpact,
  CalculateDinnerRouteOptimizationRequest,
} from '@runningdinner/shared';
import { Trans, useTranslation } from 'react-i18next';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import Paragraph from '../../common/theme/typography/Paragraph';
import { ProgressBar } from '../../common/ProgressBar';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useIsRouteOptimization } from './useIsRouteOptimization';
import { usePredictOptimizationImpact } from './usePredictOptimizationImpact';
import { FetchProgressBar } from '../../common/FetchProgressBar';
import { useRouteOptimization } from './useRouteOptimization';
import { t } from 'i18next';
import { Span } from '../../common/theme/typography/Tags';

type RouteOptimizationButtonProps = {
  routeDistancesList: DinnerRouteWithDistancesList | undefined;
} & BaseAdminIdProps;

export function RouteOptimizationButton(props: RouteOptimizationButtonProps) {
  const { isOpen, open, close } = useDisclosure();
  const { t } = useTranslation(['admin']);

  const optimizationId = useIsRouteOptimization();
  if (isStringNotEmpty(optimizationId)) {
    return null;
  }

  return (
    <>
      <Tooltip title={'Aktuell nicht verfügbar'}>
        <Button sx={{ mr: 1 }} color="inherit" onClick={() => open()} size="small" variant="outlined" disabled={false}>
          {t('admin:dinner_route_optimize_action')}
        </Button>
      </Tooltip>
      <RouteOptimizationDialog onClose={close} isOpen={isOpen} {...props} />
    </>
  );
}

type RouteOptimizationDialogProps = {
  onClose: () => void;
  isOpen?: boolean;
} & RouteOptimizationButtonProps;

function RouteOptimizationDialog({ isOpen, onClose, adminId, routeDistancesList }: RouteOptimizationDialogProps) {
  const { t } = useTranslation(['common', 'admin']);

  const predictOptimizationQuery = usePredictOptimizationImpact(adminId);
  const { isPending, triggerCalculateOptimization, previewUrl, errorMessage, resetAll } = useRouteOptimization({ adminId });

  async function handleTriggerCalculationOptimization() {
    const calculateRequest: CalculateDinnerRouteOptimizationRequest = {
      currentAverageDistanceInMeters: routeDistancesList?.averageDistanceInMeters || -1,
      currentSumDistanceInMeters: routeDistancesList?.sumDistanceInMeters || -1,
    };
    triggerCalculateOptimization(calculateRequest);
  }

  const okButtonDisabled = isPending() || !routeDistancesList || isStringNotEmpty(previewUrl);

  function handleClose() {
    resetAll();
    onClose();
  }

  return (
    <Dialog
      onClose={handleClose}
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

        <Box my={2}>
          {!routeDistancesList && <ProgressBar showLoadingProgress={true} />}
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
        onOk={handleTriggerCalculationOptimization}
        okButtonDisabled={okButtonDisabled}
        onCancel={handleClose}
        okLabel={t('admin:dinner_route_optimize_action')}
        cancelLabel={t('common:cancel')}
      />
    </Dialog>
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
    return (
      <Typography variant="body1" color="error">
        <Trans i18nKey={'admin:dinner_route_optimize_prediction_no_impact'} />
      </Typography>
    );
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
