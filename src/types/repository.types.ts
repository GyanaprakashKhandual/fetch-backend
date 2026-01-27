import { Document, Types } from "mongoose";

export enum RepositoryProvider {
  GITHUB = "github",
  GITLAB = "gitlab",
  BITBUCKET = "bitbucket",
  AZURE_DEVOPS = "azure_devops",
  SELF_HOSTED = "self_hosted",
  LOCAL = "local",
}

export enum RepositoryStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  SYNCING = "syncing",
  ERROR = "error",
  CLONING = "cloning",
  ARCHIVED = "archived",
}

export enum RepositoryVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  INTERNAL = "internal",
}

export enum FileType {
  ROUTE = "route",
  CONTROLLER = "controller",
  MODEL = "model",
  MIDDLEWARE = "middleware",
  CONFIG = "config",
  TEST = "test",
  SCHEMA = "schema",
  MIGRATION = "migration",
  UTIL = "util",
  OTHER = "other",
}

export enum ScanStatus {
  IDLE = "idle",
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IRepositoryAuth {
  type: "token" | "ssh" | "oauth" | "basic";
  token?: string;
  tokenExpiry?: Date;
  sshKey?: string;
  sshKeyPassphrase?: string;
  sshKeyFingerprint?: string;
  oauthAccessToken?: string;
  oauthRefreshToken?: string;
  oauthExpiry?: Date;
  oauthScopes?: string[];
  username?: string;
  password?: string;
}

export interface IBranch {
  name: string;
  isDefault: boolean;
  isProtected: boolean;
  lastCommit: {
    hash: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    timestamp: Date;
    url?: string;
  };
  ahead?: number;
  behind?: number;
  lastSyncedAt?: Date;
}

export interface IScannedFile {
  id: string;
  path: string;
  name: string;
  extension: string;
  type: FileType;
  size: number;
  language?: string;
  linesOfCode: number;
  functions: Array<{
    name: string;
    lineStart: number;
    lineEnd: number;
    parameters?: string[];
    isAsync?: boolean;
  }>;
  imports: string[];
  exports: string[];
  framework?: string;
  endpoints: Array<{
    method: string;
    path: string;
    handler: string;
    lineNumber: number;
    middleware?: string[];
  }>;
  lastModified: Date;
  lastScanned: Date;
  hash: string;
  url?: string;
}

export interface IWebhookConfig {
  id: string;
  enabled: boolean;
  provider: RepositoryProvider;
  url?: string;
  secret?: string;
  events: string[];
  lastTriggered?: Date;
  deliveries: Array<{
    id: string;
    event: string;
    timestamp: Date;
    success: boolean;
    payload?: any;
    error?: string;
  }>;
}

export interface ISyncConfig {
  autoSync: boolean;
  syncInterval: number;
  syncOnPush: boolean;
  syncOnPullRequest: boolean;
  syncOnRelease: boolean;
  branches: string[];
  includePaths: string[];
  excludePaths: string[];
  fileExtensions: string[];
  maxFileSize: number;
  maxDepth?: number;
  followSymlinks: boolean;
}

export interface IScanResult {
  id: string;
  status: ScanStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  branch: string;
  commit: string;
  filesScanned: number;
  filesSkipped: number;
  directoriesScanned: number;
  endpointsDiscovered: number;
  schemasDiscovered: number;
  newFiles: number;
  modifiedFiles: number;
  deletedFiles: number;
  errors: Array<{
    file?: string;
    line?: number;
    message: string;
    type: string;
  }>;
  scanSpeed: number;
  triggeredBy: "manual" | "webhook" | "schedule" | "ai";
}

export interface IFrameworkInfo {
  name: string;
  version?: string;
  language: string;
  confidence: number;
  configFiles: string[];
  dependencies?: Record<string, string>;
  entryPoints?: string[];
  routeFiles?: string[];
  conventions?: {
    routing?: string;
    middleware?: string;
    controllers?: string;
    models?: string;
  };
}

export interface IPullRequest {
  id: string;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  author: string;
  url: string;
  createdAt: Date;
  updatedAt?: Date;
  mergedAt?: Date;
  additions: number;
  deletions: number;
  changedFiles: number;
  sourceBranch: string;
  targetBranch: string;
  analyzed: boolean;
  analyzedAt?: Date;
  affectedEndpoints?: string[];
}

export interface IRepositoryStats {
  totalFiles: number;
  scannedFiles: number;
  totalSize: number;
  totalLines: number;
  filesByType: Map<FileType, number>;
  languageDistribution: Map<string, number>;
  endpoints: {
    total: number;
    byMethod: Map<string, number>;
  };
  lastUpdated: Date;
}

export interface IRepository extends Document {
  name: string;
  description?: string;
  provider: RepositoryProvider;
  visibility: RepositoryVisibility;
  repoUrl: string;
  cloneUrl: string;
  sshUrl?: string;
  webUrl?: string;
  owner: string;
  repoName: string;
  fullName: string;
  externalId?: string;
  authentication: IRepositoryAuth;
  localPath?: string;
  isCloned: boolean;
  cloneSize?: number;
  defaultBranch: string;
  branches: IBranch[];
  activeBranch: string;
  syncConfig: ISyncConfig;
  status: RepositoryStatus;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  scannedFiles: IScannedFile[];
  lastScanResult?: IScanResult;
  scanHistory: IScanResult[];
  frameworks: IFrameworkInfo[];
  stats: IRepositoryStats;
  webhooks: IWebhookConfig[];
  pullRequests: IPullRequest[];
  projectId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  addedBy: Types.ObjectId;
  collaborators: Array<{
    userId: Types.ObjectId;
    role: "admin" | "write" | "read";
    addedAt: Date;
  }>;
  language?: string;
  topics: string[];
  license?: string;
  providerData?: {
    stars?: number;
    forks?: number;
    watchers?: number;
    openIssues?: number;
    hasWiki?: boolean;
    hasPages?: boolean;
  };
  syncErrors: Array<{
    timestamp: Date;
    error: string;
    type: "clone" | "pull" | "scan" | "webhook" | "auth";
    resolved: boolean;
    resolvedAt?: Date;
  }>;
  settings: {
    autoDetectFramework: boolean;
    autoGenerateEndpoints: boolean;
    notifyOnChanges: boolean;
    keepCloneUpdated: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}
