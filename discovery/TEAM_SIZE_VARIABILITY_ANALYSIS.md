# Team Size Variability Analysis

## Executive Summary

This document analyzes the RunningDinner codebase to identify all locations where the team size of **2 participants** is hardcoded or assumed. To support variable team sizes (e.g., 3 participants per team), these areas need modification.

**Current State**: Team size is configurable in the data model (`teamSize` field exists) but is hardcoded to 2 in multiple critical areas.

---

## 1. Critical Backend Changes Required

### 1.1 Validation & Configuration

#### **Location**: `CreateRunningDinnerWizardService.java`

- **File**: `runningdinner-backend/src/main/java/org/runningdinner/wizard/CreateRunningDinnerWizardService.java`
- **Lines**: 191-193

```java
if (options.getTeamSize() != 2) {
  throw new ValidationException(new IssueList(new Issue("teamSize", "error.invalid.team.size", IssueType.VALIDATION)));
}
```

**Impact**: 🔴 **CRITICAL** - This explicitly rejects any team size other than 2.  
**Action**: Remove this validation or make it accept a range (e.g., 2-4).

#### **Location**: Default Values

- **Files**:
  - `RunningDinnerConfig.java` (line 211, 268)
  - `BasicRunningDinnerConfiguration.java` (line 21)
  - `OptionsTO.java` (line 19)
  - `CreateWizardService.ts` (line 181)

```java
private int teamSize = 2;
```

**Impact**: 🟡 **MEDIUM** - Default value is fine, but ensure it's truly configurable.  
**Action**: Keep default as 2, but verify no logic depends on this being immutable.

---

### 1.2 Team Partner Wish Logic (2-Person Assumption)

#### **Location**: `TeamPartnerWishTuple.java`

- **File**: `runningdinner-backend/src/main/java/org/runningdinner/participant/partnerwish/TeamPartnerWishTuple.java`
- **Lines**: 15-23

```java
private Participant participant1;
private Participant participant2;

public TeamPartnerWishTuple(Participant participant1, Participant participant2) {
  this.participant1 = participant1;
  this.participant2 = participant2;
}

public Set<Participant> getParticipants() {
  return Sets.newHashSet(participant1, participant2);
}
```

**Impact**: 🔴 **CRITICAL** - Hardcoded to exactly 2 participants.  
**Action**: Refactor to use `List<Participant>` or `Set<Participant>` instead of two fixed fields. This affects:

- Team partner wish registration flow
- Team partner wish matching logic
- Validation in `WaitingListService.java` (line 188): `if (teamPartnerRegistationParticipants.size() != 2)`

#### **Location**: `WaitingListService.java`

- **Lines**: 181, 188-192

```java
List<Participant> participantList = participantsByTeamPartnerRegistrationOriginatorId.getOrDefault(
    p.getTeamPartnerWishOriginatorId(), new ArrayList<>(2)); // <-- Hardcoded capacity

if (teamPartnerRegistationParticipants.size() != 2) {  // <-- Hardcoded check
  LOGGER.error("Cannot use {} for new teams generation...", teamPartnerRegistationParticipants);
  throw new ValidationException(...);
}
```

**Impact**: 🔴 **CRITICAL** - Prevents team partner registration for teams of size != 2.  
**Action**: Change validation to use `runningDinner.getConfiguration().getTeamSize()`.

---

### 1.3 Team Distribution & Generation Logic

#### **Location**: `TeamDistributorHosting.java`

- **File**: `runningdinner-backend/src/main/java/org/runningdinner/core/TeamDistributorHosting.java`
- **Lines**: 62-69

```java
Participant participant1 = getBestMatchingParticipant(FuzzyBoolean.TRUE, null);
FuzzyBoolean toggledHostingCapability = toggleHosting(configuration.canHost(participant1), true);
Participant participant2 = getBestMatchingParticipant(toggledHostingCapability, participant1);

teamMembers.add(participant1);
teamMembers.add(participant2);
```

**Impact**: 🔴 **CRITICAL** - Hardcoded loop to add exactly 2 participants.  
**Action**: Replace with a loop based on `configuration.getTeamSize()`:

