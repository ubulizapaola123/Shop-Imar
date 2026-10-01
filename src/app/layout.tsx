import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Sell Point - Sales, Stock & Cash Management",
  description: "Shop sales, stock and cash management system for shop counters (guichets) in Rwanda. Currency is Rwf.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-[#1F2937] bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
