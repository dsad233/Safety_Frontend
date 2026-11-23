import { useEffect, useState } from "react";
import AccountLayout from "../components/account/AccountLayout";
import { ArrowLeft } from "lucide-react";
import { getMyPage } from "../common/account/api";
import type { AccountPageProps, AccountProfile } from "../common/account/types";

type MyPageResult = {
  accessToken: string;
  profile: AccountProfile | null;
  errorMessage: string;
};

export default function MyPage({
  onNavigate,
  accessToken,
  onLogout,
}: AccountPageProps & {
  accessToken: string | null;
  onLogout: () => void;
}) {
  const [result, setResult] = useState<MyPageResult | null>(null);
  const currentResult = result?.accessToken === accessToken ? result : null;

  useEffect(() => {
    if (!accessToken) return;

    const token = accessToken;
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const profile = await getMyPage(token, controller.signal);
        if (controller.signal.aborted) return;

        setResult({ accessToken: token, profile, errorMessage: "" });
      } catch (error) {
        if (controller.signal.aborted) return;

        setResult({
          accessToken: token,
          profile: null,
          errorMessage:
            error instanceof Error
              ? error.message
              : "마이페이지 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        });
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [accessToken]);

  return (
    <AccountLayout
      eyebrow="내 계정"
      title="마이페이지"
      description="계정 정보를 확인하고 로그인 상태를 관리하세요."
      onNavigate={onNavigate}
    >
      {accessToken ? (
        <>
          {!currentResult && (
            <p className="account-note" role="status">
              계정 정보를 불러오는 중입니다.
            </p>
          )}
          {currentResult?.errorMessage && (
            <p className="account-error" role="alert">
              {currentResult.errorMessage}
            </p>
          )}
          {currentResult?.profile && (
            <dl className="account-details">
              <div>
                <dt>닉네임</dt>
                <dd>{currentResult.profile.nickname}</dd>
              </div>
              <div>
                <dt>이메일</dt>
                <dd>{currentResult.profile.email}</dd>
              </div>
              <div>
                <dt>로그인 ID</dt>
                <dd>{currentResult.profile.loginId}</dd>
              </div>
              <div>
                <dt>로그인 상태</dt>
                <dd className="account-status">로그인됨</dd>
              </div>
            </dl>
          )}
          <p className="account-note">
            프로필 변경 기능은 현재 서버 API에서 지원하지 않습니다. 로그아웃하면
            이 브라우저의 로그인 정보가 삭제됩니다.
          </p>
          <button
            className="account-submit account-logout"
            type="button"
            onClick={onLogout}
          >
            로그아웃
          </button>
        </>
      ) : (
        <div className="account-success">
          <strong>로그인이 필요합니다.</strong>
          <span>로그인하면 계정 정보를 확인할 수 있습니다.</span>
          <button
            className="account-submit"
            type="button"
            onClick={() => onNavigate("login")}
          >
            로그인
          </button>
        </div>
      )}
      <button
        className="account-back"
        type="button"
        onClick={() => onNavigate("files")}
      >
        <ArrowLeft size={15} /> 파일 목록으로 돌아가기
      </button>
    </AccountLayout>
  );
}
