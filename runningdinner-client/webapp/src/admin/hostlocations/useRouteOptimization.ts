import {
  BaseAdminIdProps,
  buildOptimizationNotificationSubscriptionUrl,
  CalculateDinnerRouteOptimizationRequest,
  createRouteOptimizationCalculation,
  DinnerRouteOptimizationResult,
  findRouteOptimizationPreview,
  isStringEmpty,
} from '@runningdinner/shared';
import { useEffect, useState } from 'react';
import { OPTIMIZATION_ID_QUERY_PARAM } from '../AdminNavigationHook';
import { isAxiosError } from 'axios';
import { DinnerRouteOptimizationResultService } from './DinnerRouteOptimizationResultService';

function buildPreviewUrl(optimizationId: string) {
  const url = window.location.href;
  return `${url}?${OPTIMIZATION_ID_QUERY_PARAM}=${optimizationId}`;
}

function setOptimizationResultToLocalStorage(
  optimizationResult: DinnerRouteOptimizationResult,
  originalOptimizationRequest: CalculateDinnerRouteOptimizationRequest,
  adminId: string,
): string {
  optimizationResult.averageDistanceInMetersBefore = originalOptimizationRequest.currentAverageDistanceInMeters;
  optimizationResult.sumDistanceInMetersBefore = originalOptimizationRequest.currentSumDistanceInMeters;
  DinnerRouteOptimizationResultService.saveDinnerRouteOptimizationResult(optimizationResult, adminId);
  return buildPreviewUrl(optimizationResult.id);
}

type UseRouteOptimizationProps = {} & BaseAdminIdProps;

export function useRouteOptimization({ adminId }: UseRouteOptimizationProps) {
  const [currentOptimizationId, setCurrentOptimizationId] = useState<string | null>(null);
  const [optimizationRequest, setOptimizationRequest] = useState<CalculateDinnerRouteOptimizationRequest | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function resetOptimizationRequest() {
    setCurrentOptimizationId(null);
    setOptimizationRequest(null);
    setPreviewUrl(null);
  }

  function resetOptimizationResponse() {
    setErrorMessage(null);
    setPreviewUrl(null);
  }

  function handleTriggerOptimizationError(error: unknown) {
    if (error && isAxiosError(error) && error.response && error.response.status === 429) {
      setErrorMessage('admin:Aktuell gibt es zu viele Routen-Optimierungs-Anfragen. Du kannst es in ca. 3 Minuten erneut versuchen.');
    } else {
      setErrorMessage('admin:dinner_route_optimize_error');
    }
    console.error('Error during optimization:', error);
    resetOptimizationRequest();
  }

  function handleEventSourceError(err: Event | any, eventSource: EventSource) {
    setTimeout(async () => {
      eventSource.close();
      if (!previewUrl) {
        try {
          // Fallback, try to fetch optimization result directly (which might work)
          const routeOptimizationResult = await findRouteOptimizationPreview(adminId, currentOptimizationId || '');
          setOptimizationResultToLocalStorage(routeOptimizationResult, optimizationRequest!, adminId);
          return; // When reaching here our fallback worked and we have a preview URL
        } catch (innerErr) {
          // No error handling here, we are already in error scenario and this error might be expected
        }
        setErrorMessage('admin:dinner_route_optimize_error');
        console.error('Route optimization SSE seems to be timed out:', err);
        resetOptimizationRequest();
      }
    }, 250);
  }

  async function triggerCalculateOptimization(incomingOptimizationRequest: CalculateDinnerRouteOptimizationRequest) {
    setOptimizationRequest(incomingOptimizationRequest);
    resetOptimizationResponse();
    try {
      const calculationCreationResponse = await createRouteOptimizationCalculation(adminId, incomingOptimizationRequest);
      const { optimizationId } = calculationCreationResponse;
      setCurrentOptimizationId(optimizationId);
      console.log('Optimization calculation started with ID:', optimizationId);
    } catch (error) {
      handleTriggerOptimizationError(error);
    }
  }

  function applyOptimizationResponse(event: MessageEvent<any>, originalOptimizationRequest: CalculateDinnerRouteOptimizationRequest): string | null {
    console.log(`Received optimization update: ${event.data}`);
    try {
      const optimizationResult = JSON.parse(event.data) as DinnerRouteOptimizationResult;
      return setOptimizationResultToLocalStorage(optimizationResult, originalOptimizationRequest, adminId);
    } catch (error) {
      console.error('Error parsing optimization result:', error);
      setErrorMessage('admin:dinner_route_optimize_error');
      return null;
    }
  }

  useEffect(() => {
    if (isStringEmpty(currentOptimizationId) || isStringEmpty(adminId) || !optimizationRequest) {
      return;
    }
    const eventSource = new EventSource(buildOptimizationNotificationSubscriptionUrl(adminId, currentOptimizationId!));
    eventSource.onmessage = (event) => {
      const previewUrlResult = applyOptimizationResponse(event, optimizationRequest!);
      eventSource.close();
      resetOptimizationRequest();
      setPreviewUrl(previewUrlResult);
    };
    eventSource.onerror = (err) => {
      handleEventSourceError(err, eventSource);
    };
    return () => {
      eventSource.close();
    };
  }, [currentOptimizationId, adminId, optimizationRequest]);

  return {
    isPending: () => optimizationRequest !== null,
    previewUrl,
    triggerCalculateOptimization,
    errorMessage,
  };
}
