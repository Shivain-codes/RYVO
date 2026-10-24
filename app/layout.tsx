import type { Metadata } from 'next';
import '@fontsource/jetbrains-mono/latin-500.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'RYVO — Run to Your Own Rhythm',
  description: 'Your pace changes. Your music follows. Explore RYVO and find your rhythm with an interactive cadence-to-BPM demonstration.',
  applicationName: 'RYVO',
  openGraph: { title: 'RYVO — Run to Your Own Rhythm', description: 'Movement becomes music. Explore the RYVO rhythm lab.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
