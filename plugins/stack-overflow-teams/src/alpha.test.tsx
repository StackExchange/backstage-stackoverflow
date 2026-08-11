import { fireEvent, screen } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  renderTestApp,
} from '@backstage/frontend-test-utils';
import {
  ApiBlueprint,
  NavItemBlueprint,
  coreExtensionData,
} from '@backstage/frontend-plugin-api';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';

import stackOverflowTeamsPlugin, {
  stackOverflowTeamsApi,
  stackOverflowTeamsAskQuestionNavItem,
  stackOverflowTeamsAskQuestionPage,
  stackOverflowTeamsNavItem,
  stackOverflowTeamsPage,
  stackOverflowTeamsSearchResultListItem,
  stackOverflowTeamsSearchResultType,
} from './alpha';
import { stackoverflowteamsApiRef } from './api';
import type { StackOverflowAPI } from './api/StackOverflowAPI';
import { askQuestionRouteRef, rootRouteRef } from './routes';

/**
 * Booting a whole app and lazily loading the page takes a while under jsdom,
 * especially on a cold module cache in CI.
 */
const APP_RENDER_TIMEOUT_MS = 30_000;

const emptyPage = {
  totalCount: 0,
  pageSize: 30,
  page: 1,
  totalPages: 1,
  sort: 'creation',
  order: 'desc',
  items: [],
};

const createMockStackOverflowApi = () =>
  ({
    getAuthStatus: jest.fn().mockResolvedValue(true),
    getTeamName: jest.fn().mockResolvedValue('Test Team'),
    getBaseUrl: jest.fn().mockResolvedValue('https://stack.example.com'),
    getQuestions: jest.fn().mockResolvedValue(emptyPage),
    getTags: jest.fn().mockResolvedValue(emptyPage),
    getUsers: jest.fn().mockResolvedValue(emptyPage),
    getMe: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Ada Lovelace',
      jobTitle: null,
      department: null,
      avatarUrl: 'https://stack.example.com/avatar.png',
      webUrl: 'https://stack.example.com/users/1',
      reputation: 101,
      role: 'Registered',
    }),
  } as unknown as StackOverflowAPI);

/**
 * The plugin with its API extension swapped for a mock, so that the tests
 * exercise the real extension wiring without hitting the backend.
 */
const testPlugin = stackOverflowTeamsPlugin.withOverrides({
  extensions: [
    stackOverflowTeamsPlugin.getExtension('api:stack-overflow-teams').override({
      params: defineParams =>
        defineParams({
          api: stackoverflowteamsApiRef,
          deps: {},
          factory: () => createMockStackOverflowApi(),
        }),
    }),
  ],
});

