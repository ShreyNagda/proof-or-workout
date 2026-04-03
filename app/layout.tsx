import type { Metadata } from "next";
// @ts-expect-error Next.js handles global CSS side-effect imports
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
