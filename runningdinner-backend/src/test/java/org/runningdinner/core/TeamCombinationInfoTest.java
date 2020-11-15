package org.runningdinner.core;

import static org.assertj.core.api.Assertions.assertThat;

import static org.junit.Assert.assertEquals;

import java.util.Map;

import org.junit.Test;

public class TeamCombinationInfoTest {

	@Test
	public void testCombintionWithThreeMeals() throws NoPossibleRunningDinnerException {
		TeamCombinationInfo info = new TeamCombinationInfo(9, 3);
		assertEquals(0, info.getNumRemaindingTeams());
		assertThat(info.getCombinationFactors()).containsExactlyInAnyOrder(new Integer(9), new Integer(12), new Integer(15));
	}

	@Test
	public void testCombinationWithTwoMeals() throws NoPossibleRunningDinnerException {
		TeamCombinationInfo info = new TeamCombinationInfo(9, 2);
		assertEquals(1, info.getNumRemaindingTeams());
		assertThat(info.getCombinationFactors()).containsExactlyInAnyOrder(new Integer(4), new Integer(6));
	}

	@Test
	public void testTeamSizeFactorizationsWithThreeMeals() throws NoPossibleRunningDinnerException {

		TeamCombinationInfo team9 = new TeamCombinationInfo(9, 3);
		Map<Integer, Integer> teamSizeFactorizations = team9.getTeamSizeFactorizations();
		assertThat(teamSizeFactorizations.entrySet()).hasSize(3);
		assertThat(teamSizeFactorizations).containsEntry(9, 1);
    assertThat(teamSizeFactorizations).containsEntry(12, 0);
    assertThat(teamSizeFactorizations).containsEntry(15, 0);

		TeamCombinationInfo team18 = new TeamCombinationInfo(18, 3);
		teamSizeFactorizations = team18.getTeamSizeFactorizations();
		assertThat(teamSizeFactorizations.entrySet()).hasSize(3);
    assertThat(teamSizeFactorizations).containsEntry(9, 2);
    assertThat(teamSizeFactorizations).containsEntry(12, 0);
    assertThat(teamSizeFactorizations).containsEntry(15, 0);

		TeamCombinationInfo team15 = new TeamCombinationInfo(15, 3);
		teamSizeFactorizations = team15.getTeamSizeFactorizations();
    assertThat(teamSizeFactorizations.entrySet()).hasSize(3);
    assertThat(teamSizeFactorizations).containsEntry(9, 0);
    assertThat(teamSizeFactorizations).containsEntry(12, 0);
    assertThat(teamSizeFactorizations).containsEntry(15, 1);

		TeamCombinationInfo team21 = new TeamCombinationInfo(21, 3);
		teamSizeFactorizations = team21.getTeamSizeFactorizations();
    assertThat(teamSizeFactorizations.entrySet()).hasSize(3);
    assertThat(teamSizeFactorizations).containsEntry(9, 1);
    assertThat(teamSizeFactorizations).containsEntry(12, 1);
    assertThat(teamSizeFactorizations).containsEntry(15, 0);

		TeamCombinationInfo team33 = new TeamCombinationInfo(33, 3);
		teamSizeFactorizations = team33.getTeamSizeFactorizations();
		assertThat(teamSizeFactorizations.entrySet()).hasSize(3);
    assertThat(teamSizeFactorizations).containsEntry(9, 2);
    assertThat(teamSizeFactorizations).containsEntry(12, 0);
    assertThat(teamSizeFactorizations).containsEntry(15, 1);

		TeamCombinationInfo team75 = new TeamCombinationInfo(75, 3);
		teamSizeFactorizations = team75.getTeamSizeFactorizations();
		assertThat(teamSizeFactorizations.entrySet()).hasSize(3);
		
    assertThat(teamSizeFactorizations).containsEntry(9, 7);
    assertThat(teamSizeFactorizations).containsEntry(12, 1);
    assertThat(teamSizeFactorizations).containsEntry(15, 0);
	}
}
