# @stackoverflow/backstage-plugin-stack-overflow-teams

## 1.7.0

### Minor Changes

- 3703b54: Added support for the new Backstage frontend system through a new `/alpha` entry point.

  Apps built with `@backstage/frontend-defaults` can now install the plugin as a feature:

  ```tsx
  import { createApp } from '@backstage/frontend-defaults';
  import stackOverflowTeamsPlugin from '@stackoverflow/backstage-plugin-stack-overflow-teams/alpha';

  const app = createApp({ features: [stackOverflowTeamsPlugin] });
  ```

  This ships the hub page, both sidebar nav items, the Stack Internal API, the search result list item, the search result type filter, and the ask-a-question modal as configurable extensions — so no `Root.tsx` wiring is needed, unlike the legacy installation. The default entry point is unchanged, so apps on the legacy frontend system are unaffected.

  The "Ask a Question" sidebar item opens the modal over whatever page you are on, without navigating or remounting it. Nav items in the new frontend system are always links, so the plugin mounts a trigger route at `/stack-overflow-teams/ask` for the route ref to resolve against and intercepts clicks on it before the router sees them. Reaching that route another way, such as a bookmark, opens the modal and steps back out of the route. The `openAskQuestionModal` window event keeps working from anywhere in the app.

  Also bumped the `@backstage/*` dependencies to match the Backstage 1.46 baseline used by this repository, and declared the previously undeclared `@backstage/plugin-search-common` dependency.

## 1.6.2

### Patch Changes

- d338a50: Removed unnecessary React imports

## 1.6.1

### Patch Changes

- 8bc8e6e: Rebranding patch, changed terms from "Stack Overflow for Teams" to "Stack Overflow Internal" or "Stack Internal"

## 1.6.0

### Minor Changes

- ebbd62a: Fixed issue with collator NPM package, fixed UI issue with frontend plugin, updated backend and app local dev environments to the latest backstage version

## 1.5.0

### Minor Changes

- a30ff98: Changeset tracking added + NPM repository is now under Stackoverflow org
