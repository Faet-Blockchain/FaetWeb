import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
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
  title: "FAET",
  description: "The Metaverse Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${nocturneSerifRegular.variable} ${nocturneSerifBold.variable} relative antialiased bg-black text-[#CED6AE]`}
      >
        {/* Scripts must go in <body> with App Router */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5RH1TK4158"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5RH1TK4158');
          `}
        </Script>
        <Script
          src="https://www.google.com/recaptcha/enterprise.js?render=6LfUn2IrAAAAAOe0xfIsiXgdnQ3FaApkJORBh68E"
          strategy="afterInteractive"
        />

        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
