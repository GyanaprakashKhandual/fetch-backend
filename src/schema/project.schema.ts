import { Schema, Types } from "mongoose";
import {
  AIAnalysisStatus,
  IAIAnalysisResult,
  IProject,
  IProjectAnalytics,
  ISyncStatus,
  ProjectStatus,
  ProjectVisibility,
} from "../types/project.types";
import {
  aiConfigurationSchema,
  discoveredEndpointSchema,
  analysisResultSchema,
  projectSettingsSchema,
} from "../schema/project.sub.schema";
import { Project } from "../models/project.model";

const projectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [200, "Project name cannot exceed 200 characters"],
      index: true,
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    icon: String,
    color: {
      type: String,
      default: "#3B82F6",
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
      index: true,
    },
    visibility: {
      type: String,
      enum: Object.values(ProjectVisibility),
      default: ProjectVisibility.PRIVATE,
      index: true,
    },
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      index: true,
    },
    databaseConnections: [
      {
        type: Schema.Types.ObjectId,
        ref: "DatabaseConnection",
      },
    ],
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
    environments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Environment",
      },
    ],
    aiConfiguration: {
      type: aiConfigurationSchema,
      default: () => ({}),
    },
    discoveredEndpoints: {
      type: [discoveredEndpointSchema],
      default: [],
    },
    analysisHistory: {
      type: [analysisResultSchema],
      default: [],
      validate: {
        validator: function (history: any[]) {
          return history.length <= 100;
        },
        message: "Analysis history cannot exceed 100 entries",
      },
    },
    currentAnalysis: analysisResultSchema,
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["owner", "admin", "editor", "viewer"],
          default: "viewer",
        },
        addedAt: { type: Date, default: Date.now },
        addedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    settings: {
      type: projectSettingsSchema,
      default: () => ({}),
    },
    integrations: [
      {
        type: {
          type: String,
          required: true,
        },
        enabled: { type: Boolean, default: true },
        config: Schema.Types.Mixed,
        lastSyncAt: Date,
      },
    ],
    readme: String,
    documentation: {
      url: String,
      content: String,
      generatedByAI: { type: Boolean, default: false },
      lastUpdated: Date,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      index: true,
    },
    analytics: {
      totalRequests: { type: Number, default: 0 },
      totalCollections: { type: Number, default: 0 },
      totalEndpoints: { type: Number, default: 0 },
      execution: {
        totalExecutions: { type: Number, default: 0 },
        successfulExecutions: { type: Number, default: 0 },
        failedExecutions: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },
      },
      ai: {
        totalScans: { type: Number, default: 0 },
        endpointsDiscovered: { type: Number, default: 0 },
        requestsGenerated: { type: Number, default: 0 },
        lastScanAt: Date,
      },
      team: {
        totalMembers: { type: Number, default: 0 },
        activeMembers: { type: Number, default: 0 },
      },
    },
    syncStatus: {
      isActive: { type: Boolean, default: false },
      lastSyncAt: Date,
      nextSyncAt: Date,
      lastCommit: {
        hash: String,
        message: String,
        author: String,
        timestamp: Date,
      },
      syncErrors: [
        {
          timestamp: { type: Date, default: Date.now },
          error: String,
          resolved: { type: Boolean, default: false },
        },
      ],
    },
    apiSpecification: {
      type: {
        type: String,
        enum: ["openapi", "swagger", "graphql", "custom"],
      },
      version: String,
      url: String,
      content: Schema.Types.Mixed,
      importedAt: Date,
    },
    testSuites: [
      {
        type: Schema.Types.ObjectId,
        ref: "TestSuite",
      },
    ],
    testRuns: [
      {
        id: String,
        startedAt: Date,
        completedAt: Date,
        status: {
          type: String,
          enum: ["running", "completed", "failed"],
        },
        totalTests: Number,
        passedTests: Number,
        failedTests: Number,
        triggeredBy: {
          type: String,
          enum: ["manual", "schedule", "ai", "webhook"],
        },
      },
    ],
    webhooks: [
      {
        id: String,
        name: String,
        url: String,
        events: [String],
        enabled: { type: Boolean, default: true },
        secret: String,
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: Date,
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "projects",
  },
);

projectSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
projectSchema.index({ owner: 1, visibility: 1 });
projectSchema.index({ "members.userId": 1 });
projectSchema.index({ tags: 1, category: 1 });
projectSchema.index({ repositoryId: 1 });
projectSchema.index({ "syncStatus.nextSyncAt": 1 });
projectSchema.index(
  { projectName: "text", description: "text", tags: "text" },
  { weights: { projectName: 10, tags: 5, description: 1 } },
);

projectSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

projectSchema.virtual("isAIEnabled").get(function () {
  return this.aiConfiguration?.enabled || false;
});

projectSchema.virtual("hasPendingAnalysis").get(function () {
  return (
    this.currentAnalysis?.status === AIAnalysisStatus.IN_PROGRESS ||
    this.currentAnalysis?.status === AIAnalysisStatus.PENDING
  );
});

projectSchema.methods.addMember = async function (
  userId: Types.ObjectId,
  role: "admin" | "editor" | "viewer",
  addedBy: Types.ObjectId,
) {
  const exists = this.members.some(
    (m: any) => m.userId.toString() === userId.toString(),
  );
  if (exists) {
    throw new Error("User is already a member");
  }
  this.members.push({
    userId,
    role,
    addedAt: new Date(),
    addedBy,
  });
  this.analytics.team.totalMembers = this.members.length;
  return this.save();
};

projectSchema.methods.removeMember = async function (userId: Types.ObjectId) {
  this.members = this.members.filter(
    (m: any) => m.userId.toString() !== userId.toString(),
  );
  this.analytics.team.totalMembers = this.members.length;
  return this.save();
};

