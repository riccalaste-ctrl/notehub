import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteHub - Condividi appunti scolastici",
  description: "Piattaforma gratuita per condividere appunti tra studenti",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}