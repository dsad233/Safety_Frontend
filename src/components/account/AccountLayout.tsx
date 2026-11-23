import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { AccountPageProps } from "../../common/account/types";

export default function AccountLayout({
  children,
  eyebrow,
  title,
  description,
  onNavigate,
}: AccountPageProps & {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="account-page">
      <section className="account-panel">
        <a
          className="account-brand"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("files");
          }}
        >
          <span className="brand-mark">
            <ShieldCheck size={21} strokeWidth={2.4} />
          </span>
          <span>
            safety<span className="brand-period">.</span>
          </span>
        </a>
        <div className="account-heading">
          <span className="account-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
