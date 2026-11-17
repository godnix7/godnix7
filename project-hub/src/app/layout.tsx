import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "./hub.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const jbmono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://project.nischay.tech"),
  title: {
    default: "Project Lab — Nischay Kademane",
    template: "%s — Nischay Kademane",
  },
  description: "Explore and try software, systems, and applied AI projects by Nischay Kademane.",
  openGraph: {
    title: "Nischay Kademane — Project Hub",
    description: "Explore software, systems, and applied AI projects.",
    url: "https://project.nischay.tech",
    siteName: "Nischay Project Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nischay Kademane — Project Hub",
    description: "Selected software, systems, and applied AI projects.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${jbmono.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] noise-bg" />
        {children}
      </body>
    </html>
  );
}
