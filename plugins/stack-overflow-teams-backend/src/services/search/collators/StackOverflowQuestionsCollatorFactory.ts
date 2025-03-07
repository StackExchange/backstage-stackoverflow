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
  apiAccessToken?: string;
  teamName?: string;
  requestParams?: StackOverflowQuestionsRequestParams;
  logger: LoggerService;
};

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
  private readonly teams: boolean;
  private readonly apiAccessToken: string | undefined;
  private readonly teamName: string | undefined;
  private readonly logger: LoggerService;
  private readonly referrer: string = 'Backstage_Plugin'
  public readonly type: string = 'stack-overflow';

    // Helper function to force API Version 3.
  private forceAPIv3(baseUrl: string) {
      return `${new URL(baseUrl).origin}/api/v3`;
    }

  private constructor(options: StackOverflowQuestionsCollatorFactoryOptions) {
    this.baseUrl = this.forceAPIv3(options.baseUrl) 
    this.teams = options.teams || false;
    this.apiAccessToken = options.apiAccessToken;
    this.teamName = options.teamName;
    this.logger = options.logger.child({ documentType: this.type });

    // Sets the same default request parameters as the official API documentation
    // See https://api.stackexchange.com/docs/questions
    this.requestParams = {
      order: 'desc',
      sort: 'activity',
      ...(options.requestParams ?? {}),
    };
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
    const requestParams = config
      .getOptionalConfig('stackoverflow.requestParams')
      ?.get<StackOverflowQuestionsRequestParams>();

    return new StackOverflowQuestionsCollatorFactory({
      baseUrl,
      teams,
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
    this.logger.info(`Retrieving data using Stack Overflow API Version 3`);

    if (!this.baseUrl) {
      this.logger.error(
        `No stackoverflow.baseUrl configured in your app-config.yaml`,
      );
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

    let page = 1;
    let totalPages = 1
    const pageSize = this.requestParams.pageSize || 50
    this.logger.warn('Starting collating Stack Overflow questions, wait for the success message')
    while (page <= totalPages) {
      const res = await fetch(`${requestUrl}&page=${page}&pageSize=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${this.apiAccessToken}`,
        },
      }
    );

      const data = await res.json();
      totalPages = data.totalPages

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
          location: `${question.webUrl}?r=${this.referrer}`,
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
      page++
    }
  }
}
