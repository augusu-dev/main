import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '全国家賃ヒートマップ',
  description: '市区町村別の家賃データと掲示板を閲覧できるポータル'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
