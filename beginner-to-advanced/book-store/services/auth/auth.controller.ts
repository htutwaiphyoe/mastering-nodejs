import type { Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import db from "@/db";
import {
  usersTable,
  publicUserColumns,
  type SignupInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type UserRole,
} from "@/services/users/users.model";
import { refreshTokensTable } from "./auth.model";
import { COOKIES } from "@/constants";
import { hashPassword, verifyPassword } from "@/libs/password";
import { signAccessToken } from "@/libs/jwt";
import {
  generateToken,
  hashToken,
  refreshTokenExpiry,
  resetTokenExpiry,
} from "@/libs/token";
import {
  emailQueue,
  PASSWORD_RESET_JOB,
  type PasswordResetJob,
} from "@/libs/queue";
import { env } from "@/libs/env";
import { ApiError } from "@/libs/error";
import { DAY, MINUTE } from "@/constants";

const cookieBase = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie(COOKIES.access.name, accessToken, {
    ...cookieBase,
    path: COOKIES.access.path,
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * MINUTE,
  });
  res.cookie(COOKIES.refresh.name, refreshToken, {
    ...cookieBase,
    path: COOKIES.refresh.path,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * DAY,
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie(COOKIES.access.name, {
    ...cookieBase,
    path: COOKIES.access.path,
  });
  res.clearCookie(COOKIES.refresh.name, {
    ...cookieBase,
    path: COOKIES.refresh.path,
  });
};

const issueTokens = async (
  res: Response,
  userId: string,
  role: UserRole,
) => {
  const accessToken = signAccessToken({ sub: userId, role });
  const { token: refreshToken, tokenHash } = generateToken();

  await db.insert(refreshTokensTable).values({
    userId,
    tokenHash,
    expiresAt: refreshTokenExpiry(),
  });

  setAuthCookies(res, accessToken, refreshToken);

  return { accessToken, refreshToken };
};

const readRefreshToken = (req: Request): string | undefined =>
  req.cookies?.[COOKIES.refresh.name] ?? req.body?.refreshToken;

export const signup = async (
  req: Request<{}, unknown, SignupInput>,
  res: Response,
) => {
  const { password, ...rest } = req.body;

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({ ...rest, password: passwordHash })
    .returning(publicUserColumns);

  const { accessToken, refreshToken } = await issueTokens(
    res,
    user.id,
    user.role,
  );

  res.status(201).json({
    status: "success",
    accessToken,
    refreshToken,
    user,
  });
};

export const login = async (
  req: Request<{}, unknown, LoginInput>,
  res: Response,
) => {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.email, email), isNull(usersTable.deactivatedAt)))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.password))) {
    throw ApiError.unauthenticated("Invalid email or password.");
  }

  const { accessToken, refreshToken } = await issueTokens(
    res,
    user.id,
    user.role,
  );

  const { password: _password, ...safeUser } = user;

  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
    user: safeUser,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const rawToken = readRefreshToken(req);

  if (!rawToken) {
    throw ApiError.unauthenticated("Refresh token is required.");
  }

  const [stored] = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.tokenHash, hashToken(rawToken)))
    .limit(1);

  if (!stored) {
    throw ApiError.unauthenticated("Invalid refresh token.");
  }

  if (stored.revokedAt) {
    await db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokensTable.userId, stored.userId),
          isNull(refreshTokensTable.revokedAt),
        ),
      );
    clearAuthCookies(res);
    throw ApiError.unauthenticated("Refresh token has been revoked.");
  }

  if (stored.expiresAt <= new Date()) {
    throw ApiError.unauthenticated("Refresh token has expired.");
  }

  const [user] = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(
      and(eq(usersTable.id, stored.userId), isNull(usersTable.deactivatedAt)),
    )
    .limit(1);

  if (!user) {
    clearAuthCookies(res);
    throw ApiError.unauthenticated("User is no longer active.");
  }

  await db
    .update(refreshTokensTable)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokensTable.id, stored.id));

  const { accessToken, refreshToken } = await issueTokens(
    res,
    stored.userId,
    user.role,
  );

  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const rawToken = readRefreshToken(req);

  if (rawToken) {
    await db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokensTable.tokenHash, hashToken(rawToken)),
          isNull(refreshTokensTable.revokedAt),
        ),
      );
  }

  clearAuthCookies(res);

  res.status(200).json({
    status: "success",
  });
};

export const forgotPassword = async (
  req: Request<{}, unknown, ForgotPasswordInput>,
  res: Response,
) => {
  const { email } = req.body;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.email, email), isNull(usersTable.deactivatedAt)))
    .limit(1);

  if (user) {
    const { token, tokenHash } = generateToken();

    await db
      .update(usersTable)
      .set({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: resetTokenExpiry(),
      })
      .where(eq(usersTable.id, user.id));

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

    await emailQueue.add(PASSWORD_RESET_JOB, {
      to: user.email,
      resetUrl,
    } satisfies PasswordResetJob);
  }

  res.status(200).json({
    status: "success",
    message: "If an account exists for that email, a reset link has been sent.",
  });
};

export const resetPassword = async (
  req: Request<{}, unknown, ResetPasswordInput>,
  res: Response,
) => {
  const { token, password } = req.body;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.passwordResetTokenHash, hashToken(token)))
    .limit(1);

  if (
    !user ||
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt <= new Date()
  ) {
    throw ApiError.badRequest("Invalid or expired reset token.");
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(usersTable)
    .set({
      password: passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    })
    .where(eq(usersTable.id, user.id));

  await db
    .update(refreshTokensTable)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokensTable.userId, user.id),
        isNull(refreshTokensTable.revokedAt),
      ),
    );

  res.status(200).json({
    status: "success",
    message: "Password has been reset. Please log in.",
  });
};
