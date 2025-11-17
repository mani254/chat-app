"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

interface HeroProps {
  className?: string;
}

export default function Hero({ className = "" }: HeroProps) {
  const [contributorCount, setContributorCount] = useState(1247);
  const [starCount, setStarCount] = useState(8923);
  const [activeUsers, setActiveUsers] = useState(15432);

  // Simulate real-time stats
  useEffect(() => {
    const interval = setInterval(() => {
      setContributorCount((prev) => prev + Math.floor(Math.random() * 3));
      setStarCount((prev) => prev + Math.floor(Math.random() * 5));
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`relative overflow-hidden bg-gradient-to-b from-background to-background-accent/50 ${className}`}>
      <div className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Open Source WhatsApp
            <br />
            <span className="text-foreground">for Developers</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build, customize, and deploy your own secure messaging platform with modern web technologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg font-semibold"
            >
              Start Chatting
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-border hover:bg-muted transition-colors text-lg font-semibold"
            >
              Explore Features
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm"
            >
              <div className="text-3xl font-bold text-primary">{contributorCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Contributors</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm"
            >
              <div className="text-3xl font-bold text-primary">{starCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">GitHub Stars</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm"
            >
              <div className="text-3xl font-bold text-primary">{activeUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}