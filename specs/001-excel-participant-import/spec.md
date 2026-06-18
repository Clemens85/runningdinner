# Feature Specification: Excel Participant Import

**Feature Branch**: `001-excel-participant-import`  
**Created**: 2026-06-01  
**Status**: Draft  
**Input**: User description: "We need a new feature for importing participant data from Excel file..."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Bulk Import Participants from Excel (Priority: P1)

An event organizer has collected participant registrations offline (e.g., from a paper form or a separate spreadsheet). They want to upload all participants at once instead of entering each one manually through the participant form.

**Why this priority**: This is the core value of the feature. Without it, the feature does not exist. All other stories build on it.

**Independent Test**: Can be fully tested by opening the participant list for an event, triggering the import action, uploading a valid Excel file with at least 5 participants, confirming the preview, and verifying that all participants appear in the participant list.

**Acceptance Scenarios**:

1. **Given** the organizer is on the participant list page, **When** they trigger the import action, **Then** they are presented with a file selection to choose an Excel file.
2. **Given** the organizer selects a valid Excel file, **When** the file is processed, **Then** a preview of all parsed participants is shown before any data is saved.
3. **Given** the organizer confirms the import preview (with no errors), **When** the import is submitted, **Then** all participants are added to the event and visible in the participant list.
4. **Given** the Excel file contains all optional fields (dietary preferences, address remarks, mobile number), **When** the file is imported, **Then** those fields are preserved correctly for each participant.

---

### User Story 2 - Validate and Preview Import Results (Priority: P1)

Before committing data, the organizer wants to see a complete preview of all rows parsed from the Excel file, with clear indicators of which rows are valid and which have issues, so errors can be caught before they enter the system.

**Why this priority**: Without a proper validation preview, the organizer has no confidence in the import and bad data could be silently saved. This is as critical as the import itself.

**Independent Test**: Can be tested by uploading an Excel file that intentionally contains: one row missing the email, one row with a duplicate email (matching an existing participant), and one row with a duplicate email matching another row in the same file. All three errors must appear in the preview, and the valid rows must be clearly identified.

**Acceptance Scenarios**:

1. **Given** the organizer uploads an Excel file, **When** the preview is shown, **Then** each row displays the participant's name, email, and a clear validation status (valid / warning / error).
2. **Given** a row in the Excel has an email that already exists among the event's registered participants, **When** the preview is shown, **Then** that row is flagged as a duplicate error with a descriptive message.
3. **Given** two rows in the same Excel file share the same email address, **When** the preview is shown, **Then** both rows are flagged as duplicate errors.
4. **Given** a row is missing one or more mandatory fields (e.g., name or address), **When** the preview is shown, **Then** that row is flagged as a validation error listing the missing fields.
5. **Given** the preview contains at least one error row, **When** the organizer attempts to confirm the import, **Then** the system enforces the configured partial-import behavior (see FR-012).

---

### User Story 3 - Download Import Template (Priority: P2)

An organizer wants to prepare participant data using the correct column structure. They need a downloadable Excel template with all column headers and instructions so they know exactly what data to provide.

**Why this priority**: Without the template, organizers cannot reliably prepare their data, which would cause widespread validation errors and poor adoption of the import feature.

**Independent Test**: Can be tested independently by downloading the template from the participant list area, opening it in a standard spreadsheet tool, and verifying all expected column headers and a dedicated instructions sheet are present.

**Acceptance Scenarios**:

1. **Given** the organizer triggers the import flow, **When** the import dialog/view opens, **Then** a clearly labeled "Download Template" option is available.
2. **Given** the organizer downloads the template, **When** they open it, **Then** it contains all required and optional column headers in the correct order.
3. **Given** the organizer opens the template, **When** they look for guidance, **Then** a dedicated "Instructions" tab/sheet explains the purpose and format of each column, including which fields are mandatory and accepted values for constrained fields (e.g., gender values, dietary flags).

---

### User Story 4 - Import Participants with Team Partner Wish (Priority: P2)

