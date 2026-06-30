"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dbService, Post } from "@/lib/db";
import styles from "./page.module.css";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await dbService.getPosts();
        // type이 'post'이거나 정의되지 않은 순수 에세이 글만 필터링 (단, 소개글 id: 'about'은 제외)
        const filtered = data.filter(p => (!p.type || p.type === "post") && p.id !== "about");
        setPosts(filtered);
      } catch (error) {
        console.error("글 목록을 가져오는 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 날짜 포맷팅 함수 (YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 페이지네이션 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div className={styles.container}>
      {/* 헤더 영역 */}
      <header className={styles.header}>
        <Link href="/admin" className={styles.authorName} title="관리자 모드">
          김준
        </Link>
        <nav className={styles.headerNav}>
          <Link href="/" className={styles.headerNavLink}>글</Link>
          <Link href="/work" className={styles.headerNavLink}>작업</Link>
          <Link href="/about" className={styles.headerNavLink}>소개</Link>
        </nav>
      </header>

      {/* 메인 콘텐츠 영역 (중앙 정렬 글 목록) */}
      <main className={styles.main}>
        {loading ? (
          <p style={{ alignSelf: "center", color: "rgba(44, 44, 45, 0.4)", fontSize: "0.95rem" }}>
            생각들을 불러오는 중...
          </p>
        ) : posts.length === 0 ? (
          <p style={{ alignSelf: "center", color: "rgba(44, 44, 45, 0.4)", fontSize: "0.95rem" }}>
            아직 작성된 글이 없습니다.
          </p>
        ) : (
          <>
            <ul className={styles.postList}>
              {currentPosts.map((post, index) => (
                <li key={post.id} className={styles.postItem}>
                  <Link href={`/post/${post.id}`} className={styles.postLink}>
                    <span className={styles.postTitleText}>{post.title}</span>
                    <span className={styles.postDateText}>{formatDate(post.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* 페이지네이션 번호 영역 */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`${styles.pageNumber} ${
                      currentPage === pageNum ? styles.activePage : ""
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 푸터 영역 */}
      <footer className={styles.footer}>
        <span className={styles.copyright}>Copyright 2025-2026. June Kim 🇰🇷 All rights reserved.</span>
      </footer>
    </div>
  );
}


