import { Document, Types } from "mongoose";

export enum ProjectStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  SYNCING = "syncing",
  ERROR = "error",
}

export enum ProjectVisibility {
  PRIVATE = "private",
  TEAM = "team",
  ORGANIZATION = "organization",
  PUBLIC = "public",
}

export enum AIAnalysisStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  PARTIAL = "partial",
}

export enum EndpointSource {
  AI_DISCOVERED = "ai_discovered",
  MANUAL = "manual",
  IMPORTED = "imported",
  SWAGGER = "swagger",
  OPENAPI = "openapi",
}

export interface IAIConfiguration {
  enabled: boolean;
  autoSync: boolean;
  syncInterval?: number;
  endpointDiscovery: {
    enabled: boolean;
    frameworks: string[];
    scanPaths: string[];
    excludePaths: string[];
    lastScan?: Date;
    nextScan?: Date;
  };
  schemaAnalysis: {
    enabled: boolean;
    inferTypes: boolean;
    generateValidation: boolean;
    detectRelationships: boolean;
  };
  testGeneration: {
    enabled: boolean;
    autoGenerate: boolean;
    includeEdgeCases: boolean;
    generateNegativeTests: boolean;
    mockDataStrategy: "realistic" | "random" | "minimal";
  };
  autoExecution: {
    enabled: boolean;
    schedule?: string;
    onDeploy: boolean;
    onPush: boolean;
    environments: Types.ObjectId[];
  };
  model: {
    provider: "anthropic" | "openai" | "custom";
    modelName: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface IDiscoveredEndpoint {
  id: string;
  path: string;
  method: string;
  source: EndpointSource;
  description?: string;
  handler?: string;
  filePath?: string;
  lineNumber?: number;
  authentication?: {
    required: boolean;
    type?: string;
    middleware?: string[];
  };
  parameters?: {
    path?: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
    }>;
    query?: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
      defaultValue?: any;
    }>;
    body?: { type: string; schema?: any; example?: any };
    headers?: Array<{ name: string; required: boolean; description?: string }>;
  };
  responses?: Array<{
    statusCode: number;
    description?: string;
    schema?: any;
    example?: any;
  }>;
  confidence: number;
  discoveredAt: Date;
  lastValidated?: Date;
  validated: boolean;
  requestId?: Types.ObjectId;
  testData?: {
    valid: any[];
    invalid: any[];
    edgeCases: any[];
  };
}

export interface IAIAnalysisResult {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  status: AIAnalysisStatus;
  endpointsDiscovered: number;
  endpointsValidated: number;
  requestsGenerated: number;
  testsGenerated: number;
  codeFiles: {
    total: number;
    scanned: number;
    skipped: number;
  };
  errors: Array<{
    type: string;
    message: string;
    file?: string;
    line?: number;
  }>;
  warnings: Array<{ type: string; message: string; suggestion?: string }>;
  duration: number;
  tokensUsed?: number;
  summary: string;
  changelog?: string[];
}

export interface IProjectSettings {
  defaultEnvironment?: Types.ObjectId;
  baseUrl?: string;
  namingConvention: {
    requests: "camelCase" | "snake_case" | "kebab-case" | "PascalCase";
    collections: "camelCase" | "snake_case" | "kebab-case" | "PascalCase";
  };
  execution: {
    defaultTimeout: number;
    retryOnFailure: boolean;
    maxRetries: number;
    parallelExecution: boolean;
    maxParallel: number;
  };
  notifications: {
    onDiscovery: boolean;
    onTestFailure: boolean;
    onAnalysisComplete: boolean;
    channels: Array<{ type: "email" | "slack" | "webhook"; config: any }>;
  };
  versionControl: {
    autoCommit: boolean;
    commitMessage?: string;
    branch?: string;
  };
}

export interface IIntegration {
  type: string;
  enabled: boolean;
  config: any;
  lastSyncAt?: Date;
}

export interface IProjectAnalytics {
  totalRequests: number;
  totalCollections: number;
  totalEndpoints: number;
  execution: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    avgResponseTime: number;
  };
  ai: {
    totalScans: number;
    endpointsDiscovered: number;
    requestsGenerated: number;
    lastScanAt?: Date;
  };
  team: {
    totalMembers: number;
    activeMembers: number;
  };
}

export interface ISyncStatus {
  isActive: boolean;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    timestamp: Date;
  };
  syncErrors: Array<{
    timestamp: Date;
    error: string;
    resolved: boolean;
  }>;
}

export interface IProject extends Document {
  projectName: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  repositoryId?: Types.ObjectId;
  databaseConnections: Types.ObjectId[];
  workspaceId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  collections: Types.ObjectId[];
  requests: Types.ObjectId[];
  environments: Types.ObjectId[];
  aiConfiguration: IAIConfiguration;
  discoveredEndpoints: IDiscoveredEndpoint[];
  analysisHistory: IAIAnalysisResult[];
  currentAnalysis?: IAIAnalysisResult;
  owner: Types.ObjectId;
  teams: Types.ObjectId[];
  members: Array<{
    userId: Types.ObjectId;
    role: "owner" | "admin" | "editor" | "viewer";
    addedAt: Date;
    addedBy: Types.ObjectId;
  }>;
  settings: IProjectSettings;
  integrations: IIntegration[];
  readme?: string;
  documentation?: {
    url?: string;
    content?: string;
    generatedByAI: boolean;
    lastUpdated?: Date;
  };
  tags: string[];
  category?: string;
  analytics: IProjectAnalytics;
  syncStatus: ISyncStatus;
  apiSpecification?: {
    type: "openapi" | "swagger" | "graphql" | "custom";
    version?: string;
    url?: string;
    content?: any;
    importedAt?: Date;
  };
  testSuites: Types.ObjectId[];
  testRuns: Array<{
    id: string;
    startedAt: Date;
    completedAt?: Date;
    status: "running" | "completed" | "failed";
    totalTests: number;
    passedTests: number;
    failedTests: number;
    triggeredBy: "manual" | "schedule" | "ai" | "webhook";
  }>;
  webhooks: Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
    secret?: string;
  }>;
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}
