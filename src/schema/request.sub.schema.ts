import { Schema } from "mongoose";
import {
  IKeyValue,
  IPathVariable,
  IAuthentication,
  IRequestBody,
  IScript,
  ITest,
  IAssertion,
  IRequestSettings,
  IResponseSnapshot,
  IVersion,
  IDocumentation,
  AuthenticationType,
  RawBodyFormat,
  BodyType,
} from "../types/request.types";

export const keyValueSchema = new Schema<IKeyValue>(
  {
    key: { type: String, required: true },
    value: { type: String, default: "" },
    description: { type: String },
    enabled: { type: Boolean, default: true },
    type: { type: String },
  },
  { _id: false },
);

export const pathVariableSchema = new Schema<IPathVariable>(
  {
    key: { type: String, required: true },
    value: { type: String, default: "" },
    description: { type: String },
  },
  { _id: false },
);

export const authenticationSchema = new Schema<IAuthentication>(
  {
    type: {
      type: String,
      enum: Object.values(AuthenticationType),
      default: AuthenticationType.NONE,
    },
    apiKey: {
      key: String,
      value: String,
      addTo: { type: String, enum: ["header", "query"], default: "header" },
    },
    bearerToken: {
      token: String,
      prefix: { type: String, default: "Bearer" },
    },
    basicAuth: {
      username: String,
      password: String,
    },
    digestAuth: {
      username: String,
      password: String,
      realm: String,
      nonce: String,
      algorithm: String,
      qop: String,
      nonceCount: Number,
      clientNonce: String,
      opaque: String,
    },
    oauth1: {
      consumerKey: String,
      consumerSecret: String,
      token: String,
      tokenSecret: String,
      signatureMethod: {
        type: String,
        enum: ["HMAC-SHA1", "HMAC-SHA256", "PLAINTEXT"],
      },
      timestamp: String,
      nonce: String,
      version: String,
      realm: String,
      includeBodyHash: Boolean,
    },
    oauth2: {
      grantType: {
        type: String,
        enum: [
          "authorization_code",
          "client_credentials",
          "password",
          "implicit",
        ],
      },
      accessToken: String,
      refreshToken: String,
      clientId: String,
      clientSecret: String,
      authUrl: String,
      accessTokenUrl: String,
      scope: String,
      state: String,
      redirectUri: String,
    },
    awsSignature: {
      accessKey: String,
      secretKey: String,
      region: String,
      service: String,
      sessionToken: String,
    },
    customHeaders: [keyValueSchema],
  },
  { _id: false },
);

export const requestBodySchema = new Schema<IRequestBody>(
  {
    type: {
      type: String,
      enum: Object.values(BodyType),
      default: BodyType.NONE,
    },
    formData: [keyValueSchema],
    urlEncoded: [keyValueSchema],
    raw: {
      data: String,
      format: {
        type: String,
        enum: Object.values(RawBodyFormat),
        default: RawBodyFormat.TEXT,
      },
    },
    binary: {
      fileName: String,
      fileType: String,
      fileSize: Number,
      fileUrl: String,
    },
    graphql: {
      query: String,
      variables: String,
    },
  },
  { _id: false },
);

export const scriptSchema = new Schema<IScript>(
  {
    enabled: { type: Boolean, default: true },
    language: {
      type: String,
      enum: ["javascript", "python"],
      default: "javascript",
    },
    code: { type: String, default: "" },
  },
  { _id: false },
);

export const testSchema = new Schema<ITest>(
  {
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    script: { type: String, required: true },
  },
  { _id: false },
);

export const assertionSchema = new Schema<IAssertion>(
  {
    id: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    type: {
      type: String,
      enum: [
        "status_code",
        "header",
        "body",
        "response_time",
        "json_schema",
        "custom",
      ],
      required: true,
    },
    field: String,
    operator: {
      type: String,
      enum: [
        "equals",
        "not_equals",
        "contains",
        "not_contains",
        "matches",
        "greater_than",
        "less_than",
        "exists",
        "not_exists",
      ],
      required: true,
    },
    expectedValue: Schema.Types.Mixed,
    description: String,
  },
  { _id: false },
);

export const requestSettingsSchema = new Schema<IRequestSettings>(
  {
    followRedirects: { type: Boolean, default: true },
    maxRedirects: { type: Number, default: 5 },
    timeout: { type: Number, default: 30000 },
    verifySsl: { type: Boolean, default: true },
    encodeUrl: { type: Boolean, default: true },
    keepAlive: { type: Boolean, default: true },
    proxy: {
      enabled: { type: Boolean, default: false },
      host: String,
      port: Number,
      username: String,
      password: String,
    },
  },
  { _id: false },
);

export const responseSnapshotSchema = new Schema<IResponseSnapshot>(
  {
    executedAt: { type: Date, required: true },
    statusCode: { type: Number, required: true },
    statusText: { type: String, required: true },
    responseTime: { type: Number, required: true },
    responseSize: { type: Number, required: true },
    headers: { type: Map, of: String },
    body: String,
    bodyPreview: String,
    cookies: [
      {
        name: String,
        value: String,
        domain: String,
        path: String,
        expires: Date,
      },
    ],
    testResults: [
      {
        testName: String,
        passed: Boolean,
        message: String,
      },
    ],
    assertionResults: [
      {
        assertionId: String,
        passed: Boolean,
        message: String,
      },
    ],
  },
  { _id: false },
);

export const versionSchema = new Schema<IVersion>(
  {
    versionNumber: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changes: { type: String },
    snapshot: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

export const documentationSchema = new Schema<IDocumentation>(
  {
    description: String,
    notes: String,
    examples: [
      {
        name: String,
        description: String,
        requestSnapshot: Schema.Types.Mixed,
        responseSnapshot: responseSnapshotSchema,
      },
    ],
    tags: [String],
  },
  { _id: false },
);
