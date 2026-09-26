import * as s from "../services/auth.service";
import { ok } from "../utils/response";

type AuthResult = {
  refreshToken?: string;
  [key: string]: any;
};

const cookie = (
  res: any,
  name: string,
  value: string | undefined,
  maxAge: number
) => {
  const prod = process.env.NODE_ENV === "production";
  return res.setHeader(
    "Set-Cookie",
    `${name}=${encodeURIComponent(value ?? "")}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=${prod ? "None" : "Lax"}${prod ? "; Secure" : ""}`
  );
};

export const registerC = async (q: any, r: any) => {
  const x = (await s.register(q.body, {
    userAgent: q.headers["user-agent"],
    ip: q.ip,
  })) as AuthResult;

  cookie(r, "nc_refresh", x.refreshToken, 7 * 24 * 60 * 60);
  delete x.refreshToken;
  return ok(r, x, "Registered", 201);
};

export const loginC = async (q: any, r: any) => {
  const x = (await s.login(q.body, {
    userAgent: q.headers["user-agent"],
    ip: q.ip,
  })) as AuthResult;

  cookie(r, "nc_refresh", x.refreshToken, 7 * 24 * 60 * 60);
  delete x.refreshToken;
  return ok(r, x, "Logged in");
};

export const refresh = async (q: any, r: any) => {
  const x = (await s.refresh(q.cookies?.nc_refresh, {
    userAgent: q.headers["user-agent"],
    ip: q.ip,
  })) as AuthResult;

  cookie(r, "nc_refresh", x.refreshToken, 7 * 24 * 60 * 60);
  delete x.refreshToken;
  return ok(r, x, "Token refreshed");
};

export const logout = async (q: any, r: any) => {
  await s.logout(q.cookies?.nc_refresh);
  cookie(r, "nc_refresh", "", 0);
  return ok(r, { message: "Logged out" });
};

export const meC = async (q: any, r: any) =>
  ok(r, await s.me(q.user.id));

export const requestReset = async (q: any, r: any) =>
  ok(r, await s.requestReset(q.body.email));

export const reset = async (q: any, r: any) =>
  ok(r, await s.resetPassword(q.body.token, q.body.password));

export const verify = async (q: any, r: any) =>
  ok(r, await s.verifyEmail(q.body.token));