```java
for (int j = 0; j < configuration.getTeamSize(); j++) {
  // Logic to get next participant
}
```

#### **Location**: `TeamDistributorHosting.getNextRandomTeamMembers()`

- **Lines**: 150-170 (estimated)

```java
private List<Participant> getNextRandomTeamMembers() {
  // Currently returns exactly 2 participants
}
```

**Impact**: 🔴 **CRITICAL** - Must return `teamSize` participants.  
**Action**: Modify to use `configuration.getTeamSize()` in the loop.

#### **Location**: `TeamDistributorGender.java`

- **Lines**: 60-61

```java
List<Participant> teamMembers = team.getTeamMembersOrdered();
teamSwapActions.addAll(findAllTeamSwapActions(team, teamMembers.get(0), teamPartnerWishTuples));
teamSwapActions.addAll(findAllTeamSwapActions(team, teamMembers.get(1), teamPartnerWishTuples));
```

**Impact**: 🔴 **CRITICAL** - Assumes exactly 2 members when balancing genders.  
**Action**: Loop through all team members:

```java
for (Participant teamMember : teamMembers) {
  teamSwapActions.addAll(findAllTeamSwapActions(team, teamMember, teamPartnerWishTuples));
}
```

---

### 1.4 Team Swapping Logic

#### **Location**: `TeamService.java`

- **Line**: 331

```java
Assert.state(parentTeams.size() == 2, "Retrieved " + parentTeams.size() + " teams, but expected 2 teams");
```

**Impact**: 🟡 **MEDIUM** - This is correct (swapping members between 2 teams), but the assertion message should clarify.  
**Action**: This is actually fine - we're swapping between 2 teams, not checking team member count.

---

### 1.5 Team Calculation & Combination Logic

#### **Location**: `TeamCombinationInfo.java`

- **Line**: 58

```java
final int factorizationLimiter = minimumTeamsNeeded * 2;
```

**Impact**: 🟡 **MEDIUM** - The `* 2` might be related to team size assumptions.  
**Action**: Review this algorithm to ensure it works for teamSize > 2. The comment suggests it's for "handling all possible team size combinations".

#### **Location**: `RunningDinnerCalculator.java`

- **Line**: 206

```java
// This will typically be 0 (= all participants can put into teams => even number of participants)
// or 1 (odd number of participants), or any other number for any teamSize != 2:
int numParticipantOffset = allParticipants.size() % runningDinnerConfig.getTeamSize();
```

**Impact**: 🟢 **LOW** - This already uses `getTeamSize()` correctly.  
**Action**: No change needed, but verify surrounding logic handles teamSize > 2.

---

### 1.6 Database Schema

#### **Location**: `V1.1__CreateBaseTables.sql`

- **Line**: 158

```sql
teamSize int4 not null,
```

**Impact**: 🟢 **LOW** - Database already supports variable team sizes.  
**Action**: No change needed.

---

### 1.7 Team Entity Initialization

#### **Location**: `Team.java`

- **Lines**: 69, 77

```java
protected Set<Team> hostTeams = new HashSet<Team>(2); // heuristic assumption
protected Set<Team> guestTeams = new HashSet<Team>(2); // heuristic assumption
```

**Impact**: 🟢 **LOW** - This is just initial capacity for the Set, not a constraint.  
**Action**: Consider increasing to `3` or `numMeals` for better performance with larger teams.

---

## 2. Critical Frontend Changes Required

### 2.1 UI - Team Size Field (Disabled)

#### **Location**: `OptionsStep.tsx`

- **Line**: 119

```tsx
<FormTextField
  name="teamSize"
  disabled={true}
  label={t("wizard:team_size")}
  variant="outlined"
/>
```

**Impact**: 🔴 **CRITICAL** - Field is disabled, preventing users from changing team size.  
**Action**: Enable the field and add validation (e.g., min: 2, max: 4).

---

### 2.2 Team Partner Registration Assumptions

#### **Location**: Frontend Team Partner Logic

- Multiple files assume exactly 2 participants in team partner registration:
  - `TeamPartnerWishSectionRegistration.tsx`
  - `TeamPartnerWishFormInput.tsx`
  - `hasAllTeamMembersSameTeamPartnerWish()` in `Team.ts` (line 69)

