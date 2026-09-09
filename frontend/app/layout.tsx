import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "OrbitLens — Indian Lunar Remote Sensing Portal | ISRO",
  description: "Sub-pixel image registration, photogrammetry, and PDS4 remote-sensing portal for Chandrayaan-2/3 mission payloads (ISRO SAC)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
