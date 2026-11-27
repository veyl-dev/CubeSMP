import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import "./globals.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "CubeSMP — Your next adventure",
  description: "The official CubeSMP store. Ranks, points, and upgrades for your adventure."
};

const validColor=(value:unknown,fallback:string)=>typeof value==="string"&&/^#[0-9a-fA-F]{6}$/.test(value)?value:fallback;
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const keys=["theme_primary","theme_cyan","theme_accent"];
  const settings=await prisma.websiteSetting.findMany({where:{key:{in:keys}}});
  const values=Object.fromEntries(settings.map(x=>[x.key,x.value]));
  const theme={
    "--brand-primary":validColor(values.theme_primary,"#078cff"),
    "--brand-cyan":validColor(values.theme_cyan,"#42d9ff"),
    "--brand-accent":validColor(values.theme_accent,"#0755ed")
  } as CSSProperties;
  return <html lang="en"><body style={theme}>{children}</body></html>;
}
