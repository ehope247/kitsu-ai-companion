import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
});

// THIS IS THE PART THAT FIXES THE TELEGRAM PREVIEW
export const metadata: Metadata = {
  title: "$KITSU | The AI Empress",
  description: "An emotional AI companion with a cat’s mind. She reacts. She remembers. She has moods.",
  metadataBase: new URL('https://kitsu-ai-companion.vercel.app'), // Update this if you connect your custom domain later
  icons: {
    icon: "/kitsu.png",
    shortcut: "/kitsu.png",
    apple: "/kitsu.png",
  },
  openGraph: {
    title: "$KITSU | The AI Empress",
    description: "Not a tool. Not a bot. Just Kitsu.",
    images: [
      {
        url: "/kitsu.png", // This makes the cat show up on Telegram
        width: 1200,
        height: 1200,
        alt: "Kitsu AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "$KITSU | The AI Empress",
    description: "Not a tool. Not a bot. Just Kitsu.",
    images: ["/kitsu.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}