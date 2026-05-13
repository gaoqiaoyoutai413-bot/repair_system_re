import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "修理進捗管理システム",
  description: "修理案件の受付、担当者割り当て、現場報告を管理するポートフォリオアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
