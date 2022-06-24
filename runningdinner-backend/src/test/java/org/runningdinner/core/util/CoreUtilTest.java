package org.runningdinner.core.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;
import java.util.Set;

import org.junit.Test;

import com.google.common.collect.ImmutableSet;

public class CoreUtilTest {

	@Test
	public void excludeMultipleForSameCollection() {
		
		Set<Integer> a = ImmutableSet.of(1, 2);
		Set<Integer> b = ImmutableSet.of(1, 2);
		assertThat(CoreUtil.excludeMultipleFromSet(a, b)).isEmpty();
	}
	
	@Test
	public void excludeMultipleForOneSameElement() {
		
		Set<Integer> a = ImmutableSet.of(1, 2);
		Set<Integer> b = ImmutableSet.of(1);
		assertThat(CoreUtil.excludeMultipleFromSet(b, a)).containsExactly(2);
	}
	
	@Test
	public void excludeMultipleForDisjunctSets() {
		
		Set<Integer> a = ImmutableSet.of(1, 2);
		Set<Integer> b = ImmutableSet.of(3, 4);
		assertThat(CoreUtil.excludeMultipleFromSet(b, a)).containsExactly(1, 2);
	}
	
	@Test
	public void excludeMultipleForSeveralSameElements() {
		
		Set<Integer> a = ImmutableSet.of(1, 2, 3, 4);
		Set<Integer> b = ImmutableSet.of(2, 3);
		assertThat(CoreUtil.excludeMultipleFromSet(b, a)).containsExactly(1, 4);
	}	
	
	@Test
	public void excludeMultipleForEmptyCollection() {
		
		Set<Integer> a = ImmutableSet.of(1, 2, 3, 4);
		assertThat(CoreUtil.excludeMultipleFromSet(Collections.emptyList(), a)).containsExactly(1, 2, 3, 4);
	}
	
}