An organizer has participants who want to dine with a specific partner. The Excel file should allow specifying a team partner wish for each participant — either by referencing the partner's email address (if the partner is known in the system or within the same import) or by providing the partner's name directly.

**Why this priority**: Team partner wishes are a key feature of the application. Many events rely on them, and the import would be significantly incomplete without this capability.

**Independent Test**: Can be tested by uploading an Excel file that includes: one participant with a team partner wish by email (where the referenced participant is also in the same file), and one participant with a team partner wish using only a name. Both must be reflected correctly in the preview and after confirmation.

**Acceptance Scenarios**:

1. **Given** an Excel row includes a partner's email address in the designated column, **When** the preview is shown, **Then** the team partner wish by email is displayed and validated (with a warning if the partner email is not found in the current import or existing participants).
2. **Given** an Excel row includes a partner's first name and last name but no partner email, **When** the preview is shown, **Then** the team partner wish by name is displayed and treated as a minimal-data partner registration.
3. **Given** the organizer confirms the import, **When** participants with team partner wishes are saved, **Then** the team partner wish relationship is correctly established in the system.

---

### User Story 5 - Access Import and Export from Participant List (Priority: P3)

The existing plain export button in the participant list header is replaced by a combined control that surfaces both export and import as distinct, equally accessible actions — without requiring the organizer to navigate away.

**Why this priority**: UX consolidation; the entry point must be discoverable. Without it, the import feature would need a separate navigation path.

**Independent Test**: Can be tested by verifying that the participant list header shows a single combined control, that the export action still produces the same Excel file as before, and that the import action opens the import flow.

**Acceptance Scenarios**:

1. **Given** the organizer is on the participant list and participants exist, **When** they look at the list header, **Then** they see a single combined control that clearly communicates both export and import are available.
2. **Given** the organizer expands the combined control, **When** they select export, **Then** the Excel export works exactly as it did before (no regression).
3. **Given** the organizer expands the combined control, **When** they select import, **Then** the import flow starts immediately.

---

### Edge Cases

- What happens when an uploaded file is not a valid Excel format (e.g., CSV, PDF, or a corrupt .xlsx)?
- What happens when the Excel file has data rows but all columns for a row are empty?
- How does the system handle very large files (e.g., 500+ rows)?
- What if the partner email column contains the same participant's own email (self-reference)?
- What happens when both partner email and partner name columns are filled for the same row?
- What if the organizer closes the import preview mid-way — are any participants saved?
- What if the backend fails to save one participant mid-import after several have already succeeded?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The participant list header MUST replace the current standalone export button with a combined action control that exposes both "Export to Excel" and "Import from Excel" as distinct action items.
- **FR-002**: The combined action control MUST be labeled in a way that communicates its dual purpose (export and import) without requiring the organizer to expand it first (e.g., via label, tooltip, or icon).
- **FR-003**: The "Export to Excel" action MUST continue to function exactly as the current export button does (no regression).
- **FR-004**: The "Import from Excel" action MUST allow the organizer to select a local .xlsx file from their device.
- **FR-005**: All Excel parsing MUST occur entirely within the browser; the raw file content MUST NOT be transmitted to the server during the parsing phase.
- **FR-006**: The Excel parsing capability MUST be loaded on demand, only when the organizer initiates the import flow. It MUST NOT be included in the main application bundle loaded on page entry.
- **FR-007**: After parsing, the system MUST display a comprehensive import preview screen listing all parsed participant rows before any data is submitted to the backend.
- **FR-008**: Each row in the preview MUST show: participant name, email address, a summary of key fields, and a clear validation status badge (Valid / Warning / Error) with associated messages.
- **FR-009**: A row MUST be flagged as an error if the email address already exists among the event's currently registered participants (duplicate against existing data).
- **FR-010**: A row MUST be flagged as an error if its email address appears in more than one row within the same uploaded file (intra-file duplicate).
- **FR-011**: A row MUST be flagged as an error if any mandatory field (first name, last name, email, street, street number, ZIP code, city) is missing or blank.
- **FR-012**: If the import preview contains a mix of valid and error rows, the system MUST allow the organizer to proceed with importing only the valid rows. Before final confirmation, the system MUST display a prominent summary of all rows that will be skipped (with their errors), so the organizer makes a conscious and informed decision. No error row is ever silently skipped.
- **FR-013**: The confirmed import MUST use the existing backend API for adding participants; each valid participant is submitted individually through the existing create-participant endpoint. No new backend import endpoint is required.
- **FR-014**: The Excel column format MUST cover at minimum: first name, last name, email, gender, age, street, street number, ZIP code, city, address remarks, number of seats, mobile number, dietary flags (vegetarian, vegan, lactose-free, gluten-free), dietary notes.
- **FR-015**: The Excel format MUST include columns for team partner wish data supporting two modes: (a) partner email reference, and (b) partner first name + partner last name without email. When both partner email and partner name columns are filled for the same row, the partner email takes precedence and the name columns are ignored. When only partner name columns are provided (no email), the system MUST record the partner wish as an unresolved wish with no linked participant created — it is stored as a wish intent only, not as a new participant registration.
- **FR-016**: A downloadable Excel template MUST be available within the import flow.
- **FR-017**: The Excel template MUST contain all column headers matching the import format, plus a dedicated "Instructions" sheet describing each column's purpose, whether it is mandatory, and accepted value formats/constraints.
- **FR-018**: The import feature MUST NOT save any participant data to the backend until the organizer explicitly confirms the import from the preview screen.
- **FR-019**: After a successful import, the participant list MUST refresh to show the newly added participants without requiring a full page reload.

