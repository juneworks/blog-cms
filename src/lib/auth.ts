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

const DEMO_PASSWORD = "admin1234"; // 로컬스토리지 fallback용 비밀번호
const AUTH_COOKIE_NAME = "blog_admin_authenticated";

export const authService = {
  // 로그인 시도
  async login(password: string, email?: string): Promise<boolean> {
    if (isFirebaseEnabled && auth) {
      try {
        // Firebase Auth를 사용할 경우 이메일이 필요하므로, 이메일이 주어지지 않은 경우 default admin 이메일로 매칭
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
      // 로컬 fallback
      if (password === DEMO_PASSWORD) {
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_COOKIE_NAME, "true");
        }
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
