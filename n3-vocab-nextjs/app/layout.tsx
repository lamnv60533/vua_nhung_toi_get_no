import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f23",
};

export const metadata: Metadata = {
  title: "N3 Vocabulary Learning",
  description: "Learn JLPT N3 vocabulary with flashcards, typing practice, and quizzes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "N3 Vocab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
