# Backstage - Stack Overflow for Teams Plugin

## Sample application

Follow the steps below to set up and run the sample integration of Backstage with Stack Overflow.

Currently, the plugins information will be pulled from the Backstage and Backstage Community repositories for the Backstage Plugins:

Frontend - https://github.com/backstage/community-plugins/tree/main/workspaces/stack-overflow/plugins/stack-overflow

Backend (search collator) - https://github.com/backstage/backstage/tree/master/plugins/search-backend-module-stack-overflow-collator

1. Fork and clone the repository

2. Make sure you are using the sample-app branch

```bash

git checkout example-app

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
