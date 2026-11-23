import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import MyPage from "./MyPage";
import Toast from "../components/Toast";
import StorageSidebar from "../components/storage/StorageSidebar";
import StorageTopbar from "../components/storage/StorageTopbar";
import StorageFileList from "../components/storage/StorageFileList";
import StoragePagination from "../components/storage/StoragePagination";
import StorageActionMenus from "../components/storage/StorageActionMenus";
import FileActionModal from "../components/storage/FileActionModal";
import CreateFolderModal from "../components/storage/CreateFolderModal";
import { useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";
import { clearAccountSession, readAccountSession } from "../common/account/session";
import { getAppPage } from "../common/navigation";
import {
  filterOptions,
  MAX_FILE_SIZE,
  folderColors,
  DEFAULT_FILE_PAGE_SIZE,
} from "../common/storage/constants";
import { useStorageFiles } from "../common/storage/useStorageFiles";
import { getStorageFileBuffer } from "../common/storage/api";
import {
  downloadFileBuffer,
  getImageType,
  folderPathFromUrl,
  folderUrlFromPath,
  getFileRequestHeaders,
  parentFolderPath,
  joinFolderPath,
} from "../common/storage/utils";
import {
  ArrowUpDown,
  ChevronRight,
  File,
  FolderOpen,
  HardDrive,
  LayoutGrid,
  List,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import type { AccountSession } from "../common/account/types";
import type { AppPage } from "../common/navigation";
import type {
  StoredFile,
  ViewFilter,
  ViewMode,
  FolderEntry,
  FolderInfo,
  FileAction,
  VisibleItem,
} from "../common/storage/types";

function StoragePage() {
  const [queryPages, setQueryPages] = useState<number>(DEFAULT_FILE_PAGE_SIZE);
  const [appPage, setAppPage] = useState<AppPage>(() =>
    getAppPage(window.location.pathname),
  );
  const [accountSession, setAccountSession] = useState<AccountSession | null>(
    () => readAccountSession(),
  );
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [activeFolder, setActiveFolder] = useState(() =>
    getAppPage(window.location.pathname) === "files"
      ? folderPathFromUrl(window.location.pathname)
      : "/",
  );
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [sortNewestFirst, setSortNewestFirst] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFileMenuId, setOpenFileMenuId] = useState<string | null>(null);
  const [openFolderMenuPath, setOpenFolderMenuPath] = useState<string | null>(
    null,
  );
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeFile, setActiveFile] = useState<StoredFile | null>(null);
  const [activeFolderInfo, setActiveFolderInfo] = useState<FolderInfo | null>(
    null,
  );
  const [activeAction, setActiveAction] = useState<FileAction | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    files,
    setFiles,
    page: queryPage,
    hasNextPage,
    isLoading,
    errorMessage: fileListError,
    loadPage,
  } = useStorageFiles({
    session: accountSession,
    enabled: appPage === "files",
    pages: queryPages,
    path: activeFolder,
    orderBy: sortNewestFirst ? "NEW" : "OLD",
    filter,
    search,
  });

  function changeFilePage(page: number) {
    setOpenFileMenuId(null);
    setOpenFolderMenuPath(null);
    closeFileAction();
    void loadPage(page);
  }

  function navigateToPage(page: AppPage) {
    const nextUrl = page === "files" ? "/files" : `/${page}`;
    if (window.location.pathname !== nextUrl) {
      window.history.pushState(null, "", nextUrl);
    }
    setAppPage(page);
    if (page === "files") {
      setActiveFolder("/");
      setFilter("all");
    }
  }

  function navigateToFolder(path: string) {
    const nextUrl = folderUrlFromPath(path);
    if (folderPathFromUrl(window.location.pathname) !== path) {
      window.history.pushState(null, "", nextUrl);
    }
    setAppPage("files");
    setActiveFolder(path);
    setFilter("all");
    if (appPage === "files" && path === activeFolder && filter === "all") {
      void loadPage(1);
    }
  }

  function toggleFileMenu(
    event: MouseEvent<HTMLButtonElement>,
    file: StoredFile,
  ) {
    if (openFileMenuId === file.id) {
      setOpenFileMenuId(null);
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: Math.min(bounds.bottom + 4, window.innerHeight - 224),
      left: Math.max(8, Math.min(bounds.right - 188, window.innerWidth - 196)),
    });
    setActiveFile(file);
    setActiveFolderInfo(null);
    setOpenFolderMenuPath(null);
    setOpenFileMenuId(file.id);
  }

  function toggleFolderMenu(
    event: MouseEvent<HTMLButtonElement>,
    folder: FolderEntry,
  ) {
    if (openFolderMenuPath === folder.path) {
      setOpenFolderMenuPath(null);
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: Math.min(bounds.bottom + 4, window.innerHeight - 140),
      left: Math.max(8, Math.min(bounds.right - 188, window.innerWidth - 196)),
    });
    setActiveFile(null);
    setActiveFolderInfo({
      id: folder.id,
      name: folder.name,
      path: folder.path,
      updatedAt: folder.updatedAt,
      count: folder.count,
      totalSize: folder.totalSize,
    });
    setOpenFileMenuId(null);
    setOpenFolderMenuPath(folder.path);
  }

  function openFolderInfo(folder: FolderInfo) {
    setActiveFile(null);
    setActiveFolderInfo(folder);
    setActiveAction("folder-info");
    setOpenFolderMenuPath(null);
    setOpenFileMenuId(null);
  }

  function openFolderRename(folder: FolderInfo) {
    setActiveFile(null);
    setActiveFolderInfo(folder);
    setActiveAction("rename");
    setRenameValue(folder.name);
    setOpenFolderMenuPath(null);
    setOpenFileMenuId(null);
  }

  function openFileAction(action: FileAction, file: StoredFile) {
    setActiveFile(file);
    setActiveFolderInfo(null);
    setActiveAction(action);
    setOpenFileMenuId(null);
    setOpenFolderMenuPath(null);
    if (action === "rename") setRenameValue(file.fileName);
  }

  function closeFileAction() {
    setActiveAction(null);
    setActiveFile(null);
    setActiveFolderInfo(null);
  }

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name || /[\\/]/.test(name)) {
      setNotice("폴더명을 입력해 주세요. /와 \\는 사용할 수 없습니다.");
      return;
    }

    if (
      visibleFolders.some(
        (folder) =>
          folder.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
      )
    ) {
      setNotice("같은 이름의 폴더가 이미 있습니다.");
      return;
    }

    setIsCreatingFolder(true);
    try {
      const response = await fetch("/api/files/new/folder", {
        method: "POST",
        headers: getFileRequestHeaders(accountSession),
        body: JSON.stringify({
          fileName: name,
          path: activeFolder,
        }),
      });
      if (!response.ok) throw new Error("폴더 생성에 실패했습니다.");

      navigateToFolder(joinFolderPath(activeFolder, name));
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      setNotice(`${name} 폴더를 만들었습니다.`);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("폴더 생성 실패:", error);
      setNotice("폴더 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsCreatingFolder(false);
    }
  }

  async function downloadFile(file: StoredFile) {
    try {
      const buffer = await getStorageFileBuffer(
        accountSession?.accessToken ?? "",
        file.id,
      );
      downloadFileBuffer(buffer, file);
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      setNotice(
        error instanceof Error
          ? error.message
          : "파일 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  }

  async function saveFileName() {
    const file = activeFile;
    const folder = activeFolderInfo;
    const fileName = renameValue.trim();
    const targetId = file?.id ?? folder?.id;
    if (!targetId || !fileName) return;

    if (
      folder &&
      (/[\\/]/.test(fileName) ||
        visibleFolders.some(
          (entry) =>
            entry.id !== folder.id &&
            entry.name.toLocaleLowerCase() === fileName.toLocaleLowerCase(),
        ))
    ) {
      setNotice(
        /[\\/]/.test(fileName)
          ? "폴더명에 /와 \\는 사용할 수 없습니다."
          : "같은 이름의 폴더가 이미 있습니다.",
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/files/rename/${encodeURIComponent(targetId)}`,
        {
          method: "PATCH",
          headers: getFileRequestHeaders(accountSession),
          body: JSON.stringify({ fileName }),
        },
      );
      if (!response.ok) throw new Error("이름 변경에 실패했습니다.");

      if (folder) {
        const oldPath = folder.path;
        const parentPath = parentFolderPath(oldPath);
        const newPath = joinFolderPath(parentPath, fileName);
        setFiles((current) =>
          current.map((entry) => {
            if (entry.id === folder.id) {
              return { ...entry, fileName };
            }
            if (
              entry.path === oldPath ||
              entry.path.startsWith(`${oldPath}/`)
            ) {
              return {
                ...entry,
                path: `${newPath}${entry.path.slice(oldPath.length)}`,
              };
            }
            return entry;
          }),
        );
        setNotice("폴더명을 변경했습니다.");
      } else if (file) {
        setFiles((current) =>
          current.map((entry) =>
            entry.id === file.id ? { ...entry, fileName } : entry,
          ),
        );
        setNotice("파일명을 변경했습니다.");
      }
      closeFileAction();
    } catch (error) {
      console.error("이름 변경 실패:", error);
      setNotice("이름 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  async function deleteFile() {
    if (!activeFile) return;

    try {
      const response = await fetch(
        `/api/files/${encodeURIComponent(activeFile.id)}`,
        { method: "DELETE", headers: getFileRequestHeaders(accountSession) },
      );
      if (!response.ok) throw new Error("파일 삭제에 실패했습니다.");

      setFiles((current) =>
        current.filter((file) => file.id !== activeFile.id),
      );
      setNotice("파일을 삭제했습니다.");
      closeFileAction();
      void loadPage(files.length === 1 ? Math.max(1, queryPage - 1) : queryPage);
    } catch (error) {
      console.error("파일 삭제 실패:", error);
      setNotice("파일 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  async function deleteFolder() {
    if (!activeFolderInfo) return;
    const folder = activeFolderInfo;

    try {
      const response = await fetch(
        `/api/files/${encodeURIComponent(folder.id)}`,
        { method: "DELETE", headers: getFileRequestHeaders(accountSession) },
      );
      if (!response.ok) throw new Error("폴더 삭제에 실패했습니다.");

      setFiles((current) =>
        current.filter(
          (file) =>
            file.id !== folder.id &&
            file.path !== folder.path &&
            !file.path.startsWith(`${folder.path}/`),
        ),
      );
      setNotice(`${folder.name} 폴더를 삭제했습니다.`);
      closeFileAction();
      void loadPage(files.length === 1 ? Math.max(1, queryPage - 1) : queryPage);
    } catch (error) {
      console.error("폴더 삭제 실패:", error);
      setNotice("폴더 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }


  async function addFiles(selectedFiles: FileList | File[]) {
    const accepted: {
      fileName: string;
      extension: string;
      path: string;
      file: string;
      imageType: StoredFile["imageType"];
    }[] = [];
    const rejected: string[] = [];

    try {
      for (const selectedFile of Array.from(selectedFiles)) {
        if (selectedFile.size > MAX_FILE_SIZE) {
          rejected.push(selectedFile.name);
          continue;
        }

        const dotIndex = selectedFile.name.lastIndexOf(".");
        const extension =
          dotIndex > 0
            ? selectedFile.name.slice(dotIndex).toLocaleLowerCase()
            : "";
        const arrayBuffer = await selectedFile.arrayBuffer();

        accepted.push({
          fileName:
            dotIndex > 0
              ? selectedFile.name.slice(0, dotIndex)
              : selectedFile.name,
          extension,
          path: activeFolder,
          file: Buffer.from(arrayBuffer).toString("base64"),
          imageType: getImageType(extension),
        });
      }

      if (accepted.length) {
        const response = await fetch("/api/files/upload", {
          method: "POST",
          headers: getFileRequestHeaders(accountSession),
          body: JSON.stringify(accepted.length > 1 ? accepted : accepted[0]),
        });

        if (!response.ok) {
          throw new Error("파일 저장 요청에 실패했습니다.");
        }
        setFilter("all");
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      setNotice("파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const messages = [];
    if (accepted.length)
      messages.push(`${accepted.length}개 파일을 업로드했습니다.`);
    if (rejected.length)
      messages.push(
        `${rejected.join(", ")}: 4 GB 이하 파일만 추가할 수 있습니다.`,
      );
    if (messages.length) {
      setNotice(messages.join(" "));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void addFiles(Array.from(event.target.files));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(Array.from(event.dataTransfer.files));
  }

  const visibleFolders: FolderEntry[] = files
    .filter(
      (file) =>
        file.imageType === "folder" &&
        (filter === "recent" || file.path === activeFolder),
    )
    .map((folder, index) => ({
      id: folder.id,
      name: folder.fileName,
      path: joinFolderPath(folder.path, folder.fileName),
      updatedAt: folder.updatedAt,
      count: folder.folderInfo?.length ?? 0,
      totalSize: folder.folderInfo?.totalSize ?? 0,
      color: folderColors[index % folderColors.length],
    }));
  const visibleFiles = files.filter(
    (file) =>
      file.imageType !== "folder" &&
      (filter === "recent" || file.path === activeFolder),
  );
  const visibleItems = files.flatMap<VisibleItem>((file) => {
    if (file.imageType === "folder") {
      const folder = visibleFolders.find((entry) => entry.id === file.id);
      return folder ? [{ type: "folder" as const, folder }] : [];
    }
    return filter === "recent" || file.path === activeFolder
      ? [{ type: "file" as const, file }]
      : [];
  });

  const currentTitle =
    filter === "recent"
      ? "최근 파일"
      : filter === "images"
        ? "이미지"
        : filter === "documents"
          ? "문서"
          : filter === "videos"
            ? "동영상"
            : filter === "shared"
              ? "공유 항목"
              : activeFolder === "/"
                ? "모든 파일"
                : activeFolder.slice(1);

  useEffect(() => {
    const syncFolderFromUrl = () => {
      const page = getAppPage(window.location.pathname);
      setAppPage(page);
      if (page === "files") {
        setActiveFolder(folderPathFromUrl(window.location.pathname));
        setFilter("all");
      }
    };

    window.addEventListener("popstate", syncFolderFromUrl);
    return () => window.removeEventListener("popstate", syncFolderFromUrl);
  }, []);

  useEffect(() => {
    if (
      appPage === "files" &&
      !accountSession &&
      window.location.pathname !== "/login"
    ) {
      window.history.replaceState(null, "", "/login");
    }
  }, [accountSession, appPage]);

  function handleLogin(session: AccountSession) {
    setFiles([]);
    setAccountSession(session);
    navigateToPage("files");
  }

  if (appPage === "files" && !accountSession) {
    return <LoginPage onNavigate={navigateToPage} onLogin={handleLogin} />;
  }

  if (appPage === "login") {
    return <LoginPage onNavigate={navigateToPage} onLogin={handleLogin} />;
  }

  if (appPage === "signup") {
    return <SignupPage onNavigate={navigateToPage} />;
  }

  if (appPage === "mypage") {
    return (
      <MyPage
        onNavigate={navigateToPage}
        accessToken={accountSession?.accessToken ?? null}
        onLogout={() => {
          setFiles([]);
          clearAccountSession();
          setAccountSession(null);
          navigateToPage("login");
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <StorageSidebar
        accountSession={accountSession}
        filter={filter}
        activeFolder={activeFolder}
        itemCount={visibleFiles.length + visibleFolders.length}
        navigateToFolder={navigateToFolder}
        navigateToPage={navigateToPage}
        setFilter={setFilter}
        setNotice={setNotice}
        onUpload={() => fileInputRef.current?.click()}
      />

      <main
        className={`main-content ${isDragging ? "drag-active" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="drop-overlay">
            <div>
              <Upload size={28} />
              <strong>여기에 파일을 놓으세요</strong>
              <span>파일당 최대 4 GB</span>
            </div>
          </div>
        )}
        <StorageTopbar
          accountSession={accountSession}
          navigateToPage={navigateToPage}
          setNotice={setNotice}
          currentTitle={currentTitle}
          search={search}
          setSearch={setSearch}
        />

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                YOUR SPACE, IN ORDER
              </div>
              <h1>
                {currentTitle}
                <span className="title-count">
                  {visibleFiles.length + visibleFolders.length}
                </span>
              </h1>
              <p>필요한 파일을 한곳에서 안전하게 관리하세요.</p>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={17} />
              파일 업로드
            </button>
          </section>

          <section className="summary-strip" aria-label="저장소 현황">
            <div className="summary-item">
              <span className="summary-icon green-tile">
                <HardDrive size={17} />
              </span>
              <span>
                <small>사용 중인 공간</small>
                <strong>
                  1.2 <em>GB</em>
                </strong>
              </span>
              <span className="summary-divider" />
            </div>
            <div className="summary-item">
              <span className="summary-icon lilac-tile">
                <File size={17} />
              </span>
              <span>
                <small>저장된 파일</small>
                <strong>
                  {visibleFiles.length} <em>개</em>
                </strong>
              </span>
              <span className="summary-divider" />
            </div>
            <div className="summary-item">
              <span className="summary-icon orange-tile">
                <FolderOpen size={17} />
              </span>
              <span>
                <small>내 폴더</small>
                <strong>
                  {visibleFolders.length} <em>개</em>
                </strong>
              </span>
            </div>
            <div className="summary-capacity">
              <div>
                <span>전체 용량</span>
                <strong>6% 사용</strong>
              </div>
              <div className="capacity-track">
                <span />
              </div>
              <small>20 GB 중 1.2 GB 사용</small>
            </div>
          </section>

          <section className="files-section">
            <div className="section-title-row files-heading">
              <div>
                <h2>파일</h2>
                <span>{currentTitle}에 있는 파일</span>
              </div>
              <div className="file-toolbar">
                <button
                  className="create-folder-button"
                  type="button"
                  onClick={() => setIsCreateFolderOpen(true)}
                >
                  <FolderOpen size={15} /> 폴더 만들기
                </button>
                <button
                  className="toolbar-button"
                  type="button"
                  onClick={() => setSortNewestFirst((value) => !value)}
                >
                  <ArrowUpDown size={16} />
                  {sortNewestFirst ? "최신순" : "오래된순"}
                </button>
                <div className="filter-control">
                  <button
                    className={`toolbar-icon ${isFilterOpen || filter !== "all" ? "active" : ""}`}
                    type="button"
                    aria-label="파일 필터"
                    aria-haspopup="true"
                    aria-expanded={isFilterOpen}
                    aria-controls="file-filter-options"
                    onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                  >
                    <SlidersHorizontal size={17} />
                  </button>
                  {isFilterOpen && (
                    <div
                      className="file-filter-popover"
                      id="file-filter-options"
                      role="group"
                      aria-label="파일 유형 필터"
                    >
                      {filterOptions.map(({ value, label }) => (
                        <button
                          className={filter === value ? "selected" : ""}
                          key={value}
                          type="button"
                          aria-pressed={filter === value}
                          onClick={() => {
                            setFilter(value);
                            setIsFilterOpen(false);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className="view-toggle"
                  role="group"
                  aria-label="보기 방식"
                >
                  <button
                    className={viewMode === "list" ? "selected" : ""}
                    type="button"
                    aria-label="목록 보기"
                    aria-pressed={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                  >
                    <List size={17} />
                  </button>
                  <button
                    className={viewMode === "grid" ? "selected" : ""}
                    type="button"
                    aria-label="그리드 보기"
                    aria-pressed={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </span>
              </div>
            </div>
            {fileListError && (
              <div className="file-list-error" role="alert">
                <span>{fileListError}</span>
                <button type="button" onClick={() => void loadPage(queryPage)}>
                  다시 시도
                </button>
              </div>
            )}
            {(!fileListError || files.length > 0) && (
              <StorageFileList
                navigateToFolder={navigateToFolder}
                onUpload={() => fileInputRef.current?.click()}
                isLoading={isLoading}
                viewMode={viewMode}
                visibleItems={visibleItems}
                openFileMenuId={openFileMenuId}
                openFolderMenuPath={openFolderMenuPath}
                toggleFileMenu={toggleFileMenu}
                toggleFolderMenu={toggleFolderMenu}
                downloadFile={downloadFile}
              />
            )}
            <StoragePagination
              page={queryPage}
              pages={queryPages}
              hasNextPage={hasNextPage}
              isLoading={isLoading}
              onPageChange={changeFilePage}
              onPageSizeChange={setQueryPages}
            />
          </section>

          <div className="upload-hint">
            <span className="hint-icon">
              <Upload size={16} />
            </span>
            <span>
              <strong>파일을 더 추가해 보세요</strong>
              <small>
                여기로 파일을 끌어오거나 업로드 버튼을 눌러 선택하세요. 파일당
                최대 4 GB
              </small>
            </span>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              파일 선택 <ChevronRight size={15} />
            </button>
          </div>
          <footer className="page-footer">
            <span>
              <ShieldCheck size={14} /> 파일은 안전하게 보관됩니다
            </span>
            <span>
              SAFETY STORAGE <i>·</i> 2026
            </span>
          </footer>
        </div>
        <input
          className="visually-hidden"
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
        />
      </main>
      <StorageActionMenus
        navigateToFolder={navigateToFolder}
        openFileMenuId={openFileMenuId}
        openFolderMenuPath={openFolderMenuPath}
        downloadFile={downloadFile}
        activeFile={activeFile}
        activeFolderInfo={activeFolderInfo}
        menuPosition={menuPosition}
        setOpenFileMenuId={setOpenFileMenuId}
        setOpenFolderMenuPath={setOpenFolderMenuPath}
        openFileAction={openFileAction}
        openFolderRename={openFolderRename}
        openFolderInfo={openFolderInfo}
        setActiveAction={setActiveAction}
      />
      <FileActionModal
        activeFile={activeFile}
        activeFolderInfo={activeFolderInfo}
        activeAction={activeAction}
        closeFileAction={closeFileAction}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        saveFileName={saveFileName}
        deleteFile={deleteFile}
        deleteFolder={deleteFolder}
      />
      <CreateFolderModal
        activeFolder={activeFolder}
        isCreateFolderOpen={isCreateFolderOpen}
        setIsCreateFolderOpen={setIsCreateFolderOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        isCreatingFolder={isCreatingFolder}
        createFolder={createFolder}
      />
      <Toast message={notice} onDismiss={() => setNotice("")} />
    </div>
  );
}

export default StoragePage;
