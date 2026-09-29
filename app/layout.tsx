import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taxi KZ — приложение для таксистов",
  description: "Рабочий кабинет водителя: заказы, доход, коэффициенты и бонусы.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ru"><body>{children}</body></html>;
}