import Features from "@/components/landing/features/Features";
import Footer from "@/components/landing/footer/Footer";
import Header from "@/components/landing/header/Header";
import Hero from "@/components/landing/hero/Hero";
import { AccessibilityProvider } from "@/components/landing/shared/AccessibilityProvider";
import CTA from "@/components/landing/shared/CTA";
import DocsOpenSource from "@/components/landing/shared/DocsOpenSource";
import { generateSEOMetadata, generateStructuredData } from "@/components/landing/shared/SEO";
import Testimonials from "@/components/landing/testimonials/Testimonials";
import { BookOpen, Code, GitBranch, Heart, Shield, Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "OpenChat - Open Source WhatsApp for Developers",
  description: "Build, customize, and deploy your own secure messaging platform with modern web technologies. Open source WhatsApp alternative for developers and communities.",
});

export default function Home() {
  const structuredData = generateStructuredData();

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-invert px-4 py-2 rounded-lg z-50">
          Skip to main content
        </a>

        {/* Header */}
        <Header />

        {/* Main Content */}
        <main id="main-content">
          {/* Hero Section */}
          <Hero />

          {/* Features Section */}
          <Features />

          <DocsOpenSource />

          {/* Testimonials Section */}
          <Testimonials />

          {/* Final CTA Section */}
          <CTA
            title="Ready to Build Something Amazing?"
            description="Join thousands of developers who've already started building with OpenChat"
            variant="primary"
          />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </AccessibilityProvider>
  );
}

const CONTRIBUTION_AREAS = [
  { title: "Frontend Development", description: "React, Next.js, Tailwind CSS", icon: Code },
  { title: "Backend Engineering", description: "Node.js, Express, WebSocket", icon: GitBranch },
  { title: "Security Auditing", description: "Encryption, Auth, Penetration Testing", icon: Shield },
  { title: "Documentation", description: "API docs, tutorials, guides", icon: BookOpen },
  { title: "Design & UX", description: "UI/UX, accessibility, mobile", icon: Heart },
  { title: "Community", description: "Support, outreach, events", icon: Users },
];