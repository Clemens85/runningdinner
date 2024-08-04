package org.runningdinner.participant.rest.dinnerroute;

import org.runningdinner.participant.rest.TeamTO;

import java.util.List;

public record TeamDistanceClusterTO(List<TeamTO> teams, double distance) {
}
