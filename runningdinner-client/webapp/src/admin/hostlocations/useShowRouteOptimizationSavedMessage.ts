import { useUrlQuery } from "../../common/hooks/useUrlQuery";
import { SHOW_ROUTE_OPTIMIZATION_SAVED_MESSAGE_QUERY_PARAM } from "../AdminNavigationHook";

export function useShowRouteOptimizationSavedMessage() {
  const urlQueryParams = useUrlQuery();
  return {
    showRouteOptimizationSavedMessage: urlQueryParams.get(SHOW_ROUTE_OPTIMIZATION_SAVED_MESSAGE_QUERY_PARAM) === "true",
    deleteRouteOptimizationSavedQueryParam: () => {
      urlQueryParams.delete(SHOW_ROUTE_OPTIMIZATION_SAVED_MESSAGE_QUERY_PARAM);
      window.history.replaceState({}, "", window.location.pathname + "?" + urlQueryParams.toString());
    }
  }
}