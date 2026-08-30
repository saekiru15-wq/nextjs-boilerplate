import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "학습 멘토링",
  description: "숙제, 질문, 일정, 채팅과 AI 학습도우미를 한곳에서 관리하는 학습 멘토링 플랫폼",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
