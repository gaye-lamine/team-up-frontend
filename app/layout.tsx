import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TeamUp - Événements locaux près de chez vous",
  description: "Découvrez et créez des événements locaux dans votre ville. Rejoignez une communauté active à Paris, Dakar, Nice et Grasse.",
  openGraph: {
    title: "TeamUp - Événements locaux",
    description: "Découvrez et créez des événements locaux dans votre ville",
    type: "website",
  },
};

import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
