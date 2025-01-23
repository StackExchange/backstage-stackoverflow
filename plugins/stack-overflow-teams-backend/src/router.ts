import { LoggerService } from '@backstage/backend-plugin-api';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import {
  StackOverflowAPI,
  StackOverflowConfig,
} from './services/StackOverflowService/types';

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
  router.use(express.json());

  router.get('/questions', async (_req: Request, res: Response) => {
    try {
      const questions = await stackOverflowService.getQuestions();
      res.send(questions);
      // Improve this typescript any type
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching questions', { error });
      res
        .status(500)
        .send({
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
      res
        .status(500)
        .send({
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
      res
        .status(500)
        .send({
          error: `Failed to fetch users from ${stackOverflowConfig.baseUrl}`,
        });
    }
  });

  return router;
}
