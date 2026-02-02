import { Schema, Types } from "mongoose";
import {
  FolderStatus,
  FolderType,
  IAISuggestion,
  IFolder,
} from "../types/folder.types.js";
import {
  folderPermissionsSchema,
  folderSettingsSchema,
  folderMetadataSchema,
  aiSuggestionSchema,
  folderTemplateSchema,
  folderVersionSchema,
} from "../schema/folder.sub.schema.js";
import { Folder } from "../models/folder.model.js";

const folderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [200, "Folder name cannot exceed 200 characters"],
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    folderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(FolderType),
      default: FolderType.FOLDER,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(FolderStatus),
      default: FolderStatus.ACTIVE,
      index: true,
    },
    parentFolder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
      index: true,
    },
    childFolders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],
    breadcrumb: [
      {
        id: { type: Schema.Types.ObjectId, ref: "Folder" },
        name: String,
        slug: String,
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      index: true,
    },
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    permissions: {
      type: folderPermissionsSchema,
      default: () => ({}),
    },
    settings: {
      type: folderSettingsSchema,
      default: () => ({}),
    },
    metadata: {
      type: folderMetadataSchema,
      default: () => ({}),
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
    aiSuggestions: {
      type: [aiSuggestionSchema],
      default: [],
    },
    autoOrganizeEnabled: {
      type: Boolean,
      default: false,
    },
    template: {
      type: folderTemplateSchema,
      default: () => ({}),
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinnedAt: Date,
    versions: {
      type: [folderVersionSchema],
      default: [],
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    sharedWith: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["viewer", "editor"],
          default: "viewer",
        },
        sharedAt: { type: Date, default: Date.now },
        sharedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastAccessedAt: Date,
    accessCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    externalId: String,
    importSource: {
      type: String,
      enum: ["postman", "insomnia", "swagger", "openapi"],
    },
    importedAt: Date,
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: Date,
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "folders",
  },
);

folderSchema.index({ owner: 1, parentFolder: 1 });
folderSchema.index({ owner: 1, slug: 1 }, { unique: true });
folderSchema.index({ workspaceId: 1, status: 1, isDeleted: 1 });
folderSchema.index({ projectId: 1, parentFolder: 1, isDeleted: 1 });
folderSchema.index({ collectionId: 1, isDeleted: 1 });
folderSchema.index({ owner: 1, isFavorite: 1, isDeleted: 1 });
folderSchema.index({ owner: 1, isPinned: 1, isDeleted: 1 });
folderSchema.index({ type: 1, status: 1, isDeleted: 1 });
folderSchema.index({ "permissions.isPublic": 1, isDeleted: 1 });
folderSchema.index(
  { name: "text", description: "text", tags: "text" },
  { weights: { name: 10, tags: 5, description: 1 } },
);
folderSchema.index({ name: 1 });
folderSchema.index({ createdAt: -1 });
folderSchema.index({ updatedAt: -1 });
folderSchema.index({ "metadata.totalRequests": -1 });

folderSchema.virtual("isRoot").get(function () {
  return this.parentFolder === null;
});

folderSchema.virtual("hasChildren").get(function () {
  return this.childFolders.length > 0;
});

folderSchema.virtual("hasRequests").get(function () {
  return this.requests.length > 0;
});

folderSchema.virtual("isEmpty").get(function () {
  return this.childFolders.length === 0 && this.requests.length === 0;
});

folderSchema.virtual("fullPath").get(function () {
  if (this.breadcrumb.length === 0) return this.name;
  return [...this.breadcrumb.map((b: any) => b.name), this.name].join(" / ");
});

folderSchema.methods.addRequest = async function (requestId: Types.ObjectId) {
  if (this.requests.includes(requestId)) {
    throw new Error("Request already exists in folder");
  }
  this.requests.push(requestId);
  this.metadata.totalRequests = this.requests.length;
  this.metadata.lastRequestAdded = new Date();
  this.metadata.lastActivityAt = new Date();
  return this.save();
};

folderSchema.methods.removeRequest = async function (
  requestId: Types.ObjectId,
) {
  const index = this.requests.findIndex(
    (id: any) => id.toString() === requestId.toString(),
  );
  if (index === -1) {
    throw new Error("Request not found in folder");
  }
  this.requests.splice(index, 1);
  this.metadata.totalRequests = this.requests.length;
  this.metadata.lastActivityAt = new Date();
  return this.save();
};

folderSchema.methods.addSubfolder = async function (
  this: any,
  folderId: Types.ObjectId,
) {
  if (this.childFolders.includes(folderId)) {
    throw new Error("Subfolder already exists");
  }
  if (this.metadata.depth >= 10) {
    throw new Error("Maximum folder nesting depth (10) reached");
  }
  this.childFolders.push(folderId);
  this.metadata.totalSubfolders = this.childFolders.length;
  this.metadata.lastActivityAt = new Date();
  return this.save();
};

folderSchema.methods.removeSubfolder = async function (
  this: any,
  folderId: Types.ObjectId,
) {
  const index = this.childFolders.findIndex(
    (id: any) => id.toString() === folderId.toString(),
  );
  if (index === -1) {
    throw new Error("Subfolder not found");
  }
  this.childFolders.splice(index, 1);
  this.metadata.totalSubfolders = this.childFolders.length;
  this.metadata.lastActivityAt = new Date();
  return this.save();
};

folderSchema.methods.updateBreadcrumb = async function (this: any) {
  const breadcrumb: Array<{ id: Types.ObjectId; name: string; slug: string }> =
    [];
  let currentFolder = this;
  let parent = this.parentFolder;
  while (parent) {
    const parentFolder = await Folder.findById(parent);
    if (!parentFolder) break;
    breadcrumb.unshift({
      id: parentFolder._id,
      name: parentFolder.name,
      slug: parentFolder.slug,
    });
    parent = parentFolder.parentFolder;
    if (breadcrumb.length > 10) break;
  }
  this.breadcrumb = breadcrumb;
  this.metadata.depth = breadcrumb.length;
  return this.save();
};

folderSchema.methods.moveTo = async function (
  this: any,
  newParentId: Types.ObjectId | null,
) {
  if (this.parentFolder) {
    const oldParent = await Folder.findById(this.parentFolder);
    if (oldParent) {
      await (oldParent as any).removeSubfolder(this._id);
    }
  }
  if (newParentId) {
    const newParent = await Folder.findById(newParentId);
    if (!newParent) {
      throw new Error("New parent folder not found");
    }
    if (await this.wouldCreateCircularReference(newParentId)) {
      throw new Error("Cannot move folder: would create circular reference");
    }
    await (newParent as any).addSubfolder(this._id);
    this.parentFolder = newParentId;
  } else {
    this.parentFolder = null;
  }
  await this.updateBreadcrumb();
  return this.save();
};

folderSchema.methods.wouldCreateCircularReference = async function (
  this: any,
  targetParentId: Types.ObjectId,
): Promise<boolean> {
  let currentId = targetParentId;
  const visited = new Set<string>();
  while (currentId) {
    const idStr = currentId.toString();
    if (idStr === this._id.toString()) {
      return true;
    }
    if (visited.has(idStr)) {
      return false;
    }
    visited.add(idStr);
    const folder = await Folder.findById(currentId);
    if (!folder || !folder.parentFolder) break;
    currentId = folder.parentFolder;
  }
  return false;
};

folderSchema.methods.archive = async function (userId: Types.ObjectId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  this.status = FolderStatus.ARCHIVED;
  return this.save();
};

folderSchema.methods.restore = async function () {
  this.isArchived = false;
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  this.status = FolderStatus.ACTIVE;
  return this.save();
};

folderSchema.methods.softDelete = async function (userId: Types.ObjectId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

folderSchema.methods.undelete = async function () {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

folderSchema.methods.toggleFavorite = async function () {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

folderSchema.methods.togglePin = async function () {
  this.isPinned = !this.isPinned;
  this.pinnedAt = this.isPinned ? new Date() : undefined;
  return this.save();
};

folderSchema.methods.createVersion = async function (
  userId: Types.ObjectId,
  changes: string,
) {
  const version: any = {
    versionNumber: this.currentVersion + 1,
    createdAt: new Date(),
    createdBy: userId,
    changes,
    snapshot: {
      name: this.name,
      requests: [...this.requests],
      childFolders: [...this.childFolders],
      settings: { ...this.settings },
    },
  };
  this.versions.push(version);
  this.currentVersion += 1;
  return this.save();
};

folderSchema.methods.shareWith = async function (
  userId: Types.ObjectId,
  role: "viewer" | "editor",
  sharedBy: Types.ObjectId,
) {
  const exists = this.sharedWith.some(
    (s: any) => s.userId.toString() === userId.toString(),
  );
  if (exists) {
    throw new Error("Folder already shared with this user");
  }
  this.sharedWith.push({
    userId,
    role,
    sharedAt: new Date(),
    sharedBy,
  });
  return this.save();
};

folderSchema.methods.unshare = async function (userId: Types.ObjectId) {
  this.sharedWith = this.sharedWith.filter(
    (s: any) => s.userId.toString() !== userId.toString(),
  );
  return this.save();
};

folderSchema.methods.duplicate = async function (
  newName?: string,
  includeRequests: boolean = false,
  includeSubfolders: boolean = false,
) {
  const duplicate: any = this.toObject();
  delete duplicate._id;
  delete duplicate.folderId;
  delete duplicate.slug;
  duplicate.name = newName || `${this.name} (Copy)`;
  duplicate.requests = includeRequests ? [...this.requests] : [];
  duplicate.childFolders = includeSubfolders ? [...this.childFolders] : [];
  duplicate.versions = [];
  duplicate.currentVersion = 1;
  duplicate.createdAt = new Date();
  return Folder.create(duplicate);
};

folderSchema.methods.updateMetadata = async function () {
  this.metadata.totalRequests = this.requests.length;
  this.metadata.totalSubfolders = this.childFolders.length;
  return this.save();
};

folderSchema.methods.trackAccess = async function () {
  this.lastAccessedAt = new Date();
  this.accessCount += 1;
  return this.save({ validateBeforeSave: false });
};

folderSchema.methods.addAISuggestion = async function (
  suggestion: Omit<IAISuggestion, "id" | "createdAt" | "applied">,
) {
  const aiSuggestion: any = {
    ...suggestion,
    id: `suggestion_${Date.now()}`,
    applied: false,
    createdAt: new Date(),
  };
  this.aiSuggestions.push(aiSuggestion);
  return this.save();
};

folderSchema.methods.getSummary = function () {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    type: this.type,
    status: this.status,
    requestCount: this.requests.length,
    subfolderCount: this.childFolders.length,
    depth: this.metadata.depth,
    fullPath: this.fullPath,
    isFavorite: this.isFavorite,
    isPinned: this.isPinned,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

folderSchema.statics.findBySlug = function (
  slug: string,
  ownerId: Types.ObjectId,
) {
  return this.findOne({ slug, owner: ownerId, isDeleted: false });
};

folderSchema.statics.findRootFolders = function (
  workspaceId: Types.ObjectId,
  ownerId?: Types.ObjectId,
) {
  const query: any = {
    workspaceId,
    parentFolder: null,
    isDeleted: false,
  };
  if (ownerId) query.owner = ownerId;
  return this.find(query).sort({ name: 1 });
};

folderSchema.statics.findByProject = function (projectId: Types.ObjectId) {
  return this.find({ projectId, isDeleted: false }).sort({ name: 1 });
};

folderSchema.statics.findByParent = function (parentId: Types.ObjectId) {
  return this.find({ parentFolder: parentId, isDeleted: false }).sort({
    name: 1,
  });
};

folderSchema.statics.findFavorites = function (userId: Types.ObjectId) {
  return this.find({ owner: userId, isFavorite: true, isDeleted: false }).sort({
    updatedAt: -1,
  });
};

folderSchema.statics.findPinned = function (userId: Types.ObjectId) {
  return this.find({ owner: userId, isPinned: true, isDeleted: false }).sort({
    pinnedAt: -1,
  });
};

folderSchema.statics.searchFolders = function (
  searchTerm: string,
  workspaceId?: Types.ObjectId,
) {
  const query: any = {
    $text: { $search: searchTerm },
    isDeleted: false,
  };
  if (workspaceId) query.workspaceId = workspaceId;
  return this.find(query, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
};

folderSchema.statics.getFolderTree = async function (
  rootId: Types.ObjectId | null,
  workspaceId: Types.ObjectId,
  maxDepth: number = 10,
) {
  const buildTree = async (
    parentId: Types.ObjectId | null,
    depth: number = 0,
  ): Promise<any[]> => {
    if (depth >= maxDepth) return [];
    const folders = await this.find({
      workspaceId,
      parentFolder: parentId,
      isDeleted: false,
    }).sort({ name: 1 });
    const tree = [];
    for (const folder of folders) {
      const children = await buildTree(folder._id, depth + 1);
      tree.push({
        ...folder.toObject(),
        children,
      });
    }
    return tree;
  };
  return buildTree(rootId);
};

folderSchema.statics.findTemplates = function (category?: string) {
  const query: any = {
    "template.isTemplate": true,
    isDeleted: false,
  };
  if (category) query["template.templateCategory"] = category;
  return this.find(query).sort({ "template.timesUsed": -1 });
};

folderSchema.pre("save", async function (next: any) {
  if (!this.folderId) {
    this.folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  if (!this.slug || this.isModified("name")) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (
      await Folder.findOne({
        slug,
        owner: this.owner,
        _id: { $ne: this._id },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

folderSchema.post("save", async function (doc: any) {
  if (doc.parentFolder && doc.isModified("parentFolder")) {
    const parent = await Folder.findById(doc.parentFolder);
    if (parent && !parent.childFolders.includes(doc._id)) {
      await (parent as any).addSubfolder(doc._id);
    }
  }
});

folderSchema.pre("findByIdAndDelete", async function (next: any) {
  const doc = this as any;
  if (doc?.parentFolder) {
    const parent = await Folder.findById(doc.parentFolder);
    if (parent) {
      await (parent as any).removeSubfolder(doc._id);
    }
  }
  next();
});

export { folderSchema };
