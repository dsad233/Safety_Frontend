import { joinFolderPath } from "../../common/storage/utils";
import { Folder, X } from "lucide-react";

type CreateFolderModalProps = {
  activeFolder: string;
  isCreateFolderOpen: boolean;
  setIsCreateFolderOpen: (isOpen: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  isCreatingFolder: boolean;
  createFolder: () => Promise<void>;
};

export default function CreateFolderModal({
  activeFolder,
  isCreateFolderOpen,
  setIsCreateFolderOpen,
  newFolderName,
  setNewFolderName,
  isCreatingFolder,
  createFolder,
}: CreateFolderModalProps) {
  return (
    <>
      {isCreateFolderOpen && (
        <div
          className="action-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreateFolderOpen(false);
              setNewFolderName("");
            }
          }}
        >
          <section
            className="action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-folder-title"
          >
            <header className="action-modal-header">
              <div>
                <span className="modal-eyebrow">SAFETY STORAGE</span>
                <h2 id="create-folder-title">새 폴더 만들기</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => {
                  setIsCreateFolderOpen(false);
                  setNewFolderName("");
                }}
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </header>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void createFolder();
              }}
            >
              <label className="modal-field-label" htmlFor="new-folder-name">
                폴더명
              </label>
              <div className="rename-input-wrap">
                <Folder size={16} aria-hidden="true" />
                <input
                  id="new-folder-name"
                  autoFocus
                  maxLength={100}
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  placeholder="예: 프로젝트 자료"
                />
              </div>
              <p className="folder-path-preview">
                생성 경로:{" "}
                {joinFolderPath(
                  activeFolder,
                  newFolderName.trim() || "새 폴더",
                )}
              </p>
              <div className="modal-actions">
                <button
                  className="secondary-modal-button"
                  type="button"
                  onClick={() => {
                    setIsCreateFolderOpen(false);
                    setNewFolderName("");
                  }}
                >
                  취소
                </button>
                <button
                  className="primary-modal-button"
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                >
                  {isCreatingFolder ? "만드는 중..." : "폴더 만들기"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
