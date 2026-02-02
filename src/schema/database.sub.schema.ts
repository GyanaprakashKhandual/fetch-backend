import { Schema } from "mongoose";
import {
  IConnectionConfig,
  IColumn,
  IIndex,
  ITableSchema,
  ITestDataConfig,
  IGeneratedTestData,
  IQueryTemplate,
  ISchemaAnalysisResult,
  IDatabaseStats,
  IHealthCheck,
  DataType,
  SchemaAnalysisStatus,
} from "../types/database.types.js";

export const connectionConfigSchema = new Schema<IConnectionConfig>(
  {
    host: { type: String, required: true },
    port: { type: Number, required: true },
    database: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    ssl: { type: Boolean, default: false },
    sslCertificate: { type: String, select: false },
    poolSize: { type: Number, default: 10 },
    maxConnections: { type: Number, default: 20 },
    minConnections: { type: Number, default: 2 },
    connectionTimeout: { type: Number, default: 30000 },
    options: { type: Map, of: Schema.Types.Mixed },
    connectionString: { type: String, select: false },
  },
  { _id: false },
);

export const columnSchema = new Schema<IColumn>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(DataType),
      required: true,
    },
    nativeType: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    isForeign: { type: Boolean, default: false },
    isUnique: { type: Boolean, default: false },
    isNullable: { type: Boolean, default: true },
    isAutoIncrement: Boolean,
    defaultValue: Schema.Types.Mixed,
    enumValues: [String],
    maxLength: Number,
    minLength: Number,
    max: Number,
    min: Number,
    precision: Number,
    scale: Number,
    pattern: String,
    format: String,
    foreignKey: {
      table: String,
      column: String,
      onDelete: {
        type: String,
        enum: ["CASCADE", "SET NULL", "RESTRICT", "NO ACTION"],
      },
      onUpdate: {
        type: String,
        enum: ["CASCADE", "SET NULL", "RESTRICT", "NO ACTION"],
      },
    },
    description: String,
    comment: String,
  },
  { _id: false },
);

export const indexSchema = new Schema<IIndex>(
  {
    name: { type: String, required: true },
    columns: { type: [String], required: true },
    isUnique: { type: Boolean, default: false },
    isPrimary: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["btree", "hash", "gist", "gin", "brin", "text"],
    },
  },
  { _id: false },
);

export const tableSchemaSchema = new Schema<ITableSchema>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["table", "view", "collection"],
      default: "table",
    },
    schema: String,
    columns: { type: [columnSchema], default: [] },
    indexes: { type: [indexSchema], default: [] },
    relations: [
      {
        type: {
          type: String,
          enum: ["one-to-one", "one-to-many", "many-to-one", "many-to-many"],
        },
        targetTable: String,
        sourceColumn: String,
        targetColumn: String,
        junctionTable: String,
      },
    ],
    rowCount: Number,
    approximateSize: Number,
    sampleData: [Schema.Types.Mixed],
    aiAnalysis: {
      purpose: String,
      entityType: String,
      suggestedEndpoints: [
        {
          method: String,
          path: String,
          description: String,
        },
      ],
      dataPatterns: [String],
      validationRules: [
        {
          field: String,
          rule: String,
          reason: String,
        },
      ],
    },
    createdAt: Date,
    lastModified: Date,
    lastAnalyzed: Date,
  },
  { _id: false },
);

export const testDataConfigSchema = new Schema<ITestDataConfig>(
  {
    enabled: { type: Boolean, default: false },
    strategy: {
      type: String,
      enum: ["realistic", "random", "edge_cases", "mixed"],
      default: "realistic",
    },
    tables: [
      {
        tableName: String,
        recordCount: Number,
        includeEdgeCases: Boolean,
        respectConstraints: Boolean,
        columnOverrides: { type: Map, of: Schema.Types.Mixed },
      },
    ],
    maintainRelationships: { type: Boolean, default: true },
    cascadeGeneration: { type: Boolean, default: true },
  },
  { _id: false },
);

export const generatedTestDataSchema = new Schema<IGeneratedTestData>(
  {
    id: { type: String, required: true },
    tableName: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    recordCount: { type: Number, required: true },
    data: [Schema.Types.Mixed],
    strategy: { type: String, required: true },
    seed: Number,
    valid: { type: Boolean, default: true },
    validationErrors: [String],
  },
  { _id: false },
);

export const queryTemplateSchema = new Schema<IQueryTemplate>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    table: { type: String, required: true },
    operation: {
      type: String,
      enum: ["select", "insert", "update", "delete", "custom"],
      required: true,
    },
    query: { type: String, required: true },
    parameters: [
      {
        name: String,
        type: {
          type: String,
          enum: Object.values(DataType),
        },
        required: Boolean,
        defaultValue: Schema.Types.Mixed,
      },
    ],
    suggestedEndpoint: {
      method: String,
      path: String,
      description: String,
    },
    executionCount: { type: Number, default: 0 },
    lastExecuted: Date,
    avgExecutionTime: Number,
  },
  { _id: false },
);

export const schemaAnalysisResultSchema = new Schema<ISchemaAnalysisResult>(
  {
    id: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: Date,
    status: {
      type: String,
      enum: Object.values(SchemaAnalysisStatus),
      default: SchemaAnalysisStatus.PENDING,
    },
    duration: Number,
    tablesAnalyzed: { type: Number, default: 0 },
    columnsAnalyzed: { type: Number, default: 0 },
    relationshipsFound: { type: Number, default: 0 },
    indexesFound: { type: Number, default: 0 },
    totalRecords: { type: Number, default: 0 },
    approximateDatabaseSize: { type: Number, default: 0 },
    suggestedEndpoints: [
      {
        table: String,
        method: String,
        path: String,
        description: String,
        confidence: Number,
      },
    ],
    dataQualityIssues: [
      {
        table: String,
        column: String,
        issue: String,
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        suggestion: String,
      },
    ],
    recommendations: [
      {
        type: {
          type: String,
          enum: ["index", "query", "schema", "data"],
        },
        table: String,
        description: String,
        impact: {
          type: String,
          enum: ["low", "medium", "high"],
        },
      },
    ],
    errors: [
      {
        table: String,
        message: String,
        type: String,
      },
    ],
    triggeredBy: {
      type: String,
      enum: ["manual", "schedule", "ai", "connection"],
      required: true,
    },
  },
  { _id: false },
);

export const databaseStatsSchema = new Schema<IDatabaseStats>(
  {
    totalTables: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalRecords: { type: Number, default: 0 },
    totalSize: { type: Number, default: 0 },
    tablesBySize: [
      {
        name: String,
        size: Number,
        recordCount: Number,
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false },
);

export const healthCheckSchema = new Schema<IHealthCheck>(
  {
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["healthy", "degraded", "unhealthy"],
      required: true,
    },
    latency: { type: Number, required: true },
    checks: [
      {
        name: String,
        status: {
          type: String,
          enum: ["pass", "fail"],
        },
        message: String,
      },
    ],
    error: String,
  },
  { _id: false },
);