**Impact**: 🔴 **CRITICAL** - Team partner wish registration only supports 2 participants.  
**Action**:

- Update UI to allow registering multiple team partners (up to `teamSize - 1`)
- Modify `TeamPartnerWishRegistrationData` to support multiple participants
- Update backend `TeamPartnerWishRegistrationDataTO` to accept an array

---

### 2.3 Team Display & Calculations

#### **Location**: Various UI Components

```typescript
// shared/src/admin/teams/NumberOfAssignableParticipantsToReplaceTeamHook.js (line 5)
return runningDinner.options.teamSize - numNotAssignedParticipantsLength;

// shared/src/admin/teams/TeamsNotExistingHook.ts (line 70)
numExpectedTeams: numAssignableParticipants / runningDinner.options.teamSize,

// shared/src/admin/RunningDinnerService.ts (line 124)
return numMeals * numMeals * teamSize;
```

**Impact**: 🟢 **LOW** - These already use the dynamic `teamSize` value.  
**Action**: Verify these calculations work correctly for teamSize > 2.

---

### 2.4 Waitlist & Team Replacement Logic

#### **Location**: `WaitingListService.ts`

- **Lines**: 125-133

```typescript
export function getNumCancelledTeamMembers(
  team: Team,
  numSelectedParticipants: number,
  teamSizeOfRunningDinner: number
) {
  const teamMembers = team.teamMembers.filter(
    (tm) => !isParticipantCancelled(tm)
  );
  let numCancelledTeamMembers =
    teamSizeOfRunningDinner - teamMembers.length - numSelectedParticipants;
  return Math.max(0, numCancelledTeamMembers);
}
```

**Impact**: 🟢 **LOW** - Already uses dynamic `teamSizeOfRunningDinner`.  
**Action**: No change needed.

---

## 3. Testing Implications

### 3.1 Test Files Assuming Team Size = 2

#### **Location**: Multiple Test Files

- `TeamPartnerRegistrationTest.java` - Tests team partner registration with 2 participants
- `RunningDinnerCalculatorTest.java` (lines 173-194) - Tests team generation with hardcoded pairs
- `TeamServiceTest.java` - Tests team operations with 2 members
- `TeamRouteBuilderTest.java` (line 63) - `assertThat(seenTeamsOfTeam4).hasSize(2);`

**Impact**: 🟡 **MEDIUM** - Tests will fail or need updates for teamSize > 2.  
**Action**:

- Add parameterized tests for different team sizes (2, 3, 4)
- Update existing tests to use configurable team size
- Create specific test cases for team size = 3

---

## 4. Business Logic Implications

### 4.1 Gender Distribution

**Current Logic**: `TeamDistributorGender` tries to balance genders across 2-person teams (male/female pairing).

**With 3-person teams**: What's the desired behavior?

- Option A: 2 of one gender, 1 of another?
- Option B: Ignore gender distribution for 3+ person teams?
- Option C: Try to maximize diversity (e.g., 2 females, 1 male or 2 males, 1 female)?

**Action Required**: Define business rules for gender distribution with teamSize > 2.

---

### 4.2 Hosting Distribution

**Current Logic**: `TeamDistributorHosting` tries to pair one hosting-capable participant with one non-hosting participant.

**With 3-person teams**:

- Need at least 1 hosting-capable person per team
- Algorithm needs adjustment to handle 3-person teams

**Action Required**: Update `TeamDistributorHosting.calculateTeams()` to handle variable team sizes.

---

### 4.3 Dinner Route Calculations

**Location**: `TeamCombinationInfo.java` and dinner plan generators

**Current Logic**: Calculates minimum teams needed as `numMeals * numMeals`.

**With larger teams**:

- Fewer teams will be created (e.g., 30 participants = 15 teams with size 2, but 10 teams with size 3)
- This affects dinner route complexity and meeting patterns

**Action Required**:

- Verify dinner route algorithm works with different team sizes
- Test minimum participant requirements with teamSize = 3

---

### 4.4 Team Partner Wish Matching

**Current Logic**: Matches pairs of participants who want to be in the same team.

