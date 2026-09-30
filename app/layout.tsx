import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Skillo | Exchange skills with people",
    template: "%s | Skillo",
  },
  description:
    "A social network where people exchange skills, learn together, and help each other grow.",
  applicationName: "Skillo",
  keywords: [
    "skill exchange",
    "peer learning",
    "social learning",
    "teach skills",
    "learn together",
  ],
  creator: "Skillo",
  openGraph: {
    title: "Skillo | Everyone has something to teach",
    description: "Exchange skills with people who want to learn what you know.",
    type: "website",
    siteName: "Skillo",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F6F1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
