import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface GetQuizAttemptsData {
  quizAttempts: ({
    id: UUIDString;
    topicIndex: number;
    score: number;
    totalQuestion: number;
    correctAnswer: number;
    difficulty: number;
    createdAt: TimestampString;
  } & QuizAttempt_Key)[];
}

export interface GetQuizAttemptsVariables {
  userId: string;
}

export interface GetUserProfileData {
  topicProfile?: {
    topic1: number;
    topic2: number;
    topic3: number;
    topic4: number;
    topic5: number;
    topic6: number;
    topic7: number;
    topic8: number;
    topic9: number;
    topic10: number;
    topic11: number;
    topic12: number;
    updatedAt: TimestampString;
  };
}

export interface GetUserProfileVariables {
  userId: string;
}

export interface InsertQuizAttemptData {
  quizAttempt_insert: QuizAttempt_Key;
}

export interface InsertQuizAttemptVariables {
  userId: string;
  topicIndex: number;
  score: number;
  totalQuestion: number;
  correctAnswer: number;
  difficulty: number;
  createdAt: TimestampString;
}

export interface LearningPath_Key {
  userId: string;
  __typename?: 'LearningPath_Key';
}

export interface Prediction_Key {
  userId: string;
  topicIndex: number;
  __typename?: 'Prediction_Key';
}

export interface QuizAttempt_Key {
  id: UUIDString;
  __typename?: 'QuizAttempt_Key';
}

export interface TopicProfile_Key {
  userId: string;
  __typename?: 'TopicProfile_Key';
}

export interface UpsertLearningPathData {
  learningPath_upsert: LearningPath_Key;
}

export interface UpsertLearningPathVariables {
  userId: string;
  currentTopic: number;
  recommendedDifficulty: number;
  nextTopic: number;
  updatedAt: TimestampString;
}

export interface UpsertPredictionData {
  prediction_upsert: Prediction_Key;
}

export interface UpsertPredictionVariables {
  userId: string;
  topicIndex: number;
  predictedLevel: number;
  confidence: number;
  updatedAt: TimestampString;
}

export interface UpsertTopicProfileData {
  topicProfile_upsert: TopicProfile_Key;
}

export interface UpsertTopicProfileVariables {
  userId: string;
  topic1: number;
  topic2: number;
  topic3: number;
  topic4: number;
  topic5: number;
  topic6: number;
  topic7: number;
  topic8: number;
  topic9: number;
  topic10: number;
  topic11: number;
  topic12: number;
  updatedAt: TimestampString;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  id: string;
  email: string;
  name: string;
  createdAt: TimestampString;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'UpsertUser' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertUserData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertUser(vars: UpsertUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertUserData>>;

/** Generated Node Admin SDK operation action function for the 'InsertQuizAttempt' Mutation. Allow users to execute without passing in DataConnect. */
export function insertQuizAttempt(dc: DataConnect, vars: InsertQuizAttemptVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertQuizAttemptData>>;
/** Generated Node Admin SDK operation action function for the 'InsertQuizAttempt' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertQuizAttempt(vars: InsertQuizAttemptVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertQuizAttemptData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertPrediction' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertPrediction(dc: DataConnect, vars: UpsertPredictionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertPredictionData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertPrediction' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertPrediction(vars: UpsertPredictionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertPredictionData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertLearningPath' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertLearningPath(dc: DataConnect, vars: UpsertLearningPathVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertLearningPathData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertLearningPath' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertLearningPath(vars: UpsertLearningPathVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertLearningPathData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertTopicProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertTopicProfile(dc: DataConnect, vars: UpsertTopicProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertTopicProfileData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertTopicProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertTopicProfile(vars: UpsertTopicProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertTopicProfileData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserProfile' Query. Allow users to execute without passing in DataConnect. */
export function getUserProfile(dc: DataConnect, vars: GetUserProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserProfileData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserProfile' Query. Allow users to pass in custom DataConnect instances. */
export function getUserProfile(vars: GetUserProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserProfileData>>;

/** Generated Node Admin SDK operation action function for the 'GetQuizAttempts' Query. Allow users to execute without passing in DataConnect. */
export function getQuizAttempts(dc: DataConnect, vars: GetQuizAttemptsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetQuizAttemptsData>>;
/** Generated Node Admin SDK operation action function for the 'GetQuizAttempts' Query. Allow users to pass in custom DataConnect instances. */
export function getQuizAttempts(vars: GetQuizAttemptsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetQuizAttemptsData>>;

