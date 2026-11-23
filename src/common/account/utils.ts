export async function getResponseMessage(response: Response) {
  const result: unknown = await response.json();
  if (
    typeof result === "object" &&
    result !== null &&
    "message" in result &&
    typeof result.message === "string"
  ) {
    return result.message;
  }
  throw new Error("서버 응답 형식이 올바르지 않습니다.");
}

export function decodeTokenUser(token: string) {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("로그인 응답의 토큰 형식이 올바르지 않습니다.");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const result: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (typeof result !== "object" || result === null) {
    throw new Error("로그인 사용자 정보가 올바르지 않습니다.");
  }
  return result as { nickname?: unknown; email?: unknown; loginId?: unknown };
}
