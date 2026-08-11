# Stack Internal Frontend Plugin

This package is the frontend counterpart of the `stack-overflow-teams` plugin for Backstage.

## Areas of Responsibility

It provides the UI and interacts with the [backend service](https://github.com/EstoesMoises/backstage-stackoverflow/tree/main/plugins/stack-overflow-teams-backend) to fetch data from your Stack Internal Enterprise instance.

### Backend Dependency

To fully utilize this plugin, you must also install and configure the corresponding **backend package** (`@stackoverflow/backstage-plugin-stack-overflow-teams-backend`) in your Backstage backend. The frontend plugin relies on the backend for API communication and authentication handling.

## More details

### Enhanced `<StackOverflowSearchResultListItem />`

This component is a modified version of the [community plugin.](https://github.com/backstage/community-plugins/tree/main/workspaces/stack-overflow/plugins/stack-overflow/src/search/StackOverflowSearchResultListItem)

It adds a more Stack Overflow Internal-like interface, including additional information such as the questions' score, user role, user reputation, and timestamp.

---

### Individual Frontend Components

- **`<StackOverflowMe />`**
  
  Displays information about the authenticated user.

- **`<StackOverflowPostQuestionModal />`**
  
  Provides a form for users to create a new Stack Overflow Internal question. Once submitted, an API request is executed to create the question.
  
  This form listens to the `'openAskQuestionModal'` event. You can utilize this anywhere in your Backstage UI. To invoke the form, add the component to your UI along with a button that dispatches the event. Example:

  ```tsx
  <SidebarItem
    icon={StackOverflowIcon}
    onClick={() => window.dispatchEvent(new Event('openAskQuestionModal'))}
    text="Ask a Question"
  />
  
  <StackOverflowPostQuestionModal />
  ```

- **`<StackOverflowQuestion />`**
  
  Retrieves questions from the API. Uses API pagination to navigate all pages of questions available to the instance.

- **`<StackOverflowTags />`**
  
  Retrieves tags from the API. Uses standard pagination, displaying only the first 30 API results.

- **`<StackOverflowUsers />`**
  
  Retrieves users from the API. Uses standard pagination, displaying only the first 30 API results.

- **`<StackOverflowHub />`**
  
  Various components collectively create this informative hub.

## Authentication Components

- **`<StackAuthStart />`**
  
  Initiates **`/auth/start`** on the backend.

- **`<StackAuthLoading />`**
  
  Handles the loading state during authentication.

- **`<StackAuthCallback />`**
  
  Receives the code and state from your Stack Internal Enterprise instance as part of the OAuth process and initiates **`/callback`** in the backend.

- **`<StackAuthSuccess />`**
  
  Displays authentication success state.

- **`<StackAuthFailed />`**
  
  Displays authentication failure state.

### Page

- **`<StackOverflowTeamsPage />`**
  
  This page triggers authentication components, bundles, and orchestrates everything for you so you don't have to use the authentication components separately. If authenticated, it will return the `<StackOverflowHub />`.

### API Requests

The frontend plugin creates an API Ref for Stack Internal, which can be found under the `/api` folder. **All API requests from the frontend are directed to Backstage's backend**.

## New frontend system

The plugin supports both the legacy frontend system and the [new frontend system](https://backstage.io/docs/frontend-system/). Everything documented above is the legacy interface and keeps working unchanged; the new frontend system is served from the separate `/alpha` entry point.

In an app created with `@backstage/frontend-defaults`, install the plugin by adding it to your features:

```tsx
// packages/app/src/index.tsx
import { createApp } from '@backstage/frontend-defaults';
import stackOverflowTeamsPlugin from '@stackoverflow/backstage-plugin-stack-overflow-teams/alpha';

const app = createApp({
  features: [stackOverflowTeamsPlugin],
});
```

If your app discovers features automatically through `app.packages` config, no code change is needed at all.

### Extensions

| Extension ID                                                | What it does                                                                                                                  |
| :---------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `page:stack-overflow-teams`                                  | The Stack Internal hub, mounted at `/stack-overflow-teams`.                                                                     |
| `page:stack-overflow-teams/ask-question`                     | Trigger route for the ask-a-question modal at `/stack-overflow-teams/ask`. Renders nothing; see below.                          |
| `nav-item:stack-overflow-teams`                              | The "Stack Internal" sidebar item.                                                                                             |
| `nav-item:stack-overflow-teams/ask-question`                 | The "Ask a Question" sidebar item.                                                                                             |
| `api:stack-overflow-teams`                                   | The Stack Internal API client, talking to the backend plugin.                                                                   |
| `search-result-list-item:stack-overflow-teams`               | Renders indexed Stack Internal questions on the search page.                                                                    |
| `search-filter-result-type:stack-overflow-teams`             | Adds "Stack Internal" to the search page result type filter.                                                                    |
| `app-root-element:stack-overflow-teams/ask-question-modal`   | Mounts `<StackOverflowPostQuestionModal />` at the app root, so the `openAskQuestionModal` event works from anywhere in the app. |

#### How the "Ask a Question" nav item works

Clicking it opens the modal over whatever page you are on. Nothing navigates, nothing remounts, and the page underneath keeps its state.

Getting there takes a small amount of machinery, because the new frontend system has no `onClick` nav item: `NavItemBlueprint` only accepts a `routeRef`, and the nav bar is rendered by the app rather than by plugins. So the plugin:

1. mounts a trigger route at `/stack-overflow-teams/ask` that renders nothing, purely so the route ref resolves and the nav item can point at it, and
2. intercepts clicks on that link in the capture phase, before the router sees them, and opens the modal instead.

If the route is reached some other way — a bookmark, a pasted URL — the modal still opens and the router steps back out to the page you came from, or to the hub.

The `openAskQuestionModal` window event is unchanged and still works from anywhere in the app, so your own triggers keep working:

```tsx
<button onClick={() => window.dispatchEvent(new Event('openAskQuestionModal'))}>
  Ask a question
</button>
```

All of them are enabled by default and can be configured or disabled through `app.extensions` config, for example:

```yaml
app:
  extensions:
    # Serve the hub from a different path. Remember to update
    # stackoverflow.redirectUri to match, since the OAuth flow returns here.
    - page:stack-overflow-teams:
        config:
          path: /stack-internal
    # Opt out of the sidebar item
    - nav-item:stack-overflow-teams: false
```

### Local development

`packages/app-next` in this repository is a small app on the new frontend system with this plugin installed. Run it against the backend with:

```bash
yarn start:next
```
