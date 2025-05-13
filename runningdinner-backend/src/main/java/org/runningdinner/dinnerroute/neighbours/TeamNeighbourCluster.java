package org.runningdinner.dinnerroute.neighbours;

import org.runningdinner.participant.rest.TeamTO;

public record TeamNeighbourCluster(TeamTO a, TeamTO b, double distance) {
}
