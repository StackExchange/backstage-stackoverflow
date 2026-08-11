import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'stack-overflow-teams',
});

/**
 * Route that opens the "ask a question" modal on top of the hub.
 *
 * The legacy frontend system opens the modal from a sidebar item with an
 * `onClick` handler. The new frontend system has no equivalent — nav items
 * must point at a route — so the modal gets a route of its own there.
 */
export const askQuestionRouteRef = createRouteRef({
  id: 'stack-overflow-teams-ask-question',
});
