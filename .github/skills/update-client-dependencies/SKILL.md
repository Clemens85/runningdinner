# Skill: Update Client Dependencies

## Description

Orchestrates a safe, incremental upgrade of all frontend dependencies across the `runningdinner-client` PNPM monorepo (root `package.json`, `shared/`, and `webapp/` sub-packages). A **main orchestrator agent** supervises a **worker agent** that performs the actual upgrades. Each dependency is upgraded, verified, and logged to a changelog before committing. If a upgrade is deemed impossible without human input, the process stops and the user is informed.

## Trigger

Use this skill when the user says something like:

- "Update/upgrade frontend dependencies"
- "Check for new frontend package versions"
- "Run dependency updates for the client"
- Invokes this skill by name

---

## Prerequisites & Permissions (Ask ONCE before starting)

Before doing any work, ask the user the following questions in a single message. Do not start until you have answers for all required items:

1. **Commit permission** (required): "May I create git commits for each successfully verified upgrade batch?"
2. **E2E tests** (required): "Should I run Cypress E2E tests as a final sanity check? If yes, which spec folders? Options: `wizard`, `landing`, `admin`, `portal`, or `all`. Note: running all specs is time-consuming. Recommended: `wizard` only for quick smoke tests."
3. **Scope** (optional, default = all): "Are there any packages you want to skip or pin? (e.g., `yup` – known compatibility issues)"

Store the answers in session memory under `/memories/session/dep-upgrade-permissions.md` and read them at the start of every sub-task.

---

## Monorepo Structure Reference

```
runningdinner-client/
  package.json          ← root: shared devDependencies (TypeScript, Vite, ESLint, Vitest, React, etc.)
  pnpm-workspace.yaml
  shared/
    package.json        ← own deps: uuid, xlsx, yup + testing devDeps
  webapp/
    package.json        ← own deps: MUI, react-router-dom, emotion, vis.gl, etc.
```

### Key Commands

```bash
# From runningdinner-client/
pnpm install                    # install after version changes
pnpm typecheck                  # run tsc across all packages (MUST pass)
pnpm test                       # run Vitest unit tests across all packages

# From e2e-tests/ (only if user approved E2E)
npx cypress run --spec "cypress/integration/wizard/**/*.spec.js"   # smoke test
npx cypress run --spec "cypress/integration/**/*.spec.js"          # all tests
```

---

## Changelog File

Maintain a file at `runningdinner-client/DEPENDENCY_CHANGELOG.md`.

- Create it if it does not exist.
- Prepend a new dated section on each run using the format below.
- Do not overwrite previous entries.

```markdown
## YYYY-MM-DD – Dependency Update Run

### Updated

| Package | Location | Old Version | New Version | Notes                           |
| ------- | -------- | ----------- | ----------- | ------------------------------- |
| axios   | root     | 1.16.0      | 1.17.0      | Patch bump, no breaking changes |

### Skipped / Blocked

| Package | Reason              |
| ------- | ------------------- |
| yup     | User requested skip |

### Failed / Needs Human Review

| Package          | Reason                                                             |
| ---------------- | ------------------------------------------------------------------ |
| react-router-dom | Migration guide step requires manual route refactor – stopped here |
```

---

## Upgrade Order (Worker Agent Must Follow)

Process dependencies in the order below – smaller/lower-risk packages first, larger/higher-risk last. Within each tier, packages can be batched together if they have no interdependencies.

### Tier 1 – Utilities & Tooling (low risk)

- `axios`, `lodash-es`, `uuid`
- `date-fns` ← **check for coupled upgrade** (see Cross-Dependency Rules below)
- `typescript` (check for any new strict rules that break compilation)
- `prettier`, `eslint` and all `eslint-*` plugins
- `@types/*` packages

### Tier 2 – Build & Test Infrastructure (medium risk)

- `vite` and `@vitejs/*` plugins
- `vitest`
- `@testing-library/*`, `jsdom`
- `globals`

### Tier 3 – State & Data Fetching (medium risk)

