import { Box, Button, Dialog, DialogContent } from "@mui/material";
import { DinnerRouteTeamMapEntry, BaseAdminIdProps, buildAddressEntityList, calculateOptimizationClusters, useDisclosure, isStringNotEmpty, DinnerRouteWithDistancesList } from "@runningdinner/shared";
import { useTranslation } from "react-i18next";
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

type RouteOptimizationButtonProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  routeDistancesList: DinnerRouteWithDistancesList | undefined;
} & BaseAdminIdProps;

export function RouteOptimizationButton(props: RouteOptimizationButtonProps) {

  const {isOpen, open, close} = useDisclosure();
  
  const optimizationId = useIsRouteOptimization();
  if (isStringNotEmpty(optimizationId)) {
    return null;
  }

  return (
    <>
      <Button sx={{ mr: 1}} color="inherit" onClick={() => open()} size="small" variant="outlined">
        Optimieren...
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

  const optimizeMutation = useMutation({
    mutationFn: () => calculateOptimization(),
    onError(error) {
      showError("Leider konnte keine Optimierung deiner Dinner-Routen durchgeführt werden.");
      console.error("Error during optimization:", error);
    },
  });


  async function calculateOptimization() {
    const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);
    const optimizationResult = await calculateOptimizationClusters(adminId, addressEntityList);
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
      <DialogTitleCloseable onClose={onClose}>Dinner Routen optimieren</DialogTitleCloseable>
      <DialogContent>
        <Paragraph>
         Hier kannst du eine Neu-Berechnung der Dinner-Routen zur Optimierung der Laufwege durchführen.<br/><br/>
         Es wird versucht, die Routen so zu optimieren, dass die Laufwege der Teams möglichst kurz sind. 
         Das Ergebnis kannst du dir aschließend in einem neuen Browser-Tab anzeigen lassen und mit deinem jetzigen Stand vergleichen.
        </Paragraph><br/>
        <Paragraph>
          <strong>{t("common:note")}</strong>: Deine aktuellen Dinner-Routen werden durch diese Aktion nicht verändert.
        </Paragraph>

        <Box my={2}>
          { !routeDistancesList && <ProgressBar showLoadingProgress={true} /> }
          { optimizeMutation.isPending && <ProgressBar showLoadingProgress={true} /> }
          {optimizeMutation.data && 
            <Button onClick={onClose} color="primary" startIcon={<OpenInNewIcon />} href={optimizeMutation.data} target="_blank" rel="noopener noreferrer">
              <Paragraph>Optimierte Routen-Vorschau öffnen...</Paragraph>
            </Button>
          }
        </Box>

      </DialogContent>
      <DialogActionsPanel onOk={() => optimizeMutation.mutate()}
                          okButtonDisabled={okButtonDisabled}
                          onCancel={onClose} 
                          okLabel={t("Optimieren...")} 
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  )
}