projectSchema.methods.updateMemberRole = async function (
  userId: Types.ObjectId,
  newRole: "admin" | "editor" | "viewer",
) {
  const member = this.members.find(
    (m: any) => m.userId.toString() === userId.toString(),
  );
  if (!member) {
    throw new Error("Member not found");
  }
  member.role = newRole;
  return this.save();
};

projectSchema.methods.startAIAnalysis = async function () {
  if (this.hasPendingAnalysis) {
    throw new Error("Analysis already in progress");
  }
  const analysisId = `analysis_${Date.now()}`;
  const analysis: any = {
    id: analysisId,
    startedAt: new Date(),
    status: AIAnalysisStatus.IN_PROGRESS,
    endpointsDiscovered: 0,
    endpointsValidated: 0,
    requestsGenerated: 0,
    testsGenerated: 0,
    codeFiles: {
      total: 0,
      scanned: 0,
      skipped: 0,
    },
    errors: [],
    warnings: [],
    duration: 0,
    summary: "",
  };
  this.currentAnalysis = analysis;
  this.status = ProjectStatus.SYNCING;
  return this.save();
};

projectSchema.methods.completeAIAnalysis = async function (
  result: Partial<IAIAnalysisResult>,
) {
  if (!this.currentAnalysis) {
    throw new Error("No analysis in progress");
  }
  this.currentAnalysis = {
    ...this.currentAnalysis,
    ...result,
    completedAt: new Date(),
    status: AIAnalysisStatus.COMPLETED,
    duration: Date.now() - this.currentAnalysis.startedAt.getTime(),
  };
  if (this.analysisHistory.length >= 100) {
    this.analysisHistory.shift();
  }
  this.analysisHistory.push(this.currentAnalysis);
  this.analytics.ai.totalScans += 1;
  this.analytics.ai.endpointsDiscovered += result.endpointsDiscovered || 0;
  this.analytics.ai.requestsGenerated += result.requestsGenerated || 0;
  this.analytics.ai.lastScanAt = new Date();
  this.currentAnalysis = undefined;
  this.status = ProjectStatus.ACTIVE;
  return this.save();
};

projectSchema.methods.addDiscoveredEndpoint = async function (endpoint: any) {
  const exists = this.discoveredEndpoints.some(
    (e: any) => e.path === endpoint.path && e.method === endpoint.method,
  );
  if (!exists) {
    this.discoveredEndpoints.push(endpoint);
    this.analytics.totalEndpoints = this.discoveredEndpoints.length;
  }
  return this.save();
};

projectSchema.methods.updateSyncStatus = async function (
  status: Partial<ISyncStatus>,
) {
  this.syncStatus = {
    ...this.syncStatus,
    ...status,
  };
  return this.save();
};

projectSchema.methods.scheduleNextSync = function () {
  if (!this.aiConfiguration.autoSync || !this.aiConfiguration.syncInterval) {
    return;
  }
  const nextSync = new Date();
  nextSync.setMinutes(
    nextSync.getMinutes() + this.aiConfiguration.syncInterval,
  );
  this.syncStatus.nextSyncAt = nextSync;
};

projectSchema.methods.archive = async function (userId: Types.ObjectId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  this.status = ProjectStatus.ARCHIVED;
  return this.save();
};

projectSchema.methods.restore = async function () {
  this.isArchived = false;
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  this.status = ProjectStatus.ACTIVE;
  return this.save();
};

projectSchema.methods.updateAnalytics = async function (
  updates: Partial<IProjectAnalytics>,
) {
  this.analytics = {
    ...this.analytics,
    ...updates,
  };
  return this.save();
};

projectSchema.methods.getSummary = function () {
  return {
    id: this._id,
    name: this.projectName,
    slug: this.slug,
    status: this.status,
    visibility: this.visibility,
    memberCount: this.memberCount,
    collections: this.collections.length,
    requests: this.requests.length,
    discoveredEndpoints: this.discoveredEndpoints.length,
    analytics: this.analytics,
    createdAt: this.createdAt,
    lastActivityAt: this.lastActivityAt,
  };
};

projectSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isArchived: false });
};

projectSchema.statics.findByWorkspace = function (workspaceId: Types.ObjectId) {
  return this.find({ workspaceId, isArchived: false }).sort({ createdAt: -1 });
};

projectSchema.statics.findByOwner = function (userId: Types.ObjectId) {
  return this.find({ owner: userId, isArchived: false }).sort({
    lastActivityAt: -1,
  });
};

projectSchema.statics.findByMember = function (userId: Types.ObjectId) {
  return this.find({
    "members.userId": userId,
    isArchived: false,
  }).sort({ lastActivityAt: -1 });
};

projectSchema.statics.findPendingSync = function () {
  const now = new Date();
  return this.find({
    "aiConfiguration.autoSync": true,
    "syncStatus.nextSyncAt": { $lte: now },
    status: { $ne: ProjectStatus.SYNCING },
    isArchived: false,
  });
};

projectSchema.statics.searchProjects = function (
  searchTerm: string,
  workspaceId?: Types.ObjectId,
) {
  const query: any = {
    $text: { $search: searchTerm },
    isArchived: false,
  };
  if (workspaceId) query.workspaceId = workspaceId;
  return this.find(query, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
};

projectSchema.pre("save", async function (next: any) {
  if (!this.slug && this.projectName) {
    const baseSlug = this.projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Project.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  if (this.isModified() && !this.isNew) {
    this.lastActivityAt = new Date();
  }
  next();
});

export { projectSchema };
