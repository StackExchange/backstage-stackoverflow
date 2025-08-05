# Stack Overflow Teams Frontend Plugin

This package is the frontend counterpart of the `stack-overflow-teams` plugin for Backstage.

## Areas of Responsibility

It provides the UI and interacts with the [backend service](https://github.com/EstoesMoises/backstage-stackoverflow/tree/main/plugins/stack-overflow-teams-backend) to fetch data from your Stack Overflow Enterprise instance.

### Backend Dependency

To fully utilize this plugin, you must also install and configure the corresponding **backend package** (`backstage-plugin-stack-overflow-teams-backend`) in your Backstage backend. The frontend plugin relies on the backend for API communication and authentication handling.

## More details

### Enhanced `<StackOverflowSearchResultListItem />`

This component is a modified version of the [community plugin.](https://github.com/backstage/community-plugins/tree/main/workspaces/stack-overflow/plugins/stack-overflow/src/search/StackOverflowSearchResultListItem)

It adds a more Stack Overflow-like interface, including additional information such as the questions' score, user role, user reputation, and timestamp.

---

### Individual Frontend Components

- **`<StackOverflowMe />`**
  
  Displays information about the authenticated user.

- **`<StackOverflowPostQuestionModal />`**
  
  Provides a form for users to create a new Stack Overflow question. Once submitted, an API request is executed to create the question.
  
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
  
  Receives the code and state from your Stack Overflow Enterprise instance as part of the OAuth process and initiates **`/callback`** in the backend.

- **`<StackAuthSuccess />`**
  
  Displays authentication success state.

- **`<StackAuthFailed />`**
  
  Displays authentication failure state.

### Page

- **`<StackOverflowTeamsPage />`**
  
  This page triggers authentication components, bundles, and orchestrates everything for you so you don't have to use the authentication components separately. If authenticated, it will return the `<StackOverflowHub />`.

### API Requests

The frontend plugin creates an API Ref for Stack Overflow for Teams, which can be found under the `/api` folder. **All API requests from the frontend are directed to Backstage's backend**.
