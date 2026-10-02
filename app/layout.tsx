import type { Metadata } from "next";
import { Geist, Geist_Mono, Rethink_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Gen Uprising publishes case files, signals, and stories for people building a more just future.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Gen Uprising publishes case files, signals, and stories for people building a more just future.",
    url: "/",
    images: [{ url: "/bg.png", width: 1600, height: 900, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Gen Uprising publishes case files, signals, and stories for people building a more just future.",
    images: ["/bg.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rethinkSans.variable} antialiased `}
      >
        <ThemeProvider
          attribute={`class`}
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <Navbar></Navbar>
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