### Key Entities

- **ExcelImportRow**: A single row parsed from the uploaded Excel file; contains all participant fields plus a validation status (`VALID`, `WARNING`, `ERROR`) and a list of validation messages per field.
- **ImportPreview**: The aggregate of all `ExcelImportRow` objects presented before the organizer confirms the import; includes summary counts of valid, warning, and error rows.
- **TeamPartnerWishImportData**: Captures team partner wish intent for an imported participant. Two mutually exclusive modes: (1) email-reference mode — stores the partner's email; (2) name-registration mode — stores the partner's first name and last name only.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An organizer can go from selecting an Excel file to seeing the full import preview in under 5 seconds for files containing up to 200 participant rows.
- **SC-002**: 100% of duplicate emails (both within the uploaded file and against existing participants) are detected and flagged before any data is saved.
- **SC-003**: 100% of rows with missing mandatory fields are flagged as validation errors in the preview.
- **SC-004**: The participant list page load time is not measurably affected by the addition of this feature (Excel processing resources are fetched only when the import flow is triggered, not on normal page load).
- **SC-005**: An organizer completing an import for the first time requires no external documentation — the template's instructions sheet provides sufficient guidance.
- **SC-006**: After a confirmed import, all successfully imported participants appear in the participant list immediately without a manual page refresh.
- **SC-007**: Organizers familiar with the existing export function can locate the import entry point without assistance (import action is visible in the same control as export).
- **SC-008**: A single import session handles at least 200 participant rows without errors or noticeable performance degradation.

## Assumptions

- "Batch add" is performed by submitting each valid participant row to the existing create-participant endpoint; no new backend batch-import endpoint is needed.
- Import is strictly additive: it only creates new participants and never updates or overwrites existing ones. Duplicates are blocked at the preview stage.
- The import feature is scoped to the event organizer (adminId-authenticated); no participant self-service import is in scope.
- The Excel template's "Instructions" sheet is sufficient onboarding; no in-app guided walkthrough is required.
- The existing export Excel format is extended (not replaced) with additional columns for dietary preferences and team partner wish; existing export files are fully valid for import, with the new columns simply being empty/optional.
- "Minimal data" for a team partner wish name-registration means first name and last name only, consistent with the existing `TeamPartnerWishRegistrationData` model.
- The combined action control in the participant list header is only visible when participants exist (consistent with the current export button behavior).
- Files up to 200 rows are the primary target; exact upper row limit is TBD during planning.
