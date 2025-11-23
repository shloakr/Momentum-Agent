import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Text Momentum",
  description: "A mobile-first text-based habit builder app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