- `redux`, `redux-thunk`, `redux-logger`
- `@reduxjs/toolkit`
- `react-redux`
- `@tanstack/react-query`
- `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- `react-hook-form`
- `yup`

### Tier 4 – UI & Routing (high risk – query migration guides)

- `@emotion/react`, `@emotion/styled` (upgrade together – MUI peer dep)
- `notistack`, `material-ui-popup-state`, `mui-markdown`
- `@mui/material`, `@mui/icons-material`, `@mui/system` ← **upgrade as one coupled group**
- `@mui/x-date-pickers` ← **always check coupling with `date-fns`** (see Cross-Dependency Rules below)
- `react-dnd`, `react-dnd-html5-backend`, `react-virtuoso`, `react-medium-image-zoom`, `html-react-parser`
- `@vis.gl/react-google-maps`
- `react-router-dom` ← **highest risk, always check migration guide**

### Tier 5 – React Core (critical – upgrade last, only on major bumps)

- `react`, `react-dom`
- `@types/react`, `@types/react-dom`

---

## Cross-Dependency Rules

Some packages have hard version-coupling requirements. Before upgrading any package in a coupled group, the worker agent **must**:

1. Identify all members of the group that need a coordinated bump.
2. Check the compatibility matrix (via migration docs or `npm show <pkg> peerDependencies`) to find the version combination that satisfies all members.
3. Upgrade **all members of the group together in a single batch** – never upgrade one member alone if doing so would violate a peer dependency of another member.
4. If a compatible version set cannot be found (e.g., `date-fns` v4 is incompatible with the latest `@mui/x-date-pickers`), **do not upgrade any member of the group**. Mark the entire group as "Needs Human Review" in the changelog.

### Known Coupled Groups (always check these together)

| Group              | Members                                                     | Why Coupled                                                                              |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Date handling      | `date-fns` + `@mui/x-date-pickers`                          | MUI date pickers declare a strict `peerDependency` on specific `date-fns` major versions |
| MUI core           | `@mui/material` + `@mui/icons-material` + `@mui/system`     | Must always be on identical major+minor versions                                         |
| MUI core ↔ Emotion | `@mui/material` + `@emotion/react` + `@emotion/styled`      | MUI requires specific emotion peer deps per major                                        |
| React types        | `react` + `react-dom` + `@types/react` + `@types/react-dom` | Type definitions must match the runtime major                                            |
| Redux ecosystem    | `redux` + `react-redux` + `@reduxjs/toolkit`                | RTK has peer deps on both redux and react-redux                                          |

### Runtime Detection of Unexpected Coupling

Even outside the known groups above, the worker agent must detect ad-hoc coupling:

1. After bumping any package, run `pnpm install` and **read any peer dependency warnings** in the output.
2. If pnpm warns that package A now requires a different version of package B, treat A and B as a coupled group for this run.
3. Look up the compatible version of B, add it to the current batch, and re-run `pnpm install`.
4. Record the discovered coupling in the changelog "Notes" column: `"Coupled with <B> – upgraded together"`.
5. Update the session memory discovered-couplings list so the orchestrator is aware for subsequent tiers.

If the required coupled version of B is in a **later tier** (e.g., `date-fns` is Tier 1 but a new version requires `@mui/x-date-pickers` from Tier 4):

- **Do not skip ahead**. Instead, temporarily hold `date-fns` at its current version.
- Add a note: `"date-fns upgrade deferred – must be co-upgraded with @mui/x-date-pickers in Tier 4"`.
- When Tier 4 is reached, upgrade both together as a single batch.

---

## Worker Agent Protocol (Per Dependency or Batch)

For each package (or small batch of related packages in the same tier):

### Step 1 – Check Latest Version & Peer Dependencies

```bash
# In runningdinner-client/
pnpm outdated --recursive 2>/dev/null | grep <package>
# Or check npm registry directly:
npm show <package> version
# Check declared peer dependencies of the new version BEFORE editing package.json:
npm show <package>@<new-version> peerDependencies
```

For every package in a **known coupled group** (see Cross-Dependency Rules), run `npm show ... peerDependencies` on each group member before editing any `package.json`. Determine the full compatible version set first, then apply all bumps together in one batch.

### Step 2 – Consult Migration Guide (Tier 3 and above, or any MAJOR bump)

- Use `mcp_context7_resolve-library-id` + `mcp_context7_query-docs` to fetch:
  - The **changelog** or **migration guide** for the target version.
  - Pay special attention to: breaking API changes, removed exports, peer dependency requirements.
- For **MUI** upgrades: always look for the official MUI migration guide for the target major version.
- For **react-router-dom** upgrades: always fetch the React Router migration guide.
- For **react** / **react-dom** major bumps: fetch the React upgrade guide.
- Document key breaking changes in the changelog entry under "Notes".

### Step 3 – Apply the Version Bump

Edit the relevant `package.json` file(s) directly. Change the version specifier to the new exact version (remove `^` or `~` – use exact versions consistent with the rest of the file).

Then install:

```bash
cd runningdinner-client && pnpm install
```

### Step 4 – Apply Required Code Migrations

If the migration guide identified breaking changes, apply the necessary code changes now before running checks. Document what was changed in the changelog "Notes" column.

### Step 5 – Verify

Run in order, stopping immediately if any step fails:

```bash
# From runningdinner-client/
pnpm typecheck
pnpm test
```

If `typecheck` or `test` fails:

1. Read the full error output carefully.
2. Attempt to fix the error (consult migration docs again if needed).
3. Re-run the failing check.
4. If the error cannot be resolved after **two attempts**, mark the package as **"Needs Human Review"** in the changelog, revert the version bump (`git checkout -- .`), and skip to the next package. Do NOT stop the entire process unless the failure blocks all subsequent upgrades.

### Step 6 – Commit (if user approved)

```bash
cd /home/clemens/Projects/runningdinner
git add runningdinner-client/
git commit -m "chore(deps): upgrade <package> <old> → <new>"
```

Use conventional commit format. Group patch-only bumps from Tier 1 into a single commit if convenient.

---

## Orchestrator Agent Protocol

The main orchestrator agent is responsible for:

1. **Loading permissions** from `/memories/session/dep-upgrade-permissions.md`.
2. **Invoking the worker agent** (via `runSubagent`) for each tier or batch. Pass the full context: tier, packages to upgrade, permissions, changelog path.
3. **Reading the worker's result** and updating the session todo list.
4. **Handling blocked upgrades**: if the worker marks a package as "Needs Human Review", the orchestrator logs it in the changelog and continues with the next package.
5. **Running E2E tests** (if user approved) after all tiers are complete:
   ```bash
   cd /home/clemens/Projects/runningdinner/e2e-tests
   npx cypress run --spec "cypress/integration/wizard/**/*.spec.js"
   # or user's chosen spec folders
   ```
6. **Final commit** of the changelog file if not already committed with the last batch.
7. **Reporting** a summary to the user:
   - List of all upgraded packages with old → new versions
   - List of skipped/blocked packages with reasons
   - Whether E2E tests passed

### Stopping Conditions

The orchestrator MUST stop the entire process and report to the user if:

- A package upgrade causes compilation failures that cannot be fixed automatically.
- A migration requires architectural decisions that cannot be inferred from code (e.g., a routing paradigm change that affects the entire app).
- `pnpm install` itself fails due to unresolvable peer dependency conflicts across the monorepo.
- The user's pre-approved skip list cannot be satisfied (e.g., a required peer dep forces an upgrade of a skipped package).

When stopping, the orchestrator must:

1. Revert any uncommitted changes: `git checkout -- runningdinner-client/`
2. Write the reason to the `DEPENDENCY_CHANGELOG.md` under "Failed / Needs Human Review".
3. Commit the changelog.
4. Report clearly to the user what happened and what decision is needed.

---

## Session Memory Layout

Create and maintain `/memories/session/dep-upgrade-permissions.md`:

```markdown
# Dependency Upgrade Session

