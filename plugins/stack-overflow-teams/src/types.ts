export type Question = {
    id: number
    title: string
    body: string
    webUrl: string
    score: number
    viewCount: number
    isAnswered: boolean
    tags: [Tag];
    bounty: {} | null;
    creationDate: string;
    lastActivityDate: string;
    answerCount: number;
  }
  
  export type Tag = {
    id: number
    name: string
    description: string
    postCount: number
    webUrl: string
  }
  
  export type User = {
    id: number
    name: string
    jobTitle: string | null
    department: string | null
    avatarUrl: string
    webUrl: string
    reputation: number
    role: string
  }
  
  export type PaginatedResponse<T> = {
    totalCount: number
    pageSize: number
    page: number
    totalPages: number
    sort: string
    order: string
    items: T[];
  }
  
  export type StackOverflowConfig = {
    baseUrl: string;
    teamName?: string;
    apiAccessToken: string;
  }
  
  export interface StackOverflowAPI {
    getQuestions(): Promise<PaginatedResponse<Question>>
    getTags(): Promise<PaginatedResponse<Tag>>
    getUsers(): Promise<PaginatedResponse<User>>
  }  