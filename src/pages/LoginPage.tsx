import AccountLayout from "../components/account/AccountLayout";
import { useState } from "react";
import { saveAccountSession } from "../common/account/session";
import { getResponseMessage, decodeTokenUser } from "../common/account/utils";
import { ArrowLeft, AtSign, LockKeyhole } from "lucide-react";
import type { FormEvent } from "react";
import type { LoginPageProps, AccountSession } from "../common/account/types";

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const isEmail = identifier.includes("@");
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEmail ? { email: identifier.trim() } : { loginId: identifier.trim() }),
          password,
        }),
      });
      if (!response.ok) {
        setErrorMessage(await getResponseMessage(response));
        return;
      }

      const result: unknown = await response.json();
      if (
        typeof result !== "object" ||
        result === null ||
        !("data" in result) ||
        typeof result.data !== "object" ||
        result.data === null ||
        !("access_token" in result.data) ||
        !("refresh_token" in result.data) ||
        typeof result.data.access_token !== "string" ||
        typeof result.data.refresh_token !== "string"
      ) {
        throw new Error("로그인 응답 형식이 올바르지 않습니다.");
      }

      const tokenUser = decodeTokenUser(result.data.access_token);
      const session: AccountSession = {
        nickname:
          typeof tokenUser.nickname === "string" ? tokenUser.nickname : identifier,
        email: typeof tokenUser.email === "string" ? tokenUser.email : "",
        loginId:
          typeof tokenUser.loginId === "string"
            ? tokenUser.loginId
            : isEmail
              ? ""
              : identifier.trim(),
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
      };
      saveAccountSession(session);
      onLogin(session);
    } catch (error) {
      console.error("로그인 실패:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AccountLayout
      eyebrow="다시 만나 반가워요"
      title="로그인"
      description="계정에 로그인해 파일을 계속 관리하세요."
      onNavigate={onNavigate}
    >
      <form className="account-form" onSubmit={submit}>
        <label htmlFor="login-identifier">이메일 또는 로그인 ID</label>
        <div className="account-input-wrap">
          <AtSign size={17} aria-hidden="true" />
          <input
            id="login-identifier"
            autoComplete="username"
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="이메일 또는 로그인 ID"
          />
        </div>
        <label htmlFor="login-password">비밀번호</label>
        <div className="account-input-wrap">
          <LockKeyhole size={17} aria-hidden="true" />
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
          />
        </div>
        {errorMessage && (
          <p className="account-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button className="account-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="account-switch">
        아직 계정이 없으신가요?{" "}
        <button type="button" onClick={() => onNavigate("signup")}>
          회원가입
        </button>
      </p>
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
