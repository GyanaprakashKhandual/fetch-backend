import { Schema, Types } from "mongoose";
import {
  AuthenticationType,
  BodyType,
  HttpMethod,
  IRequest,
  RequestStatus,
} from "../types/request.types";
import {
  keyValueSchema,
  pathVariableSchema,
  authenticationSchema,
  requestBodySchema,
  scriptSchema,
  testSchema,
  assertionSchema,
  requestSettingsSchema,
  responseSnapshotSchema,
  versionSchema,
  documentationSchema,
} from "../schema/request.sub.schema";

const requestSchema = new Schema<IRequest>(
  {
    requestName: {
      type: String,
      required: [true, "Request name is required"],
      trim: true,
      maxlength: [200, "Request name cannot exceed 200 characters"],
      index: true,
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    method: {
      type: String,
      enum: Object.values(HttpMethod),
      required: [true, "HTTP method is required"],
      default: HttpMethod.GET,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    baseUrl: { type: String, trim: true },
    path: { type: String, trim: true },
    protocol: {
      type: String,
      enum: ["http", "https", "ws", "wss"],
      default: "https",
    },
    queryParams: { type: [keyValueSchema], default: [] },
    pathVariables: { type: [pathVariableSchema], default: [] },
    headers: { type: [keyValueSchema], default: [] },
    authentication: {
      type: authenticationSchema,
      default: () => ({ type: AuthenticationType.NONE }),
    },
    body: {
      type: requestBodySchema,
      default: () => ({ type: BodyType.NONE }),
    },
    preRequestScript: scriptSchema,
    tests: { type: [testSchema], default: [] },
    assertions: { type: [assertionSchema], default: [] },
    settings: {
      type: requestSettingsSchema,
      default: () => ({}),
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      index: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.ACTIVE,
      index: true,
    },
    isFavorite: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [], index: true },
    executionHistory: {
      type: [responseSnapshotSchema],
      default: [],
      validate: {
        validator: function (history: any[]) {
          return (history as any).length <= 50;
        },
        message: "Execution history cannot exceed 50 entries",
      },
    },
    versions: { type: [versionSchema], default: [] },
    currentVersion: { type: Number, default: 1 },
    documentation: {
      type: documentationSchema,
      default: () => ({}),
    },
    environmentOverrides: [
      {
        environmentId: { type: Schema.Types.ObjectId, ref: "Environment" },
        variables: { type: Map, of: String },
      },
    ],
    executionCount: { type: Number, default: 0, min: 0 },
    lastExecutedAt: { type: Date },
    avgResponseTime: { type: Number, min: 0 },
    successRate: { type: Number, min: 0, max: 100 },
    mockResponse: {
      enabled: { type: Boolean, default: false },
      statusCode: { type: Number, default: 200 },
      headers: { type: Map, of: String },
      body: String,
      delay: { type: Number, default: 0 },
    },
    codeSnippets: [
      {
        language: String,
        code: String,
        generatedAt: { type: Date, default: Date.now },
      },
    ],
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "requests",
  },
);

requestSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
requestSchema.index({ collectionId: 1, folderId: 1, createdAt: -1 });
requestSchema.index({ createdBy: 1, isFavorite: 1 });
requestSchema.index({ tags: 1, status: 1 });
requestSchema.index({ method: 1, status: 1 });
requestSchema.index(
  { requestName: "text", description: "text", tags: "text" },
  { weights: { requestName: 10, tags: 5, description: 1 } },
);
requestSchema.index({ executionCount: -1 });
requestSchema.index({ lastExecutedAt: -1 });

requestSchema.virtual("fullUrl").get(function () {
  const enabledParams = this.queryParams.filter((p: any) => p.enabled);
  if (enabledParams.length === 0) return this.url;

  const queryString = enabledParams
    .map(
      (p: any) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`,
    )
    .join("&");

  return `${this.url}?${queryString}`;
});

requestSchema.virtual("hasBody").get(function () {
  return this.body.type !== BodyType.NONE;
});

requestSchema.virtual("hasTests").get(function () {
  return this.tests.length > 0 || this.assertions.length > 0;
});

requestSchema.methods.addExecutionHistory = async function (snapshot: any) {
  if (this.executionHistory.length >= 50) {
    this.executionHistory.shift();
  }
  this.executionHistory.push(snapshot);
  this.lastExecutedAt = snapshot.executedAt;
  this.executionCount += 1;
  this.calculateAnalytics();
  return this.save();
};

requestSchema.methods.calculateAnalytics = function () {
  if (this.executionHistory.length === 0) return;
  const recentHistory = this.executionHistory.slice(-20);
  const totalTime = recentHistory.reduce(
    (sum: number, exec: any) => sum + exec.responseTime,
    0,
  );
  this.avgResponseTime = Math.round(totalTime / recentHistory.length);

  const successCount = recentHistory.filter(
    (exec: any) => exec.statusCode >= 200 && exec.statusCode < 400,
  ).length;
  this.successRate = Math.round((successCount / recentHistory.length) * 100);
};

requestSchema.methods.createVersion = async function (this: any,
  userId: Types.ObjectId,
  changes: string,
) {
  const newVersion = {
    versionNumber: this.currentVersion + 1,
    createdAt: new (Date as any)(),
    createdBy: userId,
    changes,
    snapshot: this.toObject(),
  };
  this.versions.push(newVersion);
  this.currentVersion += 1;
  return this.save();
};

requestSchema.methods.restoreVersion = async function (this: any, versionNumber: number) {
  const version = this.versions.find(
    (v: any) => v.versionNumber === versionNumber,
  );
  if (!version) throw new (Error as any)("Version not found");
  const { _id, createdAt, updatedAt, ...snapshot } = version.snapshot;
  Object.assign(this, snapshot);
  return this.save();
};

requestSchema.methods.duplicate = async function (this: any, newName?: string) {
  const duplicate = this.toObject();
  delete duplicate._id;
  delete duplicate.slug;
  duplicate.requestName = newName || `${this.requestName} (Copy)`;
  duplicate.executionHistory = [];
  duplicate.versions = [];
  duplicate.currentVersion = 1;
  duplicate.executionCount = 0;
  return (this as any).model("Request").create(duplicate);
};

requestSchema.methods.exportRequest = function (this: any) {
  const exported = this.toObject();
  if (exported.authentication?.basicAuth) {
    exported.authentication.basicAuth.password = "***";
  }
  if (exported.authentication?.bearerToken) {
    exported.authentication.bearerToken.token = "***";
  }
  if (exported.authentication?.oauth2) {
    exported.authentication.oauth2.accessToken = "***";
    exported.authentication.oauth2.refreshToken = "***";
    exported.authentication.oauth2.clientSecret = "***";
  }
  delete exported.executionHistory;
  return exported;
};

requestSchema.methods.toggleFavorite = async function (this: any) {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

requestSchema.statics.findBySlug = (function (this: any, slug: string) {
  return this.findOne({ slug });
} as any);

requestSchema.statics.findByWorkspace = (function (this: any,
  workspaceId: Types.ObjectId,
  status?: string,
) {
  const query: any = { workspaceId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
} as any);

requestSchema.statics.findByCollection = (function (this: any,
  collectionId: Types.ObjectId,
) {
  return this.find({ collectionId }).sort({ createdAt: -1 });
} as any);

requestSchema.statics.findFavorites = (function (this: any, userId: Types.ObjectId) {
  return this.find({ createdBy: userId, isFavorite: true }).sort({
    updatedAt: -1,
  });
} as any);

requestSchema.statics.searchRequests = (function (this: any,
  searchTerm: string,
  workspaceId?: Types.ObjectId,
) {
  const query: any = { $text: { $search: searchTerm } };
  if (workspaceId) query.workspaceId = workspaceId;
  return this.find(query, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
} as any);

requestSchema.statics.findPopular = (function (this: any,
  workspaceId: Types.ObjectId,
  limit: number = 10,
) {
  return this.find({ workspaceId }).sort({ executionCount: -1 }).limit(limit);
} as any);

requestSchema.statics.findRecentlyExecuted = (function (this: any,
  userId: Types.ObjectId,
  limit: number = 10,
) {
  return this.find({ createdBy: userId, lastExecutedAt: { $exists: true } })
    .sort({ lastExecutedAt: -1 })
    .limit(limit);
} as any);

requestSchema.pre("save", async function (this: any, next: any) {
  if (!this.slug) {
    const baseSlug = this.requestName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await (this as any).model("Request").findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

requestSchema.pre("save", function (next : any) {
  if (this.isModified() && !this.isNew) {
  }
  next();
});

requestSchema.post("save", async function (doc: any) {
  if (doc.executionHistory.length > 50) {
    doc.executionHistory = doc.executionHistory.slice(-50);
    await doc.save();
  }
});

export { requestSchema };
