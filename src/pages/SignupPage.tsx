import AccountLayout from "../components/account/AccountLayout";
import { useEffect, useRef, useState } from "react";
import {
  availabilityEndpoints,
  validPasswordPattern,
} from "../common/account/constants";
import { getResponseMessage } from "../common/account/utils";
import { ArrowLeft, AtSign, LockKeyhole, Mail, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import type {
  AccountPageProps,
  AvailabilityField,
  AvailabilityState,
} from "../common/account/types";

export default function SignupPage({ onNavigate }: AccountPageProps) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [availability, setAvailability] = useState<
    Record<AvailabilityField, AvailabilityState>
  >({
    nickname: { status: "idle", message: "" },
    email: { status: "idle", message: "" },
    loginId: { status: "idle", message: "" },
  });
  const [checkedValues, setCheckedValues] = useState<
    Record<AvailabilityField, string>
  >({ nickname: "", email: "", loginId: "" });
  const availabilityRequests = useRef<
    Partial<Record<AvailabilityField, AbortController>>
  >({});
  const availabilityCheckRef = useRef<
    (field: AvailabilityField, value: string) => Promise<void>
  >(async () => {});

  availabilityCheckRef.current = async (field, rawValue) => {
    const value = rawValue.trim();
    const { endpoint, label } = availabilityEndpoints[field];
    const validationMessage =
      field === "nickname" &&
      value.length > 0 &&
      (value.length < 2 || value.length >= 30)
        ? "닉네임은 2자 이상 30자 미만이어야 합니다."
        : field === "email" &&
            value.length > 0 &&
            (value.length < 5 ||
              value.length >= 50 ||
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          ? "유효한 이메일을 5자 이상 50자 미만으로 입력해 주세요."
          : field === "loginId" &&
              value.length > 0 &&
              (value.length < 3 || value.length >= 20)
            ? "로그인 ID는 3자 이상 20자 미만이어야 합니다."
            : "";

    availabilityRequests.current[field]?.abort();
    if (!value || validationMessage) {
      setCheckedValues((current) => ({ ...current, [field]: "" }));
      setAvailability((current) => ({
        ...current,
        [field]: {
          status: validationMessage ? "error" : "idle",
          message: validationMessage,
        },
      }));
      return;
    }

    const controller = new AbortController();
    availabilityRequests.current[field] = controller;
    setCheckedValues((current) => ({ ...current, [field]: "" }));
    setAvailability((current) => ({
      ...current,
      [field]: { status: "checking", message: "중복 여부를 확인하고 있습니다." },
    }));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(await getResponseMessage(response));
      }

      const result: unknown = await response.json();
      if (
        typeof result !== "object" ||
        result === null ||
        !("check" in result) ||
        typeof result.check !== "boolean"
      ) {
        throw new Error(`${label} 확인 응답 형식이 올바르지 않습니다.`);
      }
      if (controller.signal.aborted) return;

      setAvailability((current) => ({
        ...current,
        [field]: result.check
          ? { status: "unavailable", message: "이미 사용 중입니다." }
          : { status: "available", message: "사용할 수 있습니다." },
      }));
      setCheckedValues((current) => ({
        ...current,
        [field]: result.check ? "" : value,
      }));
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(`${label} 중복 확인 실패:`, error);
      setCheckedValues((current) => ({ ...current, [field]: "" }));
      setAvailability((current) => ({
        ...current,
        [field]: {
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : `${label} 중복 확인에 실패했습니다.`,
        },
      }));
    }
  };

  useEffect(() => {
    const requests = availabilityRequests.current;
    const timer = window.setTimeout(() => {
      void availabilityCheckRef.current("nickname", nickname);
    }, 450);
    return () => {
      window.clearTimeout(timer);
      requests.nickname?.abort();
    };
  }, [nickname]);

  useEffect(() => {
    const requests = availabilityRequests.current;
    const timer = window.setTimeout(() => {
      void availabilityCheckRef.current("email", email);
    }, 450);
    return () => {
      window.clearTimeout(timer);
      requests.email?.abort();
    };
  }, [email]);

  useEffect(() => {
    const requests = availabilityRequests.current;
    const timer = window.setTimeout(() => {
      void availabilityCheckRef.current("loginId", loginId);
    }, 450);
    return () => {
      window.clearTimeout(timer);
      requests.loginId?.abort();
    };
  }, [loginId]);

  function updateIdentityField(field: AvailabilityField, value: string) {
    setCheckedValues((current) => ({ ...current, [field]: "" }));
    setAvailability((current) => ({
      ...current,
      [field]: { status: "idle", message: "" },
    }));
    if (field === "nickname") setNickname(value);
    if (field === "email") setEmail(value);
    if (field === "loginId") setLoginId(value);
  }

  function isAvailabilityConfirmed(field: AvailabilityField, value: string) {
    return (
      availability[field].status === "available" &&
      checkedValues[field] === value.trim()
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (
      !isAvailabilityConfirmed("nickname", nickname) ||
      !isAvailabilityConfirmed("email", email) ||
      !isAvailabilityConfirmed("loginId", loginId)
    ) {
      setErrorMessage("닉네임, 이메일, 로그인 ID의 중복 확인을 완료해 주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!validPasswordPattern.test(password)) {
      setErrorMessage("비밀번호는 영문 대·소문자, 숫자, 특수문자를 포함해 8~29자로 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          email: email.trim(),
          loginId: loginId.trim(),
          password,
          confirmPassword,
        }),
      });
      if (!response.ok) {
        setErrorMessage(await getResponseMessage(response));
        return;
      }
      await getResponseMessage(response);
      setIsRegistered(true);
    } catch (error) {
      console.error("회원가입 실패:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AccountLayout
      eyebrow="안전한 파일 관리의 시작"
      title="회원가입"
      description="계정을 만들고 나만의 저장 공간을 시작하세요."
      onNavigate={onNavigate}
    >
      {isRegistered ? (
        <div className="account-success" role="status">
          <strong>회원가입이 완료되었습니다.</strong>
          <span>로그인하여 파일 저장소를 이용해 주세요.</span>
          <button
            className="account-submit"
            type="button"
            onClick={() => onNavigate("login")}
          >
            로그인하기
          </button>
        </div>
      ) : (
        <form className="account-form" onSubmit={submit}>
          <label htmlFor="signup-nickname">닉네임</label>
          <div className="account-input-wrap">
            <UserRound size={17} aria-hidden="true" />
            <input
              id="signup-nickname"
              autoComplete="nickname"
              minLength={2}
              maxLength={29}
              required
              value={nickname}
              onChange={(event) =>
                updateIdentityField("nickname", event.target.value)
              }
              placeholder="2~29자"
            />
          </div>
          <div className="availability-row">
            <span
              className={`availability-message ${availability.nickname.status}`}
              aria-live="polite"
            >
              {availability.nickname.message ||
                (nickname ? "입력 중 자동으로 중복 확인합니다." : "")}
            </span>
            <button
              className="availability-button"
              type="button"
              disabled={!nickname.trim() || availability.nickname.status === "checking"}
              onClick={() =>
                void availabilityCheckRef.current("nickname", nickname)
              }
            >
              {availability.nickname.status === "checking"
                ? "확인 중..."
                : "중복 확인"}
            </button>
          </div>
          <label htmlFor="signup-email">이메일</label>
          <div className="account-input-wrap">
            <Mail size={17} aria-hidden="true" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              maxLength={49}
              required
              value={email}
              onChange={(event) =>
                updateIdentityField("email", event.target.value)
              }
              placeholder="name@example.com"
            />
          </div>
          <div className="availability-row">
            <span
              className={`availability-message ${availability.email.status}`}
              aria-live="polite"
            >
              {availability.email.message ||
                (email ? "입력 중 자동으로 중복 확인합니다." : "")}
            </span>
            <button
              className="availability-button"
              type="button"
              disabled={!email.trim() || availability.email.status === "checking"}
              onClick={() => void availabilityCheckRef.current("email", email)}
            >
              {availability.email.status === "checking"
                ? "확인 중..."
                : "중복 확인"}
            </button>
          </div>
          <label htmlFor="signup-login-id">로그인 ID</label>
          <div className="account-input-wrap">
            <AtSign size={17} aria-hidden="true" />
            <input
              id="signup-login-id"
              autoComplete="username"
              minLength={3}
              maxLength={19}
              required
              value={loginId}
              onChange={(event) =>
                updateIdentityField("loginId", event.target.value)
              }
              placeholder="3~19자"
            />
          </div>
          <div className="availability-row">
            <span
              className={`availability-message ${availability.loginId.status}`}
              aria-live="polite"
            >
              {availability.loginId.message ||
                (loginId ? "입력 중 자동으로 중복 확인합니다." : "")}
            </span>
            <button
              className="availability-button"
              type="button"
              disabled={
                !loginId.trim() || availability.loginId.status === "checking"
              }
              onClick={() =>
                void availabilityCheckRef.current("loginId", loginId)
              }
            >
              {availability.loginId.status === "checking"
                ? "확인 중..."
                : "중복 확인"}
            </button>
          </div>
          <label htmlFor="signup-password">비밀번호</label>
          <div className="account-input-wrap">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={29}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8~29자, 영문 대·소문자·숫자·특수문자 각각 포함"
            />
          </div>
          <label htmlFor="signup-confirm-password">비밀번호 확인</label>
          <div className="account-input-wrap">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="비밀번호를 다시 입력해 주세요"
            />
          </div>
          {errorMessage && (
            <p className="account-error" role="alert">
              {errorMessage}
            </p>
          )}
          <button
            className="account-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "가입 중..." : "계정 만들기"}
          </button>
        </form>
      )}
      <p className="account-switch">
        이미 계정이 있으신가요?{" "}
        <button type="button" onClick={() => onNavigate("login")}>
          로그인
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
