import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface InsertLearningPathData {
  learningPath_insert: LearningPath_Key;
}

export interface InsertLearningPathVariables {
  userId: string;
  currentTopic: number;
  recommendedDifficulty: number;
  nextTopic: number;
  updatedAt: TimestampString;
}

export interface InsertPredictionData {
  prediction_insert: Prediction_Key;
}

export interface InsertPredictionVariables {
  userId: string;
  topicIndex: number;
  predictedLevel: number;
  confidence: number;
  updatedAt: TimestampString;
}

export interface InsertQuestionData {
  question_insert: Question_Key;
}

export interface InsertQuestionVariables {
  topicIndex: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  difficulty: number;
  explanation?: string | null;
  createdAt: TimestampString;
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

export interface InsertTopicLabelData {
  topicLabel_insert: TopicLabel_Key;
}

export interface InsertTopicLabelVariables {
  topicIndex: number;
  topicName: string;
  description?: string | null;
}

export interface InsertTopicProfileData {
  topicProfile_insert: TopicProfile_Key;
}

export interface InsertTopicProfileVariables {
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

export interface LearningPath_Key {
  id: UUIDString;
  __typename?: 'LearningPath_Key';
}

export interface ListQuizAttemptsByUserData {
  quizAttempts: ({
    id: UUIDString;
    topicIndex: number;
    score: number;
    createdAt: TimestampString;
  } & QuizAttempt_Key)[];
}

export interface ListQuizAttemptsByUserVariables {
  userId: string;
}

export interface Prediction_Key {
  id: UUIDString;
  __typename?: 'Prediction_Key';
}

export interface Question_Key {
  id: UUIDString;
  __typename?: 'Question_Key';
}

export interface QuizAttempt_Key {
  id: UUIDString;
  __typename?: 'QuizAttempt_Key';
}

export interface TopicLabel_Key {
  id: UUIDString;
  __typename?: 'TopicLabel_Key';
}

export interface TopicProfile_Key {
  id: UUIDString;
  __typename?: 'TopicProfile_Key';
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

/** Generated Node Admin SDK operation action function for the 'InsertTopicLabel' Mutation. Allow users to execute without passing in DataConnect. */
export function insertTopicLabel(dc: DataConnect, vars: InsertTopicLabelVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertTopicLabelData>>;
/** Generated Node Admin SDK operation action function for the 'InsertTopicLabel' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertTopicLabel(vars: InsertTopicLabelVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertTopicLabelData>>;

/** Generated Node Admin SDK operation action function for the 'InsertQuestion' Mutation. Allow users to execute without passing in DataConnect. */
export function insertQuestion(dc: DataConnect, vars: InsertQuestionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertQuestionData>>;
/** Generated Node Admin SDK operation action function for the 'InsertQuestion' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertQuestion(vars: InsertQuestionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertQuestionData>>;

/** Generated Node Admin SDK operation action function for the 'InsertQuizAttempt' Mutation. Allow users to execute without passing in DataConnect. */
export function insertQuizAttempt(dc: DataConnect, vars: InsertQuizAttemptVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertQuizAttemptData>>;
/** Generated Node Admin SDK operation action function for the 'InsertQuizAttempt' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertQuizAttempt(vars: InsertQuizAttemptVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertQuizAttemptData>>;

/** Generated Node Admin SDK operation action function for the 'InsertPrediction' Mutation. Allow users to execute without passing in DataConnect. */
export function insertPrediction(dc: DataConnect, vars: InsertPredictionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertPredictionData>>;
/** Generated Node Admin SDK operation action function for the 'InsertPrediction' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertPrediction(vars: InsertPredictionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertPredictionData>>;

/** Generated Node Admin SDK operation action function for the 'InsertLearningPath' Mutation. Allow users to execute without passing in DataConnect. */
export function insertLearningPath(dc: DataConnect, vars: InsertLearningPathVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertLearningPathData>>;
/** Generated Node Admin SDK operation action function for the 'InsertLearningPath' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertLearningPath(vars: InsertLearningPathVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertLearningPathData>>;

/** Generated Node Admin SDK operation action function for the 'InsertTopicProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function insertTopicProfile(dc: DataConnect, vars: InsertTopicProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertTopicProfileData>>;
/** Generated Node Admin SDK operation action function for the 'InsertTopicProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertTopicProfile(vars: InsertTopicProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertTopicProfileData>>;

/** Generated Node Admin SDK operation action function for the 'ListQuizAttemptsByUser' Query. Allow users to execute without passing in DataConnect. */
export function listQuizAttemptsByUser(dc: DataConnect, vars: ListQuizAttemptsByUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListQuizAttemptsByUserData>>;
/** Generated Node Admin SDK operation action function for the 'ListQuizAttemptsByUser' Query. Allow users to pass in custom DataConnect instances. */
export function listQuizAttemptsByUser(vars: ListQuizAttemptsByUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListQuizAttemptsByUserData>>;

