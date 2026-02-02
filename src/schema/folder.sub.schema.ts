import { Schema } from "mongoose";
import {
  IFolderPermissions,
  IFolderSettings,
  IFolderMetadata,
  IAISuggestion,
  IFolderTemplate,
  IFolderVersion,
  SortOrder,
} from "../types/folder.types.js";

export const folderPermissionsSchema = new Schema<IFolderPermissions>(
  {
    isPublic: { type: Boolean, default: false },
    allowSharing: { type: Boolean, default: true },
    allowDuplication: { type: Boolean, default: true },
    allowExport: { type: Boolean, default: true },
    teams: [
      {
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        permission: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    users: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        permission: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },
        addedAt: { type: Date, default: Date.now },
        addedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    inheritFromParent: { type: Boolean, default: true },
  },
  { _id: false },
);

export const folderSettingsSchema = new Schema<IFolderSettings>(
  {
    icon: String,
    color: {
      type: String,
      default: "#3B82F6",
    },
    emoji: String,
    sortOrder: {
      type: String,
      enum: Object.values(SortOrder),
      default: SortOrder.MANUAL,
    },
    sortRequestsBy: {
      type: String,
      enum: Object.values(SortOrder),
    },
    defaultView: {
      type: String,
      enum: ["list", "grid", "tree"],
      default: "list",
    },
    showRequestCount: { type: Boolean, default: true },
    expandByDefault: { type: Boolean, default: false },
    autoOrganize: { type: Boolean, default: false },
    groupByMethod: { type: Boolean, default: false },
    groupByTag: { type: Boolean, default: false },
  },
  { _id: false },
);

export const folderMetadataSchema = new Schema<IFolderMetadata>(
  {
    totalRequests: { type: Number, default: 0 },
    totalSubfolders: { type: Number, default: 0 },
    depth: { type: Number, default: 0, min: 0, max: 10 },
    lastActivityAt: Date,
    lastRequestAdded: Date,
    lastRequestExecuted: Date,
    totalExecutions: { type: Number, default: 0 },
    successRate: { type: Number, min: 0, max: 100 },
    avgResponseTime: { type: Number, min: 0 },
    approximateSize: { type: Number, default: 0 },
  },
  { _id: false },
);

export const aiSuggestionSchema = new Schema<IAISuggestion>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["move_request", "create_subfolder", "rename", "merge", "split"],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 1, required: true },
    suggestion: { type: String, required: true },
    reasoning: { type: String, required: true },
    affectedRequests: [{ type: Schema.Types.ObjectId, ref: "Request" }],
    affectedFolders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
    suggestedName: String,
    suggestedParent: { type: Schema.Types.ObjectId, ref: "Folder" },
    suggestedStructure: Schema.Types.Mixed,
    applied: { type: Boolean, default: false },
    appliedAt: Date,
    dismissedAt: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export const folderTemplateSchema = new Schema<IFolderTemplate>(
  {
    isTemplate: { type: Boolean, default: false },
    templateName: String,
    templateDescription: String,
    templateCategory: String,
    timesUsed: { type: Number, default: 0 },
    lastUsedAt: Date,
    includeSubfolders: { type: Boolean, default: true },
    includeRequests: { type: Boolean, default: true },
    includeSettings: { type: Boolean, default: true },
  },
  { _id: false },
);

export const folderVersionSchema = new Schema<IFolderVersion>(
  {
    versionNumber: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changes: { type: String, required: true },
    snapshot: {
      name: String,
      requests: [{ type: Schema.Types.ObjectId, ref: "Request" }],
      childFolders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
      settings: folderSettingsSchema,
    },
  },
  { _id: false },
);
