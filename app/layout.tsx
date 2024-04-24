import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Based Rug Chat",
  description: "AI rug check on base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className='text-center text-gray-300 pt-6'>
          Encode Club | AI Bootcamp 24Q1 | TEAM4 Final Project
        </footer>
      </body>
    </html>
  );
}
