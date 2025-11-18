import { env } from "@/libs/env";

export const buildPasswordResetEmail = (resetUrl: string) => ({
  subject: "Reset your password",
  text: `Reset your password using this link: ${resetUrl}\n\nThis link expires in ${env.RESET_TOKEN_TTL_MINUTES} minutes. If you didn't request this, ignore this email.`,
  html: `<p>Reset your password using the link below:</p>
<p><a href="${resetUrl}">Reset password</a></p>
<p>This link expires in ${env.RESET_TOKEN_TTL_MINUTES} minutes. If you didn't request this, ignore this email.</p>`,
});
