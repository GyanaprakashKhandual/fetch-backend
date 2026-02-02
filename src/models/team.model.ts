import { model } from "mongoose";
import { ITeam } from "../types/team.types.js";
import { TeamSchema } from "../schema/team.schema.js";

export const Team = model<ITeam>("Team", TeamSchema);
