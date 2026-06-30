"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authService } from "@/lib/auth";
import { dbService, Post } from "@/lib/db";
import PostEditor from "@/components/PostEditor";
import styles from "../../admin.module.css";

export default function EditPost() {
  const [post, setPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // 로그인 보호 체계 및 글 데이터 로드
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    const loadPost = async () => {
      if (!id) return;
      try {
        const data = await dbService.getPost(id);
        if (data) {
          setPost(data);
        } else {
          alert("글을 찾을 수 없습니다.");
          router.push("/admin");
        }
      } catch (err) {
        console.error("수정할 글 로드 에러:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, router]);

  const handleUpdate = async (title: string, subtitle: string, content: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await dbService.updatePost(id, {
        title,
        subtitle,
        content
      });
      alert("글이 성공적으로 수정되었습니다.");
      router.push("/admin");
    } catch (err) {
      alert("글 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <p>데이터 로딩 및 인증 상태 확인 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.adminContainer}>
        <p>수정할 글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <PostEditor
      initialTitle={post.title}
      initialSubtitle={post.subtitle}
      initialContent={post.content}
      onSave={handleUpdate}
      saving={saving}
      pageTitle="글 수정"
    />
  );
}
