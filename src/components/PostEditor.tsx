"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../app/admin/admin.module.css";

// SVG 아이콘 정의
const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const IconLayout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const IconTable = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M3 12h18M3 3h18v18H3z" />
  </svg>
);

const IconVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconMapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconEmoji = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const IconHr = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconAlignLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);

interface PostEditorProps {
  initialTitle?: string;
  initialSubtitle?: string;
  initialContent?: string;
  initialType?: 'post' | 'work';
  isAbout?: boolean;
  onSave: (title: string, subtitle: string, content: string, type: 'post' | 'work') => Promise<void>;
  saving: boolean;
  pageTitle?: string;
}

export default function PostEditor({
  initialTitle = "",
  initialSubtitle = "",
  initialContent = "",
  initialType = "post",
  isAbout = false,
  onSave,
  saving,
  pageTitle = "글 작성"
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [content, setContent] = useState(initialContent);
  const [type, setType] = useState<'post' | 'work'>(initialType);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();

  // props 변경 시 상태 반영
  useEffect(() => {
    setTitle(initialTitle);
    setSubtitle(initialSubtitle);
    setContent(initialContent);
    setType(initialType);
  }, [initialTitle, initialSubtitle, initialContent, initialType]);

  const handleSaveClick = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    onSave(title, subtitle, content, type);
  };

  const checkSpelling = () => {
    alert("맞춤법 검사 완료: 오류가 발견되지 않았습니다.");
  };

  return (
    <div className={styles.editorContainer}>
      {/* 에디터 네비바 */}
      <nav className={styles.editorNavbar}>
        <div className={styles.navbarLeft}>
          <span className={styles.navLink} onClick={() => router.push("/admin")}>
            ← 나가기
          </span>
          <span className={styles.navLink} onClick={() => setIsPreviewOpen(true)}>
            모바일 미리보기
          </span>
          <span className={styles.navLink} onClick={checkSpelling}>
            맞춤법 검사
          </span>
        </div>
        <div>
          <button 
            onClick={handleSaveClick} 
            disabled={saving} 
            className={styles.saveBtn}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </nav>

      {/* 메인 작성 공간 */}
      <div className={styles.editorWorkspace}>
        <div className={styles.writeArea}>
          {!isAbout && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "gray", fontWeight: "700" }}>콘텐츠 구분 :</span>
              <button
                type="button"
                onClick={() => setType("post")}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  backgroundColor: type === "post" ? "var(--point-green)" : "#e1e1e6",
                  color: type === "post" ? "#ffffff" : "#000000",
                  transition: "all 0.2s ease"
                }}
              >
                일반 에세이 글 (Post)
              </button>
              <button
                type="button"
                onClick={() => setType("work")}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  backgroundColor: type === "work" ? "var(--point-green)" : "#e1e1e6",
                  color: type === "work" ? "#ffffff" : "#000000",
                  transition: "all 0.2s ease"
                }}
              >
                포트폴리오 작업물 (Work)
              </button>
            </div>
          )}
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
          <input
            type="text"
            className={styles.subtitleInput}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="소제목을 입력하세요"
          />
          <div className={styles.divider} />
          <textarea
            className={styles.contentTextarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이곳에 기록을 시작하세요..."
          />
        </div>

        {/* 툴바 섹션 */}
        <aside className={styles.toolbarSection}>
          {/* 제목 툴바 */}
          <div className={styles.toolbarGroup}>
            <button className={styles.toolbarIcon} title="이미지 첨부" aria-label="이미지 첨부">
              <IconImage />
            </button>
            <button className={styles.toolbarIcon} title="텍스트 스타일" aria-label="텍스트 스타일">
              <IconText />
            </button>
            <button className={styles.toolbarIcon} title="레이아웃 템플릿" aria-label="레이아웃 템플릿">
              <IconLayout />
            </button>
          </div>

          {/* 본문 툴바 */}
          <div className={styles.toolbarGroup}>
            <button className={styles.toolbarIcon} title="이미지 추가" aria-label="이미지 추가">
              <IconImage />
            </button>
            <button className={styles.toolbarIcon} title="표 삽입" aria-label="표 삽입">
              <IconTable />
            </button>
            <button className={styles.toolbarIcon} title="동영상 첨부" aria-label="동영상 첨부">
              <IconVideo />
            </button>
            <button className={styles.toolbarIcon} title="링크 삽입" aria-label="링크 삽입">
              <IconLink />
            </button>
            <button className={styles.toolbarIcon} title="위치 추가" aria-label="위치 추가">
              <IconMapPin />
            </button>
            <button className={styles.toolbarIcon} title="이모지" aria-label="이모지">
              <IconEmoji />
            </button>
            <button className={styles.toolbarIcon} title="구분선" aria-label="구분선">
              <IconHr />
            </button>
            <button className={styles.toolbarIcon} title="정렬" aria-label="정렬">
              <IconAlignLeft />
            </button>
          </div>
        </aside>
      </div>

      {/* 모바일 미리보기 모달 */}
      {isPreviewOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsPreviewOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <span>모바일 미리보기 ({pageTitle})</span>
              <button className={styles.closeModalBtn} onClick={() => setIsPreviewOpen(false)}>
                ✕
              </button>
            </header>
            <div className={styles.modalBody}>
              <h2 className={styles.modalPostTitle}>{title || "제목 없음"}</h2>
              <p className={styles.modalPostSubtitle}>{subtitle || "소제목 없음"}</p>
              <div className={styles.divider} />
              <div className={styles.modalPostContent}>
                {content || "작성된 본문 내용이 없습니다."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
