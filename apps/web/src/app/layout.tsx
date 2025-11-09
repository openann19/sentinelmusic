import type { Metadata } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { CratePanel } from '@/components/Crate';

const PlayerRoot = dynamic(
  () => import('./(components)/PlayerRoot'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Music Hub',
  description: 'Premium releases and links',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-bg text-text antialiased">
        <ToastProvider>
          <ErrorBoundary>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:p-2 focus:bg-accent focus:text-bg focus:rounded-xl2 focus:z-50"
            >
              Skip to content
            </a>
            <header role="banner" className="border-b border-border">
              <nav
                aria-label="Primary"
                className="mx-auto max-w-6xl flex items-center justify-between p-4"
              >
                <a
                  href="/"
                  className="text-xl font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg rounded-xl2"
                >
                  Music Hub
                </a>
                <div role="menubar" aria-label="Account">
                  <a
                    role="menuitem"
                    className="px-3 py-2 rounded-xl2 hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg"
                    href="/login"
                  >
                    Log in
                  </a>
                </div>
              </nav>
            </header>
            <main
              id="main"
              role="main"
              className="mx-auto max-w-6xl p-4 pb-24"
            >
              {children}
            </main>
            <footer
              role="contentinfo"
              className="mx-auto max-w-6xl p-4 text-sm text-muted border-t border-border mt-8"
            >
              © {new Date().getFullYear()} Music Hub
            </footer>
            <PlayerRoot />
            <CratePanel />
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
