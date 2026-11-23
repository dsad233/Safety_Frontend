import { Download, FolderOpen, Info, Pencil, Trash2 } from "lucide-react";
import type { StoredFile, FolderInfo, FileAction } from "../../common/storage/types";

type StorageActionMenusProps = {
  navigateToFolder: (path: string) => void;
  openFileMenuId: string | null;
  openFolderMenuPath: string | null;
  downloadFile: (file: StoredFile) => Promise<void>;
  activeFile: StoredFile | null;
  activeFolderInfo: FolderInfo | null;
  menuPosition: { top: number; left: number };
  setOpenFileMenuId: (id: string | null) => void;
  setOpenFolderMenuPath: (path: string | null) => void;
  openFileAction: (action: FileAction, file: StoredFile) => void;
  openFolderRename: (folder: FolderInfo) => void;
  openFolderInfo: (folder: FolderInfo) => void;
  setActiveAction: (action: FileAction | null) => void;
};

export default function StorageActionMenus({
  navigateToFolder,
  openFileMenuId,
  openFolderMenuPath,
  downloadFile,
  activeFile,
  activeFolderInfo,
  menuPosition,
  setOpenFileMenuId,
  setOpenFolderMenuPath,
  openFileAction,
  openFolderRename,
  openFolderInfo,
  setActiveAction,
}: StorageActionMenusProps) {
  return (
    <>
      {openFileMenuId && activeFile && (
        <>
          <button
            className="menu-dismiss-layer"
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => {
              setOpenFileMenuId(null);
              setOpenFolderMenuPath(null);
            }}
          />
          <div
            className="file-action-menu"
            role="menu"
            aria-label={`${activeFile.fileName} 파일 메뉴`}
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpenFileMenuId(null);
                void downloadFile(activeFile);
              }}
            >
              <Download size={16} /> 다운로드
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => openFileAction("rename", activeFile)}
            >
              <Pencil size={16} /> 파일명 바꾸기
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => openFileAction("file-info", activeFile)}
            >
              <Info size={16} /> 파일 정보
            </button>
            <div className="file-menu-separator" />
            <button
              className="danger-menu-item"
              role="menuitem"
              type="button"
              onClick={() => openFileAction("delete", activeFile)}
            >
              <Trash2 size={16} /> 삭제
            </button>
          </div>
        </>
      )}
      {openFolderMenuPath && activeFolderInfo && (
        <>
          <button
            className="menu-dismiss-layer"
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpenFolderMenuPath(null)}
          />
          <div
            className="file-action-menu folder-action-menu"
            role="menu"
            aria-label={`${activeFolderInfo.name} 폴더 메뉴`}
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                navigateToFolder(activeFolderInfo.path);
                setOpenFolderMenuPath(null);
              }}
            >
              <FolderOpen size={16} /> 폴더 열기
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => openFolderRename(activeFolderInfo)}
            >
              <Pencil size={16} /> 폴더명 바꾸기
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => openFolderInfo(activeFolderInfo)}
            >
              <Info size={16} /> 폴더 정보
            </button>
            <div className="file-menu-separator" />
            <button
              className="danger-menu-item"
              role="menuitem"
              type="button"
              onClick={() => {
                setActiveAction("folder-delete");
                setOpenFolderMenuPath(null);
              }}
            >
              <Trash2 size={16} /> 폴더 삭제
            </button>
          </div>
        </>
      )}
    </>
  );
}
