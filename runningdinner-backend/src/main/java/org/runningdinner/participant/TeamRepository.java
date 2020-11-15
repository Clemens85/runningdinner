package org.runningdinner.participant;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.core.RunningDinnerRelatedRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.EntityGraph.EntityGraphType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeamRepository extends RunningDinnerRelatedRepository<Team> {

	@EntityGraph(value = Team.NAMED_ENTITIY_GRAPH_TEAMMEMBERS_AND_MEALCLASS, type = EntityGraphType.LOAD)
	List<Team> findWithTeamMembersAndMealClassDistinctByAdminIdOrderByTeamNumber(String adminId);

  @EntityGraph(value = Team.NAMED_ENTITIY_GRAPH_TEAMMEMBERS_AND_MEALCLASS, type = EntityGraphType.LOAD)
  List<Team> findWithTeamMembersAndMealClassDistinctByIdInAndAdminIdOrderByTeamNumber(Collection<UUID> teamIds, String adminId);
	
  @EntityGraph(value = Team.NAMED_ENTITIY_GRAPH_TEAMMEMBERS_AND_MEALCLASS, type = EntityGraphType.LOAD)
  Team findWithTeamMembersAndMealClassDistinctByIdAndAdminId(UUID teamId, String adminId);
	
  @Query("SELECT DISTINCT t FROM Team t JOIN t.teamMembers members LEFT JOIN FETCH t.teamMembers " +
         "WHERE members.id IN :participantIds AND t.adminId=:adminId ORDER BY t.teamNumber")
  List<Team> findTeamsByParticipantIds(@Param("participantIds") Set<UUID> participantIds, @Param("adminId") String adminId);

  @EntityGraph(value = Team.NAMED_ENTITIY_GRAPH_VISITATIONPLAN, type = EntityGraphType.LOAD)
  Team findWithVisitationPlanByIdAndAdminId(UUID teamId, String adminId);
  
  @EntityGraph(value = Team.NAMED_ENTITIY_GRAPH_VISITATIONPLAN, type = EntityGraphType.LOAD)
  List<Team> findWithVisitationPlanDistinctByIdInAndAdminIdOrderByTeamNumber(Set<UUID> teamIds, String adminId);
  
//	@Query("SELECT DISTINCT t FROM RunningDinner r JOIN r.teams t LEFT JOIN FETCH t.teamMembers LEFT JOIN FETCH t.mealClass WHERE r.uuid=:adminId AND t.naturalKey IN :teamKeys ORDER BY t.teamNumber")
//	List<Team> findWithMembersByNaturalKeys(@Param("adminId") final String adminId, @Param("teamKeys") final Set<String> teamKeys);

}