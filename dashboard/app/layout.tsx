import type { Metadata } from "next";
import "../styles/globals.css";
import { AppShell } from "../components/AppShell";
import { AppProviders } from "../providers/AppProviders";
import { RepositoryProvider } from "../contexts/RepositoryContext";
import { Suspense } from "react";
import { PreferencesProvider } from "../contexts/PreferencesContext";

export const metadata: Metadata = {
  title: { default: "CodeVault", template: "%s · CodeVault" },
  description: "GitHub-first developer solution analytics.",
  applicationName: "CodeVault",
  robots: { index: false, follow: false }
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          <PreferencesProvider>
            <Suspense fallback={null}>
              <RepositoryProvider>
                <AppShell>{children}</AppShell>
              </RepositoryProvider>
            </Suspense>
          </PreferencesProvider>
        </AppProviders>
      </body>
    </html>
  );
}
