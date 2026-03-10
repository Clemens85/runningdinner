import {
  BaseAdminIdProps,
  buildOptimizationNotificationSubscriptionUrl,
  CalculateDinnerRouteOptimizationRequest,
  createRouteOptimizationCalculation,
  DinnerRouteOptimizationResult,
  findRouteOptimizationPreview,
  findRouteOptimizationStatus,
  isStringEmpty,
} from '@runningdinner/shared';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';

import { OPTIMIZATION_ID_QUERY_PARAM } from '../AdminNavigationHook';
import { DinnerRouteOptimizationResultService } from './DinnerRouteOptimizationResultService';

const POLLING_INTERVAL = 12000; // 12 seconds
const MAX_POLLING_ATTEMPTS = 1 + 9; // initial + 9 retries

function buildPreviewUrl(optimizationId: string) {
  const url = window.location.href;
  return `${url}?${OPTIMIZATION_ID_QUERY_PARAM}=${optimizationId}`;
}

function setOptimizationResultToLocalStorage(
  adminId: string,
  optimizationResult: DinnerRouteOptimizationResult,
  originalOptimizationRequest: CalculateDinnerRouteOptimizationRequest | null,
): string {
  optimizationResult.averageDistanceInMetersBefore = originalOptimizationRequest?.currentAverageDistanceInMeters || -1;
  optimizationResult.sumDistanceInMetersBefore = originalOptimizationRequest?.currentSumDistanceInMeters || -1;
  DinnerRouteOptimizationResultService.saveDinnerRouteOptimizationResult(optimizationResult, adminId);
  return buildPreviewUrl(optimizationResult.id);
}

type UseRouteOptimizationProps = {} & BaseAdminIdProps;

export function useRouteOptimization({ adminId }: UseRouteOptimizationProps) {
  const [currentOptimizationId, setCurrentOptimizationId] = useState<string | null>(null);
  const [optimizationRequest, setOptimizationRequest] = useState<CalculateDinnerRouteOptimizationRequest | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pollingStarted, setPollingStarted] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  function resetOptimizationRequest() {
    setCurrentOptimizationId(null);
    setOptimizationRequest(null);
    setPollingStarted(false);
  }

  function resetOptimizationResponse() {
    setErrorMessage(null);
    setPreviewUrl(null);
  }

  function clearEventSource() {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }

  function handleTriggerOptimizationError(error: unknown) {
    if (error && isAxiosError(error) && error.response && error.response.status === 429) {
      setErrorMessage('admin:dinner_route_optimization_rate_limit');
    } else {
      setErrorMessage('admin:dinner_route_optimize_error');
    }
    console.error('Error during optimization:', error);
    resetOptimizationRequest();
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

  function applyOptimizationResponse(optimizationResult: DinnerRouteOptimizationResult) {
    const url = setOptimizationResultToLocalStorage(adminId, optimizationResult, optimizationRequest);
    resetOptimizationRequest();
    setPreviewUrl(url);
    clearEventSource();
  }

  async function fetchOptimizationPreviewOnOptimizationFinished() {
    try {
      // Try to fetch optimization result directly (which might work)
      const routeOptimizationResult = await findRouteOptimizationPreview(adminId, currentOptimizationId || '');
      applyOptimizationResponse(routeOptimizationResult);
    } catch (err) {
      setErrorMessage('admin:dinner_route_optimize_error');
      console.error('Route optimization SSE seems to be timed out:', err);
      resetOptimizationRequest();
    }
  }

  // --- Polling (as fallback for SSE) --- //
  const isOptimizationCalculationRunning = !!adminId && !!currentOptimizationId && !!optimizationRequest && !previewUrl;
  useEffect(() => {
    if (!pollingStarted && isOptimizationCalculationRunning) {
      const timer = setTimeout(() => setPollingStarted(true), POLLING_INTERVAL);
      return () => clearTimeout(timer);
    }
  }, [isOptimizationCalculationRunning, pollingStarted]);

  const { data: optimizationInstanceStatus } = useQuery({
    queryKey: ['findRouteOptimizationStatus', adminId, currentOptimizationId],
    queryFn: async () => {
      if (!adminId || !currentOptimizationId) {
        throw new Error('Missing adminId or optimizationId');
      }
      try {
        return await findRouteOptimizationStatus(adminId, currentOptimizationId);
      } catch (error) {
        return null; // Prevent immediate refetch on error
      }
    },
    enabled: isOptimizationCalculationRunning && pollingStarted,
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true,
    retry: MAX_POLLING_ATTEMPTS,
  });
  useEffect(() => {
    if ((optimizationInstanceStatus?.status === 'FINISHED' || optimizationInstanceStatus?.status === 'TIMEOUT') && optimizationRequest) {
      fetchOptimizationPreviewOnOptimizationFinished();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimizationInstanceStatus, optimizationRequest, adminId]);
  // --- End of Polling (SSE fallback) ---

  // --- SSE EventSource for real-time updates --- //
  function handleEventSourceError(err: Event | any) {
    setTimeout(() => {
      console.error('Route optimization SSE seems to be timed out:', err);
      clearEventSource();
      if (!previewUrl) {
        // Fallback, try to fetch optimization result directly (which might work)
        fetchOptimizationPreviewOnOptimizationFinished();
      }
    }, 250);
  }

  useEffect(() => {
    if (isStringEmpty(currentOptimizationId) || isStringEmpty(adminId) || !optimizationRequest) {
      return;
    }
    // Close any previous EventSource before creating a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const eventSource = new EventSource(buildOptimizationNotificationSubscriptionUrl(adminId, currentOptimizationId!));
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (_event) => {
      fetchOptimizationPreviewOnOptimizationFinished();
    };
    eventSource.onerror = (err) => {
      handleEventSourceError(err);
    };
    return () => {
      clearEventSource();
    };
  }, [currentOptimizationId, adminId, optimizationRequest]);
  // --- End of SSE EventSource --- //

  return {
    isPending: () => optimizationRequest !== null,
    resetAll: () => {
      resetOptimizationRequest();
      resetOptimizationResponse();
    },
    previewUrl,
    triggerCalculateOptimization,
    errorMessage,
  };
}
