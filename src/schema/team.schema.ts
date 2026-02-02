import { Schema } from "mongoose";
import { ITeam } from "../types/team.types.js";

const TeamSchema = new Schema<ITeam>(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    teamId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    folders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],
  },
  {
    timestamps: true,
    collection: "teams",
  },
);

TeamSchema.index(
  { teamName: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

TeamSchema.pre("save", function (next: any) {
  if (!this.slug) {
    const base = this.teamName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    this.slug = base;
  }

  if (!this.teamId) {
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.teamId = `${this.teamName
      .toUpperCase()
      .replace(/\s+/g, "-")
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 12)}-${randomPart}`;
  }

  next();
});

TeamSchema.statics.findByTeamId = function (teamId: string) {
  return this.findOne({ teamId: teamId.toUpperCase() });
};

TeamSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug: slug.toLowerCase() });
};

export { TeamSchema };
