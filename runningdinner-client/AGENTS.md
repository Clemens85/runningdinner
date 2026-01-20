# Running Dinner Client - AI Coding Agent Instructions

## Project Overview

React/TypeScript monorepo for "Running Dinner" event management. Multi-page SPA with four distinct apps: landing (public), wizard (event creation), admin (organizer dashboard), and self (participant view). Uses pnpm workspaces with shared business logic.

## Monorepo Architecture

### Workspace Structure

- **`shared/`**: Business logic, services, types, Redux slices, React Query utilities. Imported as `@runningdinner/shared`
- **`webapp/`**: Four React apps with Material-UI, routing handled by separate entry points (`/admin`, `/running-dinner-wizard`, `/self`, `/`)

### Multi-Page App Pattern

Each app has dedicated entry point. All apps share the same React bundle via code splitting in [App.tsx](webapp/src/App.tsx).

## State Management - Dual Pattern

### Redux Toolkit (Legacy Pattern - Admin/Wizard/Self Apps)

- Used in `shared/src/admin/redux/`, `shared/src/wizard/`, `shared/src/self/redux/`
- Slices use `createAsyncThunk` + `createReducer` pattern (see [AdminSlice.ts](shared/src/admin/redux/AdminSlice.ts))
- Each app has own store: `adminStore`, `wizardStore`, `selfAdminStore`
- Fetch state tracked via `FetchData<T>` wrapper with `FetchStatus` enum ([FetchHelpers.ts](shared/src/redux/FetchHelpers.ts))
- Selectors follow pattern: `getSomethingMandatorySelector` (throws if undefined) vs `getSomethingFetchSelector` (returns `FetchData<T>`)

### React Query (Preferred for New Code)

- Configured via `createDefaultQueryClient()` in [QueryClient.ts](shared/src/query/QueryClient.ts)
- Settings: `networkMode: 'always'`, `staleTime: Infinity`, `retry: 1`
- Custom helpers: `isQuerySucceeded(query)`, `isAllQueriesSucceeded(queries)`
- Use for all new data fetching, especially in admin features (see [HostLocationsPage.tsx](webapp/src/admin/hostlocations/HostLocationsPage.tsx))

## Backend Communication

### API Service Pattern

Services in `shared/src/*/` use axios directly with centralized config:

- **`BackendConfig.buildUrl('/path')`**: Constructs `/rest/path` URLs
- **Auto-transforms**: LocalDate/LocalDateTime arrays ↔ JS Date via interceptors ([HttpInterceptorConfig.js](shared/src/HttpInterceptorConfig.js))
- **Proxy in dev**: Vite proxies `/rest` and `/sse` to `localhost:9090` ([vite.config.ts](webapp/vite.config.ts))
- Example: [ParticipantService.ts](shared/src/admin/ParticipantService.ts) - CRUD pattern with `findParticipantsAsync`, `saveParticipantAsync`, etc.

### Date Handling Convention

Backend sends dates as number arrays `[2024, 1, 15, 14, 30]`. Interceptors auto-convert to `Date` objects. Use functions from [DateUtils.ts](shared/src/date/DateUtils.ts): `formatLocalDate()`, `toLocalDateQueryString()`, `serializeLocalDateToArray()`.

## Forms & Validation

### React Hook Form + Yup

- Use `useForm()` with `yupResolver` for validation
- Schemas in [ValidationSchemas.js](shared/src/admin/ValidationSchemas.js) - note: uses Yup v0.28 (old API)
- Wrap forms with `<FormProvider>` to enable nested field access
- Example pattern in [ParticipantForm.tsx](webapp/src/admin/participants/form/ParticipantForm.tsx)

## Shared Component Patterns

### Context Providers for Feature State

Complex features use React Context for local state (not Redux). Example: [DinnerRouteOverviewContext.tsx](shared/src/admin/dinnerroute/DinnerRouteOverviewContext.tsx)

- `useReducer` + Context API for component tree state
- Action types as enums
- Export both provider and custom hook (`useDinnerRouteOverviewContext`)

### Material-UI Conventions

- Theme in [RunningDinnerTheme.tsx](webapp/src/common/theme/RunningDinnerTheme.tsx)
- Custom typography components: `Paragraph`, `Headline`, etc.
- Use `useCustomSnackbar()` hook for notifications (wraps notistack)

## TypeScript Conventions

### Type Organization

All shared types in `shared/src/types/` with barrel exports. Naming:

- Interfaces for data: `Team`, `Participant`, `RunningDinner`
- Enums for constants: `TeamStatus`, `ActivityType`, `FetchStatus`
- Type aliases for compositions: `BaseTeam`, `HostTeam extends Team`

### Prop Types

Use descriptive prop types with `&` composition:

```typescript
type MyComponentProps = BaseRunningDinnerProps & { extraProp: string };
```

## Testing

### Vitest Setup

- Config in [vitest.config.ts](webapp/vitest.config.ts) and [vitest.config.ts](shared/vitest.config.ts)
- Uses jsdom, junit reporter outputs to `reports/`
- Setup file: `setupTests.js` (imports `@testing-library/jest-dom`)
- Run via: `pnpm test` (runs all workspaces), `pnpm -r test` (recursive)

### Testing Library

- Use `@testing-library/react` for component tests
- Example in [AddressLocation.spec.jsx](shared/src/AddressLocation.spec.jsx)

## Key Commands

```bash
# Development
pnpm dev                    # Start Vite dev server (port 3000)

# Building
pnpm build                  # Build webapp (runs vite build, no tsc)

# Code Quality
pnpm lint                   # ESLint check
pnpm lint:fix               # Auto-fix ESLint issues
pnpm typecheck              # Run tsc without emit
pnpm format                 # Prettier format
pnpm format:check           # Check formatting

# Testing
pnpm test                   # Run all tests (vitest)
pnpm -r test                # Run tests in all workspaces
```

## ESLint Configuration

Root [eslint.config.js](eslint.config.js) exports `baseNodeConfig`. Workspace configs extend this.
Key rules:

- `unused-imports/no-unused-imports: error` - auto-removes unused imports
- `simple-import-sort` plugin - auto-sorts imports
- `@typescript-eslint/no-explicit-any: off` - allows `any`
- `@typescript-eslint/require-await: error` - enforces async returns await

## Important Conventions

1. **No barrel export index files** - Import from specific files, not `index.ts` (though they exist)
2. **Shared utilities** - Check [Utils.ts](shared/src/Utils.ts) before creating helpers (`isStringNotEmpty`, `findEntityById`, `trimStringsInObject`, etc.)
3. **AdminId everywhere** - All admin API calls require `adminId: string` param
4. **Translation keys** - Use i18next with namespaces: `t('key', { ns: 'admin' })`
5. **File naming** - PascalCase for components, camelCase for hooks/utils

## Google Maps Integration

Uses `@vis.gl/react-google-maps` library. API key and map ID in [GOOGLE_MAPS_KEY](webapp/src/common/maps). Wrap maps in `<APIProvider>` at page level.
