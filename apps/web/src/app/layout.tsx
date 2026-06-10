import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IPL Auction Simulator",
    template: "%s | IPL Auction Simulator",
  },
  description:
    "Experience the thrill of IPL auctions. Build your dream team, strategize your bids, and compete in realistic cricket match simulations.",
  keywords: [
    "IPL",
    "auction",
    "cricket",
    "simulator",
    "fantasy",
    "team building",
    "bidding",
  ],
  authors: [{ name: "IPL Auction Simulator" }],
  creator: "IPL Auction Simulator",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "IPL Auction Simulator",
    description:
      "Experience the thrill of IPL auctions. Build your dream team and compete.",
    siteName: "IPL Auction Simulator",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPL Auction Simulator",
    description:
      "Experience the thrill of IPL auctions. Build your dream team and compete.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#030014",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "rgba(10, 10, 26, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(12px)",
                color: "#f1f5f9",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
