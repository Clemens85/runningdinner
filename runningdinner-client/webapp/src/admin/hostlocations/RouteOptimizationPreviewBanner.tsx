import { Alert, AlertTitle, Box, Snackbar, Stack } from '@mui/material';
import { PrimaryButton } from '../../common/theme/PrimaryButton';
import { Span } from '../../common/theme/typography/Tags';
import Paragraph from '../../common/theme/typography/Paragraph';
import { Trans, useTranslation } from 'react-i18next';
import { BaseAdminIdProps, DinnerRouteDistanceUtil, DinnerRouteOptimizationResult, saveOptimizedDinnerRoutes, useDisclosure } from '@runningdinner/shared';
import { useMutation } from '@tanstack/react-query';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import { useAdminNavigation } from '../AdminNavigationHook';
import { DinnerRouteOptimizationResultService } from './DinnerRouteOptimizationResultService';

type RouteOptimizationPreviewBannerProps = {
  optimizationId: string;
} & BaseAdminIdProps;

export function RouteOptimizationPreviewBanner({ optimizationId, adminId }: RouteOptimizationPreviewBannerProps) {
  const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);

  const { t } = useTranslation(['admin', 'common']);
  const { showError, showInfo } = useCustomSnackbar();
  const { navigateToHostLocations } = useAdminNavigation();

  const { isOpen, close } = useDisclosure(true);

  function handleClose() {
    showInfo(t('admin:dinner_route_optimize_preview_refresh'));
    close();
  }

  const saveRoutesMutation = useMutation({
    mutationFn: () => handleSave(optimizationResult),
    onError: (error: Error) => {
      showError(t('admin:dinner_route_optimize_preview_save_error'));
      console.error('Error during persisting optimization data:', error);
    },
    onSuccess: () => {
      navigateToHostLocations(adminId, true);
    },
  });

  async function handleSave(optimizationResult: DinnerRouteOptimizationResult) {
    await saveOptimizedDinnerRoutes(adminId, optimizationResult.id);
    DinnerRouteOptimizationResultService.deleteDinnerRouteOptimizationResult(optimizationId, adminId);
  }

  const showDistanceDiffInfo = canShowDistanceDiffInfo(optimizationResult);

  return (
    <>
      <Snackbar open={isOpen} sx={{ width: '100%', opacity: 0.95, top: '-5px ! important' }} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert icon={false} severity="info" sx={{ width: '98%', paddingBottom: '2px' }} variant="filled" onClose={handleClose}>
          <AlertTitle>
            <Paragraph>
              <strong>
                <Trans i18nKey="admin:dinner_route_optimize_preview_title" />
              </strong>
            </Paragraph>
          </AlertTitle>
          <Box sx={{ mt: -0.5 }}>
            <Stack direction="row" gap={1} alignItems="center" justifyContent={'space-between'} sx={{ width: '100%' }}>
              <Box>
                {showDistanceDiffInfo && <DistanceDiffInfoMessage optimizationResult={optimizationResult} />}
                {!showDistanceDiffInfo && (
                  <Span>
                    <Trans i18nKey="admin:dinner_route_optimize_preview_diff_generic" />
                  </Span>
                )}
              </Box>
              <Box>
                <PrimaryButton size="small" disabled={saveRoutesMutation.isPending} onClick={() => saveRoutesMutation.mutate()}>
                  {t('common:save')}...
                </PrimaryButton>
              </Box>
            </Stack>
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
}

function canShowDistanceDiffInfo(optimizationResult: DinnerRouteOptimizationResult): boolean {
  return (
    optimizationResult.averageDistanceInMetersBefore > 0 &&
    optimizationResult.sumDistanceInMetersBefore > 0 &&
    optimizationResult.optimizedDistances.averageDistanceInMeters > 0 &&
    optimizationResult.optimizedDistances.sumDistanceInMeters > 0
  );
}

type DistanceDiffInfoMessageProps = {
  optimizationResult: DinnerRouteOptimizationResult;
};
function DistanceDiffInfoMessage({ optimizationResult }: DistanceDiffInfoMessageProps) {
  const averageDistanceDiff = optimizationResult.averageDistanceInMetersBefore - optimizationResult.optimizedDistances.averageDistanceInMeters;
  const sumDistanceDiff = optimizationResult.sumDistanceInMetersBefore - optimizationResult.optimizedDistances.sumDistanceInMeters;

  if (averageDistanceDiff <= 0 || sumDistanceDiff <= 0) {
    return (
      <Span>
        <Trans i18nKey={'admin:dinner_route_optimize_preview_diff_negative'} />
      </Span>
    );
  }

  return (
    <Span>
      <Trans i18nKey="admin:dinner_route_optimize_preview_diff_positive_info_sum" values={{ distance: DinnerRouteDistanceUtil.getDistancePrettyFormatted(sumDistanceDiff) }} />{' '}
      <Trans
        i18nKey="admin:dinner_route_optimize_preview_diff_positive_info_average"
        values={{ distance: DinnerRouteDistanceUtil.getDistancePrettyFormatted(averageDistanceDiff) }}
      />{' '}
      <Trans i18nKey="admin:dinner_route_optimize_preview_diff_positive_save" />
    </Span>
  );
}
