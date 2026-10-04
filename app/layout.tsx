import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taxiapp-rho.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AutoKZ — автомобили Казахстана",
    template: "%s | AutoKZ",
  },
  description: "AutoKZ — маркетплейс автомобилей Казахстана. Покупайте и продавайте автомобили, запчасти и мототехнику.",
  keywords: [
    "автомобили Казахстан",
    "купить авто",
    "продать авто",
    "авто Астана",
    "авто Алматы",
    "авто объявления",
    "AutoKZ",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    siteName: "AutoKZ",
    title: "AutoKZ — автомобили Казахстана",
    description: "Покупка и продажа автомобилей, запчастей и мототехники в Казахстане.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoKZ — автомобили Казахстана",
    description: "Покупайте и продавайте автомобили в Казахстане.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ru"><body>{children}</body></html>;
}