describe('stackOverflowTeamsPlugin (new frontend system)', () => {
  it('is a frontend plugin that exposes its root route', () => {
    expect(stackOverflowTeamsPlugin.id).toBe('stack-overflow-teams');
    expect(stackOverflowTeamsPlugin.routes.root).toBe(rootRouteRef);
  });

  it('mounts the hub page at /stack-overflow-teams', () => {
    const tester = createExtensionTester(stackOverflowTeamsPage);

    expect(tester.get(coreExtensionData.routePath)).toBe(
      '/stack-overflow-teams',
    );
    expect(tester.get(coreExtensionData.routeRef)).toBe(rootRouteRef);
  });

  it('allows the hub page path to be changed through config', () => {
    const tester = createExtensionTester(stackOverflowTeamsPage, {
      config: { path: '/knowledge' },
    });

    expect(tester.get(coreExtensionData.routePath)).toBe('/knowledge');
  });

  it('contributes a nav item pointing at the hub', () => {
    const target = createExtensionTester(stackOverflowTeamsNavItem).get(
      NavItemBlueprint.dataRefs.target,
    );

    expect(target.title).toBe('Stack Internal');
    expect(target.routeRef).toBe(rootRouteRef);
    expect(target.icon).toBeDefined();
  });

  it('mounts the ask-question route under the hub', () => {
    const tester = createExtensionTester(stackOverflowTeamsAskQuestionPage);

    expect(tester.get(coreExtensionData.routePath)).toBe(
      '/stack-overflow-teams/ask',
    );
    expect(tester.get(coreExtensionData.routeRef)).toBe(askQuestionRouteRef);
  });

  it('contributes an "Ask a Question" nav item pointing at that route', () => {
    const target = createExtensionTester(
      stackOverflowTeamsAskQuestionNavItem,
    ).get(NavItemBlueprint.dataRefs.target);

    expect(target.title).toBe('Ask a Question');
    expect(target.routeRef).toBe(askQuestionRouteRef);
    expect(target.icon).toBeDefined();
  });

  it('provides the Stack Internal API', () => {
    const apiFactory = createExtensionTester(stackOverflowTeamsApi).get(
      ApiBlueprint.dataRefs.factory,
    );

    expect(apiFactory.api).toBe(stackoverflowteamsApiRef);

    const api = apiFactory.factory({
      discoveryApi: { getBaseUrl: async () => 'http://localhost:7007/api' },
      fetchApi: { fetch: jest.fn() },
    }) as StackOverflowAPI;

    expect(api.getQuestions).toEqual(expect.any(Function));
    expect(api.postQuestion).toEqual(expect.any(Function));
  });

  it('adds Stack Internal to the search result type filter', () => {
    const resultType = createExtensionTester(
      stackOverflowTeamsSearchResultType,
    ).get(SearchFilterResultTypeBlueprint.dataRefs.resultType);

    expect(resultType.value).toBe('stack-overflow');
    expect(resultType.name).toBe('Stack Internal');
  });

  describe('search result list item', () => {
    it('only claims Stack Internal results', () => {
      const item = createExtensionTester(
        stackOverflowTeamsSearchResultListItem,
      ).get(SearchResultListItemBlueprint.dataRefs.item);

      expect(
        item.predicate?.({ type: 'stack-overflow', document: {} as any }),
      ).toBe(true);
      expect(
        item.predicate?.({ type: 'software-catalog', document: {} as any }),
      ).toBe(false);
    });

    it('renders a question', async () => {
      const item = createExtensionTester(
        stackOverflowTeamsSearchResultListItem,
      ).get(SearchResultListItemBlueprint.dataRefs.item);
      const ResultItem = item.component;

      renderInTestApp(
        <ResultItem
          result={
            {
              title: 'How do I configure the collator?',
              location: 'https://stack.example.com/questions/1',
              text: 'Ada Lovelace',
              answers: 2,
              score: 5,
              tags: [],
            } as any
          }
        />,
      );

      expect(
        await screen.findByText('How do I configure the collator?', undefined, {
          timeout: APP_RENDER_TIMEOUT_MS,
        }),
      ).toBeInTheDocument();
      expect(await screen.findByText('2 answers')).toBeInTheDocument();
    }, 60_000);
  });

  it('renders the hub and the nav item in an app built on the new frontend system', async () => {
    renderTestApp({
      features: [testPlugin],
      initialRouteEntries: ['/stack-overflow-teams'],
    });

    // The whole app tree, including the lazily loaded page, has to settle
    // before anything shows up, so give it more room than the 1s default.
    expect(
      await screen.findByText('Find answers. Share what you know.', undefined, {
        timeout: APP_RENDER_TIMEOUT_MS,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Connected to')).toBeInTheDocument();
    expect(await screen.findByText('Test Team')).toBeInTheDocument();

    // Once in the sidebar nav, once in the page header.
    expect(await screen.findAllByText('Stack Internal')).toHaveLength(2);
  }, 60_000);

  it('opens the ask-question modal from the nav item without navigating away', async () => {
    renderTestApp({
      features: [testPlugin],
      initialRouteEntries: ['/stack-overflow-teams'],
    });

    expect(
      await screen.findByText('Find answers. Share what you know.', undefined, {
        timeout: APP_RENDER_TIMEOUT_MS,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Ask a Question' }));

    expect(
      await screen.findByRole('heading', { name: 'Ask a Question' }),
    ).toBeInTheDocument();
    // The page underneath is untouched — the click never reached the router.
    expect(
      screen.getByText('Find answers. Share what you know.'),
    ).toBeInTheDocument();
  }, 60_000);

  it('opens the ask-question modal when the app lands on that route directly', async () => {
    renderTestApp({
      features: [testPlugin],
      initialRouteEntries: ['/stack-overflow-teams/ask'],
    });

    // The modal is mounted lazily at the app root, so this also covers the
    // ordering between it and the route listener that opens it.
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Ask a Question' },
        {
          timeout: APP_RENDER_TIMEOUT_MS,
        },
      ),
    ).toBeInTheDocument();

    // Deep links bounce out of the trigger route onto the hub.
    expect(
      await screen.findByText('Find answers. Share what you know.'),
    ).toBeInTheDocument();
  }, 60_000);
});
