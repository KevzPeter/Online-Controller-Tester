import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { cn } from "@/lib/utils"
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Online Controller Tester",
  description: "Test your Playstation DualSense or Xbox Controllers using this interactive 3D visualization!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-slate-900 font-sans antialiased !p-0 !m-0",
        inter.variable
      )}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
