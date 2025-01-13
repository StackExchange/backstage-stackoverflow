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

Follow these steps to install the backstage application and run the plugins locally for development:

1. Fork and clone the repository.

2. Navigate into the project directory:

```bash

cd backstage-stackoverflow

```

3. Install dependencies:

```bash

yarn install

```

4. The installation will scaffold the Backstage application and include the necessary plugins. You can find the Stack Overflow plugins as dependencies inside the `package.json` files in the `/app` and `/backend` folders. The internal link between them is created using Yarn workspaces.

For example, the frontend plugin under the `/app` folder will appear as:

```json

"@backstage-community/plugin-stack-overflow": "workspace:*"

```

5. The plugins this project aims to develop are located in the `/plugins` folder. Changes to the code will usually trigger a hot reload. If not, you can restart the Backstage application.

6. To start the Backstage application, run:

```bash

yarn dev

```

## Sample application

Follow the steps below to set up and run the sample integration of Backstage with Stack Overflow.

Currently, the plugins information will be pulled from the Backstage and Backstage Community repositories for the Backstage Plugins:

Frontend - https://github.com/backstage/community-plugins/tree/main/workspaces/stack-overflow/plugins/stack-overflow

Backend (search collator) - https://github.com/backstage/backstage/tree/master/plugins/search-backend-module-stack-overflow-collator

1. Fork and clone the repository

2. Make sure you are using the sample-app branch

```bash

git checkout sample-app

```

3. Install Dependencies

After cloning the repository, this will default to the main branch. Run the following command to install all the required dependencies:

```bash

yarn install

```

4. Update Credentials

The `app-config.yaml` uses environtment variables. You can change the config according to your needs, wether you are connecting the plugin to a Teams or Enterprise instance. To changes these variables, follow the steps below:

- Navigate to the `example.env` file, which is located in the `packages/backend` directory.

- Update the credentials in this file as needed.

- Change the name of the file to just `.env`

5. Run the Development Environment

Once the dependencies are installed and variables are set up, run the following command to start the development environment on `localhost`:

```bash

yarn dev

```

### More information

You can find more information about the Backstage.io integration and setup from scratch on the comprehensive article - [Backstage.io Integration with Stack Overflow for Teams](https://stackoverflowteams.help/en/articles/9692515-backstage-io-integration)

## Contributing

Feel free to fork this repository and submit pull requests. Contributions, suggestions, and bug reports are welcome!
