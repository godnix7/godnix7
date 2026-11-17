import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nischay.tech"),
  title: {
    default: "Nischay Kademane — Software Engineer",
    template: "%s — Nischay Kademane",
  },
  description: "Selected software, systems, and applied AI projects by Nischay Kademane.",
  openGraph: {
    title: "Nischay Kademane — Software Engineer",
    description: "Selected software, systems, and applied AI projects.",
    url: "https://nischay.tech",
    siteName: "Nischay Kademane",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nischay Kademane — Software Engineer",
    description: "Selected software, systems, and applied AI projects.",
  },
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
