import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nischay Kademane — Experience Architect",
  description: "A cinematic digital experience by Nischay Kademane.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] noise-bg" />
        {children}
      </body>
    </html>
  );
}
