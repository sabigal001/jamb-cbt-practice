import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lambda | JAMB CBT Practice Portal",
  description: "The ultimate practice portal for JAMB aspirants. Master your subjects with Lambda.",
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
