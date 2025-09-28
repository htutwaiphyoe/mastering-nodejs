import type { PublicUser } from "@/features/users/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
