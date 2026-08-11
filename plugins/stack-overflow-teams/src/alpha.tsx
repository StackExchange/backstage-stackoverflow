/**
 * Support for the new Backstage frontend system.
 *
 * This entry point is published as
 * `@stackoverflow/backstage-plugin-stack-overflow-teams/alpha` and is only
 * consumed by apps built with `@backstage/frontend-defaults`. Apps on the
 * legacy frontend system keep using the default entry point, which is
 * unaffected by anything in this file.
 *
 * @packageDocumentation
 */
import { Suspense, lazy, useEffect, useRef } from 'react';
import { useHref, useLocation, useNavigate } from 'react-router-dom';
import {
  ApiBlueprint,
  AppRootElementBlueprint,
  NavItemBlueprint,
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
  useRouteRef,
} from '@backstage/frontend-plugin-api';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';

import { createStackOverflowApi, stackoverflowteamsApiRef } from './api';
import { StackOverflowIcon } from './icons';
import { askQuestionRouteRef, rootRouteRef } from './routes';

/**
 * The type emitted by the Stack Internal questions collator, used to pick the
 * results that this plugin knows how to render.
 */
const STACK_OVERFLOW_RESULT_TYPE = 'stack-overflow';

/**
 * Provides the {@link stackoverflowteamsApiRef} implementation that talks to
 * the Stack Internal backend plugin.
 *
 * @alpha
 */
export const stackOverflowTeamsApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: stackoverflowteamsApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        createStackOverflowApi(discoveryApi, fetchApi),
    }),
});

/**
 * The Stack Internal hub page, mounted at `/stack-overflow-teams` by default.
 *
 * The path is also the OAuth redirect target, so changing it via the
 * `app.extensions` config requires updating `stackoverflow.redirectUri` too.
 *
 * @alpha
 */
export const stackOverflowTeamsPage = PageBlueprint.make({
  params: {
    path: '/stack-overflow-teams',
    routeRef: rootRouteRef,
    loader: () => import('./pages').then(m => <m.StackOverflowTeamsPage />),
  },
});

/**
 * A trigger route for the "ask a question" modal, which deliberately renders
 * nothing.
 *
 * It exists only because nav items in the new frontend system must point at a
 * route — there is no `onClick` equivalent of the legacy sidebar item — and a
 * route ref only resolves if something mounts it. Clicks on the nav item never
 * actually get here; see {@link AskQuestionRouteListener}.
 *
 * @alpha
 */
export const stackOverflowTeamsAskQuestionPage = PageBlueprint.make({
  name: 'ask-question',
  params: {
    path: '/stack-overflow-teams/ask',
    routeRef: askQuestionRouteRef,
    loader: async () => <></>,
  },
});

/**
 * Sidebar entry pointing at the Stack Internal hub.
 *
 * @alpha
 */
export const stackOverflowTeamsNavItem = NavItemBlueprint.make({
  params: {
    title: 'Stack Internal',
    icon: StackOverflowIcon,
    routeRef: rootRouteRef,
  },
});

/**
 * Sidebar entry that opens the "ask a question" modal, mirroring the sidebar
 * item the legacy installation instructions add by hand.
 *
 * @alpha
 */
export const stackOverflowTeamsAskQuestionNavItem = NavItemBlueprint.make({
  name: 'ask-question',
  params: {
    title: 'Ask a Question',
    icon: StackOverflowIcon,
    routeRef: askQuestionRouteRef,
  },
});

/**
 * Renders Stack Internal questions on the search page.
 *
 * @alpha
 */
export const stackOverflowTeamsSearchResultListItem =
  SearchResultListItemBlueprint.make({
    params: {
      icon: <StackOverflowIcon />,
      predicate: result => result.type === STACK_OVERFLOW_RESULT_TYPE,
      component: () =>
        import(
          './components/StackOverflow/StackOverflowSearchResultListItem'
        ).then(m => m.StackOverflowSearchResultListItem),
    },
  });

/**
 * Adds "Stack Internal" to the result type filter on the search page.
 *
 * @alpha
 */
