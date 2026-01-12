
# Stack Internal Search Backend Module

This module for the search plugin is an enhanced version of the original [Stack Overflow Internal collator](https://github.com/backstage/backstage/tree/master/plugins/search-backend-module-stack-overflow-collator). It provides additional information while coded to work specifically with Stack Internal API Version 3.

## Getting started

Before we begin, make sure:

- You have created your own standalone Backstage app using @backstage/create-app and not using a fork of the backstage repository. If you haven't setup Backstage already, start [here](https://backstage.io/docs/getting-started/).

To use any of the functionality this plugin provides, you need to start by configuring your App with the following config:

```yaml
stackoverflow:
  baseUrl: https://api.stackoverflowteams.com # alternative: your Stack Internal Enterprise site
  teamName: $STACK_OVERFLOW_TEAM_NAME # optional if you are on Enterprise
  apiAccessToken: $STACK_OVERFLOW_API_ACCESS_TOKEN
```

### Stack Internal

If you have a private Stack Overflow Internal instance and/or a private Stack Overflow Internal Team you will need to supply a Personal Access Token. You can read more about how to set this up by going to [Stack Overflow Internal's Help Page](https://stackoverflowteams.help/en/articles/7913768-stack-overflow-for-teams-api-v3).

## Areas of Responsibility

This Stack Overflow Internal backend plugin is primarily responsible for the following:

- Provides a `StackOverflowQuestionsCollatorFactory`, which can be used in the search backend to index Stack Overflow Internal questions to your Backstage Search.

### Index Stack Overflow Internal Questions to search

Before you are able to start index Stack Overflow Internal questions to search, you need to go through the [search getting started guide](https://backstage.io/docs/features/search/getting-started).

When you have your `packages/backend/src/plugins/search.ts` file ready to make modifications, add the following code snippet to add the `StackOverflowQuestionsCollatorFactory`. Note that you can optionally modify the `requestParams`, otherwise it will defaults to `{ order: 'desc', sort: 'activity' }`.

```ts
indexBuilder.addCollator({
  schedule,
  factory: StackOverflowQuestionsCollatorFactory.fromConfig(env.config, {
    logger: env.logger,
    requestParams: {
      tagged: ['backstage'],
      pagesize: 100,
    },
  }),
});
```

## New Backend System

This package exports a module that extends the search backend to also indexing the questions exposed by the [`Stack Internal API version 3`](https://stackoverflowteams.help/en/articles/7913768-stack-overflow-for-teams-api-v3).

### Installation

Add the module package as a dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @stackoverflow/backstage-stack-overflow-teams-collator
```

Add the collator to your backend instance, along with the search plugin itself:

```tsx
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-search-backend'));
backend.add(
  import('@stackoverflow/backstage-stack-overflow-teams-collator'),
);
backend.start();
```

You may also want to add configuration parameters to your app-config, for example for controlling the scheduled indexing interval. These parameters should be placed under the `stackoverflow` key. See [the config definition file](https://github.com/estoesmoises/backstage-stackoverflow/blob/main/plugins/search-backend-module-stack-overflow-teams-collator/config.d.ts) for more details.