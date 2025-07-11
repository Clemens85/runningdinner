
package org.runningdinner.participant;

import jakarta.persistence.*;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.hibernate.annotations.BatchSize;
import org.runningdinner.core.*;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.HasGeocodingResult;
import org.springframework.util.Assert;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Represents a team of a running dinner.<br>
 * Each team is identified by his teamNumber which is unique inside <b>one</b> running-dinner.
 * 
 * @author Clemens Stich
 * 
 */
@Entity
@NamedEntityGraphs({
  @NamedEntityGraph(name = Team.NAMED_ENTITIY_GRAPH_TEAMMEMBERS_AND_MEALCLASS, attributeNodes = {
    @NamedAttributeNode("mealClass"),
    @NamedAttributeNode("teamMembers")
  }),
  @NamedEntityGraph(name = Team.NAMED_ENTITIY_GRAPH_VISITATIONPLAN, attributeNodes = {
    @NamedAttributeNode("mealClass"),
    @NamedAttributeNode("teamMembers"),
    @NamedAttributeNode(value = "hostTeams", subgraph = "visitationPlanGraph"),
    @NamedAttributeNode(value = "guestTeams", subgraph = "visitationPlanGraph")
  },
   subgraphs = {
    @NamedSubgraph(name = "visiationPlanGraph", 
                   attributeNodes = {
                     @NamedAttributeNode("mealClass"),
                     @NamedAttributeNode("teamMembers")
                   })
   })
})
public class Team extends RunningDinnerRelatedEntity implements Comparable<Team>, HasGeocodingResult {

  private static final long serialVersionUID = -2808246041848437912L;

  public static final String NAMED_ENTITIY_GRAPH_TEAMMEMBERS_AND_MEALCLASS = "NAMED_ENTITIY_GRAPH_TEAMMEMBERS_AND_MEALCLASS";
  public static final String NAMED_ENTITIY_GRAPH_VISITATIONPLAN = "NAMED_ENTITIY_GRAPH_VISITATIONPLAN";

