import type { StoredFile } from "./types";
import type { AccountSession } from "../account/types";
import { mimeTypes } from "./mimeTypes";

export function downloadFileBuffer(
  buffer: string,
  file: Pick<StoredFile, "fileName" | "extension">,
) {
  let binary: string;
  try {
    binary = atob(buffer);
  } catch {
    throw new Error("다운로드할 파일 데이터 형식이 올바르지 않습니다.");
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const extension = file.extension.toLowerCase();
  const blob = new Blob([bytes], {
    type:
      mimeTypes[extension as keyof typeof mimeTypes] ?? "application/octet-stream",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${file.fileName}${file.extension}`;

  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}

export function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

export function getImageType(extension: string): StoredFile["imageType"] {
  if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(extension))
    return "image";
  if ([".mp4", ".mov", ".webm"].includes(extension)) return "video";
  if (
    [
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".txt",
      ".xls",
      ".xlsx",
    ].includes(extension)
  )
    return "document";
  return "other";
}

export function folderPathFromUrl(pathname: string) {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
  const folderSegments = segments[0] === "files" ? segments.slice(1) : segments;
  return folderSegments.length ? `/${folderSegments.join("/")}` : "/";
}

export function folderUrlFromPath(path: string) {
  if (path === "/") return "/files";
  return `/files/${path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function getFileRequestHeaders(
  session: AccountSession | null,
): Record<string, string> {
  if (!session) throw new Error("파일을 관리하려면 로그인이 필요합니다.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
}

export function parentFolderPath(path: string) {
  const lastSlash = path.lastIndexOf("/");
  return lastSlash <= 0 ? "/" : path.slice(0, lastSlash);
}

export function joinFolderPath(parentPath: string, name: string) {
  return `${parentPath.replace(/\/+$/, "")}/${name}`;
}
