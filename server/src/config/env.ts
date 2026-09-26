import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

const projectRoot = path.resolve(process.cwd(), "..");

dotenv.config({
  path: path.join(projectRoot, ".env"),
});

export const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    PORT: z.coerce.number().default(5000),

    CLIENT_URL: z.string().url(),

    ALLOWED_ORIGINS: z.string().default(""),

    MONGODB_URI: z.string().min(1),

    JWT_SECRET: z.string().min(32),

    REFRESH_TOKEN_SECRET: z.string().min(32),

    JWT_EXPIRES_IN: z.string().default("15m"),

    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),

    RATE_LIMIT_MAX: z.coerce.number().default(200),

    AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),

    UPLOAD_MAX_BYTES: z.coerce.number().default(5242880),

    EMAIL_PROVIDER_URL: z
      .string()
      .url()
      .optional()
      .or(z.literal("")),

    EMAIL_PROVIDER_KEY: z.string().optional(),

    EMAIL_FROM: z.string().email().optional(),

    EMAIL_PROVIDER: z
      .enum(["generic", "none"])
      .default("none"),
  })
  .superRefine((v, ctx) => {
    if (
      v.NODE_ENV === "production" &&
      (
        v.EMAIL_PROVIDER !== "generic" ||
        !v.EMAIL_PROVIDER_URL ||
        !v.EMAIL_PROVIDER_KEY ||
        !v.EMAIL_FROM
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Production requires EMAIL_PROVIDER=generic plus EMAIL_PROVIDER_URL, EMAIL_PROVIDER_KEY and EMAIL_FROM",
        path: ["EMAIL_PROVIDER"],
      });
    }
  })
  .parse(process.env);

export const allowedOrigins = env.ALLOWED_ORIGINS
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

