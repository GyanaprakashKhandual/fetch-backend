import { model } from "mongoose";
import { IProject } from "../types/project.types.js";
import { projectSchema } from "../schema/project.schema.js";

export const Project = model<IProject>("Project", projectSchema);
