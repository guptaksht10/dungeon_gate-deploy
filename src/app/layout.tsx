import type { Metadata } from "next";
import "./globals.css";
import ClientRoot from "./ClientRoot";
import { Cinzel, JetBrains_Mono } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press",
});

const titleFont = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-title",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});


export const metadata: Metadata = {
  title: "Dungeon Gate: Pre-Quest to Shadow Dimension",
  description: "This secret-quest is not meant for weak hearts",
  icons: {
    icon: "/my-icon.jpg",
  },
  openGraph: {
    title: "Dungeon Gate: Pre-Quest to Shadow Dimension",
    description: "This secret-quest is not meant for weak hearts",
    images: [
      {
        url: "/scripture.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dungeon Gate: Pre-Quest to Shadow Dimension",
    description: "This secret-quest is not meant for weak hearts",
    images: ["/scripture.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <html lang="en">
  <body
    style={{
      background: "#000",
      color: "#00ff9c",
    }}
  >
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
