import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function googleConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "https://smaillabs.onrender.com/api/auth/google/callback",
  };
}

function safeEqual(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const { clientId, redirectUri } = googleConfig();
    if (!clientId) {
      res.status(503).send("Google OAuth is not configured yet");
      return;
    }
    const nonce = randomBytes(32).toString("hex");
    const state = createHash("sha256").update(`${nonce}:${redirectUri}`).digest("hex");
    res.cookie("google_oauth_state", state, {
      ...getSessionCookieOptions(req),
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
    });
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("prompt", "select_account");
    res.redirect(302, url.toString());
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const expectedState = parseCookieHeader(req.headers.cookie ?? "")["google_oauth_state"];
    if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
      res.status(403).send("Invalid Google OAuth state");
      return;
    }
    res.clearCookie("google_oauth_state", { path: "/", secure: true, sameSite: "none" });

    const { clientId, clientSecret, redirectUri } = googleConfig();
    if (!clientId || !clientSecret) {
      res.status(503).send("Google OAuth is not configured yet");
      return;
    }

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      if (!tokenResponse.ok) throw new Error(`Google token exchange failed: ${tokenResponse.status}`);
      const tokens = await tokenResponse.json() as { access_token?: string; id_token?: string };
      if (!tokens.access_token) throw new Error("Google access token missing");

      const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!profileResponse.ok) throw new Error(`Google profile request failed: ${profileResponse.status}`);
      const profile = await profileResponse.json() as { sub?: string; name?: string; email?: string };
      if (!profile.sub) throw new Error("Google subject missing");

      const openId = `google:${profile.sub}`;
      await db.upsertUser({
        openId,
        name: profile.name ?? profile.email ?? "Google user",
        email: profile.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: profile.name ?? profile.email ?? "Google user",
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.status(500).send("Google OAuth callback failed");
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) return res.status(400).json({ error: "openId missing from user info" });
      await db.upsertUser({ openId: userInfo.openId, name: userInfo.name || null, email: userInfo.email ?? null, loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null, lastSignedIn: new Date() });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, { name: userInfo.name || "", expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

export { googleConfig };
