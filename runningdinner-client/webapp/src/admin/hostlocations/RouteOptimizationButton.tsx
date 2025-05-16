import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { DinnerRouteTeamMapEntry, BaseAdminIdProps, buildAddressEntityList, calculateOptimizationClusters, useDisclosure, isStringNotEmpty, DinnerRouteWithDistancesList, OptimizationImpact, CalculateDinnerRouteOptimizationRequest } from "@runningdinner/shared";
import { Trans, useTranslation } from "react-i18next";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import { DialogTitleCloseable } from "../../common/theme/DialogTitleCloseable";
import { useCustomSnackbar } from "../../common/theme/CustomSnackbarHook";
import { setLocalStorageInAdminId } from "../../common/LocalStorageService";
import Paragraph from "../../common/theme/typography/Paragraph";
import { useMutation } from "@tanstack/react-query";
import { ProgressBar } from "../../common/ProgressBar";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { OPTIMIZATION_ID_QUERY_PARAM } from "../AdminNavigationHook";
import { useIsRouteOptimization } from "./useIsRouteOptimization";
import { usePredictOptimizationImpact } from "./usePredictOptimizationImpact";
import { FetchProgressBar } from "../../common/FetchProgressBar";

type RouteOptimizationButtonProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  routeDistancesList: DinnerRouteWithDistancesList | undefined;
} & BaseAdminIdProps;

export function RouteOptimizationButton(props: RouteOptimizationButtonProps) {

  const {isOpen, open, close} = useDisclosure();
  const {t} = useTranslation(["admin"]);

  const optimizationId = useIsRouteOptimization();
  if (isStringNotEmpty(optimizationId)) {
    return null;
  }

  return (
    <>
      <Button sx={{ mr: 1}} color="inherit" onClick={() => open()} size="small" variant="outlined">
        {t("admin:dinner_route_optimize_action")}
      </Button>
      <RouteOptimizationDialog onClose={close} isOpen={isOpen} {...props} />
    </>
  )
}


type RouteOptimizationDialogProps = {
  onClose: () => void;
  isOpen?: boolean;
} & RouteOptimizationButtonProps;

function RouteOptimizationDialog({isOpen, onClose, adminId, dinnerRouteMapEntries, routeDistancesList}: RouteOptimizationDialogProps) {

  const {t} = useTranslation(["common", "admin"]);
  const {showError} = useCustomSnackbar();

  const predictOptimizationQuery = usePredictOptimizationImpact(adminId, dinnerRouteMapEntries);

  const optimizeMutation = useMutation({
    mutationFn: () => calculateOptimization(),
    onError(error) {
      showError(t("admin:dinner_route_optimize_error"));
      console.error("Error during optimization:", error);
    },
  });


  async function calculateOptimization() {
    const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);
    const calculateRequest: CalculateDinnerRouteOptimizationRequest = {
      addressEntityList,
      currentAverageDistanceInMeters: routeDistancesList?.averageDistanceInMeters || -1,
      currentSumDistanceInMeters: routeDistancesList?.sumDistanceInMeters || -1,
    };
    const optimizationResult = await calculateOptimizationClusters(adminId, calculateRequest);
    optimizationResult.averageDistanceInMetersBefore = routeDistancesList?.averageDistanceInMeters || 0;
    optimizationResult.sumDistanceInMetersBefore = routeDistancesList?.sumDistanceInMeters || 0;
    setLocalStorageInAdminId(optimizationResult.id, optimizationResult, adminId);
    const url = window.location.href;
    return `${url}?${OPTIMIZATION_ID_QUERY_PARAM}=${optimizationResult.id}`;
  }

  const okButtonDisabled = optimizeMutation.isPending || !routeDistancesList;

  return (
    <Dialog onClose={onClose} open={!!isOpen} maxWidth={"md"} sx={{
        zIndex: 10002
      }}>
      <DialogTitleCloseable onClose={onClose}>{t("admin:dinner_route_optimize_title")}</DialogTitleCloseable>
      <DialogContent>
        <Paragraph><Trans i18nKey={"admin:dinner_route_optimize_description"} /></Paragraph>
         <Box my={2}>
            <FetchProgressBar {...predictOptimizationQuery} />
            { predictOptimizationQuery.data && <OptimizationImpactInfo optimizationImpact={predictOptimizationQuery.data}/> }
         </Box>
        <Paragraph>
          <strong>{t("common:note")}</strong>: <Trans i18nKey={"admin:dinner_route_optimize_note"} />
        </Paragraph>

        <Box my={2}>
          { !routeDistancesList && <ProgressBar showLoadingProgress={true} /> }
          { optimizeMutation.isPending && <ProgressBar showLoadingProgress={true} /> }
          {optimizeMutation.data && 
            <Button onClick={onClose} color="primary" startIcon={<OpenInNewIcon />} href={optimizeMutation.data} target="_blank" rel="noopener noreferrer">
              <Paragraph><Trans i18nKey={"admin:dinner_route_optimize_preview_open"} /></Paragraph>
            </Button>
          }
        </Box>

      </DialogContent>
      <DialogActionsPanel onOk={() => optimizeMutation.mutate()}
                          okButtonDisabled={okButtonDisabled}
                          onCancel={onClose} 
                          okLabel={t("admin:dinner_route_optimize_action")} 
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  )
}

type OptimizationImpactInfoProps = {
  optimizationImpact: OptimizationImpact;
};
function OptimizationImpactInfo({optimizationImpact}: OptimizationImpactInfoProps) {
  
  const {t} = useTranslation(["admin"]);

  if (!optimizationImpact || optimizationImpact === 'NONE') {
    return <Typography variant="body1" color="error"><Trans i18nKey={"admin:dinner_route_optimize_prediction_no_impact"} /></Typography>
  }
  
  let color = "default";
  if (optimizationImpact === 'LOW') {
    color = "warning.main";
  } else if (optimizationImpact === 'HIGH') {
    color = "success.main";
  } else if (optimizationImpact === 'MEDIUM') {
    color = "info.main";
  }

  const impactLabel = t('admin:dinner_route_optimization_impact_' + optimizationImpact.toLowerCase());

  return (
    <Typography variant="body1" component="div">
      <Trans  i18nKey="admin:dinner_route_optimize_prediction_impact"
              components={{
                typography: <Typography variant="body1" component="span" color={color} />
              }}
              values={{ impact: impactLabel }} />
    </Typography>
  )
}