package org.runningdinner.dinnerroute.optimization;

import java.util.UUID;

public record TeamMemberChange(UUID currentTeamId, UUID moveTeamMembersFromTeamId) {
	
}
