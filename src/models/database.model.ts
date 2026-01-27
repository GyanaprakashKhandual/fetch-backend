import { model } from "mongoose";
import { IDatabaseConnection } from "../types/database.types";
import { databaseConnectionSchema } from "../schema/database.schema";

export const DatabaseConnection = model<IDatabaseConnection>(
  "DatabaseConnection",
  databaseConnectionSchema,
);
