## 2026-07-22 – Dependency Update Run

### Updated

| Package | Location | Old Version | New Version | Notes |
|---|---|---|---|---|
| axios | root | 1.16.0 | 1.18.1 | Minor bump |
| uuid | shared/package.json | ^14.0.0 | ^14.0.1 | Patch bump |
| prettier | root + webapp/package.json | ^3.6.2 | ^3.9.6 | Minor bump |
| eslint-plugin-prettier | root devDep | ^5.5.4 | ^5.5.6 | Patch bump |
| eslint-plugin-unused-imports | root devDep | ^4.3.0 | ^4.4.1 | Minor bump |
| eslint-plugin-react-refresh | root devDep | ^0.4.11 | ^0.5.3 | Minor bump |
| @types/react | root devDep | ^19.0.0 | ^19.2.17 | Minor bump |
| @types/google.maps | webapp devDep | ^3.58.1 | ^3.65.3 | Minor bump |
| typescript-eslint | root devDep | 8.59.3 | 8.65.0 | Minor bump |
| @typescript-eslint/eslint-plugin | root devDep | 8.59.3 | 8.65.0 | Minor bump |
| @typescript-eslint/parser | root devDep | 8.59.3 | 8.65.0 | Minor bump |
| date-fns | root dep | 4.1.0 | 4.4.0 | Minor bump within v4 |
| @types/node | root devDep | ^22.12.0 | ^26.1.1 | Major (types-only, safe) |
| eslint-plugin-simple-import-sort | root devDep | ^12.1.1 | ^14.0.0 | Major bump; no config changes needed |
| typescript | root devDep | 6.0.2 | 7.0.2 | Major bump; fixed moduleResolution: node→bundler in tsconfig.base.json |

### Skipped / Blocked

| Package | Reason |
|---|---|
| yup | User requested skip (legacy 0.28.x API) |
| xlsx | User requested skip (legacy) |

### Failed / Needs Human Review

| Package | Reason |
|---|---|
| eslint-plugin-react-hooks | v5→v7 introduces 33 new lint errors from React Compiler rules (react-hooks/no-use-state-in-render-callbacks, react-hooks/no-access-refs-in-render). Requires code fixes before upgrading. |
| eslint | v9→v10 blocked: eslint-plugin-react-hooks@5.2.0 only supports eslint ≤9. Upgrade react-hooks to v7 first, then re-attempt. |
| @eslint/js | v9→v10 coupled with eslint; blocked for same reason. |
