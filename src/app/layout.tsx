import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NeonAuthProvider } from "@/contexts/NeonAuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestion des Dépenses Familiales",
  description: "Application de gestion des dépenses familiales avec suivi en temps réel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <NeonAuthProvider>
          {children}
        </NeonAuthProvider>
      </body>
    </html>
  );
}
