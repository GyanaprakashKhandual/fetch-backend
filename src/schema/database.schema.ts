import { Schema, Types } from "mongoose";
import {
  ConnectionStatus,
  DatabaseType,
  IDatabaseConnection,
  IHealthCheck,
  ISchemaAnalysisResult,
  SchemaAnalysisStatus,
} from "../types/database.types.js";
import {
  connectionConfigSchema,
  columnSchema,
  indexSchema,
  tableSchemaSchema,
  testDataConfigSchema,
  generatedTestDataSchema,
  queryTemplateSchema,
  schemaAnalysisResultSchema,
  databaseStatsSchema,
  healthCheckSchema,
} from "../schema/database.sub.schema.js";

const databaseConnectionSchema = new Schema<IDatabaseConnection>(
  {
    name: {
      type: String,
      required: [true, "Database name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: Object.values(DatabaseType),
      required: true,
      index: true,
    },
    config: {
      type: connectionConfigSchema,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ConnectionStatus),
      default: ConnectionStatus.DISCONNECTED,
      index: true,
    },
    lastConnectedAt: Date,
    lastTestedAt: Date,
    schemas: {
      type: [tableSchemaSchema],
      default: [],
    },
    lastSchemaSync: Date,
    schemaVersion: String,
    currentAnalysis: schemaAnalysisResultSchema,
    analysisHistory: {
      type: [schemaAnalysisResultSchema],
      default: [],
      validate: {
        validator: function (history: any[]) {
          return history.length <= 50;
        },
        message: "Analysis history cannot exceed 50 entries",
      },
    },
    testDataConfig: testDataConfigSchema,
    generatedTestData: {
      type: [generatedTestDataSchema],
      default: [],
    },
    queryTemplates: {
      type: [queryTemplateSchema],
      default: [],
    },
    stats: {
      type: databaseStatsSchema,
      default: () => ({}),
    },
    healthChecks: {
      type: [healthCheckSchema],
      default: [],
      validate: {
        validator: function (checks: any[]) {
          return checks.length <= 100;
        },
        message: "Health check history cannot exceed 100 entries",
      },
    },
    healthCheckInterval: { type: Number, default: 5 },
    lastHealthCheck: Date,
    nextHealthCheck: Date,
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
    settings: {
      autoSync: { type: Boolean, default: false },
      syncInterval: { type: Number, default: 60 },
      cacheSchemas: { type: Boolean, default: true },
      enableHealthChecks: { type: Boolean, default: true },
      enableTestDataGeneration: { type: Boolean, default: false },
      readOnly: { type: Boolean, default: false },
      logQueries: { type: Boolean, default: false },
    },
    aiConfiguration: {
      enabled: { type: Boolean, default: true },
      autoGenerateEndpoints: { type: Boolean, default: true },
      autoGenerateTestData: { type: Boolean, default: false },
      inferValidation: { type: Boolean, default: true },
      detectPatterns: { type: Boolean, default: true },
    },
    environment: {
      type: String,
      enum: ["development", "staging", "production", "testing"],
      default: "development",
      index: true,
    },
    poolInfo: {
      active: Number,
      idle: Number,
      waiting: Number,
    },
    connectionErrors: [
      {
        timestamp: { type: Date, default: Date.now },
        error: String,
        type: {
          type: String,
          enum: ["auth", "network", "timeout", "query", "other"],
        },
        resolved: { type: Boolean, default: false },
        resolvedAt: Date,
      },
    ],
    tags: { type: [String], default: [] },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "database_connections",
  },
);

databaseConnectionSchema.index({ projectId: 1, status: 1 });
databaseConnectionSchema.index({ workspaceId: 1, type: 1 });
databaseConnectionSchema.index({ environment: 1, status: 1 });
databaseConnectionSchema.index({ nextHealthCheck: 1 });
databaseConnectionSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

databaseConnectionSchema.virtual("isHealthy").get(function () {
  if (this.healthChecks.length === 0) return null;
  return this.healthChecks[this.healthChecks.length - 1].status === "healthy";
});

databaseConnectionSchema.virtual("tableCount").get(function () {
  return this.schemas.length;
});

databaseConnectionSchema.methods.startAnalysis = async function (
  triggeredBy: "manual" | "schedule" | "ai" | "connection" = "manual",
) {
  const analysisId = `analysis_${Date.now()}`;
  const analysis: any = {
    id: analysisId,
    startedAt: new Date(),
    status: SchemaAnalysisStatus.IN_PROGRESS,
    tablesAnalyzed: 0,
    columnsAnalyzed: 0,
    relationshipsFound: 0,
    indexesFound: 0,
    totalRecords: 0,
    approximateDatabaseSize: 0,
    suggestedEndpoints: [],
    dataQualityIssues: [],
    recommendations: [],
    errors: [],
    triggeredBy,
  };
  this.currentAnalysis = analysis;
  return this.save();
};

databaseConnectionSchema.methods.completeAnalysis = async function (
  result: Partial<ISchemaAnalysisResult>,
) {
  if (!this.currentAnalysis) {
    throw new Error("No analysis in progress");
  }
  this.currentAnalysis = {
    ...this.currentAnalysis,
    ...result,
    status: SchemaAnalysisStatus.COMPLETED,
    completedAt: new Date(),
    duration: Date.now() - this.currentAnalysis.startedAt.getTime(),
  };
  if (this.analysisHistory.length >= 50) {
    this.analysisHistory.shift();
  }
  this.analysisHistory.push(this.currentAnalysis);
  this.currentAnalysis = undefined;
  this.lastSchemaSync = new Date();
  return this.save();
};

databaseConnectionSchema.methods.addHealthCheck = async function (
  healthCheck: IHealthCheck,
) {
  if (this.healthChecks.length >= 100) {
    this.healthChecks.shift();
  }
  this.healthChecks.push(healthCheck);
  this.lastHealthCheck = healthCheck.timestamp;
  if (healthCheck.status === "unhealthy") {
    this.status = ConnectionStatus.ERROR;
  } else if (
    healthCheck.status === "healthy" &&
    this.status === ConnectionStatus.ERROR
  ) {
    this.status = ConnectionStatus.CONNECTED;
  }
  return this.save();
};

databaseConnectionSchema.methods.updateStats = async function () {
  this.stats.totalTables = this.schemas.filter(
    (s: any) => s.type === "table",
  ).length;
  this.stats.totalViews = this.schemas.filter(
    (s: any) => s.type === "view",
  ).length;
  this.stats.totalRecords = this.schemas.reduce(
    (total: number, schema: any) => total + (schema.rowCount || 0),
    0,
  );
  this.stats.totalSize = this.schemas.reduce(
    (total: number, schema: any) => total + (schema.approximateSize || 0),
    0,
  );
  this.stats.lastUpdated = new Date();
  return this.save();
};

databaseConnectionSchema.statics.findByProject = function (
  projectId: Types.ObjectId,
) {
  return this.find({ projectId }).sort({ createdAt: -1 });
};

databaseConnectionSchema.statics.findHealthy = function (
  workspaceId: Types.ObjectId,
) {
  return this.find({
    workspaceId,
    status: ConnectionStatus.CONNECTED,
  });
};

databaseConnectionSchema.pre("save", function (next: any) {
  if (this.isModified() && !this.isNew) {
    this.lastActivityAt = new Date();
  }
  next();
});

export { databaseConnectionSchema };
