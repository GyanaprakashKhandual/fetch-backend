import { model } from "mongoose";
import { IFolder } from "../types/folder.types";
import { folderSchema } from "../schema/folder.schema";

export const Folder = model<IFolder>("Folder", folderSchema);
