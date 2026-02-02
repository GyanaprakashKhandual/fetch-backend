import { model } from "mongoose";
import { IFolder } from "../types/folder.types.js";
import { folderSchema } from "../schema/folder.schema.js";

export const Folder = model<IFolder>("Folder", folderSchema);
