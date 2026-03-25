import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lambda | Nigeria's #1 JAMB CBT Practice Portal",
  description: "Master JAMB with Lambda. Practice with 40,000+ past questions, realistic mock exams, and real-time performance tracking. Ace your UTME with confidence.",
  keywords: ["JAMB", "UTME", "CBT Practice", "Nigeria Exams", "Past Questions", "Lambda CBT", "Exam Preparation"],
  authors: [{ name: "Lambda Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 square-grid" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-black to-purple-900/20" />
        </div>
        {children}
      </body>
    </html>
  );
}
