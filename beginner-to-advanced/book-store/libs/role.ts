import type { PublicUser } from "@/features/users/users.model";
import { ApiError } from "@/libs/error";

export const assertOwnership = (
  user: PublicUser,
  createdBy: string | null,
) => {
  if (user.role === "admin") return;
  if (createdBy !== null && createdBy === user.id) return;
  throw ApiError.forbidden("You can only manage resources you created.");
};
