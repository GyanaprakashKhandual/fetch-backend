import { model } from "mongoose";
import { IProject } from "../types/project.types";
import { projectSchema } from "../schema/project.schema";

export const Project = model<IProject>("Project", projectSchema);
