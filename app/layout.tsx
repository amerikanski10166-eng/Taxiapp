import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"JUP — знакомства в Казахстане",description:"JUP — безопасные знакомства для совершеннолетних в Казахстане.",robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}