import { Schema, Types } from "mongoose";
import {
  IRepository,
  IScanResult,
  IWebhookConfig,
  RepositoryProvider,
  RepositoryStatus,
  RepositoryVisibility,
  ScanStatus,
} from "../types/repository.types.js";
import {
  repositoryAuthSchema,
  branchSchema,
  scannedFileSchema,
  webhookConfigSchema,
  syncConfigSchema,
  scanResultSchema,
  frameworkInfoSchema,
  pullRequestSchema,
  repositoryStatsSchema,
} from "../schema/repository.sub.schema.js";

const repositorySchema = new Schema<IRepository>(
  {
    name: {
      type: String,
      required: [true, "Repository name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    provider: {
      type: String,
      enum: Object.values(RepositoryProvider),
      required: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: Object.values(RepositoryVisibility),
      default: RepositoryVisibility.PRIVATE,
    },
    repoUrl: {
      type: String,
      required: [true, "Repository URL is required"],
      index: true,
    },
    cloneUrl: {
      type: String,
      required: true,
    },
    sshUrl: String,
    webUrl: String,
    owner: {
      type: String,
      required: true,
      index: true,
    },
    repoName: {
      type: String,
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    externalId: String,
    authentication: {
      type: repositoryAuthSchema,
      required: true,
    },
    localPath: String,
    isCloned: {
      type: Boolean,
      default: false,
      index: true,
    },
    cloneSize: Number,
    defaultBranch: {
      type: String,
      default: "main",
    },
    branches: {
      type: [branchSchema],
      default: [],
    },
    activeBranch: String,
    syncConfig: {
      type: syncConfigSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: Object.values(RepositoryStatus),
      default: RepositoryStatus.DISCONNECTED,
      index: true,
    },
    lastSyncAt: Date,
    nextSyncAt: Date,
    scannedFiles: {
      type: [scannedFileSchema],
      default: [],
    },
    lastScanResult: scanResultSchema,
    scanHistory: {
      type: [scanResultSchema],
      default: [],
      validate: {
        validator: function (history: any[]) {
          return history.length <= 50;
        },
        message: "Scan history cannot exceed 50 entries",
      },
    },
    frameworks: {
      type: [frameworkInfoSchema],
      default: [],
    },
    stats: {
      type: repositoryStatsSchema,
      default: () => ({}),
    },
    webhooks: {
      type: [webhookConfigSchema],
      default: [],
    },
    pullRequests: {
      type: [pullRequestSchema],
      default: [],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["admin", "write", "read"],
          default: "read",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    language: String,
    topics: { type: [String], default: [] },
    license: String,
    providerData: {
      stars: Number,
      forks: Number,
      watchers: Number,
      openIssues: Number,
      hasWiki: Boolean,
      hasPages: Boolean,
    },
    syncErrors: [
      {
        timestamp: { type: Date, default: Date.now },
        error: String,
        type: {
          type: String,
          enum: ["clone", "pull", "scan", "webhook", "auth"],
        },
        resolved: { type: Boolean, default: false },
        resolvedAt: Date,
      },
    ],
    settings: {
      autoDetectFramework: { type: Boolean, default: true },
      autoGenerateEndpoints: { type: Boolean, default: true },
      notifyOnChanges: { type: Boolean, default: true },
      keepCloneUpdated: { type: Boolean, default: true },
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "repositories",
  },
);

repositorySchema.index({ projectId: 1, status: 1 });
repositorySchema.index({ workspaceId: 1, status: 1 });
repositorySchema.index({ fullName: 1, provider: 1 });
repositorySchema.index({ nextSyncAt: 1, "syncConfig.autoSync": 1 });
repositorySchema.index({ "collaborators.userId": 1 });
repositorySchema.index({ name: "text", description: "text", topics: "text" });

repositorySchema.virtual("totalEndpoints").get(function () {
  return this.scannedFiles.reduce(
    (total: number, file: any) => total + file.endpoints.length,
    0,
  );
});

repositorySchema.virtual("needsSync").get(function () {
  if (!this.syncConfig.autoSync) return false;
  if (!this.nextSyncAt) return true;
  return this.nextSyncAt <= new Date();
});

repositorySchema.virtual("hasErrors").get(function () {
  return this.syncErrors.some((error: any) => !error.resolved);
});

repositorySchema.methods.startScan = async function (
  branch: string,
  commit: string,
  triggeredBy: "manual" | "webhook" | "schedule" | "ai" = "manual",
) {
  const scanId = `scan_${Date.now()}`;
  const scanResult: any = {
    id: scanId,
    status: ScanStatus.IN_PROGRESS,
    startedAt: new Date(),
    branch,
    commit,
    filesScanned: 0,
    filesSkipped: 0,
    directoriesScanned: 0,
    endpointsDiscovered: 0,
    schemasDiscovered: 0,
    newFiles: 0,
    modifiedFiles: 0,
    deletedFiles: 0,
    errors: [],
    scanSpeed: 0,
    triggeredBy,
  };
  this.lastScanResult = scanResult;
  this.status = RepositoryStatus.SYNCING;
  return this.save();
};

repositorySchema.methods.completeScan = async function (
  result: Partial<IScanResult>,
) {
  if (!this.lastScanResult) {
    throw new Error("No scan in progress");
  }
  this.lastScanResult = {
    ...this.lastScanResult,
    ...result,
    status: ScanStatus.COMPLETED,
    completedAt: new Date(),
    duration: Date.now() - this.lastScanResult.startedAt.getTime(),
  };
  if (this.scanHistory.length >= 50) {
    this.scanHistory.shift();
  }
  this.scanHistory.push(this.lastScanResult);
  this.status = RepositoryStatus.CONNECTED;
  this.lastSyncAt = new Date();
  return this.save();
};

repositorySchema.methods.updateStats = async function () {
  this.stats.scannedFiles = this.scannedFiles.length;
  this.stats.totalFiles = this.scannedFiles.length;
  this.stats.totalSize = this.scannedFiles.reduce(
    (total: number, file: any) => total + file.size,
    0,
  );
  this.stats.totalLines = this.scannedFiles.reduce(
    (total: number, file: any) => total + file.linesOfCode,
    0,
  );
  this.stats.lastUpdated = new Date();
  return this.save();
};

repositorySchema.methods.addWebhook = async function (webhook: IWebhookConfig) {
  this.webhooks.push(webhook);
  return this.save();
};

repositorySchema.methods.scheduleNextSync = function () {
  if (!this.syncConfig.autoSync) return;
  const nextSync = new Date();
  nextSync.setMinutes(nextSync.getMinutes() + this.syncConfig.syncInterval);
  this.nextSyncAt = nextSync;
};

repositorySchema.methods.addSyncError = async function (
  error: string,
  type: "clone" | "pull" | "scan" | "webhook" | "auth",
) {
  this.syncErrors.push({
    timestamp: new Date(),
    error,
    type,
    resolved: false,
  });
  this.status = RepositoryStatus.ERROR;
  return this.save();
};

repositorySchema.statics.findByProject = function (projectId: Types.ObjectId) {
  return this.find({ projectId }).sort({ createdAt: -1 });
};

repositorySchema.statics.findPendingSync = function () {
  const now = new Date();
  return this.find({
    "syncConfig.autoSync": true,
    nextSyncAt: { $lte: now },
    status: { $ne: RepositoryStatus.SYNCING },
  });
};

repositorySchema.pre("save", function (next: any) {
  if (this.isModified() && !this.isNew) {
    this.lastActivityAt = new Date();
  }
  next();
});

export { repositorySchema };
