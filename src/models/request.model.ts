import { model } from "mongoose";
import { IRequest } from "../types/request.types.js";
import { requestSchema } from "../schema/request.schema.js";

export const Request = model<IRequest>("Request", requestSchema);
