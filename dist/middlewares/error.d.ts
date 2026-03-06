import type { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import type { ControllerType } from "../types/types.js";
export declare const errorMiddleware: (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const TryCatch: (func: ControllerType) => (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=error.d.ts.map