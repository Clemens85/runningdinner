package org.runningdinner.dinnerroute.optimization.local;

import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record TeamMemberChange(@Valid @NotNull  UUID currentTeamId, @Valid @NotNull UUID moveTeamMembersFromTeamId) {
	
}
