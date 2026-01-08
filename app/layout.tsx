import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Siddhant Dube - PhD Candidate & AI Researcher",
  description: "PhD candidate researching Legal AI with focus on socio-technical systems, Graph Neural Networks, LLMs, and neuro-symbolic architectures. Former Senior ML Engineer at CVS Health.",
  keywords: "Legal AI, PhD, Graph Neural Networks, GNNs, LLMs, Neuro-Symbolic AI, Socio-Technical Systems, Machine Learning, AI Research",
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