import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CubeSMP — Your next adventure",
  description: "The official CubeSMP store. Ranks, points, and upgrades for your adventure."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
