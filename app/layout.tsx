import type { Metadata } from "next";
import { Space_Mono, Inter, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SD-01 — Siddhant Dube",
  description:
    "PhD candidate researching socio-technical AI systems, Graph Neural Networks, LLMs, and neuro-symbolic architectures for legal reasoning. Former Senior ML Engineer at CVS Health.",
  keywords:
    "Legal AI, PhD, Graph Neural Networks, GNNs, LLMs, Neuro-Symbolic AI, Socio-Technical Systems, Machine Learning, AI Research",
  authors: [{ name: "Siddhant Dube" }],
  openGraph: {
    title: "SD-01 — Siddhant Dube",
    description:
      "A working ground-station console, operating one mission: Siddhant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceMono.variable} ${inter.variable} ${newsreader.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (stored === 'dark' || !stored) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="font-prose antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
