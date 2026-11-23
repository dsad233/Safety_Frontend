import {
  ArrowRight,
  Check,
  Cloud,
  FileText,
  Folder,
  LockKeyhole,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <a className="home-brand" href="/" aria-label="safety 홈">
          <span className="brand-mark">
            <ShieldCheck size={21} strokeWidth={2.4} />
          </span>
          <span>
            safety<span className="brand-period">.</span>
          </span>
        </a>
        <nav className="home-nav" aria-label="메인 메뉴">
          <a href="#features">주요 기능</a>
          <a href="#security">보안</a>
        </nav>
        <div className="home-header-actions">
          <a className="home-login-link" href="/login">
            로그인
          </a>
          <a className="home-signup-button" href="/signup">
            회원가입
          </a>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">
            <span className="eyebrow-dot" />
            나만의 안전한 파일 공간
          </span>
          <h1>
            파일을 더 안전하게,
            <br />
            더 편리하게.
          </h1>
          <p>
            중요한 파일을 한곳에 모아 보관하고, 필요한 순간 언제든 찾아보세요.
            나만을 위한 깔끔한 클라우드 파일 공간을 시작해 보세요.
          </p>
          <div className="home-hero-actions">
            <a className="home-primary-button" href="/files">
              내 파일 시작하기 <ArrowRight size={17} />
            </a>
            <a className="home-secondary-button" href="#features">
              서비스 알아보기
            </a>
          </div>
          <div className="home-trust-note">
            <span>
              <Check size={13} />
            </span>
            로그인한 사용자별로 파일을 안전하게 관리합니다
          </div>
        </div>

        <div className="home-visual" aria-label="파일 보관함 미리보기">
          <div className="home-visual-glow" />
          <div className="home-storage-card">
            <div className="home-storage-topline">
              <span className="home-storage-brand">
                <span className="home-mini-mark">
                  <ShieldCheck size={14} />
                </span>
                내 파일
              </span>
              <span className="home-storage-status">
                <span /> 안전하게 보관 중
              </span>
            </div>
            <div className="home-storage-welcome">
              <span>MY WORKSPACE</span>
              <strong>파일을 한눈에 관리하세요</strong>
            </div>
            <div className="home-storage-search">
              <Search size={15} />
              <span>파일 검색</span>
            </div>
            <div className="home-storage-folders">
              <div className="home-storage-section-title">
                <strong>내 폴더</strong>
                <span>모두 보기</span>
              </div>
              <div className="home-folder-row">
                <span className="home-folder-icon green">
                  <Folder size={18} fill="currentColor" />
                </span>
                <span>
                  <strong>프로젝트</strong>
                  <small>12개 항목</small>
                </span>
                <span className="home-folder-date">오늘</span>
              </div>
              <div className="home-folder-row">
                <span className="home-folder-icon blue">
                  <Folder size={18} fill="currentColor" />
                </span>
                <span>
                  <strong>문서 보관함</strong>
                  <small>8개 항목</small>
                </span>
                <span className="home-folder-date">어제</span>
              </div>
              <div className="home-folder-row">
                <span className="home-folder-icon orange">
                  <FileText size={18} />
                </span>
                <span>
                  <strong>기획서.pdf</strong>
                  <small>PDF 문서</small>
                </span>
                <span className="home-folder-date">10월 18일</span>
              </div>
            </div>
            <div className="home-storage-footer">
              <span className="home-cloud-icon">
                <Cloud size={17} />
              </span>
              <span>
                <strong>모든 파일을 한곳에서</strong>
                <small>언제든 쉽게 찾고 관리하세요</small>
              </span>
              <Upload size={16} />
            </div>
          </div>
          <div className="home-floating-badge">
            <span>
              <LockKeyhole size={16} />
            </span>
            <div>
              <strong>나만의 안전한 공간</strong>
              <small>개인별 파일 관리</small>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features" id="features">
        <div className="home-section-heading">
          <span className="home-eyebrow">SIMPLE &amp; SAFE</span>
          <h2>파일 관리에 필요한 모든 것</h2>
          <p>복잡한 설정 없이, 필요한 파일을 쉽고 안전하게 관리하세요.</p>
        </div>
        <div className="home-feature-grid">
          <article className="home-feature-card">
            <span className="home-feature-icon green">
              <Folder size={20} />
            </span>
            <h3>깔끔한 파일 정리</h3>
            <p>
              폴더와 검색 기능으로 파일을 보기 좋게 정리하고 빠르게 찾아보세요.
            </p>
          </article>
          <article className="home-feature-card" id="security">
            <span className="home-feature-icon lilac">
              <ShieldCheck size={20} />
            </span>
            <h3>사용자별 보관 공간</h3>
            <p>
              로그인한 계정에 연결된 파일을 관리해 개인별 공간을 분리합니다.
            </p>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-icon orange">
              <Cloud size={20} />
            </span>
            <h3>간편한 업로드</h3>
            <p>
              파일을 업로드하고 다운로드하며 나만의 자료를 한곳에서 관리하세요.
            </p>
          </article>
        </div>
      </section>

      <footer className="home-footer">
        <a className="home-brand" href="/" aria-label="safety 홈">
          <span className="brand-mark">
            <ShieldCheck size={18} strokeWidth={2.4} />
          </span>
          <span>
            safety<span className="brand-period">.</span>
          </span>
        </a>
        <span>나만의 파일 공간, safety.</span>
      </footer>
    </main>
  );
}
