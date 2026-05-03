import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nest CRUD Frontend",
  description: "Basit kullanıcı CRUD arayüzü",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
