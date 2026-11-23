import { formatSize, parentFolderPath } from "../../common/storage/utils";
import {
  ArrowDownToLine,
  ChevronDown,
  File,
  FileImage,
  FileText,
  Film,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import type { MouseEvent } from "react";
import type {
  StoredFile,
  FolderEntry,
  VisibleItem,
  ViewMode,
} from "../../common/storage/types";

type StorageFileListProps = {
  navigateToFolder: (path: string) => void;
  onUpload: () => void;
  isLoading: boolean;
  viewMode: ViewMode;
  visibleItems: VisibleItem[];
  openFileMenuId: string | null;
  openFolderMenuPath: string | null;
  toggleFileMenu: (
    event: MouseEvent<HTMLButtonElement>,
    file: StoredFile,
  ) => void;
  toggleFolderMenu: (
    event: MouseEvent<HTMLButtonElement>,
    folder: FolderEntry,
  ) => void;
  downloadFile: (file: StoredFile) => Promise<void>;
};

export default function StorageFileList({
  navigateToFolder,
  onUpload,
  isLoading,
  viewMode,
  visibleItems,
  openFileMenuId,
  openFolderMenuPath,
  toggleFileMenu,
  toggleFolderMenu,
  downloadFile,
}: StorageFileListProps) {
  if (isLoading) {
    return (
      <div className="file-list-status" role="status">
        파일 목록을 불러오는 중입니다.
      </div>
    );
  }

  return (
    <>
      {viewMode === "list" ? (
        <div className="file-table-wrap">
          <table className="file-table">
            <thead>
              <tr>
                <th>
                  이름 <ChevronDown size={13} />
                </th>
                <th>폴더 경로</th>
                <th>파일 크기</th>
                <th>수정한 날짜</th>
                <th aria-label="작업" />
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                if (item.type === "folder") {
                  const { folder } = item;
                  return (
                    <tr className="folder-table-row" key={folder.id}>
                      <td>
                        <div className="file-name-cell">
                          <span
                            className={`file-type-icon folder-row-icon ${folder.color}`}
                          >
                            <Folder size={18} fill="currentColor" />
                          </span>
                          <button
                            className="folder-name-button file-name-copy"
                            type="button"
                            onClick={() => navigateToFolder(folder.path)}
                            aria-label={`${folder.name} 폴더 열기`}
                          >
                            <strong>{folder.name}</strong>
                            <small>폴더</small>
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="path-cell">
                          <Folder size={14} />
                          {parentFolderPath(folder.path) === "/"
                            ? "내 파일"
                            : parentFolderPath(folder.path).slice(1)}
                        </span>
                      </td>
                      <td className="muted-cell">{folder.count}개 항목</td>
                      <td className="muted-cell">{folder.updatedAt}</td>
                      <td>
                        <div className="row-actions folder-row-actions">
                          <button
                            type="button"
                            aria-label={`${folder.name} 폴더 더보기`}
                            title="폴더 작업"
                            aria-haspopup="menu"
                            aria-expanded={openFolderMenuPath === folder.path}
                            onClick={(event) => toggleFolderMenu(event, folder)}
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const { file } = item;
                return (
                  <tr key={file.id}>
                    <td>
                      <div className="file-name-cell">
                        <span className={`file-type-icon ${file.imageType}`}>
                          {file.imageType === "image" ? (
                            <FileImage size={18} />
                          ) : file.imageType === "video" ? (
                            <Film size={18} />
                          ) : file.imageType === "document" ? (
                            <FileText size={18} />
                          ) : (
                            <File size={18} />
                          )}
                        </span>
                        <span className="file-name-copy">
                          <strong>{file.fileName}</strong>
                          <small>{file.extension || "파일"}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="path-cell">
                        <Folder size={14} />
                        {file.path === "/" ? "내 파일" : file.path.slice(1)}
                      </span>
                    </td>
                    <td className="muted-cell">{formatSize(file.size)}</td>
                    <td className="muted-cell">{file.updatedAt}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          aria-label={`${file.fileName} 다운로드`}
                          title="다운로드"
                          onClick={() => void downloadFile(file)}
                        >
                          <ArrowDownToLine size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`${file.fileName} 더보기`}
                          title="더보기"
                          aria-haspopup="menu"
                          aria-expanded={openFileMenuId === file.id}
                          onClick={(event) => toggleFileMenu(event, file)}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleItems.length === 0 && (
            <div className="empty-state">
              <span>
                <Search size={20} />
              </span>
              <strong>파일이 없습니다</strong>
              <p>검색어나 선택한 폴더를 확인해 주세요.</p>
            </div>
          )}
          <button
            className="load-more"
            type="button"
            onClick={() => onUpload()}
          >
            <Plus size={15} />
            파일 추가하기
          </button>
        </div>
      ) : (
        <div className="file-grid-wrap">
          <div className="file-grid">
            {visibleItems.map((item) => {
              if (item.type === "folder") {
                const { folder } = item;
                return (
                  <article className="file-grid-card" key={folder.id}>
                    <button
                      className="grid-card-menu"
                      type="button"
                      aria-label={`${folder.name} 폴더 작업`}
                      aria-haspopup="menu"
                      aria-expanded={openFolderMenuPath === folder.path}
                      onClick={(event) => toggleFolderMenu(event, folder)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    <button
                      className="grid-card-main"
                      type="button"
                      onClick={() => navigateToFolder(folder.path)}
                      aria-label={`${folder.name} 폴더 열기`}
                    >
                      <span
                        className={`grid-card-icon folder-row-icon ${folder.color}`}
                      >
                        <Folder size={23} fill="currentColor" />
                      </span>
                      <strong>{folder.name}</strong>
                      <small>폴더 · {folder.updatedAt}</small>
                    </button>
                    <div className="grid-card-meta">
                      <span>{folder.count}개 항목</span>
                      <span className="path-cell">
                        <Folder size={13} />
                        {parentFolderPath(folder.path) === "/"
                          ? "내 파일"
                          : parentFolderPath(folder.path).slice(1)}
                      </span>
                    </div>
                  </article>
                );
              }

              const { file } = item;
              return (
                <article className="file-grid-card" key={file.id}>
                  <div className="grid-card-actions">
                    <button
                      type="button"
                      aria-label={`${file.fileName} 다운로드`}
                      title="다운로드"
                      onClick={() => void downloadFile(file)}
                    >
                      <ArrowDownToLine size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`${file.fileName} 더보기`}
                      title="더보기"
                      aria-haspopup="menu"
                      aria-expanded={openFileMenuId === file.id}
                      onClick={(event) => toggleFileMenu(event, file)}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                  <div className="grid-card-main">
                    <span
                      className={`grid-card-icon file-type-icon ${file.imageType}`}
                    >
                      {file.imageType === "image" ? (
                        <FileImage size={23} />
                      ) : file.imageType === "video" ? (
                        <Film size={23} />
                      ) : file.imageType === "document" ? (
                        <FileText size={23} />
                      ) : (
                        <File size={23} />
                      )}
                    </span>
                    <strong>{file.fileName}</strong>
                    <small>{file.extension || "파일"}</small>
                  </div>
                  <div className="grid-card-meta">
                    <span>{formatSize(file.size)}</span>
                    <span>{file.updatedAt}</span>
                  </div>
                </article>
              );
            })}
          </div>
          {visibleItems.length === 0 && (
            <div className="empty-state">
              <span>
                <Search size={20} />
              </span>
              <strong>파일이 없습니다</strong>
              <p>검색어나 선택한 폴더를 확인해 주세요.</p>
            </div>
          )}
          <button
            className="load-more"
            type="button"
            onClick={() => onUpload()}
          >
            <Plus size={15} />
            파일 추가하기
          </button>
        </div>
      )}
    </>
  );
}
