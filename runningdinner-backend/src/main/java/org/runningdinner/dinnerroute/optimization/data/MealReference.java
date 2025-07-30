package org.runningdinner.dinnerroute.optimization.data;

import java.util.Objects;
import java.util.UUID;

public record MealReference(UUID id, String label) {

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		MealReference that = (MealReference) o;
		return Objects.equals(id(), that.id());
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(id());
	}
}
