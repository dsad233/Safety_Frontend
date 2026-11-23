import type { AccountSession } from "./types";

const SESSION_KEY = "safety-account-session";

export function readAccountSession(): AccountSession | null {
  const value = window.sessionStorage.getItem(SESSION_KEY);
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "nickname" in parsed &&
      "email" in parsed &&
      "loginId" in parsed &&
      "accessToken" in parsed &&
      "refreshToken" in parsed &&
      typeof parsed.nickname === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.loginId === "string" &&
      typeof parsed.accessToken === "string" &&
      typeof parsed.refreshToken === "string"
    ) {
      return parsed as AccountSession;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  window.sessionStorage.removeItem(SESSION_KEY);
  return null;
}

export function saveAccountSession(session: AccountSession) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAccountSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}
