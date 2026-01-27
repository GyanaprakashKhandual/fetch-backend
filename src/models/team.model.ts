import { model } from "mongoose";
import { ITeam } from "../types/team.types";
import { TeamSchema } from "../schema/team.schema";

export const Team = model<ITeam>("Team", TeamSchema);
