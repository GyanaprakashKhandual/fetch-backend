import { model } from "mongoose";
import { IUser } from "../types/user.types";
import { userSchema } from "../schema/user.schema";

export const User = model<IUser>("User", userSchema);
