import type { PublicUser } from "@/features/users/users.model";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
