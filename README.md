
# Backstage - Stack Overflow for Teams Plugin

## Overview

This repository adds new features to the Stack Overflow plugins for [Backstage.io](https://backstage.io/), an open-source developer portal platform. The plugin integrates Stack Overflow for Teams (Enterprise and B&B tiers) with Backstage, enabling users to view and interact with content from their Stack Overflow instance directly within the Backstage environment.

### Key Features:

-   **Enterprise & B&B API Support**: Fully integrated with Stack Overflow for Teams API v3, supporting both the Enterprise and B&B tiers.
-   **Home Page**: Displays key Stack Overflow data, including:
    -   A leaderboard of active users or top contributors.
    -   Trending tags.
    -   Top unanswered questions.
-   **Backend API Integration**: Secure backend routers access the Stack Overflow Teams API via Keys or Tokens to retrieve relevant data.

### Current Progress:

#### Completed:

-   **API Integration**: Full integration with Stack Overflow for Teams (Enterprise and B&B tiers) using API v3.

#### In Progress:

-   **Error Logging**: Improving logging for better debugging and issue tracking.
-   **Backend Development**: Building backend routers for secure access to Stack Overflow Teams API.

#### Upcoming:

-   **Frontend Development**:
    -   User interface for the home page (leaderboard, trending tags, unanswered questions).
    -   Resolving the issue with client-side API requests, which is incompatible with private instances.
-   **Additional Features**:
    -   Enhancing the UI/UX for improved user interaction and engagement.

## Installation

Follow these steps to install and run the plugin locally:

1. Fork and clone the repository
    
2.  Navigate into the project directory:
    
    ```bash
    cd backstage-stackoverflow
    
    ```
    
3.  Install dependencies:
    
    ```bash
    yarn install
    
    ```
    
4.  The installation will scaffold the Backstage application and include the necessary plugins. You can find the Stack Overflow plugins as dependencies inside the `package.json` files in the `/app` and `/backend` folders. The internal link between them is created using Yarn workspaces.
    
    For example, the frontend plugin under the `/app` folder will appear as:
    
    ```json
    "@backstage-community/plugin-stack-overflow": "workspace:*"
    
    ```
    
5.  The plugins this project aims to develop are located in the `/plugins` folder. Changes to the code will usually trigger a hot reload. If not, you can restart the Backstage application.
    
6.  To start the Backstage application, run:
    
    ```bash
    yarn dev
    
    ```
    
## Contributing

Feel free to fork this repository and submit pull requests. Contributions, suggestions, and bug reports are welcome!
