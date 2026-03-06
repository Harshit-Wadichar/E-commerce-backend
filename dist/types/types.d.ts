import type { NextFunction } from "express";
export interface NewRequestUserBody {
    _id: string;
    name: string;
    email: string;
    photo: string;
    gender: "male" | "female";
    dob: Date;
}
export type ControllerType = (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=types.d.ts.map