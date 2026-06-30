"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dbService, Post } from "@/lib/db";
import pageStyles from "../page.module.css";
import aboutStyles from "./about.module.css";

export default function AboutPage() {
  const [aboutPost, setAboutPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await dbService.getPost("about");
        setAboutPost(data);
      } catch (error) {
        console.error("소개 정보 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  // 마크다운 형태의 소개글을 이미지 구조와 100% 동일하게 렌더링하는 커스텀 파서
  const renderContent = (text: string) => {
    return text.split("\n\n").map((block, index) => {
      // 1. 대제목 파싱 (# JUNE, # WORKS, # JUNEWORKS)
      if (block.startsWith("# ")) {
        const lines = block.split("\n");
        const titleLine = lines[0].substring(2); // '# ' 제외
        const descLine = lines.slice(1).join("\n"); // 그 아래 붉은색/초록색 설명 부분
        
        // 타이틀의 첫 4글자(JUNE 등)와 나머지 뒷 텍스트를 매칭 분할
        let mainWord = titleLine;
        let restWord = "";
        
        if (titleLine.startsWith("JUNEWORKS")) {
          mainWord = "JUNE";
          restWord = "WORKS";
        } else if (titleLine.startsWith("WORKS")) {
          mainWord = "WORKS";
          restWord = "";
        } else if (titleLine.startsWith("JUNE")) {
          mainWord = "JUNE";
          restWord = "";
        }
        
        return (
          <div key={index} className={aboutStyles.sectionHeader}>
            <h2 className={aboutStyles.sectionTitle}>
              <span className={aboutStyles.titleAccent}>{mainWord}</span>
              {restWord && <span className={aboutStyles.titleRest}> {restWord}</span>}
            </h2>
            {descLine && <p className={aboutStyles.sectionDesc}>{descLine}</p>}
          </div>
        );
      }

      // 2. 소그룹 리스트 파싱 (― motto, ― 모바일용 디자인 등)
      if (block.startsWith("― ")) {
        const lines = block.split("\n");
        const groupTitle = lines[0];
        const items = lines.slice(1);
        return (
          <div key={index} className={aboutStyles.listGroup}>
            <h4 className={aboutStyles.listGroupTitle}>{groupTitle}</h4>
            <ul className={aboutStyles.listItems}>
              {items.map((item, i) => (
                <li key={i} className={aboutStyles.listItem}>{item}</li>
              ))}
            </ul>
          </div>
        );
      }

      // 3. 일반 단락 파싱
      return (
        <p key={index} className={aboutStyles.paragraph}>
          {block}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className={pageStyles.container}>
        <p style={{ textAlign: "center", color: "rgba(0, 0, 0, 0.4)", margin: "auto" }}>
          소개 정보를 읽어오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className={pageStyles.container}>
      {/* 헤더 영역 (고정) */}
      <header className={pageStyles.header}>
        <Link href="/admin" className={pageStyles.authorName} title="관리자 모드">
          김준
        </Link>
        <nav className={pageStyles.headerNav}>
          <Link href="/" className={pageStyles.headerNavLink}>글</Link>
          <Link href="/work" className={pageStyles.headerNavLink}>작업</Link>
          <Link href="/about" className={`${pageStyles.headerNavLink} ${aboutStyles.activeMenu}`}>소개</Link>
        </nav>
      </header>

      {/* 메인 콘텐츠 영역 (680px 가로 폭 및 정갈한 About 레이아웃) */}
      <main className={pageStyles.main}>
        <article className={aboutStyles.aboutArticle}>
          {aboutPost ? (
            renderContent(aboutPost.content)
          ) : (
            <p style={{ color: "rgba(0, 0, 0, 0.4)" }}>소개 데이터가 비어 있습니다.</p>
          )}
        </article>
      </main>

      {/* 푸터 영역 (고정) */}
      <footer className={pageStyles.footer}>
        <span className={pageStyles.copyright}>Copyright 2025-2026. June Kim 🇰🇷 All rights reserved.</span>
      </footer>
    </div>
  );
}
