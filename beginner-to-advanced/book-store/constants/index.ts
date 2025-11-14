export const COOKIES = {
  access: { name: "accessToken", path: "/" },
  refresh: { name: "refreshToken", path: "/auth" },
} as const;

export const BEARER_PREFIX = "Bearer ";
