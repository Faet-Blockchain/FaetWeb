import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const nocturneSerifRegular = localFont({
  src: "./fonts/NocturneSerif-Regular.woff",
  variable: "--font-nocturne-serif-regular",
  weight: "100 900",
});
const nocturneSerifBold = localFont({
  src: "./fonts/NocturneSerif-Bold.woff",
  variable: "--font-nocturne-serif-bold",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FAET Brand Website",
  description: "FAET Brand Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nocturneSerifRegular.variable} ${nocturneSerifBold.variable} relative antialiased bg-black text-[#CED6AE]`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
