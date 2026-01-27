import { Document, Types } from "mongoose";

export enum FolderType {
  FOLDER = "folder",
  COLLECTION = "collection",
  WORKSPACE = "workspace",
}

export enum FolderStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  TEMPLATE = "template",
}

export enum SortOrder {
  MANUAL = "manual",
  NAME_ASC = "name_asc",
  NAME_DESC = "name_desc",
  CREATED_ASC = "created_asc",
  CREATED_DESC = "created_desc",
  UPDATED_ASC = "updated_asc",
  UPDATED_DESC = "updated_desc",
  REQUEST_COUNT = "request_count",
}

export enum FolderColor {
  RED = "#EF4444",
  ORANGE = "#F97316",
  YELLOW = "#F59E0B",
  GREEN = "#10B981",
  BLUE = "#3B82F6",
  INDIGO = "#6366F1",
  PURPLE = "#8B5CF6",
  PINK = "#EC4899",
  GRAY = "#6B7280",
}

export interface IFolderPermissions {
  isPublic: boolean;
  allowSharing: boolean;
  allowDuplication: boolean;
  allowExport: boolean;
  teams: Array<{
    teamId: Types.ObjectId;
    permission: "view" | "edit" | "admin";
    addedAt: Date;
  }>;
  users: Array<{
    userId: Types.ObjectId;
    permission: "view" | "edit" | "admin";
    addedAt: Date;
    addedBy: Types.ObjectId;
  }>;
  inheritFromParent: boolean;
}

export interface IFolderSettings {
  icon?: string;
  color: string;
  emoji?: string;
  sortOrder: SortOrder;
  sortRequestsBy?: SortOrder;
  defaultView: "list" | "grid" | "tree";
  showRequestCount: boolean;
  expandByDefault: boolean;
  autoOrganize: boolean;
  groupByMethod: boolean;
  groupByTag: boolean;
}

export interface IFolderMetadata {
  totalRequests: number;
  totalSubfolders: number;
  depth: number;
  lastActivityAt?: Date;
  lastRequestAdded?: Date;
  lastRequestExecuted?: Date;
  totalExecutions: number;
  successRate?: number;
  avgResponseTime?: number;
  approximateSize?: number;
}

export interface IAISuggestion {
  id: string;
  type: "move_request" | "create_subfolder" | "rename" | "merge" | "split";
  confidence: number;
  suggestion: string;
  reasoning: string;
  affectedRequests?: Types.ObjectId[];
  affectedFolders?: Types.ObjectId[];
  suggestedName?: string;
  suggestedParent?: Types.ObjectId;
  suggestedStructure?: any;
  applied: boolean;
  appliedAt?: Date;
  dismissedAt?: Date;
  createdAt: Date;
}

export interface IFolderTemplate {
  isTemplate: boolean;
  templateName?: string;
  templateDescription?: string;
  templateCategory?: string;
  timesUsed: number;
  lastUsedAt?: Date;
  includeSubfolders: boolean;
  includeRequests: boolean;
  includeSettings: boolean;
}

export interface IFolderVersion {
  versionNumber: number;
  createdAt: Date;
  createdBy: Types.ObjectId;
  changes: string;
  snapshot: {
    name: string;
    requests: Types.ObjectId[];
    childFolders: Types.ObjectId[];
    settings: IFolderSettings;
  };
}

export interface IFolder extends Document {
  name: string;
  description?: string;
  folderId: string;
  slug: string;
  type: FolderType;
  status: FolderStatus;
  parentFolder: Types.ObjectId | null;
  childFolders: Types.ObjectId[];
  breadcrumb: Array<{
    id: Types.ObjectId;
    name: string;
    slug: string;
  }>;
  requests: Types.ObjectId[];
  collectionId?: Types.ObjectId;
  projectId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  owner: Types.ObjectId;
  permissions: IFolderPermissions;
  settings: IFolderSettings;
  metadata: IFolderMetadata;
  tags: string[];
  category?: string;
  aiSuggestions: IAISuggestion[];
  autoOrganizeEnabled: boolean;
  template: IFolderTemplate;
  isFavorite: boolean;
  isPinned: boolean;
  pinnedAt?: Date;
  versions: IFolderVersion[];
  currentVersion: number;
  sharedWith: Array<{
    userId: Types.ObjectId;
    role: "viewer" | "editor";
    sharedAt: Date;
    sharedBy: Types.ObjectId;
  }>;
  lastModifiedBy?: Types.ObjectId;
  lastAccessedAt?: Date;
  accessCount: number;
  externalId?: string;
  importSource?: "postman" | "insomnia" | "swagger" | "openapi";
  importedAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
