import { model } from "mongoose";
import { IDatabaseConnection } from "../types/database.types.js";
import { databaseConnectionSchema } from "../schema/database.schema.js";

export const DatabaseConnection = model<IDatabaseConnection>(
  "DatabaseConnection",
  databaseConnectionSchema,
);