export const stackOverflowTeamsSearchResultType =
  SearchFilterResultTypeBlueprint.make({
    params: {
      value: STACK_OVERFLOW_RESULT_TYPE,
      name: 'Stack Internal',
      icon: <StackOverflowIcon />,
    },
  });

// Imported from the module rather than the barrel file so that the rich text
// editor only ends up in the chunk that is loaded when the modal is opened.
const LazyPostQuestionModal = lazy(() =>
  import('./components/StackOverflow/StackOverflowPostQuestionModal').then(
    m => ({ default: m.StackOverflowPostQuestionModal }),
  ),
);

/**
 * Turns the ask-question nav item into a plain modal trigger.
 *
 * Nav items in the new frontend system are always links, but this modal is
 * supposed to open over whatever you are doing without disturbing it. So the
 * click is intercepted before the router sees it: no navigation, no route
 * change, no remount of the page underneath.
 *
 * Navigating to the route by other means — a bookmark, a pasted URL, a
 * middle-click — still works, and is handled by the effect below.
 *
 * This is rendered as a sibling of the modal inside the same Suspense
 * boundary, so React mounts both in the same commit and runs the modal's
 * `openAskQuestionModal` listener effect first. Dispatching from outside the
 * boundary would race the lazy chunk on a cold page load.
 */
const AskQuestionRouteListener = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const askQuestionPath = useRouteRef(askQuestionRouteRef);
  const hubPath = useRouteRef(rootRouteRef);
  // The href the nav item actually renders, base path included.
  const askQuestionHref = useHref(askQuestionPath?.() ?? '/');
  // Where to return to if we do end up on the route. Null on a cold load
  // straight into it, in which case we fall back to the hub.
  const returnTo = useRef<string | null>(null);

  useEffect(() => {
    if (!askQuestionPath) {
      return undefined;
    }

    const onClick = (event: MouseEvent) => {
      // Leave modified clicks alone so "open in new tab" keeps working.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as Element | null)?.closest?.(
        'a[href]',
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank') return;

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== askQuestionHref
      ) {
        return;
      }

      // Only preventDefault, deliberately. React Router's Link checks
      // defaultPrevented before navigating, so this is enough to stop it,
      // while leaving other handlers on the way down — analytics on the nav
      // item, for one — to run as they normally would.
      event.preventDefault();
      window.dispatchEvent(new Event('openAskQuestionModal'));
    };

    // Capture phase, so this runs before the router's own link handling.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [askQuestionPath, askQuestionHref]);

  useEffect(() => {
    if (askQuestionPath?.() !== location.pathname) {
      returnTo.current = `${location.pathname}${location.search}${location.hash}`;
      return;
    }

    window.dispatchEvent(new Event('openAskQuestionModal'));
    navigate(returnTo.current ?? hubPath?.() ?? '/', { replace: true });
  }, [location, navigate, askQuestionPath, hubPath]);

  return null;
};

/**
 * Mounts the "ask a question" modal at the app root so it can be opened from
 * anywhere in the app by dispatching the `openAskQuestionModal` window event,
 * or by navigating to the ask-question route.
 *
 * The modal renders nothing until it is opened, and its editor bundle is only
 * fetched on first open.
 *
 * @alpha
 */
export const stackOverflowTeamsAskQuestionModal = AppRootElementBlueprint.make({
  name: 'ask-question-modal',
  params: {
    element: (
      <Suspense fallback={null}>
        <LazyPostQuestionModal />
        <AskQuestionRouteListener />
      </Suspense>
    ),
  },
});

/**
 * The Stack Internal plugin for the new Backstage frontend system.
 *
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'stack-overflow-teams',
  info: { packageJson: () => import('../package.json') },
  routes: {
    root: rootRouteRef,
    askQuestion: askQuestionRouteRef,
  },
  extensions: [
    stackOverflowTeamsApi,
    stackOverflowTeamsPage,
    stackOverflowTeamsAskQuestionPage,
    stackOverflowTeamsNavItem,
    stackOverflowTeamsAskQuestionNavItem,
    stackOverflowTeamsSearchResultListItem,
    stackOverflowTeamsSearchResultType,
    stackOverflowTeamsAskQuestionModal,
  ],
});
