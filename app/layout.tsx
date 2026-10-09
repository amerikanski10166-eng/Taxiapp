import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://autokz.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AutoKZ — автомобили Казахстана",
    template: "%s | AutoKZ",
  },
  description:
    "Покупайте и продавайте автомобили по всему Казахстану. Объявления с фото, ценой, пробегом и контактами продавца — бесплатно.",
  applicationName: "AutoKZ",
  keywords: [
    "автомобили Казахстан",
    "купить автомобиль",
    "продать автомобиль",
    "авто объявления",
    "авторынок Казахстан",
    "AutoKZ",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    siteName: "AutoKZ",
    title: "AutoKZ — автомобили Казахстана",
    description:
      "Ищите автомобили по всему Казахстану или бесплатно разместите своё объявление.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "AutoKZ — автомобили Казахстана",
    description:
      "Ищите автомобили по всему Казахстану или бесплатно разместите своё объявление.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
