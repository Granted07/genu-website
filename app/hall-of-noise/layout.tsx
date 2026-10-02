import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hall of Noise",
  description:
    "Audio dispatches on landmark cases, dissenting opinions, and the politics shaping tomorrow.",
  alternates: { canonical: "/hall-of-noise" },
};

export default function HallOfNoiseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
