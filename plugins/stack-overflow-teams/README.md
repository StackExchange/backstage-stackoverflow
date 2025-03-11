# Stack Overflow Teams Frontend Plugin

This package is the **frontend component** of the `stack-overflow-teams` plugin for Backstage. It provides the UI and interacts with the backend service to fetch data from your Stack Overflow Enterprise instance.

### Backend Dependency
To fully utilize this plugin, you must also install and configure the corresponding **backend package** (`backstage-plugin-stack-overflow-teams-backend`) in your Backstage backend. The frontend plugin relies on the backend for API communication and authentication handling.

---

## Frontend Plugin

### Components

- **`<StackOverflowHub />`**  
  The below various components collectively create this informative hub.

- **`<StackOverflowMe />`**  
  Displays information about the authenticated user.

- **`<StackOverflowPostQuestionModal />`**  
  Provides a form for users to create a new Stack Overflow question. Once submitted, an API request is executed to create the question.

- **`<StackOverflowQuestion />`**  
  Retrieves questions from the API. Uses standard pagination, displaying only the first 30 API results.

- **`<StackOverflowTags />`**  
  Retrieves tags from the API. Uses standard pagination, displaying only the first 30 API results.

- **`<StackOverflowUsers />`**  
  Retrieves users from the API. Uses standard pagination, displaying only the first 30 API results.

#### Authentication Components

- **`<StackAuthStart />`**  
  Initiates **`/auth/start`** on the backend.

- **`<StackAuthLoading />`**  
  Handles loading state during authentication.

- **`<StackAuthCallback />`**  
  Receives the code and state from your Stack Overflow Enterprise instance as part of the OAuth process and initiates **`/callback`** in the backend.

- **`<StackAuthSuccess />`**  
  Displays authentication success state.

- **`<StackAuthFailed />`**  
  Displays authentication failure state.

### Page

- **`<StackOverflowTeamsPage />`**

  This page triggers authentication components. If authenticated, it will return the **StackOverflow Hub**.

### API Requests  

The frontend plugin creates an API Ref for StackOverflow for Teams, which can be found under the `/api` folder. **All API requests from the frontend are directed to Backstage's backend**.

---

## Getting Started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running:
```sh
yarn start
```
in the root directory, and then navigating to [/stack-overflow-teams](http://localhost:3000/stack-overflow-teams).

You can also serve the plugin in isolation by running:
```sh
yarn start
```
in the plugin directory.

This method of serving the plugin provides quicker iteration speed, faster startup, and hot reloads. It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

