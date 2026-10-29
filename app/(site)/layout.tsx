import { DM_Serif_Display } from "next/font/google";

// Police à empattements proche du logo, chargée seulement sur la landing
const titres = DM_Serif_Display({
  variable: "--font-titres",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${titres.variable} flex flex-1 flex-col`}>{children}</div>;
}
