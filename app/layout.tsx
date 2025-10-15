import type {Metadata} from "next";
import {Geist, Geist_Mono, Rethink_Sans} from "next/font/google";
// @ts-ignore: Cannot find module or type declarations for side-effect import of './globals.css'.
import "./globals.css";
import Navbar from "@/components/nav";
import {ThemeProvider} from "@/components/theme-provider";

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
                className={`${geistSans.variable} ${geistMono.variable} ${rethinkSans.variable} antialiased `}
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