## Permissions

- commit: yes/no
- e2e: yes/no – specs: wizard|landing|admin|portal|all
- skip: [list of packages to skip]

## Progress

- [ ] Tier 1 – Utilities & Tooling
- [ ] Tier 2 – Build & Test Infrastructure
- [ ] Tier 3 – State & Data Fetching
- [ ] Tier 4 – UI & Routing
- [ ] Tier 5 – React Core

## Blocked Packages

(filled by worker agent results)

## Discovered Coupled Groups (runtime)

(filled when pnpm install warns about new peer dependency conflicts during the run)

- Example: `date-fns 4.x` requires `@mui/x-date-pickers >=8` – deferred to Tier 4 and upgraded together
```

---

## Important Notes

- **Never use `pnpm update` or `ncu -u` blindly** – always inspect the target version and migration guide before editing `package.json`.
- **Peer dependency warnings from pnpm are acceptable** unless they cause actual build or test failures.
- **The `xlsx` package in `shared/` is a known legacy dependency** – skip major upgrades unless the user explicitly requests it.
- **`yup` is used with the legacy `0.x` API** (`@0.28.x`) across both `shared` and `webapp`. Do NOT upgrade to `1.x` without explicit user approval – it is a breaking API rewrite.
- **`react-dnd` uses `^16`** – stay on `16.x` unless the user approves, as `17+` may have breaking changes.
- All version specifiers in the root `package.json` should use exact versions (no `^`) for production deps, consistent with current style.
