import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { Providers } from "@/common/components/Providers";

import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "BookMyShow Clone",
  description: "Movie ticket booking — browse shows, pick seats, pay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#f2f5fa] text-[#333]">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
