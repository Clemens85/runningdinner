<!--
Sync Impact Report
- Version change: N/A -> 0.1.0
- Modified principles: [PRINCIPLE_1_NAME] -> I. Domain-Driven Service Boundaries; [PRINCIPLE_2_NAME] -> II. Shared-First Frontend Logic; [PRINCIPLE_3_NAME] -> III. Stable Contracts and IDs; [PRINCIPLE_4_NAME] -> IV. Data and Schema Discipline; [PRINCIPLE_5_NAME] -> V. Event-Driven Side Effects
- Added sections: Architecture Constraints; Development Workflow & Quality Gates
- Removed sections: None
- Templates requiring updates: .specify/templates/plan-template.md (✅ updated), .specify/templates/spec-template.md (✅ checked), .specify/templates/tasks-template.md (✅ checked), .specify/templates/commands (⚠ pending: directory missing)
- Follow-up TODOs: TODO(RATIFICATION_DATE): original adoption date unknown
-->
# RunYourDinner Constitution

## Core Principles

### I. Domain-Driven Service Boundaries
Backend changes MUST preserve the controller -> service -> repository flow. Rest controllers handle
HTTP concerns only and delegate to services. Cross-cutting behavior (emails, activity logs,
geocoding) MUST be triggered via domain events, not direct calls from controllers.
Rationale: keeps domain logic testable and avoids leaky infrastructure concerns.

### II. Shared-First Frontend Logic
New client logic MUST live in `runningdinner-client/shared` when it is reusable across apps.
But this applies only for logic, all stuff that comprises UI components (DOM etc). and which is device- and framwork-dependent
must be placed in `webapp` (the idea of the `shared` is to be UI framwork agnostic and to be also usable maybe in mobile device apps)
`webapp` should focus on composition and routing; avoid duplicating business logic in the UI.
Use `BackendConfig.buildUrl()` for all API URLs and prefer React Query for new data fetching.
Rationale: ensures consistent behavior across admin, wizard, self, and landing apps.

### III. Stable Contracts and IDs
All admin and self-service flows MUST use their respective IDs as required inputs, and those
IDs MUST be treated as confidential secrets (do not log or expose them). Public event links
are also sensitive unless explicitly public. Breaking API changes require explicit migration
and coordination across backend and frontend.
Rationale: IDs are the access keys for admin and participant workflows.

### IV. Data and Schema Discipline
Schema changes MUST be expressed as Flyway migrations. Backend DTOs (TOs) remain separate from
JPA entities; do not expose entities directly through REST. Any data shape change requires
updating date serialization expectations and related client adapters.
Rationale: preserves safe migrations and stable API contracts.

### V. Event-Driven Side Effects
Side effects (email dispatch, geocoding requests, activity logging) MUST be triggered through
the event system and published after commit when they depend on persisted data. Prefer
independent transactions (`REQUIRES_NEW`) for non-critical side effects.
Rationale: improves consistency and reduces transactional coupling.

## Architecture Constraints

- Backend stack is Spring Boot 3.4+ on Java 21 with PostgreSQL and Flyway migrations.
- Frontend stack is React 18 + TypeScript + Vite with Material UI; shared logic lives in the
	`shared` package and is consumed by `webapp`.
- All backend HTTP APIs use `/rest/...` endpoints, grouped by domain (`/wizardservice/v1/`,
	`/masterdataservice/v1/`, etc.).
- Axios interceptors and `BackendConfig` remain the single source of truth for API base URLs
	and date serialization.
- Secret links (`adminId`, `selfAdministrationId`, open/public event links) are sensitive
	credentials and MUST not be logged or exposed in telemetry.

## Development Workflow & Quality Gates

- Use the existing build/test tooling: `./mvnw` for backend, `pnpm` for frontend and e2e.
- Prefer `@ApplicationTest` and existing test helpers for backend tests; use Vitest and
	Testing Library for frontend tests.
- Update or add tests when changing behavior in backend services, shared utilities, or
	cross-app UI flows.
- Keep new React Query usage aligned with `createDefaultQueryClient()` defaults and existing
	query helpers.
- Favor shared utilities (`Utils.ts`, `DateUtils.ts` , ...) before adding new helpers.

## Governance

- This constitution supersedes all other development guidance.
- Amendments require updating this document, noting the rationale, and bumping the version
	according to semantic versioning (MAJOR: incompatible principle changes, MINOR: new or
	expanded principles/sections, PATCH: clarifications/typos).
- Every plan must include a Constitution Check derived from these principles.
- Compliance is reviewed in code reviews and during spec/plan creation.
- Runtime guidance lives in AGENTS.md files and README documentation; deviations must be
	justified in the relevant plan.

**Version**: 0.1.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-02-25
