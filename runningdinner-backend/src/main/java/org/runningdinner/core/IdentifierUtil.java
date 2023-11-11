package org.runningdinner.core;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.core.util.CoreUtil;

public final class IdentifierUtil {

	private IdentifierUtil() {
		// NOP
	}
	
	/**
	 * Gathers all IDs of the passed entities and returns them as a set
	 * 
	 * @param entities
	 * @return
	 */
	public static <T extends Identifiable> Set<UUID> getIds(final Collection<T> entities) {
		if (CoreUtil.isEmpty(entities)) {
			return Collections.emptySet();
		}

		Set<UUID> result = new HashSet<>(entities.size());
		for (T entity : entities) {
			result.add(entity.getId());
		}
		return result;
	}
	
	public static <T extends Identifiable> Optional<T> filterListForId(final Collection<T> entities, final UUID entityId) {
		
		return entities
						.stream()
						.filter(e -> Objects.equals(entityId, e.getId()))
						.findFirst();
	}
	
	public static <T extends Identifiable> T filterListForIdMandatory(final Collection<T> entityList, UUID entityId) {
    
    return filterListForId(entityList, entityId)
            .orElseThrow(() -> new IllegalStateException("Expected " + entityList + " to contain requested " + entityId));
  }

  public static <T extends Identifiable> Set<T> filterListForIds(Collection<T> entities, Collection<UUID> entityIds) {
    
    Set<T> result = new HashSet<>();
    for (UUID entityId : entityIds) {
      filterListForId(entities, entityId)
        .ifPresent(result::add);
    }
    return result;
  }
	
}
