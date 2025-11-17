"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";

interface CTAProps {
  className?: string;
  variant?: "primary" | "secondary";
  title?: string;
  description?: string;
}

export default function CTA({ 
  className = "", 
  variant = "primary",
  title = "Ready to Build Something Amazing?",
  description = "Join thousands of developers who've already started building with OpenChat"
}: CTAProps) {
  const isPrimary = variant === "primary";

  return (
    <section className={`py-20 md:py-32 ${isPrimary ? 'bg-gradient-to-r from-primary to-primary/80' : 'bg-background-accent/30'} ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isPrimary ? 'text-primary-foreground' : 'text-primary-accent'
          }`}>
            {title}
          </h2>
          <p className={`text-xl mb-8 ${
            isPrimary ? 'text-primary-foreground/90' : 'text-muted-foreground'
          }`}>
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-colors text-lg font-semibold ${
                isPrimary
                  ? 'bg-background text-foreground hover:bg-background/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              Start Building
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/openchat/openchat"
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 transition-colors text-lg font-semibold ${
                isPrimary
                  ? 'border-background text-background hover:bg-background hover:text-foreground'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}