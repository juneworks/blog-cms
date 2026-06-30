"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dbService, Post } from "@/lib/db";
import pageStyles from "../page.module.css";
import workStyles from "./work.module.css";

export default function WorkList() {
  const [works, setWorks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const data = await dbService.getPosts();
        // type이 'work'로 설정된 프로젝트/작업 데이터만 필터링
        const filtered = data.filter(p => p.type === "work");
        setWorks(filtered);
      } catch (error) {
        console.error("작업 목록 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  return (
    <div className={pageStyles.container}>
      {/* 헤더 영역 (고정) */}
      <header className={pageStyles.header}>
        <Link href="/" className={pageStyles.authorName} title="홈">
          김준
        </Link>
        <nav className={pageStyles.headerNav}>
          <Link href="/" className={pageStyles.headerNavLink}>글</Link>
          <Link href="/work" className={`${pageStyles.headerNavLink} ${workStyles.activeMenu}`}>작업</Link>
          <Link href="/about" className={pageStyles.headerNavLink}>소개</Link>
        </nav>
      </header>

      {/* 메인 콘텐츠 영역 (680px 가로 폭 제한 및 2열 그리드) */}
      <main className={pageStyles.main}>
        {loading ? (
          <p style={{ alignSelf: "center", color: "rgba(0, 0, 0, 0.4)", fontSize: "0.95rem" }}>
            작업 목록을 불러오는 중...
          </p>
        ) : works.length === 0 ? (
          <p style={{ alignSelf: "center", color: "rgba(0, 0, 0, 0.4)", fontSize: "0.95rem" }}>
            아직 등록된 작업이 없습니다.
          </p>
        ) : (
          <div className={workStyles.workGrid}>
            {works.map((work) => (
              <Link key={work.id} href={`/work/${work.id}`} className={workStyles.workCard}>
                <div 
                  className={workStyles.thumbnailBox}
                  style={{ background: work.bgGradient || "linear-gradient(135deg, #dfddd6, #2e633f)" }}
                >
                  {/* 중앙에 이니셜이나 기하학적 심볼을 은은하게 얹어 디자인성 극대화 */}
                  <span className={workStyles.thumbnailSymbol}>
                    {work.title.substring(0, 2)}
                  </span>
                </div>
                <h3 className={workStyles.workTitle}>{work.title}</h3>
                {work.subtitle && <p className={workStyles.workSubtitle}>{work.subtitle}</p>}
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 푸터 영역 (고정) */}
      <footer className={pageStyles.footer}>
        <span className={pageStyles.copyright}>
          Copyright 2025-2026. <Link href="/admin" style={{ color: "inherit", textDecoration: "none", cursor: "default" }}>June Kim</Link> 🇰🇷 All rights reserved.
        </span>
      </footer>
    </div>
  );
}
