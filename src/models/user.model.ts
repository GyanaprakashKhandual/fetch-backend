import { model } from "mongoose";
import { IUser } from "../types/user.types.js";
import { userSchema } from "../schema/user.schema.js";

export const User = model<IUser>("User", userSchema);
