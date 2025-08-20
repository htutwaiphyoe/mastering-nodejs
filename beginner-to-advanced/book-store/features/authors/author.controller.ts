import type { Request, Response } from "express";
import db from "@/db";
import { authorsTable } from "./author.model";

export const getAllAuthors = async (req: Request, res: Response) => {
  const authors = await db.select().from(authorsTable);

  res.status(200).json({
    status: "success",
    authors,
  });
};
