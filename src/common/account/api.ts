import type { AccountProfile } from "./types";
import { getResponseMessage } from "./utils";

export async function getMyPage(
  accessToken: string,
  signal?: AbortSignal,
): Promise<AccountProfile> {
  const response = await fetch("/api/users/mypage", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });

  if (!response.ok) {
    const message = await getResponseMessage(response).catch(
      () => "마이페이지 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
    throw new Error(message);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    typeof result.data !== "object" ||
    result.data === null ||
    !("nickname" in result.data) ||
    !("email" in result.data) ||
    !("loginId" in result.data) ||
    typeof result.data.nickname !== "string" ||
    typeof result.data.email !== "string" ||
    typeof result.data.loginId !== "string"
  ) {
    throw new Error("마이페이지 응답 형식이 올바르지 않습니다.");
  }

  return result.data as AccountProfile;
}
