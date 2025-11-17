"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, MessageCircle } from "lucide-react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`py-12 bg-background-accent/50 border-t border-border ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-primary-accent" />
              <span className="text-lg font-bold">OpenChat</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Open source WhatsApp-like chat system for developers and communities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-primary-accent">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/chat" className="text-muted-foreground hover:text-primary-accent transition-colors">Chat</Link></li>
              <li><Link href="/docs" className="text-muted-foreground hover:text-primary-accent transition-colors">Documentation</Link></li>
              <li><Link href="/features" className="text-muted-foreground hover:text-primary-accent transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary-accent transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-primary-accent">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contributors" className="text-muted-foreground hover:text-primary-accent transition-colors">Contributors</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary-accent transition-colors">Blog</Link></li>
              <li><Link href="/events" className="text-muted-foreground hover:text-primary-accent transition-colors">Events</Link></li>
              <li><Link href="/support" className="text-muted-foreground hover:text-primary-accent transition-colors">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-primary-accent">Connect</h4>
            <div className="flex gap-4">
              <Link href="https://github.com/openchat/openchat" className="text-muted-foreground hover:text-primary-accent transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com/openchat" className="text-muted-foreground hover:text-primary-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com/company/openchat" className="text-muted-foreground hover:text-primary-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} OpenChat Contributors • Released under the MIT License</p>
        </div>
      </div>
    </footer>
  );
}