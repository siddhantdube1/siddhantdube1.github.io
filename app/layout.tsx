import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Siddhant Dube - ML Engineer & AI Researcher",
  description: "Senior Machine Learning Engineer at CVS Health specializing in scalable AI systems, GPU computing, and real-time ML. Incoming PhD student in Legal AI.",
  keywords: "Machine Learning, AI, Software Engineer, CVS Health, PhD, Legal AI, NLP, Deep Learning",
  authors: [{ name: "Siddhant Dube" }],
  openGraph: {
    title: "Siddhant Dube - ML Engineer & AI Researcher",
    description: "Senior Machine Learning Engineer specializing in scalable AI systems",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}