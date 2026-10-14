import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATSHANA — автомобили Казахстана",
  description: "ATSHANA — автомобильный маркетплейс Казахстана: купить, продать и разместить объявление бесплатно.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ru"><body>{children}</body></html>;
}