import type { AvailabilityField } from "./types";

export const availabilityEndpoints: Record<
  AvailabilityField,
  { endpoint: string; label: string }
> = {
  nickname: { endpoint: "/api/auth/check/nickname", label: "닉네임" },
  email: { endpoint: "/api/auth/check/email", label: "이메일" },
  loginId: { endpoint: "/api/auth/check/loginid", label: "로그인 ID" },
};

export const validPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,29}$/;
