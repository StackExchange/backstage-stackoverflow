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

#### Authentication components
- **`<StackAuthStart />`**  
Initiates **`/auth/start`** on the backend.

- **`<StackAuthLoading />`**  

- **`<StackAuthCallback />`**  
  Receives the code and state from your Stack Overflow Enterprise instance as part of the OAuth process and initiates **`/callback`** in the backend.

- **`<StackAuthSuccess />`**  
- **`<StackAuthFailed />`**  

### Page
- **`<StackOverflowTeamsPage />`**

This page triggers authentication components, if authenticated it will return the StackOverflow HUB.

### API Requests  

The frontend plugin creates and API Ref for StackOverflowforTeams which can be found under /api folder. All API requests from the frontend are directed to **Backstage's backend**.

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/stack-overflow-teams](http://localhost:3000/stack-overflow-teams).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
