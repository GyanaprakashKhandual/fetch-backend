import { Document, Types } from "mongoose";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  CONNECT = "CONNECT",
  TRACE = "TRACE",
}

export enum AuthenticationType {
  NONE = "none",
  API_KEY = "api_key",
  BEARER_TOKEN = "bearer_token",
  BASIC_AUTH = "basic_auth",
  DIGEST_AUTH = "digest_auth",
  OAUTH1 = "oauth1",
  OAUTH2 = "oauth2",
  HAWK = "hawk",
  AWS_SIGNATURE = "aws_signature",
  NTLM = "ntlm",
  CUSTOM = "custom",
}

export enum BodyType {
  NONE = "none",
  FORM_DATA = "form_data",
  X_WWW_FORM_URLENCODED = "x_www_form_urlencoded",
  RAW = "raw",
  BINARY = "binary",
  GRAPHQL = "graphql",
}

export enum RawBodyFormat {
  TEXT = "text",
  JSON = "json",
  XML = "xml",
  HTML = "html",
  JAVASCRIPT = "javascript",
}

export enum RequestStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
  DEPRECATED = "deprecated",
}

export interface IKeyValue {
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
  type?: string;
}

export interface IPathVariable {
  key: string;
  value: string;
  description?: string;
}

export interface IAuthentication {
  type: AuthenticationType;
  apiKey?: { key: string; value: string; addTo: "header" | "query" };
  bearerToken?: { token: string; prefix?: string };
  basicAuth?: { username: string; password: string };
  digestAuth?: {
    username: string;
    password: string;
    realm?: string;
    nonce?: string;
    algorithm?: string;
    qop?: string;
    nonceCount?: number;
    clientNonce?: string;
    opaque?: string;
  };
  oauth1?: {
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
    signatureMethod: "HMAC-SHA1" | "HMAC-SHA256" | "PLAINTEXT";
    timestamp?: string;
    nonce?: string;
    version?: string;
    realm?: string;
    includeBodyHash?: boolean;
  };
  oauth2?: {
    grantType:
      | "authorization_code"
      | "client_credentials"
      | "password"
      | "implicit";
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    authUrl?: string;
    accessTokenUrl?: string;
    scope?: string;
    state?: string;
    redirectUri?: string;
  };
  awsSignature?: {
    accessKey: string;
    secretKey: string;
    region: string;
    service: string;
    sessionToken?: string;
  };
  customHeaders?: IKeyValue[];
}

export interface IRequestBody {
  type: BodyType;
  formData?: IKeyValue[];
  urlEncoded?: IKeyValue[];
  raw?: { data: string; format: RawBodyFormat };
  binary?: {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    fileUrl?: string;
  };
  graphql?: { query: string; variables?: string };
}

export interface IScript {
  enabled: boolean;
  language: "javascript" | "python";
  code: string;
}

export interface ITest {
  name: string;
  enabled: boolean;
  script: string;
}

export interface IAssertion {
  id: string;
  enabled: boolean;
  type:
    | "status_code"
    | "header"
    | "body"
    | "response_time"
    | "json_schema"
    | "custom";
  field?: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "matches"
    | "greater_than"
    | "less_than"
    | "exists"
    | "not_exists";
  expectedValue?: any;
  description?: string;
}

export interface IRequestSettings {
  followRedirects: boolean;
  maxRedirects?: number;
  timeout: number;
  verifySsl: boolean;
  encodeUrl: boolean;
  keepAlive: boolean;
  proxy?: {
    enabled: boolean;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
  };
}

export interface IResponseSnapshot {
  executedAt: Date;
  statusCode: number;
  statusText: string;
  responseTime: number;
  responseSize: number;
  headers: Record<string, string>;
  body?: string;
  bodyPreview?: string;
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: Date;
  }>;
  testResults?: Array<{ testName: string; passed: boolean; message?: string }>;
  assertionResults?: Array<{
    assertionId: string;
    passed: boolean;
    message?: string;
  }>;
}

export interface IEnvironmentOverride {
  environmentId: Types.ObjectId;
  variables: Record<string, string>;
}

export interface IVersion {
  versionNumber: number;
  createdAt: Date;
  createdBy: Types.ObjectId;
  changes: string;
  snapshot: any;
}

export interface IDocumentation {
  description?: string;
  notes?: string;
  examples?: Array<{
    name: string;
    description?: string;
    requestSnapshot: any;
    responseSnapshot?: IResponseSnapshot;
  }>;
  tags?: string[];
}

export interface IRequest extends Document {
  requestName: string;
  description?: string;
  method: HttpMethod;
  slug: string;
  url: string;
  baseUrl?: string;
  path?: string;
  protocol: "http" | "https" | "ws" | "wss";
  queryParams: IKeyValue[];
  pathVariables: IPathVariable[];
  headers: IKeyValue[];
  authentication: IAuthentication;
  body: IRequestBody;
  preRequestScript?: IScript;
  tests: ITest[];
  assertions: IAssertion[];
  settings: IRequestSettings;
  collectionId?: Types.ObjectId;
  folderId?: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  sharedWith: Types.ObjectId[];
  isPublic: boolean;
  status: RequestStatus;
  isFavorite: boolean;
  tags: string[];
  executionHistory: IResponseSnapshot[];
  versions: IVersion[];
  currentVersion: number;
  documentation: IDocumentation;
  environmentOverrides: IEnvironmentOverride[];
  executionCount: number;
  lastExecutedAt?: Date;
  avgResponseTime?: number;
  successRate?: number;
  mockResponse?: {
    enabled: boolean;
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
    delay?: number;
  };
  codeSnippets?: Array<{ language: string; code: string; generatedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: Types.ObjectId;
}
