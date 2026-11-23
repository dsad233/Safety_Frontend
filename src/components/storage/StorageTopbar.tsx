import { Bell, ChevronRight, Search } from "lucide-react";
import type { AccountSession } from "../../common/account/types";
import type { AppPage } from "../../common/navigation";

type StorageTopbarProps = {
  accountSession: AccountSession | null;
  navigateToPage: (page: AppPage) => void;
  setNotice: (message: string) => void;
  currentTitle: string;
  search: string;
  setSearch: (search: string) => void;
};

export default function StorageTopbar({
  accountSession,
  navigateToPage,
  setNotice,
  currentTitle,
  search,
  setSearch,
}: StorageTopbarProps) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>내 파일</span>
        <ChevronRight size={14} />
        <strong>{currentTitle}</strong>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="파일 검색"
            aria-label="파일 검색"
          />
          <kbd>⌘ K</kbd>
        </label>
        <button
          className="icon-button notification-button"
          type="button"
          aria-label="알림"
          onClick={() => setNotice("새로운 알림이 없습니다.")}
        >
          <Bell size={18} />
          <i />
        </button>
        <button
          className="top-avatar top-avatar-button"
          type="button"
          aria-label="마이페이지 열기"
          onClick={() =>
            navigateToPage(accountSession ? "mypage" : "login")
          }
        >
          {accountSession?.nickname.slice(0, 1) || "?"}
        </button>
      </div>
    </header>
  );
}
