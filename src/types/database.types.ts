import { Document, Types } from "mongoose";

export enum DatabaseType {
  POSTGRESQL = "postgresql",
  MYSQL = "mysql",
  MONGODB = "mongodb",
  SQLITE = "sqlite",
  MSSQL = "mssql",
  ORACLE = "oracle",
  REDIS = "redis",
  DYNAMODB = "dynamodb",
  CASSANDRA = "cassandra",
  FIREBASE = "firebase",
  SUPABASE = "supabase",
  MARIADB = "mariadb",
}

export enum ConnectionStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  ERROR = "error",
  TESTING = "testing",
}

export enum SchemaAnalysisStatus {
  IDLE = "idle",
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum DataType {
  STRING = "string",
  NUMBER = "number",
  INTEGER = "integer",
  FLOAT = "float",
  BOOLEAN = "boolean",
  DATE = "date",
  DATETIME = "datetime",
  TIMESTAMP = "timestamp",
  JSON = "json",
  ARRAY = "array",
  OBJECT = "object",
  BINARY = "binary",
  UUID = "uuid",
  EMAIL = "email",
  URL = "url",
  ENUM = "enum",
  UNKNOWN = "unknown",
}

export interface IConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  sslCertificate?: string;
  poolSize?: number;
  maxConnections?: number;
  minConnections?: number;
  connectionTimeout?: number;
  options?: Record<string, any>;
  connectionString?: string;
}

export interface IColumn {
  name: string;
  type: DataType;
  nativeType: string;
  isPrimary: boolean;
  isForeign: boolean;
  isUnique: boolean;
  isNullable: boolean;
  isAutoIncrement?: boolean;
  defaultValue?: any;
  enumValues?: string[];
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
  precision?: number;
  scale?: number;
  pattern?: string;
  format?: string;
  foreignKey?: {
    table: string;
    column: string;
    onDelete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
    onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
  };
  description?: string;
  comment?: string;
}

export interface IIndex {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  type?: "btree" | "hash" | "gist" | "gin" | "brin" | "text";
}

export interface ITableSchema {
  id: string;
  name: string;
  type: "table" | "view" | "collection";
  schema?: string;
  columns: IColumn[];
  indexes: IIndex[];
  relations: Array<{
    type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
    targetTable: string;
    sourceColumn: string;
    targetColumn: string;
    junctionTable?: string;
  }>;
  rowCount?: number;
  approximateSize?: number;
  sampleData?: any[];
  aiAnalysis?: {
    purpose?: string;
    entityType?: string;
    suggestedEndpoints?: Array<{
      method: string;
      path: string;
      description: string;
    }>;
    dataPatterns?: string[];
    validationRules?: Array<{
      field: string;
      rule: string;
      reason: string;
    }>;
  };
  createdAt?: Date;
  lastModified?: Date;
  lastAnalyzed?: Date;
}

export interface ITestDataConfig {
  enabled: boolean;
  strategy: "realistic" | "random" | "edge_cases" | "mixed";
  tables: Array<{
    tableName: string;
    recordCount: number;
    includeEdgeCases: boolean;
    respectConstraints: boolean;
    columnOverrides?: Record<
      string,
      {
        generator?: "faker" | "sequence" | "fixed" | "custom";
        fakerMethod?: string;
        fixedValue?: any;
        customLogic?: string;
      }
    >;
  }>;
  maintainRelationships: boolean;
  cascadeGeneration: boolean;
}

export interface IGeneratedTestData {
  id: string;
  tableName: string;
  generatedAt: Date;
  recordCount: number;
  data: any[];
  strategy: string;
  seed?: number;
  valid: boolean;
  validationErrors?: string[];
}

export interface IQueryTemplate {
  id: string;
  name: string;
  description?: string;
  table: string;
  operation: "select" | "insert" | "update" | "delete" | "custom";
  query: string;
  parameters?: Array<{
    name: string;
    type: DataType;
    required: boolean;
    defaultValue?: any;
  }>;
  suggestedEndpoint?: {
    method: string;
    path: string;
    description: string;
  };
  executionCount: number;
  lastExecuted?: Date;
  avgExecutionTime?: number;
}

export interface ISchemaAnalysisResult {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  status: SchemaAnalysisStatus;
  duration?: number;
  tablesAnalyzed: number;
  columnsAnalyzed: number;
  relationshipsFound: number;
  indexesFound: number;
  totalRecords: number;
  approximateDatabaseSize: number;
  suggestedEndpoints: Array<{
    table: string;
    method: string;
    path: string;
    description: string;
    confidence: number;
  }>;
  dataQualityIssues: Array<{
    table: string;
    column?: string;
    issue: string;
    severity: "low" | "medium" | "high";
    suggestion: string;
  }>;
  recommendations: Array<{
    type: "index" | "query" | "schema" | "data";
    table?: string;
    description: string;
    impact: "low" | "medium" | "high";
  }>;
  errors: Array<{
    table?: string;
    message: string;
    type: string;
  }>;
  triggeredBy: "manual" | "schedule" | "ai" | "connection";
}

export interface IDatabaseStats {
  totalTables: number;
  totalViews: number;
  totalRecords: number;
  totalSize: number;
  tablesBySize: Array<{
    name: string;
    size: number;
    recordCount: number;
  }>;
  lastUpdated: Date;
}

export interface IHealthCheck {
  timestamp: Date;
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  checks: Array<{
    name: string;
    status: "pass" | "fail";
    message?: string;
  }>;
  error?: string;
}

export interface IDatabaseConnection extends Document {
  name: string;
  description?: string;
  type: DatabaseType;
  config: IConnectionConfig;
  status: ConnectionStatus;
  lastConnectedAt?: Date;
  lastTestedAt?: Date;
  schemas: ITableSchema[];
  lastSchemaSync?: Date;
  schemaVersion?: string;
  currentAnalysis?: ISchemaAnalysisResult;
  analysisHistory: ISchemaAnalysisResult[];
  testDataConfig?: ITestDataConfig;
  generatedTestData: IGeneratedTestData[];
  queryTemplates: IQueryTemplate[];
  stats: IDatabaseStats;
  healthChecks: IHealthCheck[];
  healthCheckInterval?: number;
  lastHealthCheck?: Date;
  nextHealthCheck?: Date;
  projectId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  addedBy: Types.ObjectId;
  collaborators: Array<{
    userId: Types.ObjectId;
    role: "admin" | "write" | "read";
    addedAt: Date;
  }>;
  settings: {
    autoSync: boolean;
    syncInterval: number;
    cacheSchemas: boolean;
    enableHealthChecks: boolean;
    enableTestDataGeneration: boolean;
    readOnly: boolean;
    logQueries: boolean;
  };
  aiConfiguration?: {
    enabled: boolean;
    autoGenerateEndpoints: boolean;
    autoGenerateTestData: boolean;
    inferValidation: boolean;
    detectPatterns: boolean;
  };
  environment?: "development" | "staging" | "production" | "testing";
  poolInfo?: {
    active: number;
    idle: number;
    waiting: number;
  };
  connectionErrors: Array<{
    timestamp: Date;
    error: string;
    type: "auth" | "network" | "timeout" | "query" | "other";
    resolved: boolean;
    resolvedAt?: Date;
  }>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}
