package org.runningdinner.dinnerroute.optimization.data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.jetbrains.annotations.NotNull;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.HasGeocodingResult;
import org.runningdinner.participant.TeamStatus;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

public record TeamReference(@JsonProperty int teamNumber,
														@JsonProperty UUID teamId,
														@JsonProperty MealReference meal,
														@JsonProperty TeamStatus status,
														@JsonProperty double lat,
														@JsonProperty double lng,
														@JsonProperty GeocodingResult.GeocodingResultType geocodingResult,
														@JsonProperty int clusterNumber,
														@JsonProperty List<TeamReference> teamsOnRoute) implements HasGeocodingResult {

	@JsonIgnore
	public TeamReference cloneTeamReference(GeocodingResult geocodingResultOverwrite) {
		TeamReference src = this;
		GeocodingResult geocodingResult = geocodingResultOverwrite != null ? geocodingResultOverwrite : src.getGeocodingResult();
		return new TeamReference(
			src.teamNumber(),
			src.teamId(),
			src.meal(),
			src.status(),
			geocodingResult.getLat(),
			geocodingResult.getLng(),
			geocodingResult.getResultType(),
			src.clusterNumber(),
			src.teamsOnRoute()
		);
	}

	@JsonIgnore
	public TeamReference cloneTeamReference(List<TeamReference> teamsOnRouteOverride) {
		List<TeamReference> teamsOnRoute = teamsOnRouteOverride != null ? teamsOnRouteOverride : this.teamsOnRoute();
		TeamReference src = this;
		return new TeamReference(
			src.teamNumber(),
			src.teamId(),
			src.meal(),
			src.status(),
			src.lat(),
			src.lng(),
			src.geocodingResult(),
			src.clusterNumber(),
			teamsOnRoute
		);
	}

	@JsonIgnore
	@NotNull
	@Override
	public String toString() {
		String mealClassStr = meal != null ? " - " + meal : "";
		return teamNumber + mealClassStr;
	}

	@JsonIgnore
	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		TeamReference that = (TeamReference) o;
		return Objects.equals(teamId(), that.teamId());
	}

	@JsonIgnore
	@Override
	public int hashCode() {
		return Objects.hashCode(teamId());
	}

	@JsonIgnore
	@Override
	public GeocodingResult getGeocodingResult() {
		return GeocodingResult.newInstance(lat(), lng(), geocodingResult());
	}

	@JsonIgnore
	@Override
	public UUID getId() {
		return teamId();
	}

	@JsonIgnore
	@Override
	public boolean isNew() {
		return getId() == null;
	}

	@JsonIgnore
	@Override
	public boolean isSameId(UUID id) {
		return Objects.equals(id, getId());
	}
}
