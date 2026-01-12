
  

# Stack Internal Plugins for Backstage

  

Based on the existing [**Community Plugins**](https://github.com/backstage/community-plugins/tree/main/workspaces/stack-overflow/plugins) for Stack Overflow Internal, this version introduces two new plugins:

- A **frontend plugin** responsible for displaying Stack Internal data.

- A **backend plugin** responsible for fetching and creating Stack Internal data.

  

## Frontend Plugin

  

### Components

  

-  **`<StackOverflowHub />`**

The below various components collectively create this informative hub.

  

-  **`<StackOverflowMe />`**

Displays information about the authenticated user.

  

-  **`<StackOverflowPostQuestionModal />`**

Provides a form for users to create a new Stack Overflow Internal question. Once submitted, an API request is executed to create the question.

  

-  **`<StackOverflowQuestion />`**

Retrieves questions from the API. Uses standard pagination, displaying only the first 30 API results.

  

-  **`<StackOverflowTags />`**

Retrieves tags from the API. Uses standard pagination, displaying only the first 30 API results.

  

-  **`<StackOverflowUsers />`**

Retrieves users from the API. Uses standard pagination, displaying only the first 30 API results.

  

#### Authentication components

-  **`<StackAuthStart />`**

Initiates **`/auth/start`** on the backend.

  

-  **`<StackAuthLoading />`**

  

-  **`<StackAuthCallback />`**

Receives the code and state from your Stack Internal Enterprise instance as part of the OAuth process and initiates **`/callback`** in the backend.

  

-  **`<StackAuthSuccess />`**

-  **`<StackAuthFailed />`**

  

### Page

-  **`<StackOverflowTeamsPage />`**

  

This page triggers authentication components, if authenticated it will return the StackOverflow HUB.

  

### API Requests

  

The frontend plugin creates and API Ref for StackOverflowforTeams which can be found under /api folder. All API requests from the frontend are directed to **Backstage's backend**.

  

## Backend Plugin

  

The **Backstage backend plugin** (the **Teams plugin**) is responsible for:

  

-  **Indexing all questions** from the private Stack Overflow Internal instance (an enhanced version of the existing community plugins in the Backstage repository).

-  **Handling API requests** via ``createStackOverflowApi`` and ``createStackOverflowService`` to the Stack Overflow Internal instance for retrieving:

-  `/users`

-  `/tags`

-  `/questions`

- Posting new questions via `/questions`

-  **Managing OAuth authentication flow** to securely access Stack Overflow Internal. via ``createStackOverflowAuth``

  

## OAuth Authentication Flow

  

The backend is the only component that directly utilizes **Stack Overflow Internal access tokens** for requests.

  

### **Authorization Flow Details**

  

#### **`/auth/start`**

- Generates **PKCE Code Verifier**.

- Hashes Code Verifier to obtain **Code Challenge**.

- Generates a **state** (random string).

- Stores **Code Verifier** and **State** in a **secure, HTTP-only cookie** accessible only to the server.

  

#### **`/callback`**

- Retrieves the stored **Code Verifier** and **State**.

- Validates that the received **state** matches the one from Stack Overflow Internal's query string parameter.

- The backend requests an **Access Token** using the stored **Code Verifier**.

- Stores the **Stack Overflow Internal Access Token** in a **secure, HTTP-only cookie**.