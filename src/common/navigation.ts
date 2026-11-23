export type AppPage = "files" | "login" | "signup" | "mypage";

export function getAppPage(pathname: string): AppPage {
  if (pathname === "/login") return "login";
  if (pathname === "/signup") return "signup";
  if (pathname === "/mypage") return "mypage";
  return "files";
}
