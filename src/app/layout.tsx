import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "PS5 Controller Tester",
  description: "Test your PS5 Controller using this interactive 3D visualization!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable
      )}>{children}</body>
    </html>
  );
}
