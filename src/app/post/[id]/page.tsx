"use client";
// cache-bust: force-deploy-v1.0.3

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { dbService, Post } from "@/lib/db";
import styles from "../post.module.css";

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 이전/다음 글 정보
  const [prevPost, setPrevPost] = useState<Post | null>(null);
  const [nextPost, setNextPost] = useState<Post | null>(null);

  // 좋아요 및 공유 수 카운터
  const [likes, setLikes] = useState(109);
  const [liked, setLiked] = useState(false);
  const [shares, setShares] = useState(20);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const data = await dbService.getPost(id);
        setPost(data);
      } catch (error) {
        console.error("글 로드 중 에러:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
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

  // 이전 글 / 다음 글 연산 (발행 역순 정렬 기준)
  useEffect(() => {
    const fetchNavPosts = async () => {
      try {
        const allPosts = await dbService.getPosts();
        const currentIndex = allPosts.findIndex(p => p.id === id);
        if (currentIndex !== -1) {
          // 다음 글 (더 미래, 최신 글) = currentIndex - 1
          if (currentIndex > 0) {
            setNextPost(allPosts[currentIndex - 1]);
          } else {
            setNextPost(null);
          }
          // 이전 글 (더 과거, 오래된 글) = currentIndex + 1
          if (currentIndex < allPosts.length - 1) {
            setPrevPost(allPosts[currentIndex + 1]);
          } else {
            setPrevPost(null);
          }
        }
      } catch (error) {
        console.error("이전/다음 글 산출 에러:", error);
      }
    };
    if (id) {
      fetchNavPosts();
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
      alert("글 주소가 클립보드에 복사되었습니다. 원하는 곳에 공유해 보세요!");
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
        <p style={{ textAlign: "center", color: "rgba(44, 44, 45, 0.4)", margin: "auto" }}>
          글을 읽어오는 중...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", margin: "auto" }}>
          <p style={{ color: "rgba(44, 44, 45, 0.6)", marginBottom: "1.5rem" }}>
            존재하지 않거나 삭제된 글입니다.
          </p>
          <Link href="/" className={styles.backLink}>
            목록으로 돌아가기
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
          <Link href="/work" className={styles.headerNavLink}>작업</Link>
          <Link href="/about" className={styles.headerNavLink}>소개</Link>
        </nav>
      </header>

      {/* 동적 포스트 제목 영역 (스크롤 감지 연동) */}
      <div className={`${styles.postHeaderArea} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.postHeaderContainer}>
          <div className={styles.postTitleRow}>
            <h1 className={styles.postTitle}>{post.title}</h1>
          </div>
          <div className={styles.postMetaRow}>
            {post.subtitle ? (
              <p className={styles.postSubtitle}>{post.subtitle}</p>
            ) : (
              <p className={styles.postSubtitle}>&nbsp;</p>
            )}
            <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
          </div>
          {/* 제목 영역 구분선 및 스크롤 진행선 인디케이터 */}
          <div className={styles.headerDividerContainer}>
            <div className={styles.headerDivider} />
            <div className={styles.scrollIndicator} style={{ width: `${scrollProgress}%` }} />
          </div>
        </div>
      </div>

      {/* 메인 본문 콘텐츠 */}
      <main className={styles.main}>
        <article className={styles.postArticle}>
          <div className={styles.postContent}>{post.content}</div>
        </article>

        {/* 푸터 영역 위의 네비게이션 및 인터랙션 컴포넌트 */}
        <div className={styles.navSectionContainer}>
          <div className={styles.bottomDivider} />
          <div className={styles.postNavigation}>
            <div className={styles.navLeft}>
              {prevPost ? (
                <Link href={`/post/${prevPost.id}`} className={styles.navLink}>
                  ← 이전 글
                </Link>
              ) : (
                <span className={styles.navDisabled}>← 이전 글</span>
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
              {nextPost ? (
                <Link href={`/post/${nextPost.id}`} className={styles.navLink}>
                  다음 글 →
                </Link>
              ) : (
                <span className={styles.navDisabled}>다음 글 →</span>
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
