import { model } from "mongoose";
import { IRequest } from "../types/request.types";
import { requestSchema } from "../schema/request.schema";

export const Request = model<IRequest>("Request", requestSchema);
