export type StoredFile = {
  id: string;
  fileName: string;
  extension: string;
  // API의 path는 파일/폴더가 들어 있는 부모 폴더의 경로입니다.
  path: string;
  size: number;
  imageType: "image" | "document" | "video" | "other" | "folder";
  updatedAt: string;
  folderInfo?: {
    length: number;
    totalSize: number | null;
  };
};

export type ViewFilter =
  | "all"
  | "recent"
  | "images"
  | "documents"
  | "videos"
  | "shared";
export type ViewMode = "list" | "grid";
export type FileListQuery = {
  page: number;
  pages: number;
  path: string;
  orderBy: "NEW" | "OLD";
  filter: ViewFilter;
  search: string;
};

export type FileAction =
  | "rename"
  | "delete"
  | "file-info"
  | "folder-info"
  | "folder-delete";
export type FolderInfo = {
  id: string;
  name: string;
  // 화면에서 사용하는 path는 폴더 이름까지 포함한 전체 경로입니다.
  path: string;
  updatedAt: string;
  count: number;
  totalSize: number;
};
export type FolderEntry = FolderInfo & { color: string };
export type VisibleItem =
  | { type: "folder"; folder: FolderEntry }
  | { type: "file"; file: StoredFile };
