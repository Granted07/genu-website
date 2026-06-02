import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Poppins,
  Rethink_Sans,
  Red_Hat_Display,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gen Uprising",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rethinkSans.variable} ${poppins.variable} ${redHatDisplay.variable} antialiased `}
      >
        <ThemeProvider
          attribute={`class`}
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <Navbar></Navbar>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
