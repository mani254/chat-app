import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export function generateSEOMetadata({
  title = "chat-app - Open Source WhatsApp for Developers",
  description = "Build, customize, and deploy your own secure messaging platform with modern web technologies. Open source WhatsApp alternative for developers and communities.",
  keywords = ["open source", "chat application", "WhatsApp alternative", "messaging platform", "developers", "real-time messaging", "WebSocket", "TypeScript", "Next.js"],
  ogImage = "/og-image.png",
  canonicalUrl = "https://chat-app.dev"
}: SEOProps = {}): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "chat-app Contributors" }],
    creator: "chat-app Team",
    publisher: "chat-app",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "chat-app",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "chat-app - Open Source Messaging Platform",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "chat-app",
    "description": "Open source WhatsApp-like chat system for developers and communities",
    "url": "https://chat-app.dev",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Web, Windows, macOS, Linux, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "author": {
      "@type": "Organization",
      "name": "chat-app Contributors",
      "url": "https://github.com/mani254",
    },
    "mainEntity": {
      "@type": "WebSite",
      "@id": "https://chat-app.dev/#website",
      "url": "https://chat-app.dev",
      "name": "chat-app",
      "description": "Open source WhatsApp-like chat system for developers and communities",
    },
  };
}