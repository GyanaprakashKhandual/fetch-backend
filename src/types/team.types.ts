import { Document, Types } from "mongoose";

export interface ITeam extends Document {
  teamName: string;
  teamId: string;
  slug: string;
  teamMembers: Types.ObjectId[];
  projects: Types.ObjectId[];
  folders: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
