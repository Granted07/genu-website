import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Meet the people supporting Gen Uprising's independent reporting and community work.",
  alternates: { canonical: "/sponsors" },
};

export default function SponsorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
