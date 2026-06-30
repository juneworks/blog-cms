import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const isFirebaseEnabled = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let auth: any = null;
if (isFirebaseEnabled) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase Auth 초기화 에러:", error);
  }
}

const AUTH_COOKIE_NAME = "blog_admin_authenticated";
const STORAGE_EMAIL_KEY = "blog_admin_email";
const STORAGE_PASSWORD_KEY = "blog_admin_password";

export const authService = {
  // 계정이 초기 세팅되어 있는지 여부
  isAccountConfigured(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_PASSWORD_KEY);
  },

  // 관리자 이메일 조회
  getAdminEmail(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_EMAIL_KEY) || "";
  },

  // 계정 초기 세팅
  setupAccount(email: string, password: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_EMAIL_KEY, email);
      localStorage.setItem(STORAGE_PASSWORD_KEY, password);
    }
  },

  // 계정 정보 업데이트 (비밀번호 변경 등)
  updateAccount(email: string, password: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_EMAIL_KEY, email);
      localStorage.setItem(STORAGE_PASSWORD_KEY, password);
    }
  },

  // 로그인 시도
  async login(password: string, email?: string): Promise<boolean> {
    if (isFirebaseEnabled && auth) {
      try {
        const adminEmail = email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com";
        await signInWithEmailAndPassword(auth, adminEmail, password);
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_COOKIE_NAME, "true");
        }
        return true;
      } catch (error) {
        console.error("Firebase 로그인 실패:", error);
        return false;
      }
    } else {
      // 로컬 fallback (로컬스토리지 저장 비밀번호 및 이메일 검증)
      if (typeof window === "undefined") return false;
      
      const storedEmail = localStorage.getItem(STORAGE_EMAIL_KEY);
      const storedPassword = localStorage.getItem(STORAGE_PASSWORD_KEY);
      
      // 입력받은 이메일이 매칭되는지도 체크 (이메일 주소 연결 검증)
      const isEmailValid = !email || storedEmail === email;
      
      if (isEmailValid && storedPassword === password) {
        localStorage.setItem(AUTH_COOKIE_NAME, "true");
        return true;
      }
      return false;
    }
  },

  // 로그아웃
  async logout(): Promise<void> {
    if (isFirebaseEnabled && auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Firebase 로그아웃 실패:", error);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_COOKIE_NAME);
    }
  },

  // 현재 로그인 상태 체크
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    
    // 1차로 로컬스토리지의 세션 상태 검증
    const localAuth = localStorage.getItem(AUTH_COOKIE_NAME) === "true";
    
    if (isFirebaseEnabled && auth) {
      // Firebase가 켜져 있으면 실제 currentUser 유무와 함께 확인
      return !!auth.currentUser || localAuth;
    }
    
    return localAuth;
  },

  // Firebase Auth 상태 리스너 구독 (필요 시)
  subscribeToAuthChanges(callback: (user: any) => void) {
    if (isFirebaseEnabled && auth) {
      return onAuthStateChanged(auth, (user) => {
        if (user) {
          localStorage.setItem(AUTH_COOKIE_NAME, "true");
        } else {
          localStorage.removeItem(AUTH_COOKIE_NAME);
        }
        callback(user);
      });
    }
    // Fallback 모드에서는 최초 1회 즉시 호출
    callback(this.isAuthenticated() ? { email: "admin@example.com" } : null);
    return () => {};
  }
};
