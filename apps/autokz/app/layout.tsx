import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATSHANA — автомобили Казахстана",
  description: "Автомобильный маркетплейс Казахстана: купить, продать и продвинуть объявление.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ru"><body>{children}</body></html>;
}