import jwt from "jsonwebtoken";

export type JwtPayload = { sub: string };

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
};

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN ??
      "7d") as jwt.SignOptions["expiresIn"],
  });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, getSecret()) as JwtPayload;
