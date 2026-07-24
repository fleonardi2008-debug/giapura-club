import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Club Fundadores — Giapura",
  description:
    "Un lugar reservado para quienes estuvieron desde el principio. Bienvenido al Club Fundadores.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="grain min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
