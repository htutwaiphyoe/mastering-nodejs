import type { Request, Response } from "express";

export const me = (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
};