**With 3-person teams**:

- Need to support 2 people wishing to be together, with a 3rd random participant
- OR support groups of 3 wishing to be together

**Action Required**:

- Define business rules for team partner wishes with teamSize > 2
- Update `TeamPartnerWishTuple` to support flexible group sizes
- Update matching algorithm in `TeamPartnerWishService`

---

## 5. Recommended Implementation Approach

### Phase 1: Backend Foundation (High Priority)

1. ✅ Remove validation in `CreateRunningDinnerWizardService` (line 191)
2. ✅ Refactor `TeamPartnerWishTuple` to use List/Set instead of participant1/participant2
3. ✅ Update `TeamDistributorHosting` to use loops based on `teamSize`
4. ✅ Update `TeamDistributorGender` to iterate over all team members
5. ✅ Fix `WaitingListService` validation (line 188)

### Phase 2: Frontend Foundation (High Priority)

1. ✅ Enable `teamSize` field in `OptionsStep.tsx`
2. ✅ Add validation for teamSize (e.g., 2-4)
3. ✅ Update team partner registration UI to support variable sizes

### Phase 3: Business Rules (Medium Priority)

1. ✅ Define gender distribution rules for 3+ person teams
2. ✅ Define team partner wish rules for 3+ person teams
3. ✅ Update hosting distribution algorithm
4. ✅ Verify dinner route calculations

### Phase 4: Testing (Medium Priority)

1. ✅ Create parameterized tests for different team sizes
2. ✅ Update existing tests
3. ✅ Add integration tests for end-to-end flows with teamSize = 3

### Phase 5: Edge Cases (Low Priority)

1. ✅ Handle odd number of participants with teamSize = 3
2. ✅ Update error messages and translations
3. ✅ Update documentation

---

## 6. Potential Breaking Changes

### 6.1 API Changes

- `TeamPartnerWishRegistrationDataTO` might need to become an array
- Response structures might change if team partner logic changes

### 6.2 Database Migrations

- Likely no schema changes needed (teamSize field already exists)
- Might need data migration if team partner wish storage changes

### 6.3 Existing Data

- Running dinners created with teamSize=2 should continue to work
- Need to handle migration of team partner wish data if structure changes

---

## 7. Quick Reference: All Files Requiring Changes

### Backend (Java)

1. 🔴 `CreateRunningDinnerWizardService.java` - Remove validation
2. 🔴 `TeamPartnerWishTuple.java` - Refactor to List
3. 🔴 `TeamDistributorHosting.java` - Use teamSize in loops
4. 🔴 `TeamDistributorGender.java` - Iterate all members
5. 🔴 `WaitingListService.java` - Fix validation
6. 🟡 `TeamCombinationInfo.java` - Verify algorithm
7. 🟡 `ParticipantService.java` - Update team partner handling

### Frontend (TypeScript/React)

1. 🔴 `OptionsStep.tsx` - Enable teamSize field
2. 🔴 `TeamPartnerWishSectionRegistration.tsx` - Support multiple partners
3. 🔴 `TeamPartnerWishRegistrationDataTO.ts` - Update type definition
4. 🟡 `Team.ts` - Update utility functions
5. 🟡 Various UI components displaying teams

### Tests

1. 🟡 `RunningDinnerCalculatorTest.java`
2. 🟡 `TeamServiceTest.java`
3. 🟡 `TeamPartnerRegistrationTest.java`
4. 🟡 All E2E tests in `e2e-tests/`

---

## 8. Conclusion

**Feasibility**: ✅ Implementing variable team sizes is **feasible** but requires significant refactoring.

**Effort Estimate**:

- **High Priority Changes**: ~3-5 days
- **Complete Implementation**: ~10-15 days
- **Testing & Validation**: ~5 days

**Biggest Challenges**:

1. **Team Partner Wish Logic**: Currently deeply tied to 2-person tuples
2. **Gender Distribution**: Unclear business rules for 3+ person teams
3. **Testing Coverage**: Need comprehensive tests for different team sizes

**Recommendation**: Start with Phase 1 (backend foundation) to unblock the feature, then tackle team partner wish logic as a separate work stream.
