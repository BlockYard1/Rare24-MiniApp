import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import TopBar from "./components/top-bar";
import BottomNavigation from "./components/bottom-navigation";
import { Web3Provider } from "./providers/wagmiProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rare24",
  description: "Own Your Favourite Creator's Moment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} antialiased h-screen flex flex-col overflow-hidden`}
      >
        <Web3Provider>
          <TopBar/>
          <main className="flex-1 overflow-y-auto">{children}</main>
          <BottomNavigation />
        </Web3Provider>
      </body>
    </html>
  );
}
