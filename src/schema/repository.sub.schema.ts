import { Schema } from "mongoose";
import {
  IRepositoryAuth,
  IBranch,
  IScannedFile,
  IWebhookConfig,
  ISyncConfig,
  IScanResult,
  IFrameworkInfo,
  IPullRequest,
  IRepositoryStats,
  RepositoryProvider,
  FileType,
  ScanStatus,
} from "../types/repository.types";

export const repositoryAuthSchema = new Schema<IRepositoryAuth>(
  {
    type: {
      type: String,
      enum: ["token", "ssh", "oauth", "basic"],
      required: true,
    },
    token: { type: String, select: false },
    tokenExpiry: Date,
    sshKey: { type: String, select: false },
    sshKeyPassphrase: { type: String, select: false },
    sshKeyFingerprint: String,
    oauthAccessToken: { type: String, select: false },
    oauthRefreshToken: { type: String, select: false },
    oauthExpiry: Date,
    oauthScopes: [String],
    username: String,
    password: { type: String, select: false },
  },
  { _id: false },
);

export const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isProtected: { type: Boolean, default: false },
    lastCommit: {
      hash: { type: String, required: true },
      message: String,
      author: {
        name: String,
        email: String,
      },
      timestamp: Date,
      url: String,
    },
    ahead: Number,
    behind: Number,
    lastSyncedAt: Date,
  },
  { _id: false },
);

export const scannedFileSchema = new Schema<IScannedFile>(
  {
    id: { type: String, required: true },
    path: { type: String, required: true },
    name: { type: String, required: true },
    extension: String,
    type: {
      type: String,
      enum: Object.values(FileType),
      default: FileType.OTHER,
    },
    size: Number,
    language: String,
    linesOfCode: { type: Number, default: 0 },
    functions: [
      {
        name: String,
        lineStart: Number,
        lineEnd: Number,
        parameters: [String],
        isAsync: Boolean,
      },
    ],
    imports: [String],
    exports: [String],
    framework: String,
    endpoints: [
      {
        method: String,
        path: String,
        handler: String,
        lineNumber: Number,
        middleware: [String],
      },
    ],
    lastModified: Date,
    lastScanned: { type: Date, default: Date.now },
    hash: String,
    url: String,
  },
  { _id: false },
);

export const webhookConfigSchema = new Schema<IWebhookConfig>(
  {
    id: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    provider: {
      type: String,
      enum: Object.values(RepositoryProvider),
      required: true,
    },
    url: String,
    secret: { type: String, select: false },
    events: { type: [String], default: [] },
    lastTriggered: Date,
    deliveries: [
      {
        id: String,
        event: String,
        timestamp: { type: Date, default: Date.now },
        success: Boolean,
        payload: Schema.Types.Mixed,
        error: String,
      },
    ],
  },
  { _id: false },
);

export const syncConfigSchema = new Schema<ISyncConfig>(
  {
    autoSync: { type: Boolean, default: false },
    syncInterval: { type: Number, default: 60 },
    syncOnPush: { type: Boolean, default: true },
    syncOnPullRequest: { type: Boolean, default: false },
    syncOnRelease: { type: Boolean, default: false },
    branches: { type: [String], default: [] },
    includePaths: { type: [String], default: [] },
    excludePaths: {
      type: [String],
      default: ["node_modules", "dist", "build", ".git", "coverage"],
    },
    fileExtensions: {
      type: [String],
      default: [".js", ".ts", ".py", ".java", ".go", ".rb", ".php"],
    },
    maxFileSize: { type: Number, default: 1048576 },
    maxDepth: Number,
    followSymlinks: { type: Boolean, default: false },
  },
  { _id: false },
);

export const scanResultSchema = new Schema<IScanResult>(
  {
    id: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ScanStatus),
      default: ScanStatus.PENDING,
    },
    startedAt: { type: Date, required: true },
    completedAt: Date,
    duration: Number,
    branch: { type: String, required: true },
    commit: { type: String, required: true },
    filesScanned: { type: Number, default: 0 },
    filesSkipped: { type: Number, default: 0 },
    directoriesScanned: { type: Number, default: 0 },
    endpointsDiscovered: { type: Number, default: 0 },
    schemasDiscovered: { type: Number, default: 0 },
    newFiles: { type: Number, default: 0 },
    modifiedFiles: { type: Number, default: 0 },
    deletedFiles: { type: Number, default: 0 },
    errors: [
      {
        file: String,
        line: Number,
        message: String,
        type: String,
      },
    ],
    scanSpeed: { type: Number, default: 0 },
    triggeredBy: {
      type: String,
      enum: ["manual", "webhook", "schedule", "ai"],
      required: true,
    },
  },
  { _id: false },
);

export const frameworkInfoSchema = new Schema<IFrameworkInfo>(
  {
    name: { type: String, required: true },
    version: String,
    language: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    configFiles: [String],
    dependencies: { type: Map, of: String },
    entryPoints: [String],
    routeFiles: [String],
    conventions: {
      routing: String,
      middleware: String,
      controllers: String,
      models: String,
    },
  },
  { _id: false },
);

export const pullRequestSchema = new Schema<IPullRequest>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    state: {
      type: String,
      enum: ["open", "closed", "merged"],
      required: true,
    },
    author: String,
    url: String,
    createdAt: Date,
    updatedAt: Date,
    mergedAt: Date,
    additions: Number,
    deletions: Number,
    changedFiles: Number,
    sourceBranch: String,
    targetBranch: String,
    analyzed: { type: Boolean, default: false },
    analyzedAt: Date,
    affectedEndpoints: [String],
  },
  { _id: false },
);

export const repositoryStatsSchema = new Schema<IRepositoryStats>(
  {
    totalFiles: { type: Number, default: 0 },
    scannedFiles: { type: Number, default: 0 },
    totalSize: { type: Number, default: 0 },
    totalLines: { type: Number, default: 0 },
    filesByType: { type: Map, of: Number },
    languageDistribution: { type: Map, of: Number },
    endpoints: {
      total: { type: Number, default: 0 },
      byMethod: { type: Map, of: Number },
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false },
);
