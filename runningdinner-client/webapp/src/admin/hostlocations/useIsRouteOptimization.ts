import { useUrlQuery } from "../../common/hooks/useUrlQuery";
import { OPTIMIZATION_ID_QUERY_PARAM } from "../AdminNavigationHook";

export function useIsRouteOptimization(): string | null {
  const urlQueryParams = useUrlQuery();
  return urlQueryParams.get(OPTIMIZATION_ID_QUERY_PARAM);
}
