import { LoggerService } from '@backstage/backend-plugin-api';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import {
  StackOverflowAPI,
  StackOverflowConfig,
} from './services/StackOverflowService/types';
import { createStackOverflowAuth } from './api';

export async function createRouter({
  logger,
  stackOverflowConfig,
  stackOverflowService,
}: {
  logger: LoggerService;
  stackOverflowConfig: StackOverflowConfig;
  stackOverflowService: StackOverflowAPI;
}): Promise<express.Router> {
  const router = Router();
  const authService = createStackOverflowAuth(stackOverflowConfig, logger);

  router.use(express.json());

  // Parse cookies
  function cookieParse(req: Request): Record<string, string> {
    const rawCookies = req.headers.cookie;
    if (!rawCookies) return {};
    return Object.fromEntries(
      rawCookies.split('; ').map(cookie => {
        const [key, ...value] = cookie.split('=');
        return [key, value.join('=')];
      }),
    );
  }

  // OAuth Authentication routes

  router.get('/auth/start', async (_req: Request, res: Response) => {
    const { url, codeVerifier, state } = await authService.getAuthUrl();

    res.cookie('socodeverifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.json({ authUrl: url });
  });

  router.get('/callback', async (req, res) => {
    const cookies = cookieParse(req);
    const storedState = cookies.state;
    const codeVerifier = cookies.socodeverifier;
    const code = req.query.code as string;
    const state = req.query.state as string;

    try {
      if (state !== storedState) {
        return res
          .clearCookie('socodeverifier')
          .clearCookie('state')
          .status(401)
          .json({ error: 'Invalid State' });
      }

      const { accessToken, expires } = await authService.exchangeCodeForToken(
        code,
        codeVerifier,
      );
      // The cookie's max age is linked to the Token's expiration, the default expiration is 24 hours.
      return res
        .clearCookie('socodeverifier')
        .clearCookie('state')
        .cookie('stackoverflow-access-token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: expires * 1000,
        })
        .json({ ok: true });
    } catch (error: any) {
      logger.error('Failed to exchange code for token', error);
      return res
        .clearCookie('socodeverifier')
        .clearCookie('state')
        .status(500)
        .json({ error: 'Failed to authenticate to Stack Overflow for Teams' });
    }
  });

  router.get('/authStatus', async (req: Request, res: Response) => {
    try {
      const cookies = cookieParse(req);
      const authToken = cookies['stackoverflow-access-token'];

      if (!authToken) {
        return res
          .status(401)
          .json({ error: 'Missing Stack Overflow Teams Access Token' });
      }

      const baseUrl = authService.config.baseUrl

      const userResponse = await fetch(`${baseUrl}/api/v3/users/me`, {
        headers: { Authorization: `Bearer ${authToken}`}
      });

      if (userResponse.status === 401 || userResponse.status === 403) {
        res.clearCookie('stackoverflow-access-token')
        return res.status(401).json({ error: 'Invalid or expired token'})
      }

      if (!userResponse.ok) {
        res.clearCookie('stackoverflow-access-token')
        logger.error(`Token validation failed: ${await userResponse.text()}`)
        return res.status(500).json ({error: 'Failed to validate token'})
      }

      return res
        .status(200)
        .json({ ok: 'Stack Overflow Teams Access Token detected' });
    } catch (error: any) {
      logger.error('Error getting authentication status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Logout route

  router.post('/logout', async (_req: Request, res: Response) => {
    try {
      res
        .clearCookie('stackoverflow-access-token')
        .status(200)
        .json({ ok: true });
    } catch (error: any) {
      logger.error('Error removing authentication token:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Info routes

  router.get('/baseurl', async (_req: Request, res: Response) => {
    const baseUrl = new URL(stackOverflowConfig.baseUrl).origin;
    try {
      res.json({ SOInstance: baseUrl });
    } catch (error) {
      console.error('Error fetching Stack Overflow base URL:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch Stack Overflow base URL' });
    }
  });

  // Read routes

  router.get('/me', async (_req: Request, res: Response) => {
    try {
      const cookies = cookieParse(_req);
      const authToken = cookies['stackoverflow-access-token'];
      const me = await stackOverflowService.getMe(authToken);
      res.send(me);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching questions', { error });
      res.status(500).send({
        error: `Failed to fetch questions from the Stack Overflow instance`,
      });
    }
  });

  router.get('/questions', async (_req: Request, res: Response) => {
    try {
      const cookies = cookieParse(_req);
      const authToken = cookies['stackoverflow-access-token'];
      const questions = await stackOverflowService.getQuestions(authToken);
      res.send(questions);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching questions', { error });
      res.status(500).send({
        error: `Failed to fetch questions from the Stack Overflow instance`,
      });
    }
  });

  router.get('/tags', async (_req: Request, res: Response) => {
    try {
      const cookies = cookieParse(_req);
      const authToken = cookies['stackoverflow-access-token'];
      const tags = await stackOverflowService.getTags(authToken);
      res.send(tags);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching tags', { error });
      res.status(500).send({
        error: `Failed to fetch tags from the Stack Overflow instance`,
      });
    }
  });

  router.get('/users', async (_req: Request, res: Response) => {
    try {
      const cookies = cookieParse(_req);
      const authToken = cookies['stackoverflow-access-token'];
      const users = await stackOverflowService.getUsers(authToken);
      res.send(users);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching users', { error });
      res.status(500).send({
        error: `Failed to fetch users from the Stack Overflow instance`,
      });
    }
  });

  router.get('/search', async (req: Request, res: Response) => {
    try {
      const cookies = cookieParse(req);
      const authToken = cookies['stackoverflow-access-token'];
      const { query } = req.body;

      if (!authToken) {
        return res
          .status(401)
          .json({ error: 'Missing Stack Overflow Teams Access Token' });
      }
      const searchResults = await stackOverflowService.getSearch(
        query,
        authToken,
      );
      return res.status(201).json(searchResults);
    } catch (error: any) {
      logger.error('Error searching items', { error });
      return res.status(500).json({
        error: `Failed to search items on the Stack Overflow instance`,
      });
    }
  });

  // Write routes

  router.post('/questions', async (req: Request, res: Response) => {
    try {
      const cookies = cookieParse(req);
      const { title, body, tags } = req.body;
      const authToken = cookies['stackoverflow-access-token'];
      if (!authToken) {
        return res
          .status(401)
          .json({ error: 'Missing Stack Overflow Teams Access Token' });
      }
      const question = await stackOverflowService.postQuestions(
        title,
        body,
        tags,
        authToken,
      );
      return res.status(201).json(question);
    } catch (error: any) {

      if (error.status === 400) {
        return res.status(400).json({
          error: error.responseData?.detail || 'Validation failed',
          validationDetails: error.responseData,
        });
      }
      return res.status(500).json({
        error: `Failed to post question to the Stack Overflow instance`,
      });
    }
  });

  return router;
}
