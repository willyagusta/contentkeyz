import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "./WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ContentKeyz - Decentralized Content Monetization",
  description: "Create, monetize, and distribute exclusive content using blockchain technology. Own your audience, control your revenue, and build lasting creator-fan relationships.",
  keywords: "blockchain, content creator, monetization, NFT, cryptocurrency, Web3, decentralized",
  author: "ContentKeyz",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "ContentKeyz - Unlock Your Creative Potential",
    description: "Decentralized content monetization platform for creators and fans",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentKeyz - Decentralized Content Monetization",
    description: "Create, monetize, and distribute exclusive content using blockchain technology",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
