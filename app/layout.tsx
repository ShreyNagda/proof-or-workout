import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proof of Workout | POW",
  description: "Decentralized fitness verification on Ethereum Sepolia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
