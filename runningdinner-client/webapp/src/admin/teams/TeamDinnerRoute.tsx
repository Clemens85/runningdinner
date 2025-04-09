import {
  assertDefined,
  getRunningDinnerMandatorySelector,
  isQuerySucceeded,
  useAdminSelector,
  useFindDinnerRouteByAdminIdAndTeamId
} from "@runningdinner/shared";
import {useParams} from "react-router-dom";
import DinnerRouteView from "../../common/dinnerroute/DinnerRouteView";
import { FetchProgressBar } from "../../common/FetchProgressBar";

export default function TeamDinnerRoute() {

  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);
  const {adminId} = runningDinner;

  const params = useParams<Record<string, string>>();
  const teamId = params.teamId;

  assertDefined(teamId);

  const dinnerRouteQuery = useFindDinnerRouteByAdminIdAndTeamId(adminId, teamId);
  if (!isQuerySucceeded(dinnerRouteQuery)) {
    return <FetchProgressBar {...dinnerRouteQuery} />
  }
  return <DinnerRouteView dinnerRoute={dinnerRouteQuery.data!} meals={runningDinner.options.meals} adminId={adminId} />
}
