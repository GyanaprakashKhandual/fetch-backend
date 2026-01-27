import { model } from "mongoose";
import { IRepository } from "../types/repository.types";
import { repositorySchema } from "../schema/repository.schema";

export const Repository = model<IRepository>("Repository", repositorySchema);
