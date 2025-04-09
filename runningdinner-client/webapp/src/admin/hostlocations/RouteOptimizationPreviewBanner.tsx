import { Alert, AlertTitle, Box, Snackbar, Stack } from "@mui/material";
import { PrimaryButton } from "../../common/theme/PrimaryButton";
import { Span } from "../../common/theme/typography/Tags";
import Paragraph from "../../common/theme/typography/Paragraph";
import { useTranslation } from "react-i18next";
import { BaseAdminIdProps, DinnerRouteOptimizationResult, saveNewDinnerRoutes, useDisclosure } from "@runningdinner/shared";
import { useMutation } from "@tanstack/react-query";
import { useCustomSnackbar } from "../../common/theme/CustomSnackbarHook";
import { useAdminNavigation } from "../AdminNavigationHook";
import { DinnerRouteOptimizationResultService } from "./DinnerRouteOptimizationResultService";

type RouteOptimizationPreviewBannerProps = {
  optimizationId: string;
} & BaseAdminIdProps;


export function RouteOptimizationPreviewBanner({optimizationId, adminId}: RouteOptimizationPreviewBannerProps) {

  const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);

  const {t} = useTranslation("common");
  const {showError, showInfo} = useCustomSnackbar();
  const {navigateToHostLocations} = useAdminNavigation();

  const {isOpen, close} = useDisclosure(true);

  function handleClose() {
    showInfo("Wenn du diese Anzeige wieder sehen willst, akktualisiere dieses Browser-Tab (bzw. drücke F5).");
    close();
  }

  const saveRoutesMutation = useMutation({
    mutationFn: () => handleSave(optimizationResult),
    onError: (error: Error) => {
      showError("Leider konnte die Optimierung deiner Dinner-Routen nicht gespeichert werden. " + 
                "Bitte kehre zur originalen Routen-Übersicht zurück und führe eine neue Optimierung durch.");
      console.error("Error during optimization:", error);
    },
    onSuccess: () => {
      navigateToHostLocations(adminId, true);
    }
  });

  async function handleSave(optimizationResult: DinnerRouteOptimizationResult) {
    await saveNewDinnerRoutes(adminId, { dinnerRoutes: optimizationResult.optimizedDinnerRoutes });
    DinnerRouteOptimizationResultService.deleteDinnerRouteOptimizationResult(optimizationId, adminId);
  }

  const showDistanceDiffInfo = canShowDistanceDiffInfo(optimizationResult);

  return (
    <>
      <Snackbar open={isOpen} 
                sx={{ width: '100%', opacity: 0.95, top: 0 }} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}> 
        <Alert icon={false} severity="info" sx={{ width: '98%' }} variant="filled" onClose={handleClose}>
          <AlertTitle><Paragraph>Vorschau der Routen-Optimierung</Paragraph></AlertTitle>
          <Box sx={{ mt: -0.5 }}>
            <Stack direction="row" gap={1} alignItems="center" justifyContent={"space-between"} sx={{ width: '100%' }}>
              <Box>
                { showDistanceDiffInfo && <DistanceDiffInfoMessage optimizationResult={optimizationResult} /> }
                { !showDistanceDiffInfo && 
                  <Span>Du kannst die neu berechneten Routen mit denen in deinem alten Browser-Tab vergleichen. Gefällt dir das Ergebnis? Dann kannst du die neuen Routen jetzt speichern.</Span>
                }

              </Box>
              <Box>
                <PrimaryButton size="small" disabled={saveRoutesMutation.isPending} onClick={() => saveRoutesMutation.mutate()}>{t("common:save")}...</PrimaryButton>
              </Box>
            </Stack>
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
}

function canShowDistanceDiffInfo(optimizationResult: DinnerRouteOptimizationResult): boolean {
  return optimizationResult.averageDistanceInMetersBefore > 0 && optimizationResult.sumDistanceInMetersBefore > 0 &&
         optimizationResult.optimizedDistances.averageDistanceInMeters > 0 && optimizationResult.optimizedDistances.sumDistanceInMeters > 0;
}

type DistanceDiffInfoMessageProps = {
  optimizationResult: DinnerRouteOptimizationResult;
}
function DistanceDiffInfoMessage({optimizationResult}: DistanceDiffInfoMessageProps) {

  const averageDistanceDiff = Math.floor(optimizationResult.averageDistanceInMetersBefore - optimizationResult.optimizedDistances.averageDistanceInMeters);
  const sumDistanceDiff = Math.floor(optimizationResult.sumDistanceInMetersBefore - optimizationResult.optimizedDistances.sumDistanceInMeters);
  
  return (
    <Span>
      Mit den neu berechneten Routen werden <strong>{sumDistanceDiff} m</strong> Wegstrecke gespart. 
      Die Ersparnis der Durchschnitts-Route pro Team liegt bei <strong>{averageDistanceDiff} m</strong>.
      Gefällt dir das Ergebnis? Dann kannst du die neuen Routen jetzt speichern.
    </Span>
  )
}