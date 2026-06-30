"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import styles from "../admin.module.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 사용자는 어드민 대시보드로 이동
    if (authService.isAuthenticated()) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await authService.login(password);
      if (success) {
        router.push("/admin");
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setError("로그인 처리 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>June Kim Blog</h1>
        <p className={styles.loginDesc}>관리자 로그인</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="password">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요 (데모: admin1234)"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.btn} ${styles.btnPrimary} ${styles.loginBtn}`}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
