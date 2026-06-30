"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import styles from "../admin.module.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 초기 설정용 재입력
  const [isConfigured, setIsConfigured] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 사용자는 어드민 대시보드로 이동
    if (authService.isAuthenticated()) {
      router.push("/admin");
      return;
    }
    // 계정이 설정되어 있는지 확인
    setIsConfigured(authService.isAccountConfigured());
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isConfigured) {
        // 계정 초기 설정 모드
        if (!email.includes("@")) {
          setError("유효한 이메일 주소를 입력해 주세요.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("비밀번호는 최소 6자 이상이어야 합니다.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("비밀번호 재입력이 일치하지 않습니다.");
          setLoading(false);
          return;
        }
        
        // 계정 세팅 진행 후 강제 로그인 처리
        authService.setupAccount(email, password);
        await authService.login(password, email);
        alert("관리자 계정 설정이 성공적으로 완료되었습니다.");
        router.push("/admin");
      } else {
        // 일반 로그인 모드
        const success = await authService.login(password, email);
        if (success) {
          router.push("/admin");
        } else {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
      }
    } catch (err) {
      setError("계정 처리 중 예기치 않은 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>June Kim Blog</h1>
        <p className={styles.loginDesc}>
          {isConfigured ? "관리자 로그인" : "관리자 계정 초기 생성"}
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {!isConfigured && (
          <p style={{ fontSize: "0.82rem", color: "#a24a41", margin: "-5px 0 15px 0", lineHeight: "1.4" }}>
            * 최초 진입 상태입니다. 관리자로 사용할 이메일과 새 비밀번호를 직접 세팅해 주세요. 데모 패스워드는 폐기되었습니다.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* 이메일 입력 필드 */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="email">
              관리자 이메일
            </label>
            <input
              type="email"
              id="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          {/* 비밀번호 입력 필드 */}
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
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {/* 초기 설정일 때만 보여주는 비밀번호 확인 필드 */}
          {!isConfigured && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="confirmPassword">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={styles.inputField}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${styles.btn} ${styles.btnPrimary} ${styles.loginBtn}`}
            style={{ backgroundColor: "var(--point-green)", borderColor: "var(--point-green)", marginTop: "10px" }}
          >
            {loading ? "처리 중..." : isConfigured ? "로그인" : "계정 설정 및 시작"}
          </button>
        </form>
      </div>
    </div>
  );
}
