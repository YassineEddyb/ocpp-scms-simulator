import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCPP CSMS Simulator",
  description: "OCPP 1.6 Central System Management Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
