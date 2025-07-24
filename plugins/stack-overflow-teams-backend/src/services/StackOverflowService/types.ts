export type Question = {
  id: number;
  title: string;
  body: string;
};

export type Article = {
  id: number;
  viewCount: number;
  articleType: string;
  readTimeInMinutes: number;
  title: string;
  snippet: string;
  tags: Tag[];
  owner: User;
  creationDate: string;
  score: number;
  webUrl: string;
};

export type Tag = {
  id: number;
  name: string;
  description: string;
  postCount: number;
  webUrl: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string;
  webUrl: string;
  reputation: number;
  role: string;
};

export type SearchItem =
  | (Question & { type: 'question'; questionId: number })
  | (Article & { type: 'article'; articleId: number });

export type PaginatedResponse<T> = {
  totalCount: number;
  pageSize: number;
  page: number;
  totalPage: number;
  sort: string;
  order: string;
  items: T[];
};

export type StackOverflowConfig = {
  baseUrl?: string;
  teamName?: string;
  clientId?: number;
  redirectUri?: string;
  authUrl?: string;
};

export interface QuestionFilters {
  sort?: 'activity' | 'creation' | 'score';
  order?: 'asc' | 'desc';
  isAnswered?: boolean;
  page?: number;
  pageSize?: number;
}

export interface StackOverflowAPI {
  // Enhanced questions method with filtering
  getQuestions: (authToken: string, filters?: QuestionFilters) => Promise<PaginatedResponse<Question>>;
  
  // Keep original signatures for tags and users
  getTags: (authToken: string, search?: string) => Promise<PaginatedResponse<Tag>>;
  getUsers: (authToken: string) => Promise<PaginatedResponse<User>>;
  getMe: (authToken: string) => Promise<User>;
  
  // Convenience methods for common question filtering scenarios
  getActiveQuestions: (authToken: string, page?: number) => Promise<PaginatedResponse<Question>>;
  getNewestQuestions: (authToken: string, page?: number) => Promise<PaginatedResponse<Question>>;
  getTopScoredQuestions: (authToken: string, page?: number) => Promise<PaginatedResponse<Question>>;
  getUnansweredQuestions: (authToken: string, page?: number) => Promise<PaginatedResponse<Question>>;
  
  // POST
  postQuestions: (title: string, body: string, tags: string[], authToken: string) => Promise<Question>;
  
  // SEARCH
  getSearch: (query: string, authToken: string, page?: number) => Promise<PaginatedResponse<SearchItem>>;
}