import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "@/components/ConfigContext";

const display = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "VELORYN ORIEL — Silence at speed",
  description:
    "ORIEL is the first electric hypercar from VELORYN: 1,914 hp, four motors and one continuous surface. A fictional brand created for design demonstration.",
  openGraph: {
    title: "VELORYN ORIEL — Silence at speed",
    description: "The first electric hypercar from VELORYN. Limited to 99 units.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06362B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}.intro-rise,.intro-fade{opacity:1!important;animation:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-vel-gold focus:px-4 focus:py-2 focus:text-vel-pine"
        >
          Skip to content
        </a>
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}
