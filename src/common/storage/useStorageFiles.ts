import { useCallback, useEffect, useRef, useState } from "react";
import type { SetStateAction } from "react";
import type { AccountSession } from "../account/types";
import type { FileListQuery, StoredFile } from "./types";
import { getStorageFiles } from "./api";

type StorageFilesOptions = Omit<FileListQuery, "page"> & {
  session: AccountSession | null;
  enabled: boolean;
};

type FileListState = {
  key: string;
  files: StoredFile[];
  page: number;
  hasNextPage: boolean;
  isLoading: boolean;
  errorMessage: string;
};

function initialState(key: string): FileListState {
  return {
    key,
    files: [],
    page: 1,
    hasNextPage: false,
    isLoading: true,
    errorMessage: "",
  };
}

export function useStorageFiles({
  session,
  enabled,
  pages,
  path,
  orderBy,
  filter,
  search,
}: StorageFilesOptions) {
  const key = JSON.stringify([
    enabled,
    session?.accessToken,
    pages,
    path,
    orderBy,
    filter,
    search,
  ]);
  const [result, setResult] = useState(() => initialState(key));
  const currentResult = result.key === key ? result : initialState(key);
  const requestRef = useRef<AbortController | null>(null);

  const requestPage = useCallback(
    async (nextPage: number) => {
      if (!enabled || !session) return;

      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;

      try {
        const responseFiles = await getStorageFiles(
          session,
          { page: nextPage, pages, path, orderBy, filter, search },
          controller.signal,
        );
        if (controller.signal.aborted) return;

        // 전체 개수가 없는 API이므로 빈 다음 페이지에서는 현재 목록을 유지합니다.
        if (nextPage > 1 && responseFiles.length === 0) {
          setResult((current) => ({
            ...(current.key === key ? current : initialState(key)),
            hasNextPage: false,
            isLoading: false,
            errorMessage: "",
          }));
          return;
        }

        setResult({
          key,
          files: responseFiles,
          page: nextPage,
          hasNextPage: responseFiles.length === pages,
          isLoading: false,
          errorMessage: "",
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setResult((current) => ({
          ...(current.key === key ? current : initialState(key)),
          isLoading: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : "파일 목록 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        }));
      }
    },
    [enabled, session, pages, path, orderBy, filter, search, key],
  );

  useEffect(() => {
    void requestPage(1);
    return () => requestRef.current?.abort();
  }, [requestPage]);

  function loadPage(nextPage: number) {
    if (!enabled || !session || !Number.isInteger(nextPage) || nextPage < 1) {
      return Promise.resolve();
    }
    setResult((current) => ({
      ...(current.key === key ? current : initialState(key)),
      isLoading: true,
      errorMessage: "",
    }));
    return requestPage(nextPage);
  }

  const setFiles = useCallback(
    (update: SetStateAction<StoredFile[]>) => {
      setResult((current) => {
        const active = current.key === key ? current : initialState(key);
        return {
          ...active,
          files: typeof update === "function" ? update(active.files) : update,
        };
      });
    },
    [key],
  );

  return { ...currentResult, setFiles, loadPage };
}
