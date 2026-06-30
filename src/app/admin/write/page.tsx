"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { dbService } from "@/lib/db";
import PostEditor from "@/components/PostEditor";
import styles from "../admin.module.css";

export default function WritePost() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 로그인 보호 체계
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/admin/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSave = async (title: string, subtitle: string, content: string) => {
    setSaving(true);
    try {
      await dbService.createPost({
        title,
        subtitle,
        content
      });
      alert("성공적으로 글이 저장되었습니다.");
      router.push("/admin");
    } catch (err) {
      alert("글 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <p>인증 상태 확인 중...</p>
      </div>
    );
  }

  return (
    <PostEditor 
      onSave={handleSave} 
      saving={saving} 
      pageTitle="새 글 작성" 
    />
  );
}
