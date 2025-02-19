/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { Config } from '@backstage/config';
import { Readable } from 'stream';

import qs from 'qs';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Tag } from '../types';

/**
 * Extended IndexableDocument with stack overflow specific properties
 *
 * @public
 */
export interface StackOverflowDocument extends IndexableDocument {
  answers: number;
  userReputation: number;
  avatar: string;
  userProfile: string;
  userRole: string;
  tags: object[];
  score: number;
  viewCount: number;
  isAnswered: boolean;
  bounty: {} | null;
  creationDate: string;
  lastActivityDate: string;
}

/**
 * Type representing the request parameters accepted by the {@link StackOverflowQuestionsCollatorFactory}
 *
 * @public
 */
export type StackOverflowQuestionsRequestParams = {
  [key: string]: string | string[] | number;
};

/**
 * Options for {@link StackOverflowQuestionsCollatorFactory}
 *
 * @public
 */
export type StackOverflowQuestionsCollatorFactoryOptions = {
  baseUrl: string;
  teams?: boolean;
  maxPage?: number;
  apiAccessToken?: string;
  teamName?: string;
  requestParams?: StackOverflowQuestionsRequestParams;
  logger: LoggerService;
};
const DEFAULT_MAX_PAGE = 100;

/**
 * Search collator responsible for collecting stack overflow questions to index.
 *
 * @public
 */
export class StackOverflowQuestionsCollatorFactory
  implements DocumentCollatorFactory
{
  protected requestParams: StackOverflowQuestionsRequestParams;
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly teams: boolean;
  private readonly apiAccessToken: string | undefined;
  private readonly teamName: string | undefined;
  private readonly maxPage: number | undefined;
  private readonly logger: LoggerService;
  public readonly type: string = 'stack-overflow';

  private constructor(options: StackOverflowQuestionsCollatorFactoryOptions) {
    this.baseUrl = options.baseUrl;
    this.apiVersion = this.getApiVersionFromUrl(options.baseUrl);
    this.teams = options.teams || false;
    this.apiAccessToken = options.apiAccessToken;
    this.teamName = options.teamName;
    this.maxPage = options.maxPage;
    this.logger = options.logger.child({ documentType: this.type });

    // Sets the same default request parameters as the official API documentation
    // See https://api.stackexchange.com/docs/questions
    this.requestParams = {
      order: 'desc',
      sort: 'activity',
      ...(options.requestParams ?? {}),
    };
  }

  // Helper function to extract API version from baseUrl
  private getApiVersionFromUrl(baseUrl: string) {
    const url = baseUrl.trim();

    if (url.endsWith('2.3')) {
      return 'v2.3';
    }

    if (url.endsWith('v3')) {
      return 'v3';
    }

    return 'unsupported';
  }

  static fromConfig(
    config: Config,
    options: StackOverflowQuestionsCollatorFactoryOptions,
  ) {
    const apiAccessToken = config.getString(
      'stackoverflow.apiAccessToken',
    );
    const teamName = config.getOptionalString('stackoverflow.teamName');
    const baseUrl = config.getString('stackoverflow.baseUrl');
    const teams = config.getOptionalBoolean('stackoverflow.teams') || false;
    const maxPage = options.maxPage || DEFAULT_MAX_PAGE;
    const requestParams = config
      .getOptionalConfig('stackoverflow.requestParams')
      ?.get<StackOverflowQuestionsRequestParams>();

    return new StackOverflowQuestionsCollatorFactory({
      baseUrl,
      teams,
      maxPage,
      apiAccessToken,
      teamName,
      requestParams,
      ...options
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  // Error logging and debugging

  async *execute(): AsyncGenerator<StackOverflowDocument> {
    this.logger.info(`Stack Overflow API Version: ${this.apiVersion}`);

    if (!this.baseUrl) {
      this.logger.error(
        `No stackoverflow.baseUrl configured in your app-config.yaml`,
      );
    }

    if (this.apiVersion !== 'v3') {
      this.logger.error(`This plugin requires API Version 3. Ensure the base URL ends with '/api/v3'.`);
    }

    if (this.teams && !this.teamName) {
      this.logger.error(
        'When stackoverflow.teams is enabled you must define stackoverflow.teamName',
      );
    }

    const params = qs.stringify(this.requestParams, {
      arrayFormat: 'comma',
      addQueryPrefix: true,
    });

    let requestUrl;

    if (this.teams && !this.teamName) {
      this.logger.error(
        'stackoverflow.teamName is required when stackoverflow.teams is true.',
      );
    }
    if (this.teams) {
      requestUrl = `${this.baseUrl}/teams/${this.teamName}/questions${params}`;
    } else {
      requestUrl = `${this.baseUrl}/questions${params}`;
    }

    let hasMorePages = true;
    let page = 1;
    while (hasMorePages) {
      if (page === this.maxPage) {
        this.logger.warn(
          `Over ${this.maxPage} requests to the Stack Overflow API have been made, which may not have been intended. Either specify requestParams that limit the questions returned, or configure a higher maxPage if necessary.`,
        );
        break;
      }
      const res = await fetch(`${requestUrl}&page=${page}`, {
        headers: {
          Authorization: `Bearer ${this.apiAccessToken}`,
        },
      });

      const data = await res.json();

      for (const question of data.items ?? []) {
        const tags =
          question.tags?.map((tag: Tag) => ({
            id: tag.id,
            description: tag.description,
            location: tag.webUrl,
            name: tag.name,
          })) || [];

        yield {
          title: question.title,
          location: question.webUrl,
          text: question.owner?.name || 'Deleted user',
          userReputation: question.owner?.reputation,
          avatar: question.owner?.avatarUrl,
          userProfile: question.owner?.webUrl,
          userRole: question.owner?.role,
          tags: tags,
          answers: question.answerCount,
          score: question.score,
          viewCount: question.viewCount,
          isAnswered: question.isAnswered,
          bounty: question.bounty,
          creationDate: question.creationDate, 
          lastActivityDate: question.lastActivityDate, 
        };
      }
      return;
    }
  }
}
