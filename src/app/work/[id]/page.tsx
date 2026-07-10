"use client";
// cache-bust: force-deploy-v1.0.8

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dbService, Post } from "@/lib/db";
import styles from "../../post/post.module.css";
import workStyles from "../work.module.css";

export default function WorkDetail() {
  const [work, setWork] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 이전/다음 작업 정보
  const [prevWork, setPrevWork] = useState<Post | null>(null);
  const [nextWork, setNextWork] = useState<Post | null>(null);

  // 좋아요 및 공유 수 카운터
  const [likes, setLikes] = useState(109);
  const [liked, setLiked] = useState(false);
  const [shares, setShares] = useState(20);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchWork = async () => {
      if (!id) return;
      try {
        const data = await dbService.getPost(id);
        setWork(data);
      } catch (error) {
        console.error("작업 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [id]);

  // 스크롤 이벤트 감지 및 진행도 계산
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = (window.scrollY / docHeight) * 100;
        setScrollProgress(percent);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 이전 작업 / 다음 작업 연산 (작업 데이터 기준 최신순 역순 정렬)
  useEffect(() => {
    const fetchNavWorks = async () => {
      try {
        const allPosts = await dbService.getPosts();
        // type이 'work'인 작업 데이터만 필터링 및 분리
        const allWorks = allPosts.filter(p => p.type === "work");
        const currentIndex = allWorks.findIndex(p => p.id === id);
        
        if (currentIndex !== -1) {
          // 다음 작업 (더 미래, 최신) = currentIndex - 1
          if (currentIndex > 0) {
            setNextWork(allWorks[currentIndex - 1]);
          } else {
            setNextWork(null);
          }
          // 이전 작업 (더 과거, 오래됨) = currentIndex + 1
          if (currentIndex < allWorks.length - 1) {
            setPrevWork(allWorks[currentIndex + 1]);
          } else {
            setPrevWork(null);
          }
        }
      } catch (error) {
        console.error("이전/다음 작업 산출 에러:", error);
      }
    };
    if (id) {
      fetchNavWorks();
    }
  }, [id]);

  // 좋아요 및 공유 카운트 로컬 세션 로딩
  useEffect(() => {
    if (!id) return;
    const likedKey = `liked_${id}`;
    const likesCountKey = `likes_count_${id}`;
    const sharesCountKey = `shares_count_${id}`;

    const isLiked = localStorage.getItem(likedKey) === "true";
    setLiked(isLiked);

    const storedLikes = localStorage.getItem(likesCountKey);
    if (storedLikes) {
      setLikes(parseInt(storedLikes, 10));
    } else {
      const initialVal = 100 + Math.floor(Math.random() * 20);
      setLikes(initialVal);
      localStorage.setItem(likesCountKey, String(initialVal));
    }

    const storedShares = localStorage.getItem(sharesCountKey);
    if (storedShares) {
      setShares(parseInt(storedShares, 10));
    } else {
      const initialVal = 10 + Math.floor(Math.random() * 15);
      setShares(initialVal);
      localStorage.setItem(sharesCountKey, String(initialVal));
    }
  }, [id]);

  const handleLike = () => {
    const likedKey = `liked_${id}`;
    const likesCountKey = `likes_count_${id}`;
    if (liked) {
      const newVal = likes - 1;
      setLikes(newVal);
      setLiked(false);
      localStorage.setItem(likedKey, "false");
      localStorage.setItem(likesCountKey, String(newVal));
    } else {
      const newVal = likes + 1;
      setLikes(newVal);
      setLiked(true);
      localStorage.setItem(likedKey, "true");
      localStorage.setItem(likesCountKey, String(newVal));
    }
  };

  const handleShare = () => {
    const sharesCountKey = `shares_count_${id}`;
    const newVal = shares + 1;
    setShares(newVal);
    localStorage.setItem(sharesCountKey, String(newVal));

    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("작업 주소가 클립보드에 복사되었습니다. 원하는 곳에 공유해 보세요!");
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ textAlign: "center", color: "rgba(0, 0, 0, 0.4)", margin: "auto" }}>
          작업 정보를 읽어오는 중...
        </p>
      </div>
    );
  }

  if (!work) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", margin: "auto" }}>
          <p style={{ color: "rgba(0, 0, 0, 0.6)", marginBottom: "1.5rem" }}>
            존재하지 않거나 삭제된 작업물입니다.
          </p>
          <Link href="/work" className={styles.backLink}>
            작업 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 영역 (고정) */}
      <header className={styles.header}>
        <Link href="/" className={styles.authorName}>
          김준
        </Link>
        <nav className={styles.headerNav}>
          <Link href="/" className={styles.headerNavLink}>글</Link>
          <Link href="/work" className={`${styles.headerNavLink} ${workStyles.activeMenu}`}>작업</Link>
          <Link href="/about" className={styles.headerNavLink}>소개</Link>
        </nav>
        {/* 읽기 진행률 표시선을 고정 헤더 하단 가로 100% 전체 영역에 배치 */}
        <div className={styles.scrollIndicator} style={{ width: `${scrollProgress}%` }} />
      </header>

      {/* 동적 타이틀 영역 (글 페이지와 100% 동일 구조) */}
      <div className={`${styles.postHeaderArea} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.postHeaderContainer}>
          <div className={styles.postTitleRow}>
            <h1 className={styles.postTitle}>{work.title}</h1>
          </div>
          <div className={styles.postMetaRow}>
            {work.subtitle ? (
              <p className={styles.postSubtitle}>{work.subtitle}</p>
            ) : (
              <p className={styles.postSubtitle}>&nbsp;</p>
            )}
            <span className={styles.postDate}>{formatDate(work.createdAt)}</span>
          </div>
          {/* 제목 영역 구분선 */}
          <div className={styles.headerDividerContainer}>
            <div className={styles.headerDivider} />
          </div>
        </div>
      </div>

      {/* 메인 본문 콘텐츠 */}
      <main className={styles.main}>
        <article className={styles.postArticle}>
          {/* 작업 상세 이미지 대신 세련된 웜그라디언트 리소스를 상단에 넓게 배치하여 포트폴리오 감성 연출 */}
          <div 
            className={workStyles.thumbnailBox}
            style={{ 
              background: work.bgGradient || "linear-gradient(135deg, #dfddd6, #2e633f)",
              marginBottom: "30px",
              borderRadius: "4px"
            }}
          >
            <span className={workStyles.thumbnailSymbol} style={{ fontSize: "3rem" }}>
              {work.title.substring(0, 2)}
            </span>
          </div>
          <div className={styles.postContent}>{work.content}</div>
        </article>

        {/* 푸터 영역 위의 네비게이션 및 인터랙션 컴포넌트 */}
        <div className={styles.navSectionContainer}>
          <div className={styles.bottomDivider} />
          <div className={styles.postNavigation}>
            <div className={styles.navLeft}>
              {prevWork ? (
                <Link href={`/work/${prevWork.id}`} className={styles.navLink}>
                  ← 이전 작업
                </Link>
              ) : (
                <span className={styles.navDisabled}>← 이전 작업</span>
              )}
            </div>
            <div className={styles.navCenter}>
              <button onClick={handleLike} className={`${styles.interactionBtn} ${liked ? styles.liked : ""}`} title="좋아요">
                ♥ {likes}
              </button>
              <button onClick={handleShare} className={styles.interactionBtn} title="공유하기">
                ✈ {shares}
              </button>
            </div>
            <div className={styles.navRight}>
              {nextWork ? (
                <Link href={`/work/${nextWork.id}`} className={styles.navLink}>
                  다음 작업 →
                </Link>
              ) : (
                <span className={styles.navDisabled}>다음 작업 →</span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 영역 */}
      <footer className={styles.footer}>
        <span className={styles.copyright}>
          Copyright 2025-2026. <Link href="/admin" style={{ color: "inherit", textDecoration: "none", cursor: "default" }}>June Kim</Link> 🇰🇷 All rights reserved.
        </span>
      </footer>
    </div>
  );
}
