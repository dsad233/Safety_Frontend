import type { AppPage } from "../navigation";

export type AccountProfile = {
  nickname: string;
  email: string;
  loginId: string;
};

export type AccountSession = AccountProfile & {
  accessToken: string;
  refreshToken: string;
};

export type AccountPageProps = {
  onNavigate: (page: AppPage) => void;
};

export type LoginPageProps = AccountPageProps & {
  onLogin: (session: AccountSession) => void;
};

export type AvailabilityField = "nickname" | "email" | "loginId";
export type AvailabilityState = {
  status: "idle" | "checking" | "available" | "unavailable" | "error";
  message: string;
};
