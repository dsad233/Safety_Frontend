import type { AccountSession } from "../account/types";
import type { FileListQuery, StoredFile } from "./types";
import { getFileRequestHeaders } from "./utils";

export async function getStorageFileBuffer(
  accessToken: string,
  fileId: string,
): Promise<string> {
  if (!accessToken)
    throw new Error("파일을 다운로드하려면 로그인이 필요합니다.");

  const response = await fetch("/api/files/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ ids: [fileId] }),
  });

  if (!response.ok) {
    throw new Error(`파일 다운로드에 실패했습니다. (${response.status})`);
  }

  const result: unknown = await response.json();
  console.log("result: ", result);
  if (typeof result !== "object" || result === null || !("data" in result)) {
    throw new Error("파일 다운로드 응답 형식이 올바르지 않습니다.");
  }

  const data: unknown =
    Array.isArray(result.data) && result.data.length === 1
      ? result.data[0]
      : result.data;
  if (
    typeof data !== "object" ||
    data === null ||
    !("buffer" in data) ||
    typeof data.buffer !== "string"
  ) {
    throw new Error("파일 다운로드 응답 형식이 올바르지 않습니다.");
  }

  return data.buffer;
}

export async function getStorageFiles(
  session: AccountSession,
  query: FileListQuery,
  signal?: AbortSignal,
): Promise<StoredFile[]> {
  const params = new URLSearchParams({
    page: String(query.page),
    pages: String(query.pages),
    path: query.path,
    orderBy: query.orderBy,
    filter: query.filter,
    search: query.search,
  });
  const response = await fetch(`/api/files?${params}`, {
    method: "GET",
    headers: getFileRequestHeaders(session),
    signal,
  });

  if (!response.ok) {
    throw new Error(`파일 목록 조회에 실패했습니다. (${response.status})`);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    !Array.isArray(result.data)
  ) {
    throw new Error("파일 목록 응답 형식이 올바르지 않습니다.");
  }

  return result.data as StoredFile[];
}