  @Column(nullable = false)
  protected int teamNumber;

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "teamId")
  @BatchSize(size = 30)
  @OrderBy("participantNumber")
  protected Set<Participant> teamMembers = new HashSet<>();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "mealClassId", nullable = false)
  protected MealClass mealClass;

  /**
   * We have two associations to the same entity (Team) by using hostTeams and guestTeams. Therefore we must use ManyToMany association
   * for being able to get two disjunct join-tables.
   */
  @ManyToMany(cascade = CascadeType.REMOVE)
  @JoinTable(name = "HostTeamMapping", joinColumns = @JoinColumn(name = "hostTeamId"), inverseJoinColumns = @JoinColumn(name = "parentTeamId"))
  protected Set<Team> hostTeams = new HashSet<Team>(2); // heuristic assumption, will apply in nearly any case

  /**
   * We have two associations to the same entity (Team) by using hostTeams and guestTeams. Therefore we must use ManyToMany association
   * for being able to get two disjunct join-tables.
   */
  @ManyToMany(cascade = CascadeType.REMOVE)
  @JoinTable(name = "GuestTeamMapping", joinColumns = @JoinColumn(name = "guestTeamId"), inverseJoinColumns = @JoinColumn(name = "parentTeamId"))
  protected Set<Team> guestTeams = new HashSet<Team>(2); // heuristic assumption, will apply in nearly any case

  @Enumerated(EnumType.STRING)
  @Column(length = 32)
  protected TeamStatus status = TeamStatus.OK;

  protected Team() {
    // JPA
  }

  /**
   * Constructs a new team with the passed teamNumber
   * 
   * @param teamNumber
   */
  public Team(int teamNumber) {

    this.teamNumber = teamNumber;
  }

  public Team(RunningDinner runningDinner, int teamNumber) {

    super(runningDinner);
    this.teamNumber = teamNumber;
  }

  /**
   * Returns all participants that are members of this team
   * 
   */
  public Set<Participant> getTeamMembers() {

    return new HashSet<>(teamMembers);
  }


  /**
   * Returns all participants that are members of this team excluding the passed participant
   */
  public Set<Participant> getTeamMembersExcluding(Participant participant) {
    var result = getTeamMembers();
    result.removeIf(p -> p.equals(participant));
    return result;
  }

  public List<Participant> getTeamMembersOrdered() {
    
    List<Participant> result = new ArrayList<>(teamMembers);
    Collections.sort(result);
    return result;
  }
  
  public void removeTeamMember(Participant teamMember) {

    boolean removed = this.teamMembers.remove(teamMember);
    Assert.state(removed, "Could not remove team member " + teamMember);
    teamMember.setTeam(null);
  }
  
  public void removeAllTeamMembers() {
    
    for (Participant teamMember : teamMembers) {
      teamMember.setTeam(null);
    }
    this.teamMembers.clear();
  }
  
  public void addTeamMember(Participant teamMember) {
    
    boolean added = this.teamMembers.add(teamMember);
    Assert.state(added, "Could not add team member " + teamMember);
    teamMember.setTeam(this);
  }

  public void setTeamMembers(Set<Participant> teamMembers) {

    CoreUtil.assertNotNull(teamMembers, "Passed teamMembers must not be empty");
    this.teamMembers.clear();
    this.teamMembers.addAll(teamMembers);
    
    teamMembers.forEach(p -> p.setTeam(this));
  }

  /**
   * Returns the assigned meal of this team. The team is therefore responsible for cooking this meal.
   * 
   * @return
   */
  public MealClass getMealClass() {

    return mealClass;
  }

  public void setMealClass(MealClass mealClass) {

    this.mealClass = mealClass;
  }

  /**
   * Returns the number of this team
   * 
   * @return
   */
  public int getTeamNumber() {

    return teamNumber;
  }

  public TeamStatus getStatus() {

    return status;
  }

  public void setStatus(TeamStatus status) {

    this.status = status;
  }

  /**
   * Retrieves the participant from this team which is marked as host
   * 
   * @return
   */
  public Participant getHostTeamMember() {

    if (status == TeamStatus.CANCELLED) {
      return null;
    }
    
    if (!CoreUtil.isEmpty(teamMembers)) {
      for (Participant p : teamMembers) {
        if (p.isHost()) {
          return p;
        }
      }
    }
    throw new IllegalStateException("Found no host team member for team-nr " + teamNumber + " (" + id + ")");
  }

  public Participant getTeamMemberByParticipantId(final UUID participantId) {

    if (CoreUtil.isEmpty(teamMembers)) {
      return null;
    }
    for (Participant p : teamMembers) {
      if (p.isSameId(participantId)) {
        return p;
      }
    }
    return null;
  }

  /**
   * Returns a list with hosting capabilities of each team member.
   * 
   * @param runningDinnerConfig Must be passed in for determining the hosting capabilities
   * @return E.g. [TRUE, UNKNOWN] for two participants whereas one can act as host and whereas it is unknown for the other team member.
   */
  public List<FuzzyBoolean> getHostingCapability(final RunningDinnerConfig runningDinnerConfig) {

    ArrayList<FuzzyBoolean> result = new ArrayList<FuzzyBoolean>(teamMembers.size());
    for (Participant member : teamMembers) {
      result.add(runningDinnerConfig.canHost(member));
    }
    return result;
  }

  /**
   * Returns the teams which are host for the current team (from the VisitationPlan)
   * 
   * @return
   */
  public Set<Team> getHostTeams() {

    return hostTeams;
  }

  /**
   * Returns the teams which are guest of the current team (from the VisitationPlan)
   * 
   * @return
   */
  public Set<Team> getGuestTeams() {

    return guestTeams;
  }

  public int getNumberOfGuests() {

    return guestTeams.size();
  }

  public int getNumberOfHosts() {

    return hostTeams.size();
  }

  /**
   * Returns true if this team has at least one reference to the passed team
   * 
   * @param team
   * @return
   */
  public boolean containsGuestOrHostReference(final Team team) {

    return guestTeams.contains(team) || hostTeams.contains(team);
  }

  /**
   * Adds the passed team as a host team for this team.<br>
   * This method acts transitive, thus this team is also added as a guest-team to the passed hostTeam.
   * 
   * @param hostTeam
   */
  public void addHostTeam(final Team hostTeam) {

    this.hostTeams.add(hostTeam);
    hostTeam.addGuestTeam(this);
  }

  /**
   * Removes all team-references from this VisitationPlan.<br>
   * Note: This method is NOT transitive meaning that e.g. removed guest-teams are not removed in the host-team reference
   */
  public void removeAllTeamReferences() {

    this.hostTeams.clear();
    this.guestTeams.clear();
  }

  /**
   * Only needed for internal usage.
   * 
   * @param guestTeam
   */
  private void addGuestTeam(final Team guestTeam) {

    this.guestTeams.add(guestTeam);
  }
  
  public List<MealSpecifics> getMealSpecificsOfGuestTeams() {
    
    List<Participant> guestParticipants = this.getGuestTeams()
                                              .stream()
                                              .filter(t -> t.getStatus() != TeamStatus.CANCELLED)
                                              .map(Team::getTeamMembersOrdered)
                                              .flatMap(List::stream)
                                              .toList();

		return guestParticipants
              .stream()
              .filter(Participant::hasMealSpecifics)
              .map(Participant::getMealSpecifics)
              .distinct()
              .collect(Collectors.toList());
  }

  /**
   * This method works only when all associations are loaded!
   */
  public String dumpVisitationPlan() {

    StringBuilder result = new StringBuilder();

    result.append("-> ");
    writeTeams(result, hostTeams);

    result.append(CoreUtil.NEWLINE);
    result.append("<- ");
    writeTeams(result, guestTeams);

    return result.toString();
  }

  private void writeTeams(final StringBuilder buffer, final Set<Team> teams) {

    int cnt = 0;
    for (Team team : teams) {
      if (cnt++ > 0) {
        buffer.append(", ");
      }
      buffer.append(team.toString());
    }
  }
  
  @Override
  public int hashCode() {

    return new HashCodeBuilder(31, 7).append(getTeamNumber()).hashCode();
  }

  @Override
  public boolean equals(Object obj) {

    if (obj == null) {
      return false;
    }
    if (obj == this) {
      return true;
    }
    if (obj.getClass() != getClass()) {
      return false;
    }

    Team other = (Team) obj;
    return new EqualsBuilder().append(getTeamNumber(), other.getTeamNumber()).isEquals();
  }

  @Override
  public String toString() {

    // Be careful: Only valid if mealClass is loaded. We load it however all time in our queries.
    String mealClassStr = mealClass != null ? " - " + mealClass : "";
    return teamNumber + mealClassStr;
  }
  
  public String toStringDetailed() {
  	String teamMembersInfo = teamMembers != null ? getTeamMembersOrdered().toString() : "teamMembers not loaded";
  	return this + ": " + teamMembersInfo;
  }
  
  public static String toStringDetailed(Collection<Team> teams) {
  	
  	return teams
  					.stream()
  					.map(Team::toStringDetailed)
  					.collect(Collectors.joining(","));
  }

  @Override
  public int compareTo(Team o) {

    if (this.getTeamNumber() < o.getTeamNumber()) {
      return -1;
    }
    if (this.getTeamNumber() > o.getTeamNumber()) {
      return 1;
    }
    return 0;
  }

  public Team createDetachedClone(boolean includeGuestAndHostTeams) {

    Team result = new Team(getTeamNumber());

    result.setStatus(status);
    result.setMealClass(mealClass != null ? mealClass.createDetachedClone() : null);

    result.setTeamMembers(
        teamMembers
          .stream()
          .map(p -> p.createDetachedClone(true))
          .collect(Collectors.toSet())
    );

    if (includeGuestAndHostTeams) {
      result.guestTeams = guestTeams
                            .stream()
                            .map(guest -> guest.createDetachedClone(false))
                            .collect(Collectors.toSet());
  
      result.hostTeams = hostTeams
                          .stream()
                          .map(host -> host.createDetachedClone(false))
                          .collect(Collectors.toSet());
    }
    
    return result;
  }

  void setTeamNumber(int teamNumber) {
  	
  	this.teamNumber = teamNumber;
  }

  @Override
	protected void setId(UUID id) {
  	super.setId(id);
  }

	@Override
	public GeocodingResult getGeocodingResult() {
		return this.getHostTeamMember() != null ? this.getHostTeamMember().getGeocodingResult() : null;
	}
}
