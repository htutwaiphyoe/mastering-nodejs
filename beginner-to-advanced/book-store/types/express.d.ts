import type { AuthUser } from "@/services/users/users.model";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
