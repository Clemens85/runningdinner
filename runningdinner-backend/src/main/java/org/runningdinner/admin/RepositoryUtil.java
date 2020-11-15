package org.runningdinner.admin;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.core.AbstractEntity;
import org.runningdinner.core.util.CoreUtil;

public class RepositoryUtil {

	/**
	 * Gathers all IDs of the passed entities and returns them as a set
	 * 
	 * @param entities
	 * @return
	 */
	public static <T extends AbstractEntity> Set<UUID> getEntityIds(final Collection<T> entities) {
		if (CoreUtil.isEmpty(entities)) {
			return Collections.emptySet();
		}

		Set<UUID> result = new HashSet<>(entities.size());
		for (T entity : entities) {
			result.add(entity.getId());
		}
		return result;
	}
	
}
