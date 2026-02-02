import { Schema } from "mongoose";
import {
  IAIConfiguration,
  IDiscoveredEndpoint,
  IAIAnalysisResult,
  IProjectSettings,
  EndpointSource,
  AIAnalysisStatus,
} from "../types/project.types.js";

export const aiConfigurationSchema = new Schema<IAIConfiguration>(
  {
    enabled: { type: Boolean, default: true },
    autoSync: { type: Boolean, default: false },
    syncInterval: { type: Number, default: 60 },
    endpointDiscovery: {
      enabled: { type: Boolean, default: true },
      frameworks: { type: [String], default: [] },
      scanPaths: {
        type: [String],
        default: ["/src", "/app", "/routes", "/controllers"],
      },
      excludePaths: {
        type: [String],
        default: ["/node_modules", "/dist", "/build", "/.git"],
      },
      lastScan: Date,
      nextScan: Date,
    },
    schemaAnalysis: {
      enabled: { type: Boolean, default: true },
      inferTypes: { type: Boolean, default: true },
      generateValidation: { type: Boolean, default: true },
      detectRelationships: { type: Boolean, default: true },
    },
    testGeneration: {
      enabled: { type: Boolean, default: true },
      autoGenerate: { type: Boolean, default: false },
      includeEdgeCases: { type: Boolean, default: true },
      generateNegativeTests: { type: Boolean, default: true },
      mockDataStrategy: {
        type: String,
        enum: ["realistic", "random", "minimal"],
        default: "realistic",
      },
    },
    autoExecution: {
      enabled: { type: Boolean, default: false },
      schedule: String,
      onDeploy: { type: Boolean, default: false },
      onPush: { type: Boolean, default: false },
      environments: [{ type: Schema.Types.ObjectId, ref: "Environment" }],
    },
    model: {
      provider: {
        type: String,
        enum: ["anthropic", "openai", "custom"],
        default: "anthropic",
      },
      modelName: { type: String, default: "claude-sonnet-4-20250514" },
      temperature: { type: Number, default: 0.7 },
      maxTokens: { type: Number, default: 4096 },
    },
  },
  { _id: false },
);

export const discoveredEndpointSchema = new Schema<IDiscoveredEndpoint>(
  {
    id: { type: String, required: true },
    path: { type: String, required: true },
    method: { type: String, required: true },
    source: {
      type: String,
      enum: Object.values(EndpointSource),
      default: EndpointSource.AI_DISCOVERED,
    },
    description: String,
    handler: String,
    filePath: String,
    lineNumber: Number,
    authentication: {
      required: Boolean,
      type: String,
      middleware: [String],
    },
    parameters: {
      path: [
        {
          name: String,
          type: String,
          required: Boolean,
          description: String,
        },
      ],
      query: [
        {
          name: String,
          type: String,
          required: Boolean,
          description: String,
          defaultValue: Schema.Types.Mixed,
        },
      ],
      body: {
        type: String,
        schema: Schema.Types.Mixed,
        example: Schema.Types.Mixed,
      },
      headers: [
        {
          name: String,
          required: Boolean,
          description: String,
        },
      ],
    },
    responses: [
      {
        statusCode: Number,
        description: String,
        schema: Schema.Types.Mixed,
        example: Schema.Types.Mixed,
      },
    ],
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    discoveredAt: { type: Date, default: Date.now },
    lastValidated: Date,
    validated: { type: Boolean, default: false },
    requestId: { type: Schema.Types.ObjectId, ref: "Request" },
    testData: {
      valid: [Schema.Types.Mixed],
      invalid: [Schema.Types.Mixed],
      edgeCases: [Schema.Types.Mixed],
    },
  },
  { _id: false },
);

export const analysisResultSchema = new Schema<IAIAnalysisResult>(
  {
    id: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: Date,
    status: {
      type: String,
      enum: Object.values(AIAnalysisStatus),
      default: AIAnalysisStatus.PENDING,
    },
    endpointsDiscovered: { type: Number, default: 0 },
    endpointsValidated: { type: Number, default: 0 },
    requestsGenerated: { type: Number, default: 0 },
    testsGenerated: { type: Number, default: 0 },
    codeFiles: {
      total: { type: Number, default: 0 },
      scanned: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
    errors: [
      {
        type: String,
        message: String,
        file: String,
        line: Number,
      },
    ],
    warnings: [
      {
        type: String,
        message: String,
        suggestion: String,
      },
    ],
    duration: { type: Number, default: 0 },
    tokensUsed: Number,
    summary: { type: String, default: "" },
    changelog: [String],
  },
  { _id: false },
);

export const projectSettingsSchema = new Schema<IProjectSettings>(
  {
    defaultEnvironment: { type: Schema.Types.ObjectId, ref: "Environment" },
    baseUrl: String,
    namingConvention: {
      requests: {
        type: String,
        enum: ["camelCase", "snake_case", "kebab-case", "PascalCase"],
        default: "camelCase",
      },
      collections: {
        type: String,
        enum: ["camelCase", "snake_case", "kebab-case", "PascalCase"],
        default: "PascalCase",
      },
    },
    execution: {
      defaultTimeout: { type: Number, default: 30000 },
      retryOnFailure: { type: Boolean, default: false },
      maxRetries: { type: Number, default: 3 },
      parallelExecution: { type: Boolean, default: false },
      maxParallel: { type: Number, default: 5 },
    },
    notifications: {
      onDiscovery: { type: Boolean, default: true },
      onTestFailure: { type: Boolean, default: true },
      onAnalysisComplete: { type: Boolean, default: true },
      channels: [
        {
          type: {
            type: String,
            enum: ["email", "slack", "webhook"],
          },
          config: Schema.Types.Mixed,
        },
      ],
    },
    versionControl: {
      autoCommit: { type: Boolean, default: false },
      commitMessage: String,
      branch: String,
    },
  },
  { _id: false },
);
