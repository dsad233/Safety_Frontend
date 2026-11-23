import {
  ChevronDown,
  Cloud,
  FileImage,
  FileText,
  Film,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Settings2,
  Share2,
  ShieldCheck,
  Upload,
} from "lucide-react";
import type { AccountSession } from "../../common/account/types";
import type { AppPage } from "../../common/navigation";
import type { ViewFilter } from "../../common/storage/types";

type StorageSidebarProps = {
  accountSession: AccountSession | null;
  filter: ViewFilter;
  activeFolder: string;
  itemCount: number;
  navigateToFolder: (path: string) => void;
  navigateToPage: (page: AppPage) => void;
  setFilter: (filter: ViewFilter) => void;
  setNotice: (message: string) => void;
  onUpload: () => void;
};

export default function StorageSidebar({
  accountSession,
  filter,
  activeFolder,
  itemCount,
  navigateToFolder,
  navigateToPage,
  setFilter,
  setNotice,
  onUpload,
}: StorageSidebarProps) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="/"
        onClick={(event) => {
          event.preventDefault();
          navigateToFolder("/");
        }}
        aria-label="safety 홈"
      >
        <span className="brand-mark">
          <ShieldCheck size={21} strokeWidth={2.4} />
        </span>
        <span>
          safety<span className="brand-period">.</span>
        </span>
      </a>

      <button
        className="workspace-switcher"
        type="button"
        onClick={() => navigateToPage(accountSession ? "mypage" : "login")}
        aria-label="계정 페이지 열기"
      >
        <span className="workspace-avatar">
          {accountSession?.nickname.slice(0, 1) || "S"}
        </span>
        <span className="workspace-copy">
          <strong>{accountSession?.nickname || "내 워크스페이스"}</strong>
          <small>
            {accountSession ? "계정 관리" : "로그인 또는 회원가입"}
          </small>
        </span>
        <ChevronDown size={16} />
      </button>

      <button
        className="upload-button"
        type="button"
        onClick={() => onUpload()}
      >
        <Upload size={17} /> 파일 업로드{" "}
        <Plus className="upload-plus" size={15} />
      </button>

      <nav className="primary-nav" aria-label="주 메뉴">
        <p className="nav-label">라이브러리</p>
        <button
          className={`nav-item ${filter === "all" && activeFolder === "/" ? "active" : ""}`}
          onClick={() => navigateToFolder("/")}
          type="button"
        >
          <LayoutGrid size={17} />
          모든 파일
          <span className="nav-count">
            {itemCount}
          </span>
        </button>
        <button
          className={`nav-item ${filter === "recent" ? "active" : ""}`}
          onClick={() => setFilter("recent")}
          type="button"
        >
          <Cloud size={17} />
          최근 파일
        </button>
        <button
          className={`nav-item ${filter === "images" ? "active" : ""}`}
          onClick={() => setFilter("images")}
          type="button"
        >
          <FileImage size={17} />
          이미지
        </button>
        <button
          className={`nav-item ${filter === "documents" ? "active" : ""}`}
          onClick={() => setFilter("documents")}
          type="button"
        >
          <FileText size={17} />
          문서
        </button>
        <button
          className={`nav-item ${filter === "videos" ? "active" : ""}`}
          onClick={() => setFilter("videos")}
          type="button"
        >
          <Film size={17} />
          동영상
        </button>
        <button
          className={`nav-item ${filter === "shared" ? "active" : ""}`}
          onClick={() =>
            setNotice("공유 항목 기능은 현재 서버에서 지원하지 않습니다.")
          }
          type="button"
        >
          <Share2 size={17} />
          공유 항목
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="storage-label">
          <span>저장 공간</span>
          <strong>
            1.2 GB <small>/ 20 GB</small>
          </strong>
        </div>
        <div className="storage-track">
          <span />
        </div>
        <p className="storage-footnote">여유 공간이 충분합니다</p>
        <button
          className="nav-item settings-link"
          type="button"
          onClick={() => navigateToPage("mypage")}
        >
          <Settings2 size={17} />
          마이페이지
        </button>
        <button
          className="profile profile-link"
          type="button"
          onClick={() => navigateToPage(accountSession ? "mypage" : "login")}
          aria-label={
            accountSession
              ? `${accountSession.nickname} 마이페이지`
              : "로그인 페이지"
          }
        >
          <span className="profile-avatar">
            {accountSession?.nickname.slice(0, 1) || "?"}
          </span>
          <span>
            <strong>{accountSession?.nickname || "로그인 / 회원가입"}</strong>
            <small>{accountSession?.email || "계정 관리"}</small>
          </span>
          <MoreHorizontal size={18} />
        </button>
      </div>
    </aside>
  );
}
