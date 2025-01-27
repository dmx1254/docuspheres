import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

import { ProviderSession } from "@/components/session-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tableau de bord de gestion de fichiers de docusphere",
  description: "Un système de gestion de fichiers moderne pour docusphere",
  icons: {
    icon: "/docusphere.png",
    shortcut: "/docusphere.png",
    apple: "/docusphere.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ProviderSession>{children}</ProviderSession>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
