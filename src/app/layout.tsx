import type { Metadata } from "next";
import { Nanum_Myeongjo, Gowun_Batang } from "next/font/google";
import "./globals.css";

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum-myeongjo",
});

const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-gowun-batang",
});

export const metadata: Metadata = {
  title: "June Kim | Blog",
  description: "June Kim의 개인 블로그 겸 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${nanumMyeongjo.variable} ${gowunBatang.variable}`}>
      <body>{children}</body>
    </html>
  );
}

