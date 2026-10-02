import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BASGO — городские поручения",
  description: "BASGO помогает быстро решить городские поручения: доставка, получение, возврат и срочные задачи с контролем каждого шага.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ru"><body>{children}</body></html>;
}
