# Teametric

Teametric is a private Google Sheets?bound Apps Script that provides modular, configurable data synchronization and reporting entirely within a spreadsheet.

## Table of Contents
- Environment & Commands
- Dependencies & Load Sequence
- UI Selectors
- Exports
- Component Behavior
- Events & Integration Points
- CSS Coupling
- Integrity Checks
- Proposed Additions

## Environment & Commands
- Google Sheets?bound Apps Script; OAuth scopes declared in **appsscript.json**  
- Local development requires Node.js ?14 and npm  
- npm scripts (in **package.json**):  
  - `npm test` (runs tests via Jest)  
  - `npm run build` (runs lint)  
  - `npm run deploy` (invokes `clasp push`)  
- CLI usage:  
  - `npm test` ? execute **tests.js**  
  - `npm run build && npm run deploy` ? lint code and deploy to Apps Script  

## Dependencies & Load Sequence
1. onopen.gs (deferred via Apps Script trigger on spreadsheet open)  
2. sidebarhandler.gs (executes on ?Configure? menu click)  
3. sidebar.html (loaded as a module script; provides UI)  
4. apiroutes.js, databaseservice.js, userservice.js, index.js (JavaScript modules)  
5. tests.js (Node.js environment for Jest-based unit and integration tests)  

## UI Selectors
- `#teametric-menu` (menu ID added by **onopen.gs**)  
- `#sidebar-container` [role="region" aria-label="Teametric configuration"]  
- `form.grid-container` (CSS grid layout)  
- `input#endpoint-url[data-route]`  
- `input#schedule-interval`  
- `button#run-now`  
- `.error-message[data-field]` [aria-live="polite"]  

## Exports
| Module               | Exported Functions                                       |
|----------------------|----------------------------------------------------------|
| **apiroutes.js**     | `fetchRoute(routeName: string, params: object)`          |
| **databaseservice.js** | `batchRead(range: string)`, `batchWrite(updates: object[])` |
| **userservice.js**   | `getActiveUser()`, `hasPermission(scope: string)`        |
| **index.js**         | `mainSync()`, `runOnce()`                                |
| **sidebarhandler.gs**| `doGet(e)`, `saveconfig(e)`                              |
| **tests.js**         | (imports and validates all module exports and flows)     |

## Component Behavior
- **onopen.gs**  
  ? Attaches the ?Teametric? menu via `SpreadsheetApp.getUi()`  
  ? Emits custom event ?open-sidebar? on menu click  
- **sidebarhandler.gs**  
  ? `doGet`: serves **sidebar.html**; requires `#sidebar-container` present  
  ? `saveconfig`: validates payload against **config.json** schema; writes to `PropertiesService`; returns ?config-saved?  
- **sidebar.html**  
  ? Reads values from `#endpoint-url` and `#schedule-interval`  
  ? Validates inputs; toggles `.error-state`; updates `aria-invalid`  
  ? Posts `save-config` and `run-now` messages to parent  
  ? Listens for `config-saved` to display success message  
- **apiroutes.js**  
  ? Uses `PropertiesService.getScriptProperties()` to load settings  
  ? Constructs and issues `UrlFetchApp.fetch` calls per `routeName`  
- **databaseservice.js**  
  ? Performs `batchRead` and `batchWrite` on spreadsheet ranges  
  ? Toggles `.loading-state` class on target elements during operations  
- **userservice.js**  
  ? Retrieves current user email via `Session.getActiveUser().getEmail()`  
  ? Emits ?user-changed? event when email differs from previous  
- **index.js**  
  ? `mainSync()`: emits ?sync-start?; awaits user; invokes `fetchRoute`; delegates to `databaseservice.batchWrite`; emits ?sync-end?  
  ? `runOnce()`: single-execution wrapper for manual ?Run Now? operations  

## Events & Integration Points
- **open-sidebar** ? emitted by onopen.gs; triggers sidebarhandler.gs `doGet`  
- **save-config** ? posted by sidebar.html; handled by sidebarhandler.gs `saveconfig`  
- **config-saved** ? returned by sidebarhandler.gs; listened to by sidebar.html  
- **run-now** ? posted by sidebar.html; handled by index.js `runOnce`  
- **sync-start** / **sync-end** ? emitted by index.js; asserted in tests.js  

## CSS Coupling
- `.loading-state`: applied to buttons and sheet elements during data operations  
- `.error-state`: applied to invalid input fields in **sidebar.html**  
- `.grid-container`: defines two-column layout; no JS dependencies  

## Integrity Checks
- On initialization, verify presence of all canonical selectors (e.g., `#sidebar-container`)  
- Validate incoming configuration payload against **config.json** schema before writing  
- Enforce module load order: throw errors if essential properties are missing from `PropertiesService`  
- **tests.js** includes unit tests for each export and integration tests for event flows and triggers  

## Proposed Additions
- Add `button#reset-config` in **sidebar.html** for ?Restore Defaults? (new event `config-reset`, handler in sidebarhandler.gs)  
- Export `listRoutes()` in **apiroutes.js** for dynamic UI dropdown generation  
- Add `aria-describedby="endpoint-url-help"` helper text element for the endpoint URL input field