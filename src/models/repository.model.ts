import { model } from "mongoose";
import { IRepository } from "../types/repository.types.js";
import { repositorySchema } from "../schema/repository.schema.js";

export const Repository = model<IRepository>("Repository", repositorySchema);
