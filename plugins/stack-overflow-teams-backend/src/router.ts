import { LoggerService } from '@backstage/backend-plugin-api';
import express, { request, Request, Response } from 'express';
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

  // OAuth routes

  router.get('/auth/start', async (req: Request, res: Response) => {
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
        throw new Error('State does not match the one sent to the user');
      }

      const { accessToken, expires } = await authService.exchangeCodeForToken(
        code,
        codeVerifier,
      );
      // The cookie's max age is linked to the Token's expiration, the default expiration is 24 hours.
      res.clearCookie('socodeverifier');
      res.clearCookie('state')
      res.cookie('stackoverflow-access-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expires
      });
      res.json({'response': 'ok'})
    } catch (error: any) {
      logger.error('Failed to exchange code for token', error);
      res
        .clearCookie('socodeverifier')
        .clearCookie('state')
        .status(500)
        .json({ error: 'Failed to authenticate to Stack Overflow for Teams' });
    }
  });

  router.get('/questions', async (_req: Request, res: Response) => {
    try {
      const questions = await stackOverflowService.getQuestions();
      res.send(questions);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching questions', { error });
      res.status(500).send({
        error: `Failed to fetch questions from ${stackOverflowConfig.baseUrl}`,
      });
    }
  });

  router.get('/tags', async (_req: Request, res: Response) => {
    try {
      const tags = await stackOverflowService.getTags();
      res.send(tags);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching tags', { error });
      res.status(500).send({
        error: `Failed to fetch tags from ${stackOverflowConfig.baseUrl}`,
      });
    }
  });

  router.get('/users', async (_req: Request, res: Response) => {
    try {
      const users = await stackOverflowService.getUsers();
      res.send(users);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching users', { error });
      res.status(500).send({
        error: `Failed to fetch users from ${stackOverflowConfig.baseUrl}`,
      });
    }
  });

  router.post('/questions', async (_req: Request, res: Response) => {
    try {
      const cookies = cookieParse(request);
      const { title, body, tags } = request.body;
      const authToken = cookies['stackoverflow-access-token'];
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized, no access token' });
      }
      const question = await stackOverflowService.postQuestions(
        title,
        body,
        tags,
        authToken,
      );
      res.status(201).json(question);
    } catch (error: any) {
      logger.error('Error posting question', { error });
      res.status(500).json({
        error: `Failed to post question to ${stackOverflowConfig.baseUrl}`,
      });
    }
  });

  return router;
}
