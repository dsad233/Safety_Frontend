import type { ViewFilter } from "./types";

export const filterOptions: { value: Exclude<ViewFilter, "shared">; label: string }[] =
  [
    { value: "all", label: "모든 항목" },
    { value: "recent", label: "최근 파일" },
    { value: "images", label: "이미지" },
    { value: "documents", label: "문서" },
    { value: "videos", label: "동영상" },
  ];

export const MAX_FILE_SIZE = 4_294_967_295;

export const folderColors = ["green", "blue", "orange"];

export const FILE_PAGE_SIZES = [10, 20, 50] as const;
export const DEFAULT_FILE_PAGE_SIZE = FILE_PAGE_SIZES[0];
