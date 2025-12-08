# Preferred Meal Wish Feature - Comprehensive Analysis & Implementation Plan

**Date:** December 8, 2025  
**Feature Request:** Allow participants to specify their preferred meal wish during registration and enable administrators to edit this preference.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Current System Analysis](#current-system-analysis)
3. [Database Changes](#database-changes)
4. [Backend Changes](#backend-changes)
5. [Frontend Changes](#frontend-changes)
6. [Team Generation Algorithm Updates](#team-generation-algorithm-updates)
7. [Edge Cases & Considerations](#edge-cases--considerations)
8. [Implementation Plan](#implementation-plan)
9. [Testing Strategy](#testing-strategy)

---

## Feature Overview

### Requirements

1. **Participant Registration**: Participants should be able to optionally select their preferred meal during self-registration
2. **Optional Setting**: This must be optional (not mandatory) to avoid forcing users to make a selection
3. **UX Consideration**: Similar to team partner wish, use a dialog/expandable section to signal this option without cluttering the main form
4. **Admin Edit**: Administrators must be able to view and edit meal preferences for participants
5. **Team Generation**: The preferred meal wish should influence team generation and meal assignment
6. **Meal Configuration Changes**: When administrators change meal settings (2→3 or 3→2 meals), the system should handle existing preferences appropriately

### Current Similar Feature: Team Partner Wish

The team partner wish feature provides a good reference pattern:

- Optional selection with expandable UI
- Stored in Participant entity
- Considered during team generation (see `TeamDistributorHosting.generateFixedTeamsForTeamPartnerWishes()`)
- Accessible in both registration and admin forms

---

## Current System Analysis

### 1. Data Models

#### Participant Entity

**Location:** `runningdinner-backend/src/main/java/org/runningdinner/participant/Participant.java`

**Current meal-related fields:**

```java
@Embedded
@AttributeOverride(name = "mealSpecificsNote", column = @Column(name = "mealspecificsnote"))
private MealSpecifics mealSpecifics = new MealSpecifics();
```

**Note:** `MealSpecifics` stores dietary restrictions (vegetarian, vegan, lactose, gluten) - NOT meal preferences for cooking.

#### Team Entity

**Location:** `runningdinner-backend/src/main/java/org/runningdinner/participant/Team.java`

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "mealClassId", nullable = false)
protected MealClass mealClass;
```

Each team is assigned exactly one `MealClass` (meal they will cook).

#### MealClass Entity

**Location:** `runningdinner-backend/src/main/java/org/runningdinner/core/MealClass.java`

```java
@Entity
public final class MealClass extends AbstractEntity {
  @Column(nullable = false)
  @NotBlank
  private String label;

  @Column(nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  @NotNull
  private LocalDateTime time;
}
```

Represents a meal type (e.g., "Vorspeise", "Hauptspeise", "Nachspeise").

### 2. Team Generation Flow

**Location:** `runningdinner-backend/src/main/java/org/runningdinner/core/RunningDinnerCalculator.java`

```java
public GeneratedTeamsResult generateTeams(
    final RunningDinnerConfig runningDinnerConfig,
    final List<Participant> participants,
    final List<TeamTO> existingTeamsToKeep,
    final ParticipantListRandomizer participantListRandomizer)
    throws NoPossibleRunningDinnerException
```

**Steps:**

1. **Team Formation** (`buildRegularTeams`):
   - `TeamDistributorHosting`: Groups participants into teams based on hosting capacity
   - `TeamDistributorGender`: Optimizes gender distribution
   - Fixed teams created first for team partner wishes
2. **Meal Assignment** (`assignRandomMealClasses`):

   - Currently **completely random** distribution
   - Divides teams evenly across available meals
   - Example: 18 teams, 3 meals → 6 teams per meal

3. **Visitation Plan** (`StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan`):
   - Creates dinner routes for each team

### 3. Current Forms & UI

#### Registration Form (Public)

**Location:** `runningdinner-client/webapp/src/landing/PublicDinnerEventRegistrationForm.tsx`

**Structure:**

```tsx
<PersonalDataSection />
<AddressSection />
<MealSpecificsSection />  // Dietary restrictions
<TeamPartnerWishSectionRegistration />  // Optional, expandable
<MiscSection />
```

#### Admin Participant Form

**Location:** `runningdinner-client/webapp/src/admin/participants/form/ParticipantForm.tsx`

**Structure:**

```tsx
<PersonalDataSection />
<AddressSection />
<MealSpecificsSection />
<TeamPartnerWishSectionAdmin />  // Optional
<MiscSection />
```

#### Team Partner Wish Pattern

**Location:** `runningdinner-client/webapp/src/admin/participants/form/TeamPartnerWishSectionRegistration.tsx`

- Radio button selection (NONE / INVITATION / REGISTRATION)
- Opens dialog for detailed input
- Clear "optional" signaling
- Validates and stores data in `teamPartnerWishEmail` or `teamPartnerWishRegistrationData`

---

## Database Changes

### New Column in Participant Table

**Migration File:** `V2.11__AddPreferredMealWish.sql`

```sql
ALTER TABLE Participant
ADD COLUMN preferredMealClassId uuid;

ALTER TABLE Participant
ADD CONSTRAINT fk_participant_preferred_meal
FOREIGN KEY (preferredMealClassId)
REFERENCES MealClass(id)
ON DELETE SET NULL;  -- When meal is deleted, preference is cleared

CREATE INDEX idx_participant_preferred_meal
ON Participant(preferredMealClassId);

COMMENT ON COLUMN Participant.preferredMealClassId IS
'Optional: The meal that the participant prefers to cook';
```

**Rationale:**

- **Foreign Key to MealClass**: Ensures referential integrity and allows preferences to reference actual configured meals
- **ON DELETE SET NULL**: When a meal is removed (e.g., admin changes from 3→2 meals), preferences are automatically cleared
- **Nullable**: Makes the preference truly optional
- **Index**: Improves query performance when filtering/grouping by meal preference during team generation

---

## Backend Changes

### 1. Participant Entity Update

**File:** `runningdinner-backend/src/main/java/org/runningdinner/participant/Participant.java`

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "preferredMealClassId", nullable = true)
private MealClass preferredMealClass;

public MealClass getPreferredMealClass() {
    return preferredMealClass;
}

public void setPreferredMealClass(MealClass preferredMealClass) {
    this.preferredMealClass = preferredMealClass;
}

public boolean hasPreferredMealClass() {
    return preferredMealClass != null;
}
```

### 2. Transfer Objects (TOs) Update

**Files to Update:**

#### ParticipantTO.java

```java
// Add field
private MealTO preferredMeal;

// Add getter/setter
public MealTO getPreferredMeal() {
    return preferredMeal;
}

public void setPreferredMeal(MealTO preferredMeal) {
    this.preferredMeal = preferredMeal;
}
```

#### ParticipantInputDataTO.java

```java
// Add field
private MealTO preferredMeal;

// Mapping in conversion methods
```

#### BaseParticipantTO.java

Consider adding here if it should be available in all participant representations.

### 3. ParticipantService Updates

**File:** `runningdinner-backend/src/main/java/org/runningdinner/participant/ParticipantService.java`

**Update save methods:**

```java
private void updateParticipantEntity(Participant participant,
                                     ParticipantInputDataTO participantData,
                                     RunningDinner runningDinner) {
    // ... existing code ...

    // Handle preferred meal
    if (participantData.getPreferredMeal() != null &&
        participantData.getPreferredMeal().getId() != null) {
        UUID preferredMealId = participantData.getPreferredMeal().getId();
        MealClass preferredMeal = runningDinner.getConfiguration()
            .getMealClasses()
            .stream()
            .filter(m -> m.getId().equals(preferredMealId))
            .findFirst()
            .orElse(null);
        participant.setPreferredMealClass(preferredMeal);
    } else {
        participant.setPreferredMealClass(null);
    }
}
```

**Add validation:**

```java
private void validatePreferredMeal(ParticipantInputDataTO participantData,
                                    RunningDinner runningDinner) {
    if (participantData.getPreferredMeal() == null) {
        return; // Optional field
    }

    UUID preferredMealId = participantData.getPreferredMeal().getId();
    boolean mealExists = runningDinner.getConfiguration()
        .getMealClasses()
        .stream()
        .anyMatch(m -> m.getId().equals(preferredMealId));

    if (!mealExists) {
        throw new ValidationException(
            new IssueList(new Issue("preferred_meal_invalid", IssueType.VALIDATION))
        );
    }
}
```

### 4. Team Generation Algorithm Updates

**File:** `runningdinner-backend/src/main/java/org/runningdinner/core/RunningDinnerCalculator.java`

#### Update `assignRandomMealClasses` method:

```java
public void assignRandomMealClasses(final GeneratedTeamsResult generatedTeams,
                                    final RunningDinnerConfig runningDinnerConfig,
                                    final List<TeamTO> existingTeamsToKeep)
                                    throws NoPossibleRunningDinnerException {
    final Collection<MealClass> mealClasses = runningDinnerConfig.getMealClasses();

    if (CollectionUtils.isEmpty(existingTeamsToKeep)) {
        assignMealClassesWithPreferences(generatedTeams.getRegularTeams(), mealClasses);
        return;
    }

    // ... existing logic for keeping existing teams ...
}
```

#### New method for preference-based assignment:

```java
/**
 * Assigns meal classes to teams, considering participant preferences where possible.
 * Teams are assigned in three phases:
 * 1. Teams where ALL members prefer the same meal
 * 2. Teams where SOME members have a preference (majority wins)
 * 3. Remaining teams get random assignment
 */
private void assignMealClassesWithPreferences(final List<Team> regularTeams,
                                               final Collection<MealClass> mealClasses)
                                               throws NoPossibleRunningDinnerException {

    int numTeams = regularTeams.size();
    int numMeals = mealClasses.size();
    int segmentSize = numTeams / numMeals;

    // Shuffle to randomize, but we'll override with preferences
    Collections.shuffle(regularTeams);

    // Track how many teams per meal
    Map<MealClass, Integer> mealAssignmentCount = new HashMap<>();
    mealClasses.forEach(meal -> mealAssignmentCount.put(meal, 0));

    List<Team> unassignedTeams = new ArrayList<>(regularTeams);

    // Phase 1: Assign teams with unanimous preferences
    assignTeamsWithUnanimousPreference(unassignedTeams, mealClasses,
                                       mealAssignmentCount, segmentSize);

    // Phase 2: Assign teams with partial preferences
    assignTeamsWithPartialPreference(unassignedTeams, mealClasses,
                                     mealAssignmentCount, segmentSize);

    // Phase 3: Assign remaining teams randomly
    assignRemainingTeamsRandomly(unassignedTeams, mealClasses,
                                 mealAssignmentCount, segmentSize);

    // Sort by team number
    Collections.sort(regularTeams);
}

private void assignTeamsWithUnanimousPreference(List<Team> unassignedTeams,
                                                 Collection<MealClass> mealClasses,
                                                 Map<MealClass, Integer> mealAssignmentCount,
                                                 int maxPerMeal) {
    Iterator<Team> iterator = unassignedTeams.iterator();
    while (iterator.hasNext()) {
        Team team = iterator.next();
        Optional<MealClass> unanimousPreference = getUnanimousMealPreference(team);

        if (unanimousPreference.isPresent()) {
            MealClass preferredMeal = unanimousPreference.get();
            if (mealAssignmentCount.get(preferredMeal) < maxPerMeal) {
                team.setMealClass(preferredMeal);
                mealAssignmentCount.put(preferredMeal,
                                        mealAssignmentCount.get(preferredMeal) + 1);
                iterator.remove();
            }
        }
    }
}

private Optional<MealClass> getUnanimousMealPreference(Team team) {
    List<MealClass> preferences = team.getTeamMembers()
        .stream()
        .filter(p -> p.hasPreferredMealClass())
        .map(Participant::getPreferredMealClass)
        .distinct()
        .collect(Collectors.toList());

    // Return meal only if all members with preference want the same meal
    // and at least one member has a preference
    if (preferences.size() == 1) {
        return Optional.of(preferences.get(0));
    }
    return Optional.empty();
}

private void assignTeamsWithPartialPreference(List<Team> unassignedTeams,
                                               Collection<MealClass> mealClasses,
                                               Map<MealClass, Integer> mealAssignmentCount,
                                               int maxPerMeal) {
    Iterator<Team> iterator = unassignedTeams.iterator();
    while (iterator.hasNext()) {
        Team team = iterator.next();
        Optional<MealClass> majorityPreference = getMajorityMealPreference(team);

        if (majorityPreference.isPresent()) {
            MealClass preferredMeal = majorityPreference.get();
            if (mealAssignmentCount.get(preferredMeal) < maxPerMeal) {
                team.setMealClass(preferredMeal);
                mealAssignmentCount.put(preferredMeal,
                                        mealAssignmentCount.get(preferredMeal) + 1);
                iterator.remove();
            }
        }
    }
}

private Optional<MealClass> getMajorityMealPreference(Team team) {
    Map<MealClass, Long> preferenceCounts = team.getTeamMembers()
        .stream()
        .filter(p -> p.hasPreferredMealClass())
        .collect(Collectors.groupingBy(
            Participant::getPreferredMealClass,
            Collectors.counting()
        ));

    if (preferenceCounts.isEmpty()) {
        return Optional.empty();
    }

    // Find the meal with most preferences
    return preferenceCounts.entrySet()
        .stream()
        .max(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey);
}

private void assignRemainingTeamsRandomly(List<Team> unassignedTeams,
                                          Collection<MealClass> mealClasses,
                                          Map<MealClass, Integer> mealAssignmentCount,
                                          int maxPerMeal) {
    List<MealClass> mealList = new ArrayList<>(mealClasses);

    for (Team team : unassignedTeams) {
        // Find meal with fewest assignments
        MealClass leastAssignedMeal = mealList.stream()
            .min(Comparator.comparing(mealAssignmentCount::get))
            .orElseThrow();

        team.setMealClass(leastAssignedMeal);
        mealAssignmentCount.put(leastAssignedMeal,
                                mealAssignmentCount.get(leastAssignedMeal) + 1);
    }
}
```

### 5. Meal Configuration Change Handling

**File:** `runningdinner-backend/src/main/java/org/runningdinner/admin/RunningDinnerService.java`

**Update `updateMeals` method:**

```java
@Transactional
public RunningDinner updateMeals(@ValidateAdminId String adminId,
                                 Collection<MealClass> incomingMeals) {
    RunningDinner dinner = findRunningDinnerByAdminId(adminId);
    List<MealClass> existingMeals = dinner.getConfiguration().getMealClasses();

    // ... existing meal update logic ...

    // Handle participant meal preferences when meals are deleted
    if (!mealsToDelete.isEmpty()) {
        clearPreferencesForDeletedMeals(adminId, mealsToDelete);
    }

    // ... rest of existing logic ...
}

private void clearPreferencesForDeletedMeals(String adminId,
                                             List<MealClass> deletedMeals) {
    Set<UUID> deletedMealIds = deletedMeals.stream()
        .map(MealClass::getId)
        .collect(Collectors.toSet());

    List<Participant> participants = participantService.findParticipants(adminId, false);

    for (Participant participant : participants) {
        if (participant.hasPreferredMealClass() &&
            deletedMealIds.contains(participant.getPreferredMealClass().getId())) {
            participant.setPreferredMealClass(null);
        }
    }

    participantRepository.saveAll(participants);

    LOGGER.info("Cleared meal preferences for {} participants due to meal deletion",
                participants.size());
}
```

**Note:** The database ON DELETE SET NULL constraint will also handle this automatically, but explicit clearing provides better logging and control.

---

## Frontend Changes

### 1. Type Definitions

**File:** `runningdinner-client/shared/src/types/Participant.ts`

```typescript
export interface Participant
  extends BaseEntity,
    HasGeocoding,
    MealSpecifics,
    ParticipantName {
  participantNumber?: number;
  gender: string;
  mobileNumber: string;
  email: string;
  street: string;
  streetNr: string;
  zip: string;
  cityName: string;
  age: number;
  numSeats: number;
  addressRemarks: string;
  notes: string;
  teamId?: string;
  teamPartnerWishEmail?: string;
  teamPartnerWishOriginatorId?: string;
  activationDate?: Date;

  // NEW FIELD
  preferredMeal?: Meal;
}

export interface ParticipantFormModel extends Participant {
  teamPartnerWishRegistrationData?: TeamPartnerWishRegistrationData;
}
```

**Update empty participant:**

```typescript
const EMPTY_PARTICIPANT: Participant = {
  // ... existing fields ...
  preferredMeal: undefined, // NEW
};
```

### 2. Registration Form Component

**New File:** `runningdinner-client/webapp/src/admin/participants/form/PreferredMealWishSection.tsx`

```tsx
import React from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Grid,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Meal } from "@runningdinner/shared";
import FormFieldset from "../../../common/theme/FormFieldset";
import { Span } from "../../../common/theme/typography/Tags";

export interface PreferredMealWishSectionProps {
  availableMeals: Meal[];
  disabled?: boolean;
}

export function PreferredMealWishSection({
  availableMeals,
  disabled = false,
}: PreferredMealWishSectionProps) {
  const { t } = useTranslation(["common", "landing"]);
  const { register, watch, setValue } = useFormContext();

  const selectedMealId = watch("preferredMeal.id");

  const handleMealChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mealId = event.target.value;
    if (mealId === "NONE") {
      setValue("preferredMeal", null);
    } else {
      const selectedMeal = availableMeals.find((m) => m.id === mealId);
      setValue("preferredMeal", selectedMeal);
    }
  };

  if (availableMeals.length < 2) {
    return null; // Don't show if there's only one meal
  }

  return (
    <FormFieldset>
      <Box mb={2}>
        <Span i18n={"landing:preferred_meal_wish_headline"} />
      </Box>
      <FormControl component="fieldset" disabled={disabled}>
        <FormHelperText>{t("landing:preferred_meal_wish_help")}</FormHelperText>
        <RadioGroup
          value={selectedMealId || "NONE"}
          onChange={handleMealChange}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                value="NONE"
                control={<Radio />}
                label={t("common:no_preference")}
              />
            </Grid>
            {availableMeals.map((meal) => (
              <Grid item xs={12} key={meal.id}>
                <FormControlLabel
                  value={meal.id}
                  control={<Radio />}
                  label={t("landing:prefer_to_cook", { meal: meal.label })}
                />
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </FormControl>
    </FormFieldset>
  );
}
```

### 3. Update Registration Form

**File:** `runningdinner-client/webapp/src/landing/PublicDinnerEventRegistrationForm.tsx`

```tsx
import { PreferredMealWishSection } from '../admin/participants/form/PreferredMealWishSection';

function PublicDinnerEventRegistrationForm({
  onCancel,
  onRegistrationPerformed,
  publicRunningDinner,
  prefilledRegistrationData
}: RegistrationFormProps) {
  // ... existing code ...

  const { meals } = publicRunningDinner;

  return (
    // ... existing JSX ...
    <Box mb={3}>
      <AddressSection
        headline={t('common:address_data')}
        isNumSeatsRequired={true}
        addressRemarksHelperText={t('landing:address_remarks_help')}
      />
    </Box>
    <Box mb={3}>
      <MealSpecificsSection />
    </Box>
    {/* NEW SECTION */}
    <Box mb={3}>
      <PreferredMealWishSection availableMeals={meals} />
    </Box>
    <Box mb={3}>
      {!teamPartnerWishDisabled && (
        <TeamPartnerWishSectionRegistration
          invitingParticipantEmail={invitingParticipantEmail}
          publicDinnerId={publicDinnerId}
        />
      )}
    </Box>
    // ... rest of form ...
  );
}
```

### 4. Update Admin Participant Form

**File:** `runningdinner-client/webapp/src/admin/participants/form/ParticipantForm.tsx`

```tsx
import { PreferredMealWishSection } from "./PreferredMealWishSection";
import {
  useRunningDinnerSelector,
  getRunningDinnerSelector,
} from "@runningdinner/shared";

export default function ParticipantForm({
  participant,
  adminId,
  onParticipantSaved,
  onParticipantDeleted,
  teamPartnerWishDisabled,
}: ParticipantFormProps) {
  // ... existing code ...

  const runningDinner = useRunningDinnerSelector(getRunningDinnerSelector);
  const meals = runningDinner?.options?.meals || [];

  return (
    <Paper elevation={3}>
      <Box p={2}>
        <FormProvider {...formMethods}>
          <form>
            {/* ... existing sections ... */}

            {!teamPartnerWishChild && (
              <>
                <Box mb={3}>
                  <AddressSection isNumSeatsRequired={true} />
                </Box>
                <Box mb={3}>
                  <MealSpecificsSection />
                </Box>
                {/* NEW SECTION */}
                <Box mb={3}>
                  <PreferredMealWishSection availableMeals={meals} />
                </Box>
              </>
            )}

            {/* ... rest of form ... */}
          </form>
        </FormProvider>
      </Box>
    </Paper>
  );
}
```

### 5. I18n Translations

**Files:**

- `runningdinner-client/shared/src/i18n/translations/de/LandingMessages_lang_de.ts`
- `runningdinner-client/shared/src/i18n/translations/en/LandingMessages_lang_en.ts`

**German:**

```typescript
preferred_meal_wish_headline: 'Welche Mahlzeit möchtest du gerne kochen? (Optional)',
preferred_meal_wish_help: 'Du kannst hier angeben, welche Mahlzeit du bevorzugt kochen möchtest. Wir versuchen dies bei der Teameinteilung zu berücksichtigen, können aber keine Garantie geben.',
prefer_to_cook: 'Ich würde gerne {{meal}} kochen',
no_preference: 'Keine Präferenz',
```

**English:**

```typescript
preferred_meal_wish_headline: 'Which meal would you prefer to cook? (Optional)',
preferred_meal_wish_help: 'You can indicate which meal you would prefer to cook. We will try to consider this when forming teams, but cannot guarantee it.',
prefer_to_cook: 'I would like to cook {{meal}}',
no_preference: 'No preference',
```

**Common translations:**

```typescript
// In CommonMessages_lang_de.ts / CommonMessages_lang_en.ts
preferred_meal: 'Bevorzugte Mahlzeit' / 'Preferred Meal',
```

### 6. Display in Participant Lists

**File:** `runningdinner-client/webapp/src/admin/participants/ParticipantsList.tsx`

Add a column or detail view to show preferred meal:

```tsx
// In participant detail view or tooltip
{
  participant.preferredMeal && (
    <Box>
      <Typography variant="caption">
        {t("common:preferred_meal")}: {participant.preferredMeal.label}
      </Typography>
    </Box>
  );
}
```

---

## Team Generation Algorithm Updates

### Algorithm Overview

The updated `assignMealClassesWithPreferences` method uses a three-phase approach:

#### Phase 1: Unanimous Preferences

- Find teams where **ALL** members who have a preference want the same meal
- Assign these teams first to maximize satisfaction
- Only assign if the meal quota isn't exceeded

#### Phase 2: Partial Preferences

- Find teams where **SOME** members have preferences
- Use majority vote (meal with most member preferences)
- Assign if quota allows

#### Phase 3: Random Assignment

- Remaining teams get assigned to meals with fewest assignments
- Maintains balanced distribution

### Example Scenario

**Setup:**

- 18 participants → 9 teams
- 3 meals (Appetizer, Main, Dessert)
- Expected: 3 teams per meal

**Preferences:**

- Team 1: Both members prefer Appetizer ✅ **Phase 1**
- Team 2: One prefers Main, one has no preference ✅ **Phase 2**
- Team 3: One prefers Appetizer, one prefers Dessert ❌ **Phase 3** (conflicting)
- Team 4: No preferences ❌ **Phase 3**
- Team 5: Both prefer Dessert ✅ **Phase 1**
- ... etc.

**Result:**

```
Appetizer: Teams 1, 3, 6 (1 with unanimous preference, 2 random)
Main:      Teams 2, 4, 7 (1 with partial preference, 2 random)
Dessert:   Teams 5, 8, 9 (1 with unanimous preference, 2 random)
```

### Constraints & Guarantees

**Guaranteed:**

- Equal distribution across meals (as before)
- Preferences considered **when possible**
- Teams with unanimous preferences get highest priority

**NOT Guaranteed:**

- Every participant gets their preferred meal
- Reason: Physical constraints (need equal distribution)

**Fairness:**

- If too many participants prefer one meal, some will be disappointed
- Example: 12 participants prefer Appetizer, but only 6 team slots available
- Solution: First-come-first-served during team formation phase

---

## Edge Cases & Considerations

### 1. Meal Configuration Changes

**Scenario:** Admin changes meals from 3→2 or 2→3

**Impact:**

- Database constraint `ON DELETE SET NULL` automatically clears preferences for deleted meals
- Additional service-level clearing for better logging
- When meals are added, participants can update their preference

**Handling:**

```java
// In RunningDinnerService.updateMeals()
if (!mealsToDelete.isEmpty()) {
    clearPreferencesForDeletedMeals(adminId, mealsToDelete);
    LOGGER.info("Cleared preferences for {} deleted meals", mealsToDelete.size());
}
```

### 2. Team Partner Wishes + Meal Preferences

**Scenario:** Two participants register as team partners but have different meal preferences

**Handling:**

- Team formation takes precedence over meal preference
- Use majority/first preference in the team
- Document this limitation in help text

```typescript
preferred_meal_wish_help_with_partner: "Hinweis: Wenn du dich mit einem Teampartner anmeldest und ihr unterschiedliche Mahlzeiten-Wünsche habt, kann nur einer berücksichtigt werden.";
```

### 3. Unbalanced Preferences

**Scenario:** 80% of participants prefer Appetizer

**Handling:**

- Algorithm assigns as many as possible to Appetizer (up to quota)
- Remaining teams get other meals
- Clear communication: "We **try** to consider preferences"

### 4. Late Registration Changes

**Scenario:** Participant changes preference after teams are generated

**Handling:**

- Allow preference update in admin UI
- Display warning: "Teams bereits generiert - Änderung erfordert Neugenerierung"
- Regenerating teams will consider new preference

### 5. No Meals Available (Edge Case)

**Scenario:** Display preference section when only 1 meal configured

**Handling:**

```tsx
if (availableMeals.length < 2) {
  return null; // Don't show preference section
}
```

### 6. Import/Export

**Scenario:** CSV/JSON import of participants

**Update Required:**

- Add `preferredMeal` to export format
- Handle import with meal ID/label matching
- Validate that referenced meals exist

**File:** `runningdinner-backend/src/main/java/org/runningdinner/dataimport/ParticipantFromCsvImporter.java`

### 7. Migration of Existing Data

**No action needed:**

- New column is nullable
- Existing participants will have `NULL` preference
- No breaking changes

---

## Implementation Plan

### Phase 1: Backend Foundation (Week 1)

#### Day 1-2: Database & Core Entities

- [ ] Create migration `V2.11__AddPreferredMealWish.sql`
- [ ] Run migration on dev database
- [ ] Update `Participant` entity with `preferredMealClass` field
- [ ] Add getters, setters, `hasPreferredMealClass()` method
- [ ] Update `createDetachedClone()` to include preference

#### Day 3-4: Transfer Objects & Services

- [ ] Update `ParticipantTO`
- [ ] Update `ParticipantInputDataTO`
- [ ] Update `BaseParticipantTO` (if needed)
- [ ] Update `ParticipantService.updateParticipantEntity()` to handle preference
- [ ] Add validation for preferred meal (must exist in dinner configuration)
- [ ] Update registration flow to accept preference

#### Day 5: Meal Configuration Handling

- [ ] Update `RunningDinnerService.updateMeals()` to clear preferences on meal deletion
- [ ] Add logging for preference clearing
- [ ] Write unit tests for meal deletion scenarios

### Phase 2: Team Generation Algorithm (Week 2)

#### Day 1-2: Core Algorithm

- [ ] Implement `assignMealClassesWithPreferences()` method
- [ ] Implement `getUnanimousMealPreference()` helper
- [ ] Implement `getMajorityMealPreference()` helper
- [ ] Implement three-phase assignment logic

#### Day 3: Integration & Testing

- [ ] Update `assignRandomMealClasses()` to call new method
- [ ] Write unit tests for preference-based assignment
- [ ] Test edge cases (all prefer same meal, conflicting preferences, etc.)
- [ ] Test with existing team keeping logic

#### Day 4-5: Backend Testing

- [ ] Integration tests for participant save with preference
- [ ] Integration tests for team generation with preferences
- [ ] Test meal configuration changes
- [ ] Performance testing with large participant numbers

### Phase 3: Frontend Implementation (Week 3)

#### Day 1-2: Type Definitions & Components

- [ ] Update `Participant` type in TypeScript
- [ ] Update `EMPTY_PARTICIPANT` constant
- [ ] Create `PreferredMealWishSection` component
- [ ] Add i18n translations (DE + EN)

#### Day 3: Registration Form

- [ ] Integrate `PreferredMealWishSection` into `PublicDinnerEventRegistrationForm`
- [ ] Test form submission with preference
- [ ] Test form submission without preference
- [ ] Validate UI/UX flow

#### Day 4: Admin Form

- [ ] Integrate into `ParticipantForm`
- [ ] Fetch available meals from running dinner
- [ ] Test preference editing
- [ ] Test preference clearing

#### Day 5: Display & Lists

- [ ] Add preference display to participant lists
- [ ] Add preference filter (optional)
- [ ] Update participant detail views
- [ ] Test admin UI workflows

### Phase 4: Testing & Documentation (Week 4)

#### Day 1-2: E2E Testing

- [ ] Write Cypress tests for registration with meal preference
- [ ] Write Cypress tests for admin preference editing
- [ ] Write Cypress tests for team generation with preferences
- [ ] Test meal configuration change scenarios

#### Day 3: Documentation

- [ ] Update API documentation
- [ ] Update user documentation/help text
- [ ] Create admin guide for feature
- [ ] Document algorithm behavior and limitations

#### Day 4-5: Review & Polish

- [ ] Code review
- [ ] Fix bugs found during testing
- [ ] Performance optimization if needed
- [ ] Accessibility review (keyboard navigation, screen readers)
- [ ] Final testing round

### Phase 5: Deployment (Week 5)

#### Day 1: Staging Deployment

- [ ] Deploy to staging environment
- [ ] Run all tests in staging
- [ ] Manual testing of critical paths
- [ ] Performance testing with production-like data

#### Day 2-3: Production Deployment

- [ ] Database backup
- [ ] Run migration on production
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Smoke testing
- [ ] Monitor error logs

#### Day 4-5: Post-Deployment

- [ ] Monitor user feedback
- [ ] Monitor error rates
- [ ] Performance monitoring
- [ ] Create follow-up tickets for improvements
- [ ] Document lessons learned

---

## Testing Strategy

### Unit Tests

#### Backend Tests

**Participant Entity:**

```java
@Test
public void testPreferredMealClass() {
    Participant participant = new Participant();
    MealClass appetizer = MealClass.APPETIZER();

    assertFalse(participant.hasPreferredMealClass());

    participant.setPreferredMealClass(appetizer);
    assertTrue(participant.hasPreferredMealClass());
    assertEquals(appetizer, participant.getPreferredMealClass());
}
```

**Team Generation Algorithm:**

```java
@Test
public void testAssignMealClassesWithUnanimousPreferences() {
    List<Participant> participants = ParticipantGenerator.generateParticipants(18);

    // Set preferences for first 6 participants (3 teams) to prefer appetizer
    MealClass appetizer = MealClass.APPETIZER();
    for (int i = 0; i < 6; i++) {
        participants.get(i).setPreferredMealClass(appetizer);
    }

    GeneratedTeamsResult result = runningDinnerCalculator.generateTeams(
        config, participants, Collections.emptyList(), Collections::shuffle
    );

    runningDinnerCalculator.assignRandomMealClasses(
        result, config, Collections.emptyList()
    );

    // Verify at least 2 teams with unanimous appetizer preference got it
    List<Team> appetizerTeams = result.getRegularTeams().stream()
        .filter(t -> t.getMealClass().equals(appetizer))
        .collect(Collectors.toList());

    long teamsWithUnanimousPreference = appetizerTeams.stream()
        .filter(t -> t.getTeamMembers().stream()
            .allMatch(p -> appetizer.equals(p.getPreferredMealClass())))
        .count();

    assertTrue(teamsWithUnanimousPreference >= 2);
}

@Test
public void testAssignMealClassesWithConflictingPreferences() {
    // Team with conflicting preferences should get random assignment
    // but still maintain overall meal balance
}

@Test
public void testMealDeletionClearsPreferences() {
    // Test that deleting a meal clears all participant preferences for that meal
}
```

**Service Layer:**

```java
@Test
public void testSaveParticipantWithPreferredMeal() {
    ParticipantInputDataTO participantData = new ParticipantInputDataTO();
    // ... set participant data ...
    MealTO preferredMeal = new MealTO(appetizer);
    participantData.setPreferredMeal(preferredMeal);

    Participant saved = participantService.createParticipant(adminId, participantData);

    assertNotNull(saved.getPreferredMealClass());
    assertEquals(appetizer.getId(), saved.getPreferredMealClass().getId());
}

@Test
public void testSaveParticipantWithInvalidMeal() {
    // Should throw ValidationException when preferred meal doesn't exist
}
```

#### Frontend Tests

**Component Tests:**

```typescript
describe("PreferredMealWishSection", () => {
  it("should render meal options", () => {
    const meals = [
      { id: "1", label: "Appetizer", time: new Date() },
      { id: "2", label: "Main", time: new Date() },
    ];

    render(<PreferredMealWishSection availableMeals={meals} />);

    expect(screen.getByText("No preference")).toBeInTheDocument();
    expect(screen.getByText(/Appetizer/)).toBeInTheDocument();
    expect(screen.getByText(/Main/)).toBeInTheDocument();
  });

  it("should not render when only one meal available", () => {
    const meals = [{ id: "1", label: "Appetizer", time: new Date() }];

    const { container } = render(
      <PreferredMealWishSection availableMeals={meals} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("should update form value when meal selected", () => {
    // Test React Hook Form integration
  });
});
```

### Integration Tests

**End-to-End Registration Flow:**

```java
@Test
@Transactional
public void testRegistrationWithPreferredMeal() {
    // Create running dinner
    // Register participant with meal preference
    // Verify preference is saved
    // Generate teams
    // Verify team got preferred meal (if possible)
}
```

**Admin Edit Flow:**

```java
@Test
@Transactional
public void testAdminEditParticipantMealPreference() {
    // Create participant
    // Update preference via admin
    // Verify change is saved
    // Regenerate teams
    // Verify new preference is considered
}
```

### E2E Tests (Cypress)

**Registration:**

```javascript
describe("Participant Registration with Meal Preference", () => {
  it("should allow selecting preferred meal during registration", () => {
    cy.visit(`/public/${publicDinnerId}`);

    fillPersonalFieldsInRegistrationForm(participant);
    fillAddressFieldsInRegistrationForm(participant);

    // Select meal preference
    cy.getByTestId("preferred-meal-section").should("be.visible");
    cy.get('input[value="meal-id-appetizer"]').click();

    submitStandardDialog();

    assertRegistrationSummaryDialogShown();
    cy.contains("Appetizer").should("be.visible");
  });

  it("should allow registering without meal preference", () => {
    // Test that "No preference" is default and works
  });
});
```

**Admin Edit:**

```javascript
describe("Admin Participant Meal Preference Edit", () => {
  it("should allow admin to change participant meal preference", () => {
    navigateParticipantsList(adminId);

    getParticipantRows().first().click();

    cy.getByTestId("preferred-meal-section").should("be.visible");
    cy.get('input[value="meal-id-main"]').click();

    cy.getByTestId("save-participant-action").click();

    // Verify saved
    cy.contains("Participant saved").should("be.visible");
  });
});
```

**Team Generation:**

```javascript
describe("Team Generation with Meal Preferences", () => {
  it("should consider meal preferences when generating teams", () => {
    // Create participants with preferences
    // Generate teams
    // Verify at least some teams got their preference
    // Verify balanced distribution is maintained
  });
});
```

### Performance Tests

```java
@Test
public void testTeamGenerationPerformanceWithPreferences() {
    // Generate 100+ participants with various preferences
    // Measure time to generate teams
    // Ensure acceptable performance (< 2s for 100 participants)
}
```

### Accessibility Tests

- [ ] Keyboard navigation works for meal selection
- [ ] Screen reader announces meal options correctly
- [ ] Focus management is proper
- [ ] Color contrast meets WCAG AA standards
- [ ] Form labels are properly associated

---

## Summary

This feature enhances the RunYourDinner platform by allowing participants to express meal cooking preferences while maintaining the core team generation algorithm's integrity. The implementation:

1. **Preserves existing functionality**: All current features continue to work
2. **Maintains data integrity**: Foreign key constraints and cascading updates handle edge cases
3. **Enhances user experience**: Optional preference with clear communication about limitations
4. **Optimizes team satisfaction**: Priority-based assignment algorithm maximizes fulfilled preferences
5. **Handles edge cases**: Meal configuration changes, team partner conflicts, unbalanced preferences

The phased implementation plan ensures systematic development with comprehensive testing at each stage, minimizing risk of regressions or production issues.

**Total Estimated Effort:** 4-5 weeks
**Complexity:** Medium-High
**Risk Level:** Low (well-isolated changes, optional feature)
