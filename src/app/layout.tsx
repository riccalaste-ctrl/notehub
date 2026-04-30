import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SKAKK-UP - Digital Agora",
  description: "Piattaforma premium per professionisti della conoscenza",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${inter.variable} dark`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}