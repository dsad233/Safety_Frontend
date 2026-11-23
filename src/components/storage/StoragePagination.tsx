import { ChevronLeft, ChevronRight } from "lucide-react";
import { FILE_PAGE_SIZES } from "../../common/storage/constants";

type StoragePaginationProps = {
  page: number;
  pages: number;
  hasNextPage: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pages: number) => void;
};

export default function StoragePagination({
  page,
  pages,
  hasNextPage,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: StoragePaginationProps) {
  return (
    <nav className="storage-pagination" aria-label="파일 목록 페이지 이동">
      <label className="page-size-control">
        페이지당
        <select
          value={pages}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          disabled={isLoading}
          aria-label="페이지당 항목 수"
        >
          {FILE_PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}개
            </option>
          ))}
        </select>
      </label>
      <div className="pagination-actions">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={isLoading || page <= 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft size={15} /> 이전
        </button>
        <span className="pagination-current" aria-live="polite" aria-atomic="true">
          {page} 페이지
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading || !hasNextPage}
          aria-label="다음 페이지"
        >
          다음 <ChevronRight size={15} />
        </button>
      </div>
    </nav>
  );
}
