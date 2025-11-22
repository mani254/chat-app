"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Explore", href: "#features" },
  { label: "Docs", href: "#docs" },
  { label: "OpenSource", href: "#opensource" },
  { label: "Contributors", href: "#contributors" },
];

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border ${className}`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary-invert" />
            <span className="text-xl font-bold ">chat-app</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='text-sm font-medium transition-colors cursor-pointer letter-spacing-1 transform hover:scale-105'
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-invert hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-background-accent transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-border"
            >
              <div className="flex flex-col gap-4 pt-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary text-foreground/80}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label === "Chat Explore" && <Compass className="w-4 h-4 inline mr-2" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}