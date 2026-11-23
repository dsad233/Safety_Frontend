import { formatSize } from "../../common/storage/utils";
import { X } from "lucide-react";
import type { StoredFile, FolderInfo, FileAction } from "../../common/storage/types";

type FileActionModalProps = {
  activeFile: StoredFile | null;
  activeFolderInfo: FolderInfo | null;
  activeAction: FileAction | null;
  closeFileAction: () => void;
  renameValue: string;
  setRenameValue: (value: string) => void;
  saveFileName: () => Promise<void>;
  deleteFile: () => Promise<void>;
  deleteFolder: () => Promise<void>;
};

export default function FileActionModal({
  activeFile,
  activeFolderInfo,
  activeAction,
  closeFileAction,
  renameValue,
  setRenameValue,
  saveFileName,
  deleteFile,
  deleteFolder,
}: FileActionModalProps) {
  return (
    <>
      {activeAction && (activeFile || activeFolderInfo) && (
        <div
          className="action-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeFileAction();
          }}
        >
          <section
            className="action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-action-title"
          >
            <header className="action-modal-header">
              <div>
                <span className="modal-eyebrow">SAFETY STORAGE</span>
                <h2 id="file-action-title">
                  {activeAction === "rename"
                    ? activeFolderInfo
                      ? "폴더명 바꾸기"
                      : "파일명 바꾸기"
                    : activeAction === "delete"
                      ? "파일 삭제"
                      : activeAction === "folder-delete"
                        ? "폴더 삭제"
                        : activeAction === "file-info"
                          ? "파일 정보"
                          : "폴더 정보"}
                </h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={closeFileAction}
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </header>

            {activeAction === "rename" && (activeFile || activeFolderInfo) && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveFileName();
                }}
              >
                <label className="modal-field-label" htmlFor="rename-name">
                  {activeFolderInfo ? "새 폴더명" : "새 파일명"}
                </label>
                <div className="rename-input-wrap">
                  <input
                    id="rename-name"
                    autoFocus
                    maxLength={255}
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                  />
                  {activeFile && <span>{activeFile.extension}</span>}
                </div>
                <div className="modal-actions">
                  <button
                    className="secondary-modal-button"
                    type="button"
                    onClick={closeFileAction}
                  >
                    취소
                  </button>
                  <button
                    className="primary-modal-button"
                    type="submit"
                    disabled={!renameValue.trim()}
                  >
                    변경 저장
                  </button>
                </div>
              </form>
            )}

            {activeAction === "delete" && activeFile && (
              <>
                <p className="delete-message">
                  <strong>
                    {activeFile.fileName}
                    {activeFile.extension}
                  </strong>
                  을(를) 삭제할까요? 삭제 후에는 복구할 수 없습니다.
                </p>
                <div className="modal-actions">
                  <button
                    className="secondary-modal-button"
                    type="button"
                    onClick={closeFileAction}
                  >
                    취소
                  </button>
                  <button
                    className="danger-modal-button"
                    type="button"
                    onClick={() => void deleteFile()}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}

            {activeAction === "folder-delete" && activeFolderInfo && (
              <>
                <p className="delete-message">
                  <strong>{activeFolderInfo.path}</strong> 폴더를 삭제할까요?
                  폴더 안의 파일과 하위 폴더도 함께 삭제되며 복구할 수 없습니다.
                </p>
                <div className="modal-actions">
                  <button
                    className="secondary-modal-button"
                    type="button"
                    onClick={closeFileAction}
                  >
                    취소
                  </button>
                  <button
                    className="danger-modal-button"
                    type="button"
                    onClick={() => void deleteFolder()}
                  >
                    폴더 삭제
                  </button>
                </div>
              </>
            )}

            {activeAction === "file-info" && activeFile && (
              <dl className="file-info-list">
                <div>
                  <dt>파일명</dt>
                  <dd>
                    {activeFile.fileName}
                    {activeFile.extension}
                  </dd>
                </div>
                <div>
                  <dt>파일 유형</dt>
                  <dd>{activeFile.imageType}</dd>
                </div>
                <div>
                  <dt>파일 크기</dt>
                  <dd>{formatSize(activeFile.size)}</dd>
                </div>
                <div>
                  <dt>폴더 경로</dt>
                  <dd>{activeFile.path}</dd>
                </div>
                <div>
                  <dt>수정한 날짜</dt>
                  <dd>{activeFile.updatedAt}</dd>
                </div>
                <div className="modal-actions">
                  <button
                    className="primary-modal-button"
                    type="button"
                    onClick={closeFileAction}
                  >
                    확인
                  </button>
                </div>
              </dl>
            )}

            {activeAction === "folder-info" && activeFolderInfo && (
              <dl className="file-info-list">
                <div>
                  <dt>폴더명</dt>
                  <dd>{activeFolderInfo.name}</dd>
                </div>
                <div>
                  <dt>폴더 경로</dt>
                  <dd>{activeFolderInfo.path}</dd>
                </div>
                <div>
                  <dt>수정한 날짜</dt>
                  <dd>{activeFolderInfo.updatedAt}</dd>
                </div>
                <div>
                  <dt>항목 수</dt>
                  <dd>{activeFolderInfo.count}개</dd>
                </div>
                <div>
                  <dt>사용 공간</dt>
                  <dd>{formatSize(activeFolderInfo.totalSize)}</dd>
                </div>
                <div className="modal-actions">
                  <button
                    className="primary-modal-button"
                    type="button"
                    onClick={closeFileAction}
                  >
                    확인
                  </button>
                </div>
              </dl>
            )}
          </section>
        </div>
      )}
    </>
  );
}
