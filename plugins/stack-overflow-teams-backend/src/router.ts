import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import {
  StackOverflowConfig,
} from './services/StackOverflowService/types';
import { createStackOverflowService } from './services/StackOverflowService';

export async function createRouter({
  logger,
  config,
}: {
  logger: LoggerService;
  config: RootConfigService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const stackOverflowConfig: StackOverflowConfig = {
    baseUrl: config.getString('stackoverflow.baseUrl'),
    apiAccessToken: config.getString('stackoverflow.apiAccessToken'),
    teamName: config.getOptionalString('stackoverflow.teamName'),
  };

  const stackOverflowService = await createStackOverflowService({
    config: stackOverflowConfig,
    logger,
  });

  router.get('/questions', async (_req: Request, res: Response) => {
    try { 
      const questions = await stackOverflowService.getQuestions();
      res.send(questions);
      // Improve this typescript any type
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching questions', {error});
      res.status(500).send({ error: `Failed to fetch questions from ${stackOverflowConfig.baseUrl}`})
    }
  });
  
  router.get('/tags', async (_req: Request, res: Response) => {
    try { 
      const tags = await stackOverflowService.getTags();
      res.send(tags);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching tags', {error});
      res.status(500).send({ error: `Failed to fetch tags from ${stackOverflowConfig.baseUrl}`})
    }
  });

  router.get('/users', async (_req: Request, res: Response) => {
    try { 
      const users = await stackOverflowService.getUsers();
      res.send(users);
    } catch (error: any) {
      // Fix type issue when including the error for some reason
      logger.error('Error fetching users', {error});
      res.status(500).send({ error: `Failed to fetch users from ${stackOverflowConfig.baseUrl}`})
    }
  });

  return router;
}
