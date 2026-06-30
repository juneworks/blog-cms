"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { dbService, Post } from "@/lib/db";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 로그인 보호 체계
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    const loadPosts = async () => {
      try {
        const data = await dbService.getPosts();
        // 소개(about) 데이터는 대시보드 목록에서 제외
        const filtered = data.filter(p => p.id !== "about");
        setPosts(filtered);
      } catch (err) {
        console.error("글 목록을 로드하는 중 에러 발생:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [router]);

  const handleLogout = async () => {
    await authService.logout();
    router.push("/admin/login");
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`'${title}' 글을 정말로 삭제하시겠습니까?`)) {
      try {
        await dbService.deletePost(id);
        setPosts(posts.filter((post) => post.id !== id));
      } catch (err) {
        alert("글 삭제 실패");
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <p>인증 상태 확인 및 데이터 로드 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>June Kim Blog CMS</h1>
          <p style={{ fontSize: "0.85rem", color: "gray", marginTop: "0.2rem" }}>
            글 관리 대시보드
          </p>
        </div>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => router.push("/")}
            className={styles.btn}
          >
            블로그 홈으로
          </button>
          <button
            onClick={() => router.push("/admin/edit/about")}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ backgroundColor: "var(--point-green)", borderColor: "var(--point-green)" }}
          >
            소개 페이지 수정
          </button>
          <button
            onClick={() => router.push("/admin/write")}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            새 글 쓰기
          </button>
          <button
            onClick={handleLogout}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            로그아웃
          </button>
        </div>
      </header>

      <main>
        {posts.length === 0 ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "gray" }}>
            작성된 블로그 글이 없습니다. 새 글을 작성해 보세요.
          </p>
        ) : (
          <table className={styles.postTable}>
            <thead>
              <tr>
                <th style={{ width: "65%" }}>제목</th>
                <th style={{ width: "15%" }}>작성일</th>
                <th style={{ width: "20%" }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <span className={styles.tableTitle}>{post.title}</span>
                    <span className={styles.tableSubtitle}>{post.subtitle}</span>
                  </td>
                  <td>
                    <span className={styles.tableDate}>
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <button
                        onClick={() => router.push(`/admin/edit/${post.id}`)}
                        className={styles.btn}
                        style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className={`${styles.btn} ${styles.btnDanger}`}
                        style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
